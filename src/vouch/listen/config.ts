import {ok} from "../../is";
import {requestContext} from "@fastify/request-context";

export function getPort() {
    const origin = getEnvironmentOrigin();
    if (origin) {
        const { port } = new URL(origin);
        if (port) {
            return +port;
        }
    }
    const env = process.env.PORT;
    if (env && /^\d+$/.test(env)) {
        return +env;
    }
    return 3000;
}

function getEnvironmentOrigin() {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }

    if (process.env.API_URL) {
        return process.env.API_URL;
    }

    if (process.env.SERVER_EXTERNAL_URL_ORIGIN) {
        return process.env.SERVER_EXTERNAL_URL_ORIGIN;
    }

    const origin = requestContext.get("origin");

    if (origin) {
        return origin;
    }

    return undefined;
}

export function getOrigin() {
    const origin = getEnvironmentOrigin();

    if (origin) {
        return origin;
    }

    const port = getPort();

    ok(port);

    return `http://localhost:${port}`;
}