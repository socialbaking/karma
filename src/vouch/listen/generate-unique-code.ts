import { route } from "@virtualstate/listen/routes";
import { generateUniqueCode as example } from "../examples";
import {FetchEvent} from "@virtualstate/listen";
import {FastifyInstance} from "fastify";
import {getKeyValueStore} from "./kv";
import id from "human-readable-ids";
import {v4} from "uuid";

async function generateActualCode() {
    return id.hri.random();
}

export async function generateUniqueCode(fastify: FastifyInstance) {
    fastify.post("/generate-unique-code", async (request, response) => {
        const store = getKeyValueStore();
        const uniqueCode = await generateActualCode();
        const createdAt = new Date().toISOString();
        const document = {
            uniqueCode,
            createdAt,
            updatedAt: createdAt
        }
        await store.set(`#code#${uniqueCode}`, document)
        await store.set(`#log#${v4()}`, {
            message: "Unique code generated",
            uniqueCode,
            timestamp: createdAt
        })
        response.send(document);
    })
}
