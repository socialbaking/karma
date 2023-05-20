import { getExpiringStore, MONTH_MS } from "../expiring-kv";
import { ExternalUserReference, User } from "./types";
import { AuthenticationStateType } from "../authentication-state";
import { createHash } from "crypto";
import { name } from "../../package";

const STORE_NAME = "user";
const REFERENCE_STORE_NAME = "userReference";

export const DEFAULT_USER_EXPIRES_IN_MS = 6 * MONTH_MS;

export function getUserStore() {
  return getExpiringStore<User>(STORE_NAME, {
    counter: false,
  });
}

export function getExternalUserReferenceStore() {
  return getExpiringStore<ExternalUserReference>(REFERENCE_STORE_NAME, {
    counter: false,
  });
}

export function getExternalReferenceKey(
  externalType: AuthenticationStateType,
  externalId: string
) {
  const hash = createHash("sha256");
  hash.update(externalId);
  hash.update(name);
  const key = hash.digest().toString("hex");
  return `${externalType}::${key}`;
}
