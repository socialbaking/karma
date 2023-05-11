import {Expiring} from "../expiring";

export type AuthenticationStateType = "discord";

export interface AuthenticationStateData extends Expiring, Record<string, unknown> {
    type: AuthenticationStateType | string;
    userState?: string;
    externalScope?: string;
}

export interface AuthenticationState extends AuthenticationStateData {
    stateId: string;
    stateKey: string;
    createdAt: string;
}