import {AuthenticationState, AuthenticationStateData} from "./types";
import {createKey} from "./state-key";
import {
    DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS,
    DEFAULT_COOKIE_STATE_EXPIRES_MS,
    getAuthenticationStateStore
} from "./store";
import {getExpiresAt} from "../expiring-kv";

export async function addCookieState(data: Partial<AuthenticationStateData>) {
    return addAuthenticationState({
        ...data,
        type: "cookie",
        expiresAt: getExpiresAt(DEFAULT_COOKIE_STATE_EXPIRES_MS, data.expiresAt)
    });
}

export async function addAuthenticationState(data: AuthenticationStateData) {
    const { stateId, stateKey } = createKey(data.userState);
    const createdAt = new Date().toISOString();
    const state: AuthenticationState = {
        ...data,
        stateId,
        stateKey,
        expiresAt: getExpiresAt(DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS, data.expiresAt),
        createdAt
    };
    const store = getAuthenticationStateStore();
    await store.set(stateId, state);
    return state;
}