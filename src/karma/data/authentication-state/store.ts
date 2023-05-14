import {DAY_MS, getExpiringStore, MINUTE_MS} from "../expiring-kv";
import {AuthenticationState} from "./types";

const STORE_NAME = "authenticationState";

export const DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS = 3 * MINUTE_MS;
export const DEFAULT_COOKIE_STATE_EXPIRES_MS = DAY_MS;

export function getAuthenticationStateStore() {
    return getExpiringStore<AuthenticationState>(STORE_NAME);
}