import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import KarmaServer, { KarmaServerProps } from "../react/server";
import { renderToStaticMarkup } from "react-dom/server";
import {
  CountryProductMetrics,
  listCategories,
  listMetrics,
  listOrganisations,
  listPartners,
  listProducts,
} from "../data";
import { authenticate } from "../listen/authentication";
import ServerCSS from "../react/server/server-css";
import {
  getMaybeAuthenticationState,
  getMaybeAuthorizedForOrganisationId,
  getMaybeAuthorizedForPartnerId,
  getMaybeUser,
  isAnonymous,
} from "../authentication";
import { ok } from "../../is";
import { join, dirname } from "node:path";
import { addCachedPage, getCachedPage } from "../data";
import { getOrigin } from "../listen/config";
import {getConfig, View} from "@opennetwork/logistics";
import {getViews} from "./views";
import {ReactData} from "../react/server/data";
import {importmapPrefix, importmapRoot, importmapRootName, name, root} from "../package";
import etag from "@fastify/etag";
import files from "@fastify/static";

const { pathname } = new URL(import.meta.url);
const DIRECTORY = dirname(pathname);
export const REACT_CLIENT_DIRECTORY = join(DIRECTORY, "../react/client");

export async function fileRoutes(fastify: FastifyInstance) {
  fastify.register(etag);
  fastify.addHook("onRequest", (request, response, done) => {
    response.header("Cache-Control", "max-age=1800"); // Give it something
    done();
  });
  fastify.register(files, {
    root: REACT_CLIENT_DIRECTORY,
    prefix: `/${name}/client`,
  });
  const publicPath = join(root, "./public");
  fastify.register(files, {
    root: publicPath,
    decorateReply: false,
    prefix: `/${name}/public`,
  });
  try {
    fastify.register(files, {
      root: publicPath,
      decorateReply: false,
      prefix: "/public",
    });
  } catch {}
  fastify.register(files, {
    // Relative to top level of this module
    // NOT relative to cwd
    root: importmapRoot,
    prefix: `${importmapPrefix ? `/${importmapPrefix}/` : ""}${importmapRootName}`,
    decorateReply: false,
  });
}

export async function styleRoutes(fastify: FastifyInstance) {
  fastify.get(`/${name}/server.css`, async (request, response) => {
    response.header("Content-Type", "text/css");
    response.send(ServerCSS);
  });
}

export async function viewRoutes(fastify: FastifyInstance) {
  const { ALLOW_ANONYMOUS_VIEWS, ENABLE_CACHE, DEFAULT_TIMEZONE = "Pacific/Auckland" } = process.env;

  fastify.register(styleRoutes);
  fastify.register(fileRoutes);

  async function getData(request: FastifyRequest): Promise<ReactData> {
    const anonymous = isAnonymous();
    const state = getMaybeAuthenticationState();
    const { pathname } = new URL(request.url, getOrigin());
    const isFragment = pathname.endsWith("/fragment");
    const user = getMaybeUser();
    const origin = getOrigin();
    const partnersPromise = listPartners({
      authorizedPartnerId: getMaybeAuthorizedForPartnerId(),
    });
    const organisationsPromise = listOrganisations({
      authorizedOrganisationId: getMaybeAuthorizedForOrganisationId(),
    });
    const categoriesPromise = listCategories();
    const productsPromise = listProducts({
      // Making it obvious that if you are anonymous
      // only public products will be visible
      public: anonymous
    });
    let metricsPromise = Promise.resolve<CountryProductMetrics[]>([]);
    if (!anonymous) {
      metricsPromise = listMetrics();
    }

    return {
      config: getConfig(),
      url: new URL(request.url, origin).toString(),
      origin,
      isAnonymous: anonymous,
      isFragment,
      partners: await partnersPromise,
      organisations: await organisationsPromise,
      categories: await categoriesPromise,
      metrics: await metricsPromise,
      products: await productsPromise,
      roles: state?.roles,
      query: request.query,
      params: request.params,
      body: request.body,
      user,
      timezone: DEFAULT_TIMEZONE,
      isAuthenticatedTrusted: !!process.env.AUTHENTICATED_IS_TRUSTED
    };
  }

  function createPathHandler(
      view: View,
      options?: Partial<KarmaServerProps>,
      isPathCached?: boolean,
      baseDataGiven?: ReactData,
      baseResultGiven?: { value: unknown },
  ) {
    const baseHandler = view.handler;
    const submitHandler = view.submit;

    return async function handler(
      request: FastifyRequest,
      response: FastifyReply
    ) {
      let data: ReactData | undefined = baseDataGiven;
      let baseResult: unknown = undefined;
      if (baseResultGiven) {
        baseResult = baseResultGiven.value;
      } else {
        if (baseHandler) {
          data = data ?? await getData(request);
          baseResult = await baseHandler(request, response, data);
          if (response.sent) return;
        }
      }

      const html = await getHTML();

      if (response.sent) return;

      // All pages are dynamically rendered for each role
      // We require all pages to be re-fetched from our server
      // We will cache anything we need server side
      response.header("Cache-Control", "No-Store");
      response.header("Content-Type", "text/html; charset=utf-8");
      response.header("Cross-Origin-Embedder-Policy", "unsafe-none");

      if (!response.statusCode) {
        response.status(200);
      }
      response.send(html);

      async function getHTML() {
        const isCacheUsable = !!(
          isPathCached &&
          ENABLE_CACHE &&
          !submitHandler &&
          request.method.toLowerCase() === "get"
        );
        if (isCacheUsable) {
          const cached = await getCachedPage(request.url);
          if (cached) {
            response.header("X-Back-Cache-Hit", "1");
            return cached;
          }
        }
        response.header("X-Back-Cache-Miss", `1, ${isCacheUsable ? 1 : 0}`);
        const html = await getRenderedHTML();
        if (isCacheUsable) {
          response.header("X-Back-Cache-Set", "1");
          await addCachedPage(request.url, html);
        }
        return html;
      }

      async function getRenderedHTML() {
        // console.log({ anonymous, state, roles: state?.roles });
        data = data ?? await getData(request);

        // Can go right to static, should be no async loading within components
        let html = renderToStaticMarkup(
          <KarmaServer
            {...options}
            {...data}
            view={view}
            input={baseResult}
          />
        );

        if (!data.isFragment) {
          html = `<!doctype html>\n${html}`;
        }

        return html;
      }
    };
  }
  function createPathSubmitHandler(view: View) {
    const { submit, handler: baseHandler, path } = view;
    ok(
        typeof submit === "function",
        `Expected pathSubmit.${path} to be a function`
    );

    return async function handler(
        request: FastifyRequest,
        response: FastifyReply
    ) {
      let data: ReactData | undefined = undefined;
      let baseResult;

      if (baseHandler) {
        data = await getData(request);
        baseResult = await baseHandler(request, response, data);
        if (response.sent) return;
      }

      let result, error;
      try {
        data = data ?? await getData(request);
        result = await submit(request, response, baseResult, data);
      } catch (caught) {
        error = caught;
      }
      const pathHandler = createPathHandler(
        view,
        {
          result,
          error,
          submitted: true,
        },
        false,
          data,
          { value: baseResult }
      );
      await pathHandler(request, response);
    };
  }

  function createView(view: View) {
    const {
      path,
      anonymous,
      cached: isPathCached = false,
      submit
    } = view;
    const pathHandler = createPathHandler(view, {}, isPathCached);
    const preHandler = authenticate(fastify, {
      anonymous: anonymous || !!ALLOW_ANONYMOUS_VIEWS,
    });
    const fragmentSuffix = `${path === "/" ? "" : "/"}fragment`;

    fastify.get(`${path}${fragmentSuffix}`, {
      preHandler,
      handler: pathHandler,
    });
    fastify.get(path, {
      preHandler,
      handler: pathHandler,
    });

    if (submit) {
      const submitHandler = createPathSubmitHandler(view);
      fastify.post(path, {
        preHandler,
        handler: submitHandler,
      });
      fastify.post(`${path}${fragmentSuffix}`, {
        preHandler,
        handler: submitHandler,
      });
    }
  }

  getViews().forEach(createView);
}
