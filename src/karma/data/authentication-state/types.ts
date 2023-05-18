import {Expiring} from "../expiring";

export type AuthenticationStateType = "discord" | "reddit" | "cookie" | "authsignal" | "partner";

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

export interface AuthenticationStateFromData {
    type: AuthenticationStateType | string;
    createdAt: string;
    from?: AuthenticationStateFromData;
}

export interface AuthenticationStateData extends Expiring, Record<string, unknown> {
    type: AuthenticationStateType | string;
    from?: AuthenticationStateFromData;
    userState?: string;
    externalScope?: string;
    externalState?: string;
    externalKey?: string;
    roles?: AuthenticationRole[];
    partnerId?: string;
    userId?: string;
    redirectUrl?: string;
}

export interface AuthenticationState extends AuthenticationStateData, AuthenticationStateFromData {
    stateId: string;
    stateKey: string;
    createdAt: string;
    expiresAt: string;
}