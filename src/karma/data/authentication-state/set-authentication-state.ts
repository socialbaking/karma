import { AuthenticationState, AuthenticationStateData } from "./types";
import { createKey } from "./state-key";
import {
  DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS,
  getAuthenticationStateStore,
} from "./store";
import { getExpiresAt } from "../expiring-kv";

export async function setAuthenticationState(
  data: AuthenticationStateData & Partial<AuthenticationState>
) {
  const key = createKey(data.userState);
  const stateId = data.stateId || key.stateId;
  const stateKey = data.stateKey || key.stateKey;
  const createdAt = data.createdAt || new Date().toISOString();
  const state: AuthenticationState = {
    createdAt,
    ...data,
    stateId,
    stateKey,
    expiresAt: getExpiresAt(
      DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS,
      data.expiresAt
    ),
  };
  const store = getAuthenticationStateStore();
  await store.set(stateId, state);
  return state;
}
