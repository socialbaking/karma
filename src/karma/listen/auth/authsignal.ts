import { FastifyInstance } from "fastify";
import { ok } from "../../../is";
import { getOrigin } from "../config";
import {
  addCookieState,
  setAuthenticationState,
  getAuthenticationState,
  DEFAULT_AUTHSIGNAL_STATE_EXPIRES_MS,
  deleteAuthenticationState,
  getExternalUser,
} from "../../data";
import {
  authsignal,
  AUTHSIGNAL_REDIRECT_URL,
  AUTHSIGNAL_TENANT,
} from "../../authentication/authsignal";
import { createHash } from "crypto";
import { getClientIp } from "request-ip";
import { v4 } from "uuid";
import jsonwebtoken from "jsonwebtoken";
import { getExpiresAt } from "../../data/storage";

ok(jsonwebtoken.decode);

export async function authsignalAuthenticationRoutes(fastify: FastifyInstance) {

  if (!AUTHSIGNAL_TENANT) return;

  {
    const querystring = {
      type: "object",
      properties: {
        token: {
          type: "string",
        },
      },
      required: ["token"],
    };
    type Schema = {
      Querystring: {
        token: string;
      };
    };
    const schema = {
      querystring,
      tags: ["system"],
    };
    fastify.get<Schema>("/authsignal/callback", {
      schema,
      async handler(request, response) {
        const { token } = request.query;

        const decoded = jsonwebtoken.decode(token, {
          json: true,
        });

        ok(decoded, "Expected JWT token response");

        const {
          sub,
          other: { idempotencyKey, tenantId },
        } = decoded;

        ok(tenantId === AUTHSIGNAL_TENANT, "Expected tenantId to match");

        const state = await getAuthenticationState(idempotencyKey);

        ok(state, "Expected to find authentication state");

        const { type, userId } = state;

        ok(type === "authsignal", "Expected type to be authsignal");
        ok(userId === sub, "Expected token subject to match our given userId");

        const { state: userState, success } =
          await authsignal.validateChallenge({
            token,
            userId,
          });

        await deleteAuthenticationState(state.stateId);

        if (!success) {
          const { origin } = new URL(state.redirectUrl || getOrigin());
          const url = new URL("/login", origin);
          const error = "Failed to authenticate";
          url.searchParams.set("error", error);
          response.header("Location", url.toString());
          response.status(302);
          response.send(error);
          return;
        }

        const user = await getExternalUser("authsignal", userId);

        const { stateId, expiresAt } = await addCookieState({
          userId: user.userId,
          roles: [
            // We have no additional roles with this authentication method
            // Just give member, no trusted roles
            "member",
          ],
          from: {
            type: "authsignal",
            createdAt: state.createdAt,
          },
        });

        response.setCookie("state", stateId, {
          path: "/",
          signed: true,
          expires: new Date(expiresAt),
        });

        // "/home" is authenticated, "/" is not
        response.header("Location", "/home");
        response.status(302);
        response.send();
      },
    });
  }

  {
    const body = {
      type: "object",
      properties: {
        email: {
          type: "string",
        },
        deviceId: {
          type: "string",
          nullable: true,
        },
      },
      required: ["email"],
    };
    type Schema = {
      Body: {
        email: string;
        deviceId?: string;
      };
    };
    const schema = {
      body,
      tags: ["system"],
    };
    fastify.post<Schema>("/authsignal/redirect", {
      schema,
      async handler(request, response) {
        const { email, deviceId } = request.body;

        const hash = createHash("sha256");
        hash.update(AUTHSIGNAL_TENANT);
        hash.update(email);
        const userId = hash.digest().toString("hex");

        const { isEnrolled } = await authsignal.getUser({
          userId,
        });

        const redirectUrl =
          AUTHSIGNAL_REDIRECT_URL ||
          `${getOrigin()}${fastify.prefix}/authsignal/callback`;

        const actionCode = isEnrolled ? "authenticate" : "enroll";
        const ipAddress = getClientIp(request.raw);

        const stateId = v4();
        const idempotencyKey = stateId;

        const {
          state,
          url,
          idempotencyKey: returnedIdempotencyKey,
        } = await authsignal.track({
          action: actionCode,
          userId,
          email,
          idempotencyKey,
          deviceId: deviceId || undefined,
          userAgent: request.headers["user-agent"],
          ipAddress: ipAddress || undefined,
          redirectUrl,
        });

        const authenticationState = await setAuthenticationState({
          type: "authsignal",
          stateId,
          userId,
          externalKey: idempotencyKey,
          redirectUrl,
          authsignalState: state,
          authsignalActionCode: actionCode,
          expiresAt: getExpiresAt(DEFAULT_AUTHSIGNAL_STATE_EXPIRES_MS),
        });

        response.header("Location", url);
        if (authenticationState.expiresAt) {
          response.header("X-Expires-At", authenticationState.expiresAt);
        }

        response.status(302);
        response.send("Redirecting");
      },
    });
  }
}
