import {FastifyInstance} from "fastify";
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

export async function viewRoutes(fastify: FastifyInstance) {

    // TODO: Register view endpoints here

    const { ALLOW_ANONYMOUS_VIEWS } = process.env;

    Object.keys(paths).forEach(path => {
        fastify.get(path, {
            preHandler: authenticate(fastify, {
                anonymous: !!ALLOW_ANONYMOUS_VIEWS
            }),
            async handler(request, response) {
                response.header("Content-Type", "text/html; charset=utf-8");
                response.status(200);
                response.send(
                    // Can go right to static, should be no async loading within components
                    renderToStaticMarkup(
                        <KarmaServer
                            url={request.url}
                            partners={await listPartners()}
                            categories={await listCategories()}
                            metrics={request.url.includes("metrics") ? await listMetrics() : undefined}
                            products={await listProducts()}
                        />
                    )
                )
            }
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