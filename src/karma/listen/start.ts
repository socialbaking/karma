import fastify, {FastifyInstance, FastifyRequest} from "fastify";
import { routes } from "./routes";
import { setupSwagger } from "./swagger";
import blippPlugin from "fastify-blipp";
import corsPlugin from "@fastify/cors";
import { getPort } from "./config";
import { fastifyRequestContext } from "@fastify/request-context";
import helmet from "@fastify/helmet";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { bearerAuthentication } from "./authentication";
import bearerAuthPlugin from "@fastify/bearer-auth";
import authPlugin from "@fastify/auth";
import { autoSeed, seed, stopData } from "../data";
import {commitAt, commitShort, importmapRoot, importmapRootName} from "../package";
import cookie from "@fastify/cookie";
import { isLike, ok } from "../../is";
import multipart from "@fastify/multipart";
import formbody from "@fastify/formbody";
import qs from "qs";
import { REACT_CLIENT_DIRECTORY } from "../view";
import files from "@fastify/static";
import { errorHandler } from "../view/error";
import etag from "@fastify/etag";
import { parseStringFields } from "./body-parser";
import {signalMiddleware} from "../signal";
import {routes as baseRoutes} from "@opennetwork/logistics";

const { pathname } = new URL(import.meta.url);
const directory = dirname(pathname);

export async function create() {
  const { COOKIE_SECRET, PUBLIC_PATH } = process.env;

  ok(COOKIE_SECRET, "Expected COOKIE_SECRET");

  const app = fastify({
    logger: true
  });

  // const ajv = new Ajv({
  //   coerceTypes: true,
  //   useDefaults: true,
  //   removeAdditional: true
  // })
  // app.setValidatorCompiler(({ schema, method, url, httpPart }) => {
  //   return ajv.compile(schema)
  // })
  // app.setSerializerCompiler(({ schema, method, url, httpStatus, contentType }) => {
  //   const validate = ajv.compile(schema);
  //   return data => {
  //     console.log(data);
  //     validate(data);
  //     return JSON.stringify(data);
  //   }
  // })

  const register: (...args: unknown[]) => void = app.register.bind(fastify);

  register(cookie, {
    secret: COOKIE_SECRET,
    hook: "onRequest",
    parseOptions: {},
  });

  register(multipart);
  register(formbody, {
    parser: parseStringFields,
  });

  const packageJSON = await readFile(
    join(directory, "../../../package.json"),
    "utf-8"
  );
  const { name, version } = JSON.parse(packageJSON);

  register(helmet, { contentSecurityPolicy: false });

  app.addHook("preValidation", async (request, response) => {
    if (request.headers.apikey && !request.headers.authorization) {
      request.headers.authorization = `bearer ${request.headers.apikey}`;
    }
  });

  register(fastifyRequestContext, {
    hook: "preValidation",
    defaultStoreValues: {},
  });

  app.addHook("preValidation", async (request, response) => {
    request.requestContext.set(
      "origin",
      `${request.protocol}://${request.hostname}`
    );

    response.header("X-Powered-By", `${name}@${version}`);

    // Some details about time since commit
    response.header("X-Source-Commit", commitShort);
    response.header("X-Source-Commit-At", commitAt);
  });

  signalMiddleware(app as FastifyInstance);

  register(authPlugin);
  register(bearerAuthPlugin, {
    keys: new Set<string>(),
    auth: bearerAuthentication,
    addHook: false,
  });
  app.setErrorHandler(errorHandler);

  register(blippPlugin);
  register(corsPlugin);

  await app.register(
    async (instance) => {
      await instance.register(etag);
      instance.addHook("onRequest", (request, response, done) => {
        response.header("Cache-Control", "max-age=1800"); // Give it something
        done();
      });
      await instance.register(files, {
        root: REACT_CLIENT_DIRECTORY,
        prefix: "/client",
        serveDotFiles: true,
        dotfiles: "allow",
        allowedPath: (pathName: string, root: string, request: FastifyRequest) => {
          console.log("Allowed path", { pathName, root, client: true });
          return true;
        }
      });
      const publicPath = PUBLIC_PATH || join(directory, "../../../public");
      await instance.register(files, {
        root: publicPath,
        decorateReply: false,
        prefix: "/public",
        serveDotFiles: true,
        dotfiles: "allow",
        allowedPath: (pathName: string, root: string, request: FastifyRequest) => {
          console.log("Allowed path", { pathName, root, public: true });
          return true;
        }
      });


      await instance.register(files, {
        // Relative to top level of this module
        // NOT relative to cwd
        root: importmapRoot,
        prefix: importmapRootName,
        decorateReply: false,
        serveDotFiles: true,
        dotfiles: "allow",
        allowedPath: (pathName: string, root: string, request: FastifyRequest) => {
          console.log("Allowed path", { pathName, root, importmapRoot, importmapRootName });
          return true;
        }
      });
    },
    { prefix: "/" }
  );

  await setupSwagger(app);

  await register(routes);

  await register(baseRoutes);

  return app;
}

export async function start() {
  const app = await create();

  // Before we start, we should seed
  await autoSeed();

  const port = getPort();

  await app.listen({ port });

  app.blipp();

  return async () => {
    await app.close();
    // close any opened connections
    await stopData();
  };
}
