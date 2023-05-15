import {Expiring} from "../expiring";

export type AuthenticationStateType = "discord" | "reddit" | "cookie" | "partner";

export type AuthenticationRole = (
    | "moderator"
    | "admin"
    | "owner"
    | "patient"
    | "industry"
    | "member"
    | "pharmacy"
    | "clinic"
    | "booster"
    | "developer"
    | "coordinator"
);

export interface AuthenticationStateData extends Expiring, Record<string, unknown> {
    type: AuthenticationStateType | string;
    userState?: string;
    externalScope?: string;
    roles?: AuthenticationRole[];
    partnerId?: string;
    redirectUrl?: string;
}

export interface AuthenticationState extends AuthenticationStateData {
    stateId: string;
    stateKey: string;
    createdAt: string;
    expiresAt: string;
}