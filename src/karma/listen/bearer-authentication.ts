import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
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

export function getMaybeAccessToken(): string | undefined {
    return requestContext.get(AUTHORIZED_ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string {
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
        ok(partner, "Expected partner to be available");
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

export function getFastifyVerifyBearerAuth(fastify: FastifyInstance): FastifyAuthFunction {
    const verifyBearerAuth = fastify.verifyBearerAuth;
    ok(verifyBearerAuth, "Expected verifyBearerAuth, please setup @fastify/bearer-auth");
    return verifyBearerAuth;
}

export interface FastifyAuthOptions {
    relation?: "and" | "or",
    run?: "all"
}


export function getFastifyAuth(fastify: FastifyInstance) {
    const auth = fastify.auth;
    ok(auth, "Expected auth, please setup @fastify/auth");
    return auth;
}

export interface AuthInput extends FastifyAuthOptions {
    anonymous?: boolean;
}

export function authenticate(fastify: FastifyInstance, options?: AuthInput) {
    const methods: FastifyAuthFunction[] = [
        accessToken,
        getFastifyVerifyBearerAuth(fastify)
    ];

    if (options?.anonymous) {
        methods.unshift(allowAnonymous);
    }

    return getFastifyAuth(fastify)(methods, options);
}
