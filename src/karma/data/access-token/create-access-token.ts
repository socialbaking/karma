import {v4} from "uuid";
import {createHash} from "crypto";
import {AccessToken, AccessTokenData} from "./types";
import {getAccessTokenStore} from "./store";

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