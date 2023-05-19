import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import { getMaybeAuthenticationState, isAnonymous } from "../../authentication";
import { setAuthenticationState } from "../../data";
import { authenticate } from "../authentication";
import { ok } from "../../../is";

export async function logoutResponse(response: FastifyReply) {
  const state = getMaybeAuthenticationState();

  if (state && state.type !== "partner") {
    await setAuthenticationState({
      ...state,
      // Expire in the background
      expiresAt: new Date(Date.now() + 25).toISOString(),
    });
  }

  response.clearCookie("state", {
    path: "/",
    signed: true,
  });
}

export async function logoutRoutes(fastify: FastifyInstance) {
  fastify.get("/logout", {
    preHandler: authenticate(fastify),
    async handler(request, response) {
      ok(!isAnonymous(), "Expected authentication");

      await logoutResponse(response);

      response.header("Location", "/");
      response.status(302);
      response.send("Redirecting");
    },
  });
}
