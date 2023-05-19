import { getKeyValueStore } from "../kv";
import { Organisation } from "./types";

const STORE_NAME = "organisation" as const;

export function getOrganisationStore() {
  return getKeyValueStore<Organisation>(STORE_NAME);
}
