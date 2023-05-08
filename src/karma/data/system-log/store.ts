import {getKeyValueStore} from "../kv";
import {SystemLog} from "./types";

const STORE_NAME = "systemLog" as const;

export function getSystemLogStore() {
    return getKeyValueStore<SystemLog>(STORE_NAME);
}