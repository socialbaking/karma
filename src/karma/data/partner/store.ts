import {getKeyValueStore} from "../kv";
import {Partner} from "./types";

const STORE_NAME = "partner" as const;

export function getPartnerStore() {
    return getKeyValueStore<Partner>(STORE_NAME);
}