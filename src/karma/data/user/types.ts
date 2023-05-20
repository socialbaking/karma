import { Expiring } from "../expiring";
import { AuthenticationStateType } from "../authentication-state";

export interface UserData extends Expiring, Record<string, unknown> {
  externalType?: AuthenticationStateType;
}

export interface ExternalUserReferenceData {
  externalId: string;
  externalType: AuthenticationStateType;
}

export interface ExternalUserReference extends Expiring {
  externalType: AuthenticationStateType;
  userId: string;
}

export interface User extends UserData {
  userId: string;
  createdAt: string;
  updatedAt: string;
}
