import {FastifyInstance} from "fastify";
import {
    commit,
    commitAt, commitAuthor,
    packageIdentifier, secondsBetweenCommitAndBuild, secondsBetweenCommitAndTestCompletion,
    timeBetweenCommitAndBuild,
    timeBetweenCommitAndTestCompletion
} from "../package";

export async function viewRoutes(fastify: FastifyInstance) {

    // TODO: Register view endpoints here

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