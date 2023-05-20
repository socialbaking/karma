import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  commit,
  commitAt,
  commitAuthor,
  packageIdentifier,
  secondsBetweenCommitAndBuild,
  secondsBetweenCommitAndTestCompletion,
  timeBetweenCommitAndBuild,
  timeBetweenCommitAndTestCompletion,
} from "../package";
import {
  paths,
  pathsAnonymous,
  pathsCache,
  pathsHandler,
  pathsSubmit,
} from "../react/server/paths";
import KarmaServer, { KarmaServerProps } from "../react/server";
import { renderToStaticMarkup } from "react-dom/server";
import {
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
  getUser,
  isAnonymous,
} from "../authentication";
import { ok } from "../../is";
import { join, dirname } from "node:path";
import { addCachedPage, getCached, getCachedPage } from "../data/cache";
import { getOrigin } from "../listen/config";

const { pathname } = new URL(import.meta.url);
const DIRECTORY = dirname(pathname);
export const REACT_CLIENT_DIRECTORY = join(DIRECTORY, "../react/client");

export async function viewRoutes(fastify: FastifyInstance) {
  const { ALLOW_ANONYMOUS_VIEWS, ENABLE_CACHE } = process.env;

  fastify.get("/server.css", async (request, response) => {
    response.header("Content-Type", "text/css");
    response.send(ServerCSS);
  });

  function createPathHandler(
    path: string,
    options?: Partial<KarmaServerProps>,
    isPathCached?: boolean
  ) {
    const baseHandler = pathsHandler[path];
    const submitHandler = pathsSubmit[path];

    return async function handler(
      request: FastifyRequest,
      response: FastifyReply
    ) {
      if (baseHandler) {
        await baseHandler(request, response);
        if (response.sent) return;
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
        const anonymous = isAnonymous();
        const state = getMaybeAuthenticationState();
        const { pathname } = new URL(request.url, getOrigin());
        const isFragment = pathname.endsWith("/fragment");
        const user = getMaybeUser();

        // console.log({ anonymous, state, roles: state?.roles });

        // Can go right to static, should be no async loading within components
        let html = renderToStaticMarkup(
          <KarmaServer
            {...options}
            url={path}
            isAnonymous={anonymous}
            isFragment={isFragment}
            partners={await listPartners({
              authorizedPartnerId: getMaybeAuthorizedForPartnerId(),
            })}
            organisations={await listOrganisations({
              authorizedOrganisationId: getMaybeAuthorizedForOrganisationId(),
            })}
            categories={await listCategories()}
            metrics={anonymous ? [] : await listMetrics()}
            products={await listProducts()}
            roles={state?.roles}
            query={request.query}
            body={request.body}
            user={user}
          />
        );

        if (!isFragment) {
          html = `<!doctype html>\n${html}`;
        }

        return html;
      }
    };
  }
  function createPathSubmitHandler(path: string) {
    const submit = pathsSubmit[path];
    ok(
      typeof submit === "function",
      `Expected pathSubmit.${path} to be a functon`
    );

    return async function handler(
      request: FastifyRequest,
      response: FastifyReply
    ) {
      let result, error;
      try {
        result = await submit(request, response);
      } catch (caught) {
        error = caught;
      }
      const view = createPathHandler(
        path,
        {
          result,
          error,
          submitted: true,
        },
        false
      );
      await view(request, response);
    };
  }

  Object.keys(paths).forEach((path) => {
    const anonymous = pathsAnonymous[path] || !!ALLOW_ANONYMOUS_VIEWS;

    const isPathCached = pathsCache[path] || false;

    const handler = createPathHandler(path, {}, isPathCached);

    console.log({ path, anonymous, isPathCached });

    const preHandler = authenticate(fastify, {
      anonymous: pathsAnonymous[path] || !!ALLOW_ANONYMOUS_VIEWS,
    });

    fastify.get(`${path}/fragment`, {
      preHandler,
      handler,
    });
    fastify.get(path, {
      preHandler,
      handler,
    });

    if (pathsSubmit[path]) {
      fastify.post(path, {
        preHandler,
        handler: createPathSubmitHandler(path),
      });
    }
  });
}
