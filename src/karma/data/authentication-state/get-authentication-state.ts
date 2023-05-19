import { getAuthenticationStateStore } from "./store";
import { ok } from "../../../is";
import { splitKey } from "./state-key";

export async function getAuthenticationState(stateId: string) {
  const store = getAuthenticationStateStore();
  return store.get(stateId);
}

export async function getAuthenticationStateByKey(stateKey: string) {
  const { stateId, userState } = splitKey(stateKey);
  const state = await getAuthenticationState(stateId);
  if (!state) return undefined;
  if (userState) {
    ok(
      state.userState === userState,
      "Expected stored state to match given state"
    );
  }
  return state;
}
