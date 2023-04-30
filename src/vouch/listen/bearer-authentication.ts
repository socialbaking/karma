import {FastifyReply, FastifyRequest} from "fastify";
import {getAccessToken as getAccessTokenDocument} from "../data";
import {FastifyAuthFunction} from "@fastify/auth";
import {setAuthorizedForPartnerId} from "./authentication";
import {ok} from "../../is";
import {requestContext} from "@fastify/request-context";
import {getPartner as getPartnerDocument, Partner} from "../data/partner";

const AUTHORIZED_ACCESS_TOKEN_KEY = "accessTokenKeyValue";
const AUTHORIZED_PARTNER = "partner";

export function getMaybePartner(): Partner | undefined {
    return requestContext.get(AUTHORIZED_PARTNER)
}

export function getPartner(): Partner {
    const partner = getMaybePartner();
    ok(partner, "Expected authorized partner");
    return partner;
}

export function getMaybeAccessToken() {
    return requestContext.get(AUTHORIZED_ACCESS_TOKEN_KEY);
}

export function getAccessToken() {
    const accessToken = getMaybeAccessToken();
    ok(accessToken, "Expected access token to be supplied");
    return accessToken;
}

export async function bearerAuthentication(key: string, request: FastifyRequest): Promise<boolean> {
    if (!key) return false;
    const token = await getAccessTokenDocument(key);
    if (!token) return false;
    if (token.disabledAt) return false;


    if (token.partnerId) {
        setAuthorizedForPartnerId(token.partnerId);
        const partner = await getPartnerDocument(token.partnerId);
        request.requestContext.set(AUTHORIZED_PARTNER, partner);
        if (process.env.VOUCH_REQUIRE_PARTNER_APPROVAL) {
            if (!partner.approved) return false;
        }

    }

    request.requestContext.set("accessTokenAuthentication", true);
    request.requestContext.set("accessToken", token);
    request.requestContext.set(AUTHORIZED_ACCESS_TOKEN_KEY, token.accessToken);

    return true;
}

export const allowAnonymous: FastifyAuthFunction = (request, response, done) => {
    if (request.headers.authorization) {
        return done(Error('not anonymous'))
    }
    return done()
}

export const accessToken: FastifyAuthFunction = async (request, response) => {
    ok<{ accessToken?: string }>(request.query);
    if (!request.query.accessToken) {
        throw new Error('not authorized');
    }
    const success = await bearerAuthentication(request.query.accessToken, request);
    if (!success) {
        throw new Error('not authorized');
    }
}

