import fastify from "fastify";
import {routes} from "./routes";
import {setupSwagger} from "./swagger";
import blippPlugin from "fastify-blipp";
import corsPlugin from "@fastify/cors";
import {getPort} from "./config";
import {fastifyRequestContext} from "@fastify/request-context";
import helmet from "@fastify/helmet";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { bearerAuthentication } from "./authentication";
import bearerAuthPlugin from "@fastify/bearer-auth";
import authPlugin from "@fastify/auth";
import {seed, stopData} from "../data";
import {commitAt, commitShort} from "../package";

const { pathname } = new URL(import.meta.url);
const directory = dirname(pathname)

export async function create() {

    const app = fastify({
        logger: true
    });

    const register: (...args: unknown[]) => void = app.register.bind(fastify);

    const packageJSON = await readFile(join(directory, "../../../package.json"), "utf-8")
    const {
        name,
        version
    } = JSON.parse(packageJSON);

    register(helmet, { contentSecurityPolicy: false });

    app.addHook(
        "preValidation",
        async (request, response) => {
            if (request.headers.apikey && !request.headers.authorization) {
                request.headers.authorization = `bearer ${request.headers.apikey}`
            }
        }
    )

    register(fastifyRequestContext, {
        hook: 'preValidation',
        defaultStoreValues: {

        }
    });

    app.addHook(
        "preValidation",
        async (request, response) => {
            request.requestContext.set("origin", `${request.protocol}://${request.hostname}`);

            response.header("X-Powered-By", `${name}@${version}`);

            // Some details about time since commit
            response.header("X-Source-Commit", commitShort);
            response.header("X-Source-Commit-At", commitAt);
        }
    )

    register(blippPlugin);
    register(corsPlugin);

    await setupSwagger(app);

    register(authPlugin)
    register(bearerAuthPlugin, {
        keys: new Set<string>(),
        auth: bearerAuthentication,
        addHook: false
    });

    register(routes);

    return app;
}

export async function start() {

    const app = await create();

    // Before we start, we should seed
    if (process.env.ENABLE_SEED) {
        await seed();
    }

    const port = getPort();

    await app.listen({ port });

    app.blipp();

    return async () => {
        await app.close();
        // close any opened connections
        await stopData();
    }
}