import { route } from "@virtualstate/listen/routes";
import { retrieveSystemLogs as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";
import {getKeyValueStore} from "./kv";

export async function retrieveSystemLogs(fastify: FastifyInstance) {
    fastify.get("/system-logs", async (request, response) => {
        const logs = [];
        for await (const [key, log] of getKeyValueStore()) {
            if (typeof key !== "string") continue;
            if (!key.startsWith("#log#")) continue;
            logs.push(log)
        }
        response.send(logs);
    })
}

