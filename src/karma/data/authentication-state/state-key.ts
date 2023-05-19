import { v4 } from "uuid";
import { ok } from "../../../is";

const SEPARATOR = "|";

export function createKey(userState?: string) {
  const stateId = v4();
  if (!userState) return { stateId, stateKey: stateId } as const;
  const stateKey = [stateId, userState].join(SEPARATOR);
  return { stateId, stateKey } as const;
}

export function splitKey(stateKey: string) {
  ok(stateKey, "Expected stateKey");
  const [stateId, userState] = stateKey.split(SEPARATOR);
  return { stateId, userState } as const;
}
