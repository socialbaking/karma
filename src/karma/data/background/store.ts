import {getKeyValueStore} from "../kv";
import {Background} from "./types";

const STORE_NAME = "background" as const;

export function getBackgroundStore() {
    return getKeyValueStore<Background>(STORE_NAME);
}