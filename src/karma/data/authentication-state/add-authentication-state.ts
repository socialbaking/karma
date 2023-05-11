import {AuthenticationState, AuthenticationStateData} from "./types";
import {createKey} from "./state-key";
import {DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS, getAuthenticationStateStore} from "./store";

export async function addAuthenticationState(data: AuthenticationStateData) {
    const { stateId, stateKey } = createKey(data.userState);
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(
        Date.now() + DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS
    ).toISOString();
    const state: AuthenticationState = {
        ...data,
        stateId,
        stateKey,
        expiresAt,
        createdAt
    };
    const store = getAuthenticationStateStore();
    await store.set(stateId, state);
    return state;
}