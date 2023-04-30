import {FastifyReply, FastifyRequest} from "fastify";
import {getAccessToken} from "../data";
import {FastifyAuthFunction} from "@fastify/auth";
import {setAuthorizedForPartnerId} from "./authentication";
import {ok} from "../../is";

export async function bearerAuthentication(key: string, request: FastifyRequest): Promise<boolean> {
    if (!key) return false;
    const token = await getAccessToken(key);
    if (!token) return false;
    if (token.disabledAt) return false;

    if (token.partnerId) {
        setAuthorizedForPartnerId(token.partnerId);
    }

    request.requestContext.set("accessTokenAuthentication", true);
    request.requestContext.set("accessToken", token);

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

