import {
  ExternalUserReference,
  ExternalUserReferenceData,
  UserData,
} from "./types";
import {
  getExternalReferenceKey,
  getExternalUserReferenceStore,
} from "./store";
import { setUser } from "./set-user";

export async function addUser(data: UserData) {
  return setUser(data);
}

export async function addExternalUser(
  data: UserData & ExternalUserReferenceData
) {
  const store = getExternalUserReferenceStore();
  const { externalId, externalType, ...rest } = data;

  const user = await addUser({
    ...rest,
    externalType,
  });

  const reference: ExternalUserReference = {
    externalType,
    userId: user.userId,
    expiresAt: user.expiresAt,
  };
  const key = getExternalReferenceKey(externalType, externalId);
  await store.set(key, reference);

  return user;
}
