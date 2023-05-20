import { User, UserData } from "./types";
import { v4 } from "uuid";
import { getExpiresAt } from "../expiring-kv";
import { DEFAULT_USER_EXPIRES_IN_MS, getUserStore } from "./store";

export async function setUser(data: UserData & Partial<User>) {
  const store = getUserStore();
  const userId = data.userId || v4();
  const createdAt = data.createdAt || new Date().toISOString();
  const user: User = {
    ...data,
    userId,
    createdAt,
    updatedAt: createdAt,
    expiresAt: getExpiresAt(DEFAULT_USER_EXPIRES_IN_MS, data.expiresAt),
  };
  await store.set(userId, user);
  return user;
}
