import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {
    commit,
    commitAt, commitAuthor,
    packageIdentifier, secondsBetweenCommitAndBuild, secondsBetweenCommitAndTestCompletion,
    timeBetweenCommitAndBuild,
    timeBetweenCommitAndTestCompletion
} from "../package";
import {paths, pathsAnonymous} from "../react/server/paths";
import KarmaServer from "../react/server";
import {renderToStaticMarkup} from "react-dom/server";
import {listCategories, listMetrics, listPartners, listProducts} from "../data";
import {authenticate} from "../listen/authentication";
import ServerCSS from "../react/server/server-css";
import {isAnonymous} from "../authentication";

export async function viewRoutes(fastify: FastifyInstance) {

    // TODO: Register view endpoints here

    const { ALLOW_ANONYMOUS_VIEWS } = process.env;

    fastify.get("/server.css", async (request, response) => {
        response.header("Content-Type", "text/css");
        response.send(ServerCSS);
    })


    function createPathHandler(path: string) {
        return async function handler(request: FastifyRequest, response: FastifyReply) {
            const isFragment = request.url.includes("fragment");
            response.header("Content-Type", "text/html; charset=utf-8");
            // TODO swap to same host hosted documents
            response.header("Cross-Origin-Embedder-Policy", "unsafe-none");

            const anonymous = isAnonymous();

            console.log({ anonymous });

            // Can go right to static, should be no async loading within components
            let html = renderToStaticMarkup(
                <KarmaServer
                    url={path}
                    isAnonymous={anonymous}
                    isFragment={isFragment}
                    partners={anonymous ? [] : await listPartners()}
                    categories={anonymous ? [] : await listCategories()}
                    metrics={(!anonymous && path.includes("metrics")) ? await listMetrics() : undefined}
                    products={anonymous ? [] : await listProducts()}
                />
            );

            if (!isFragment) {
                html = `<!doctype html>\n${html}`
            }

            response.status(200);
            response.send(html)
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
    });

    const handler = createPathHandler("/home");
    fastify.get("/", handler);
}