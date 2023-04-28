import { listen } from "@virtualstate/listen";
import fastify from "fastify";
import {routes} from "./routes";

function getPort() {
    const env = process.env.PORT;
    if (env && /^\d+$/.test(env)) {
        return +env;
    }
    return 0; // random;
}

export async function start() {
    const app = fastify({
        logger: true
    })

    app.register(routes);

    const port = getPort();

    await app.listen({ port });
}