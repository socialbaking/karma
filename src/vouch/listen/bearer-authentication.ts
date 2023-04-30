import {FastifyRequest} from "fastify";
import {getAccessToken} from "../data";

export async function bearerAuthentication(key: string, request: FastifyRequest): Promise<boolean> {
    if (!key) return false;
    const token = await getAccessToken(key);
    if (!token) return false;
    if (!token.disabledAt) return false;

    if (token.partnerId) {
        request.requestContext.set("partnerId", token.partnerId);
    }

    request.requestContext.set("accessTokenAuthentication", true);
    request.requestContext.set("accessToken", token);

    return true;
}