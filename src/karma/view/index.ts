import {FastifyInstance} from "fastify";
import {minutesBetweenCommitAndBuild, packageIdentifier, secondsBetweenCommitAndBuild} from "../package";

export async function viewRoutes(fastify: FastifyInstance) {

    // TODO: Register view endpoints here

    fastify.get("/", async (request, response) => {

        response.header("Content-Type", "text/html");
        response.send(`
            <p>Welcome! You are running ${packageIdentifier}</p>
            <p>
                <a href="/api/documentation">Checkout the documentation!</a>
            </p>
            <p>
                <strong>Time between commit and build</strong><br/>
                Seconds: ${secondsBetweenCommitAndBuild}<br/>
                Minutes: ${minutesBetweenCommitAndBuild}
            </p>
        `);
    })
}