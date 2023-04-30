import {requestContext} from "@fastify/request-context";
import {ok} from "../../is";

export * from "./bearer-authentication";

const AUTHORIZED_PARTNER_ID_KEY = "authorizedForPartnerIds";

export function setAuthorizedForPartnerId(partnerId: string) {
    requestContext.set(AUTHORIZED_PARTNER_ID_KEY, partnerId)
}

export function getMaybeAuthorizedForPartnerId() {
    return requestContext.get(AUTHORIZED_PARTNER_ID_KEY);
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