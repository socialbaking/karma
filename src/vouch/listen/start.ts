import { listen } from "@virtualstate/listen";
import fastify from "fastify";
import {routes} from "./routes";
import {setupSwagger} from "./swagger";
import blippPlugin from "fastify-blipp";
import corsPlugin from "@fastify/cors";
import {getPort} from "./config";
import { fastifyRequestContext } from "@fastify/request-context";
import {kvsEnvStorage} from "@kvs/env";

export async function start() {
    const app = fastify({
        logger: true
    })

    const storage = await kvsEnvStorage({
        name: "vouch",
        version: 1
    });

    app.register(fastifyRequestContext, {
        hook: 'preValidation',
        defaultStoreValues: () => ({
            kvStore: storage
        })
    });

    app.register(blippPlugin);
    app.register(corsPlugin);

    await setupSwagger(app);

    app.register(routes);

    const port = getPort();

    await app.listen({ port });

    app.blipp();
}