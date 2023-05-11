import {getExpiringStore} from "../expiring-kv";
import {AuthenticationState} from "./types";

const STORE_NAME = "authenticationState";

// 3 minutes
export const DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS = 3 * 60 * 1000;

export function getAuthenticationStateStore() {
    return getExpiringStore<AuthenticationState>(STORE_NAME);
}