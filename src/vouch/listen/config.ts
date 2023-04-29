import {ok} from "../../is";
import {requestContext} from "@fastify/request-context";

export function getPort() {
    const hostname = requestContext.get("hostname");

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

export function getHostname() {
    const hostname = requestContext.get("hostname");

    if (hostname) {
        return hostname;
    }

    if (process.env.SERVER_EXTERNAL_URL_HOSTNAME) {
        return process.env.SERVER_EXTERNAL_URL_HOSTNAME;
    }

    const port = getPort();

    ok(port);

    return `http://localhost:${port}`;
}