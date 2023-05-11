import {Expiring} from "../expiring";


export interface BackgroundData extends Expiring, Record<string, unknown> {

}

export interface Background extends BackgroundData {
    backgroundKey: string;
    backgroundId: string;
    createdAt: string;
    expiresAt: string;
    completedAt?: string;
}