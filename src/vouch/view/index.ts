import {FastifyInstance} from "fastify";
import {codeDataRoutes} from "./code-data";
import {codePublicDetailsRoutes} from "./code-public-details";
import {partnerBalanceRoutes} from "./partner-balance";
import {requestCodeDataRoutes} from "./request-code-data";

export async function viewRoutes(fastify: FastifyInstance) {

    fastify.register(codeDataRoutes);
    fastify.register(codePublicDetailsRoutes);
    fastify.register(partnerBalanceRoutes);
    fastify.register(requestCodeDataRoutes);

    fastify.get("/", async (request, response) => {

        response.header("Content-Type", "text/html");
        response.send(`
            <p>Welcome!</p>
            <p>
                <a href="/request-code-data">Check a code here</a>
            </p>
            <p>
                <a href="/api/documentation">Checkout the documentation!</a>
            </p>
        `);
    })
}