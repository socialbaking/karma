import { listen } from "@virtualstate/listen";
import fastify from "fastify";
import {routes} from "./routes";
import {setupSwagger} from "./swagger";
import blippPlugin from "fastify-blipp";
import corsPlugin from "@fastify/cors";
import {getPort} from "./config";
import {fastifyRequestContext, requestContext} from "@fastify/request-context";
import helmet from "@fastify/helmet";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { bearerAuthentication } from "./bearer-authentication";
import bearerAuthPlugin from "@fastify/bearer-auth";
import authPlugin from "@fastify/auth";
import {seed} from "../data";

const { pathname } = new URL(import.meta.url);
const directory = dirname(pathname)

export async function initRedisMemory() {
    const { RedisMemoryServer } = await import("redis-memory-server")
    const redisServer = new RedisMemoryServer();

    const host = await redisServer.getHost();
    const port = await redisServer.getPort();

    process.env.REDIS_URL = `redis://${host}:${port}`;

    return async () => {
        return redisServer.stop();
    }
}

export async function create() {

    const closeFns: (() => Promise<void>)[] = [];

    if (process.env.REDIS_MEMORY && !process.env.REDIS_URL) {
        closeFns.push(await initRedisMemory());
    }

    const app = fastify({
        logger: true
    });

    const register: (...args: unknown[]) => void = app.register.bind(fastify);

    const packageJSON = await readFile(join(directory, "../../../package.json"), "utf-8")
    const {
        name,
        version
    } = JSON.parse(packageJSON);

    register(helmet, { contentSecurityPolicy: false });

    app.addHook(
        "preValidation",
        async (request, response) => {
            if (request.headers.apikey && !request.headers.authorization) {
                request.headers.authorization = `bearer ${request.headers.apikey}`
            }
        }
    )

    register(fastifyRequestContext, {
        hook: 'preValidation',
        defaultStoreValues: {

        }
    });

    app.addHook(
        "preValidation",
        async (request, response) => {
            request.requestContext.set("origin", `${request.protocol}://${request.hostname}`);

            response.header("X-Powered-By", `${name}@${version}`);
        }
    )

    register(blippPlugin);
    register(corsPlugin);

    await setupSwagger(app);

    register(authPlugin)
    register(bearerAuthPlugin, {
        keys: new Set<string>(),
        auth: bearerAuthentication,
        addHook: false
    });

    register(routes);

    return {
        app,
        closeFns
    } as const;
}

export async function start() {

    const {
        app, closeFns
    } = await create();

    // Before we start, we should seed
    await seed();

    const port = getPort();

    await app.listen({ port });

    app.blipp();

    return async () => {
        await app.close();
        await Promise.all(
            closeFns.map(async (fn) => fn())
        );
    }
}