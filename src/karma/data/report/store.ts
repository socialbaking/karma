import {getKeyValueStore} from "../kv";
import {Report} from "./types";

const STORE_NAME = "report" as const;

export function getReportStore() {
    return getKeyValueStore<Report>(STORE_NAME);
}