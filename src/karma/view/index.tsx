import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {
    commit,
    commitAt, commitAuthor,
    packageIdentifier, secondsBetweenCommitAndBuild, secondsBetweenCommitAndTestCompletion,
    timeBetweenCommitAndBuild,
    timeBetweenCommitAndTestCompletion
} from "../package";
import {paths} from "../react/server/paths";
import KarmaServer from "../react/server";
import {renderToStaticMarkup} from "react-dom/server";
import {listCategories, listMetrics, listPartners, listProducts} from "../data";
import {authenticate} from "../listen/authentication";
import ServerCSS from "../react/server/server-css";

export async function viewRoutes(fastify: FastifyInstance) {

    // TODO: Register view endpoints here

    const { ALLOW_ANONYMOUS_VIEWS } = process.env;

    fastify.get("/server.css", async (request, response) => {
        response.header("Content-Type", "text/css");
        response.send(ServerCSS);
    })

    Object.keys(paths).forEach(path => {

        async function handler(request: FastifyRequest, response: FastifyReply) {
            const isFragment = request.url.includes("fragment");
            response.header("Content-Type", "text/html; charset=utf-8");
            // TODO swap to same host hosted documents
            response.header("Cross-Origin-Embedder-Policy", "unsafe-none");

            // Can go right to static, should be no async loading within components
            let html = renderToStaticMarkup(
                <KarmaServer
                    url={path}
                    isFragment={isFragment}
                    partners={await listPartners()}
                    categories={await listCategories()}
                    metrics={path.includes("metrics") ? await listMetrics() : undefined}
                    products={await listProducts()}
                />
            );

            if (!isFragment) {
                html = `<!doctype html>\n${html}`
            }

            response.status(200);
            response.send(html)
        }

        const preHandler = authenticate(fastify, {
            anonymous: !!ALLOW_ANONYMOUS_VIEWS
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

    fastify.get("/", async (request, response) => {

        response.header("Content-Type", "text/html");
        response.send(`
            <p>Welcome! You are running ${packageIdentifier}</p>
            <p>
                <a href="/api/documentation">Checkout the documentation!</a>
            </p>
            <p data-seconds="${secondsBetweenCommitAndBuild}">
                <strong>Time between commit and build</strong><br/>
                ${timeBetweenCommitAndBuild}
            </p>
            ${
            timeBetweenCommitAndTestCompletion ? (
                `
                <p data-seconds="${secondsBetweenCommitAndTestCompletion}">
                    <strong>Time between commit and tests completion</strong><br/>
                    ${timeBetweenCommitAndTestCompletion}
                </p>
                `
            ) : "<!-- No tests ran after build -->"
            }
            <p>
                Source code last updated at ${commitAt} by ${commitAuthor}<br/>
                Commit Hash: ${commit}
            </p>
        `);
    })
}