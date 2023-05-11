import {v4} from "uuid";
import {createHash} from "crypto";
import {AccessToken, AccessTokenData, AccessTokenType} from "./types";
import {getAccessTokenStore} from "./store";

// TODO: is this the best way to create an access token string?
function createAccessTokenString(type?: AccessTokenType | string) {
    const value = v4();
    const hash = createHash("sha512");
    hash.update(value);
    const buffer = hash.digest();
    const hex = buffer.toString("hex");
    if (!type) return hex;
    return `${type}_${hex}`;
}

export async function createPartnerAccessToken(partnerId: string) {
    return createAccessToken({
        partnerId,
        accessTokenType: "partner"
    });
}

export async function createAccessToken(data: AccessTokenData) {
    const createdAt = new Date().toISOString();
    const accessToken = createAccessTokenString(data.accessTokenType);
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