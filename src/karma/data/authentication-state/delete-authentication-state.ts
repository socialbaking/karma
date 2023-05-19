import { getAuthenticationStateStore } from "./store";

export async function deleteAuthenticationState(stateId: string) {
  const store = getAuthenticationStateStore();
  await store.delete(stateId);
}
