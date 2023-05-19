import {
  AuthenticationState,
  AuthenticationStateData,
  AuthenticationStateType,
} from "./types";
import { createKey } from "./state-key";
import {
  DEFAULT_AUTHENTICATION_STATE_EXPIRES_MS,
  DEFAULT_COOKIE_STATE_EXPIRES_MS,
  EXTERNAL_STATE_ID_SEPARATOR,
  getAuthenticationStateStore,
} from "./store";
import { getExpiresAt } from "../expiring-kv";
import { setAuthenticationState } from "./set-authentication-state";

export async function addCookieState(data: Partial<AuthenticationStateData>) {
  return addAuthenticationState({
    ...data,
    type: "cookie",
    expiresAt: getExpiresAt(DEFAULT_COOKIE_STATE_EXPIRES_MS, data.expiresAt),
  });
}

export async function addAuthenticationState(data: AuthenticationStateData) {
  return setAuthenticationState(data);
}
