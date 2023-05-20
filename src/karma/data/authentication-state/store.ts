import { DAY_MS, getExpiringStore, MINUTE_MS } from "../expiring-kv";
import { AuthenticationState } from "./types";

const STORE_NAME = "authenticationState";

export const DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS = 3 * MINUTE_MS;
export const DEFAULT_COOKIE_STATE_EXPIRES_MS = DAY_MS;
// Magic email link lasts 10 minutes
export const DEFAULT_AUTHSIGNAL_STATE_EXPIRES_MS = 12 * MINUTE_MS;

export const EXTERNAL_STATE_ID_SEPARATOR = "::";

export function getAuthenticationStateStore() {
  return getExpiringStore<AuthenticationState>(STORE_NAME, {
    counter: false,
  });
}
