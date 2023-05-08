import {getKeyValueStore} from "./kv";
import {SystemLogData} from "./system-log";
import {v4} from "uuid";
import {createHash} from "crypto";

export interface AccessTokenData {
    partnerId?: string;
}

export interface AccessToken extends AccessTokenData {
    accessToken: string;
    createdAt: string;
    disabledAt?: string;
}

export interface ReverseAccessToken {
    accessTokenId: string;
}

const ACCESS_TOKEN_STORE_NAME = "accessToken"
const REVERSE_ACCESS_TOKEN_STORE_NAME = "reverseAccessToken"

export function getAccessTokenStore() {
    return getKeyValueStore<AccessToken>(ACCESS_TOKEN_STORE_NAME);
}

// Used to store the accessToken -> accessTokenId association
export function getReverseAccessTokenStore() {
    return getKeyValueStore<ReverseAccessToken>(REVERSE_ACCESS_TOKEN_STORE_NAME);
}

// TODO: is this the best way to create an access token string?
function createAccessTokenString() {
    const value = v4();
    const hash = createHash("sha512");
    hash.update(value);
    const buffer = hash.digest();
    return buffer.toString("hex");
}

export async function createPartnerAccessToken(partnerId: string) {
    return createAccessToken({
        partnerId
    });
}

export async function createAccessToken(data: AccessTokenData) {
    const createdAt = new Date().toISOString();
    const accessToken = createAccessTokenString();
    const token: AccessToken = {
        ...data,
        accessToken,
        createdAt
    };
    const store = getAccessTokenStore();
    await store.set(accessToken, token);
    return {
        accessToken
    } as const;
}

export async function getAccessToken(accessToken: string) {
    const store = getAccessTokenStore();
    return store.get(accessToken);
}