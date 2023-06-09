import {
  DEFAULT_USER_EXPIRES_IN_MS,
  getExternalReferenceKey,
  getExternalUserReferenceStore,
  getUserStore,
} from "./store";
import { AuthenticationStateType } from "../authentication-state";
import { ok } from "../../../is";
import { getExpiresAt } from "../storage";
import { addExternalUser } from "./add-user";
import { User } from "./types";

export function getUser(userId: string) {
  const store = getUserStore();
  return store.get(userId);
}

export async function getExternalUser(
  externalType: AuthenticationStateType,
  externalId: string
): Promise<User> {
  const store = getExternalUserReferenceStore();
  const key = getExternalReferenceKey(externalType, externalId);
  const reference = await store.get(key);
  if (!reference) {
    console.log(`Adding external user for ${externalType}`);
    return addExternalUser({
      externalId,
      externalType,
    });
  }
  ok(
    reference.externalType === externalType,
    "Expected external user type to match"
  );
  ok(reference.userId, "Expected external user id to be available");
  const user = await getUser(reference.userId);
  // If user is not expiring, persist the external user reference
  // If user is expiring, reset both to default expiring time
  const expiresAt = user.expiresAt
    ? getExpiresAt(DEFAULT_USER_EXPIRES_IN_MS)
    : undefined;
  // console.log(`Updating expires at of external user for ${externalType}, before ${reference.expiresAt}, after ${expiresAt}`);
  const userStore = getUserStore();
  if (expiresAt) {
    await userStore.set(user.userId, {
      ...user,
      expiresAt,
    });
  }
  await store.set(key, {
    ...reference,
    expiresAt,
  });
  return user;
}
