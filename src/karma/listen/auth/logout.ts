import {FastifyInstance} from "fastify";
import {getMaybeAuthenticationState, isAnonymous} from "../../authentication";
import {setAuthenticationState} from "../../data";
import {authenticate} from "../authentication";
import {ok} from "../../../is";

export async function logoutRoutes(fastify: FastifyInstance) {

    fastify.get(
        "/logout",
        {
            preHandler: authenticate(fastify),
            async handler(request, response) {

                ok(!isAnonymous(), "Expected authentication");

                const state = getMaybeAuthenticationState();

                if (state) {
                    await setAuthenticationState({
                        ...state,
                        // Expire in the background
                        expiresAt: new Date(Date.now() + 25).toISOString()
                    })
                }

                response.clearCookie("state", {
                    path: "/",
                    signed: true,
                });

                response.header("Location", "/");
                response.status(302);
                response.send("Redirecting");

            }
        }
    )
}