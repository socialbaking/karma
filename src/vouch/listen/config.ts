import {ok} from "../../is";
import {requestContext} from "@fastify/request-context";

export function getPort() {
    const hostname = getEnvironmentHostname();
    if (hostname) {
        const { port } = new URL(hostname);
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

function getEnvironmentHostname() {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }

    if (process.env.API_URL) {
        return process.env.API_URL;
    }

    if (process.env.SERVER_EXTERNAL_URL_HOSTNAME) {
        return process.env.SERVER_EXTERNAL_URL_HOSTNAME;
    }

    const hostname = requestContext.get("hostname");

    if (hostname) {
        return hostname;
    }

    return undefined;
}

export function getHostname() {
    const hostname = getEnvironmentHostname();
    if (hostname) {
        return hostname;
    }

    const port = getPort();

    ok(port);

    return `http://localhost:${port}`;
}