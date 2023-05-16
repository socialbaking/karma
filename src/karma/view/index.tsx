import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {
    commit,
    commitAt, commitAuthor,
    packageIdentifier, secondsBetweenCommitAndBuild, secondsBetweenCommitAndTestCompletion,
    timeBetweenCommitAndBuild,
    timeBetweenCommitAndTestCompletion
} from "../package";
import {paths, pathsAnonymous, pathsSubmit} from "../react/server/paths";
import KarmaServer, {KarmaServerProps} from "../react/server";
import {renderToStaticMarkup} from "react-dom/server";
import {listCategories, listMetrics, listOrganisations, listPartners, listProducts} from "../data";
import {authenticate} from "../listen/authentication";
import ServerCSS from "../react/server/server-css";
import {
    getMaybeAuthenticationState,
    getMaybeAuthorizedForOrganisationId,
    getMaybeAuthorizedForPartnerId,
    isAnonymous
} from "../authentication";
import {ok} from "../../is";
import {join, dirname} from "node:path";

const { pathname } = new URL(import.meta.url);
const DIRECTORY = dirname(pathname);
export const REACT_CLIENT_DIRECTORY = join(DIRECTORY, "../react/client");

export async function viewRoutes(fastify: FastifyInstance) {
    const { ALLOW_ANONYMOUS_VIEWS } = process.env;

    fastify.get("/server.css", async (request, response) => {
        response.header("Content-Type", "text/css");
        response.send(ServerCSS);
    });

    function createPathHandler(path: string, options?: Partial<KarmaServerProps>) {

        return async function handler(request: FastifyRequest, response: FastifyReply) {
            const isFragment = request.url.includes("fragment");
            response.header("Content-Type", "text/html; charset=utf-8");
            // TODO swap to same host hosted documents
            response.header("Cross-Origin-Embedder-Policy", "unsafe-none");

            const anonymous = isAnonymous();
            const state = getMaybeAuthenticationState();

            // console.log({ anonymous, state, roles: state?.roles });

            // Can go right to static, should be no async loading within components
            let html = renderToStaticMarkup(
                <KarmaServer
                    {...options}
                    url={path}
                    isAnonymous={anonymous}
                    isFragment={isFragment}
                    partners={anonymous ? [] : await listPartners({
                        authorizedPartnerId: getMaybeAuthorizedForPartnerId()
                    })}
                    organisations={anonymous ? [] : await listOrganisations({
                        authorizedOrganisationId: getMaybeAuthorizedForOrganisationId()
                    })}
                    categories={anonymous ? [] : await listCategories()}
                    metrics={anonymous ? [] : await listMetrics()}
                    products={anonymous ? [] : await listProducts()}
                    roles={state?.roles}
                    query={request.query}
                    body={request.body}
                />
            );

            if (!isFragment) {
                html = `<!doctype html>\n${html}`
            }

            response.status(200);
            response.send(html)
        }
    }
    function createPathSubmitHandler(path: string) {
        const submit = pathsSubmit[path];
        ok(typeof submit === "function", `Expected pathSubmit.${path} to be a functon`);

        return async function handler(request: FastifyRequest, response: FastifyReply) {
            let result, error;
            try {
                result = await submit(request, response);
            } catch (caught) {
                error = caught;
            }
            const view = createPathHandler(path, {
                result,
                error,
                submitted: true
            });
            await view(request, response);
        }
    }

    Object.keys(paths).forEach(path => {
        const handler = createPathHandler(path);

        const preHandler = authenticate(fastify, {
            anonymous: pathsAnonymous[path] || !!ALLOW_ANONYMOUS_VIEWS
        });

        fastify.get(`${path}/fragment`, {
            preHandler,
            handler
        });
        fastify.get(path, {
            preHandler,
            handler
        });

        if (pathsSubmit[path]) {
            fastify.post(path, {
                preHandler,
                handler: createPathSubmitHandler(path)
            });
        }
    });

    const handler = createPathHandler("/home");
    fastify.get("/", handler);
}