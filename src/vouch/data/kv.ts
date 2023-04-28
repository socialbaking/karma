import { requestContext } from "@fastify/request-context";
import {KVS, StorageSchema} from "@kvs/types";

export function getKeyValueStore() {
    return getRequestContextKeyValueStore();
}

export const requestContextKeystoreKey = "kvStore" as const;

export function getRequestContextKeyValueStore<S extends StorageSchema = StorageSchema>(): KVS<S> {
    return requestContext.get(requestContextKeystoreKey);
}