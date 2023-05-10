import {requestContext} from "@fastify/request-context";
import {ok} from "../../is";
import {Partner} from "../data";

export const AUTHORIZED_PARTNER_ID_KEY = "authorizedForPartnerIds";
export const AUTHORIZED_ACCESS_TOKEN_KEY = "accessTokenKeyValue";
export const AUTHORIZED_PARTNER = "partner";

export function setAuthorizedForPartnerId(partnerId: string) {
    requestContext.set(AUTHORIZED_PARTNER_ID_KEY, partnerId)
}

export function getMaybeAuthorizedForPartnerId() {
    return requestContext.get(AUTHORIZED_PARTNER_ID_KEY);
}

export function isAnonymous() {
    return !isAuthorized();
}

export function isAuthorized() {
    // Later add more here if more authentication methods or types are available
    return !!(
        getMaybeAuthorizedForPartnerId()
    )
}

export function getAuthorizedForPartnerId(): string {
    const partnerId = getMaybeAuthorizedForPartnerId();
    ok(partnerId, "Expected partner authorization")
    return partnerId;
}

export function validateAuthorizedForPartnerId(partnerId: string): asserts partnerId {
    const authorizedPartnerId = getAuthorizedForPartnerId();
    ok(authorizedPartnerId === partnerId, "Expected partner authorization to match");
}

export function ensurePartnerMatchIfUnapproved(partnerId: string): asserts partnerId {
    const { approved } = getPartner();
    if (process.env.VOUCH_REQUIRE_PARTNER_APPROVAL && !approved) {
        validateAuthorizedForPartnerId(partnerId);
    }
}



export function getMaybePartner(): Partner | undefined {
    return requestContext.get(AUTHORIZED_PARTNER)
}

export function getPartner(): Partner {
    const partner = getMaybePartner();
    ok(partner, "Expected authorized partner");
    return partner;
}

export function getMaybeAccessToken(): string | undefined {
    return requestContext.get(AUTHORIZED_ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string {
    const accessToken = getMaybeAccessToken();
    ok(accessToken, "Expected access token to be supplied");
    return accessToken;
}