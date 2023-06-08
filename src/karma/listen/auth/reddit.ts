import { FastifyInstance } from "fastify";
import DiscordOAuth2, { PartialGuild } from "discord-oauth2";
import { ok } from "../../../is";
import { getOrigin } from "../config";
import {
  getAuthenticationStateByKey,
  addAuthenticationState,
  systemLogSchema,
  addCookieState,
  AuthenticationRole,
  getAuthenticationRoles,
  getAuthenticationRole,
  deleteAuthenticationState,
  getCached,
  addExpiring,
  getExternalUser,
} from "../../data";
import { packageIdentifier } from "../../package";
import { getExpiresAt, MONTH_MS } from "../../data/expiring-kv";

interface RedditUserContent extends Record<string, unknown> {
  author_flair_text?: string;
  subreddit?: string;
  author?: string;
}

interface RedditSubscription extends Record<string, unknown> {
  id: string;
  url: string;
  name: string;
  display_name: string;
  title: string;
}

interface RedditSubscriptionNode {
  kind: string;
  data: RedditSubscription;
}

interface RedditSubscriptionListing {
  kind: "Listing";
  data: {
    children: RedditSubscriptionNode[];
  };
}

type RedditSubscriptionType = "moderator" | "subscriber" | "contributor";

type RedditSubscriptions = Record<RedditSubscriptionType, RedditSubscription[]>;

export const {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_REDIRECT_URL,
  REDDIT_SCOPE,
  REDDIT_NAME,
  REDDIT_AUTHORIZE_DURATION,
  REDDIT_FLAIR,
  REDDIT_FLAIR_EXPIRES_IN_MS: givenExpiresIn,
} = process.env;

export async function redditAuthenticationRoutes(fastify: FastifyInstance) {
  if (!REDDIT_CLIENT_ID) return;

  ok(REDDIT_CLIENT_ID, "Expected REDDIT_CLIENT_ID");
  ok(REDDIT_CLIENT_SECRET, "Expected REDDIT_CLIENT_SECRET");
  ok(REDDIT_NAME, "Expected REDDIT_NAME");
  ok(REDDIT_FLAIR, "Expected REDDIT_FLAIR");

  const REDDIT_FLAIR_EXPIRES_IN_MS = givenExpiresIn
    ? +givenExpiresIn
    : 6 * MONTH_MS;

  ok(REDDIT_FLAIR_EXPIRES_IN_MS > 0, "Expected REDDIT_FLAIR_EXPIRES_IN_MS");

  const REDDIT_CLIENT_BASIC = `Basic ${Buffer.from(
    `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`
  ).toString("base64")}`;

  const USER_AGENT = `SSO by ${packageIdentifier}`;

  const API_DOMAIN = "https://oauth.reddit.com";

  {
    const querystring = {
      type: "object",
      properties: {
        code: {
          type: "string",
        },
        grant_type: {
          type: "string",
        },
        state: {
          type: "string",
        },
      },
      required: ["code", "state"],
    };
    type Schema = {
      Querystring: {
        code: string;
        state: string;
      };
    };
    const schema = {
      querystring,
      tags: ["system"],
    };

    fastify.get<Schema>("/reddit/callback", {
      schema,
      async handler(request, response) {
        const { code, state: stateKey } = request.query;

        const state = await getAuthenticationStateByKey(stateKey);

        if (!state?.externalScope) {
          const message = `Could not find stateKey in storage`;
          response.status(500);
          response.send(message);
          return;
        }

        const { redirectUrl, type } = state;
        ok(type === "reddit", "Expected type to be reddit");

        await deleteAuthenticationState(state.stateId);

        const { message, access_token: accessToken } = await getAccessToken();

        ok(accessToken, message || "Expected access_token to be returned");

        const me = await getMe();
        const subscriptions = await getSubscriptionStatus();
        const flairRole = await getUserFlairRole();

        const roles = getAuthenticationRoles([
          "member", // Everyone is a member by default :)
          flairRole,
          ...Object.entries(subscriptions)
            .filter((entry) => entry[1])
            .map((entry) => entry[0]),
        ]);

        const internalUser = await getExternalUser("reddit", me.name);

        const { stateId, expiresAt } = await addCookieState({
          userId: internalUser.userId,
          roles,
          from: {
            type: "reddit",
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

        async function getSubscriptionStatus(): Promise<
          Record<RedditSubscriptionType, boolean>
        > {
          const subscriptions = await getAllSubscriptions();
          const moderator = isInList(subscriptions.moderator);
          const contributor = moderator || isInList(subscriptions.contributor);
          const subscriber = moderator || isInList(subscriptions.subscriber);
          return {
            moderator,
            contributor,
            subscriber,
          };

          function isInList(values: RedditSubscription[]) {
            return !!values.find((value) => value.display_name === REDDIT_NAME);
          }
        }

        async function getAllSubscriptions(): Promise<RedditSubscriptions> {
          const [moderator, subscriber, contributor] = await Promise.all([
            getSubscriptions("moderator"),
            getSubscriptions("subscriber"),
            getSubscriptions("contributor"),
          ]);
          return {
            moderator: moderator.data.children.map((node) => node.data),
            subscriber: subscriber.data.children.map((node) => node.data),
            contributor: contributor.data.children.map((node) => node.data),
          };
        }

        async function getSubscriptions(
          type: "moderator" | "subscriber" | "contributor"
        ): Promise<RedditSubscriptionListing> {
          const response = await fetch(
            new URL(`/subreddits/mine/${type}`, API_DOMAIN),
            {
              method: "GET",
              headers: {
                Authorization: `bearer ${accessToken}`,
                "User-Agent": USER_AGENT,
              },
            }
          );
          ok(response, "getSubscriptions response not ok");
          return response.json();
        }

        async function getUserFlairRole(): Promise<
          AuthenticationRole | undefined
        > {
          // In this case we get the remote flair first, and then
          // use cached only if we don't find one
          const flair = await getUserFlair();

          const cacheKey = `${REDDIT_NAME} ${me.name}: flair`;
          if (flair) {
            const role = getAuthenticationRole(flair);
            if (!role) return undefined; // Don't use cached, just undefined;
            await addExpiring({
              role: false, // Don't cache based on the authentication role
              key: cacheKey,
              value: role,
              expiresAt: getExpiresAt(REDDIT_FLAIR_EXPIRES_IN_MS),
            });
            return role;
          }
          return getCached<AuthenticationRole>(cacheKey);
        }

        async function getUserFlair(): Promise<string | undefined> {
          const [comments, submitted] = await Promise.all([
            getUserContent("comments"),
            getUserContent("submitted"),
          ]);

          let found = comments.find(isMatching);

          if (!found) {
            found = submitted.find(isMatching);
            if (!found) return undefined;
          }

          return found.author_flair_text.replace(/:[^:]+:/g, "").trim();

          function isMatching(content: RedditUserContent) {
            return (
              content.author_flair_text?.startsWith(REDDIT_FLAIR) &&
              content.subreddit === REDDIT_NAME &&
              content.author === me.name
            );
          }
        }

        async function getUserContent(
          type: "comments" | "submitted"
        ): Promise<RedditUserContent[]> {
          const url = new URL(`/user/${me.name}/${type}`, API_DOMAIN);
          url.searchParams.set("limit", "100");
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Authorization: `bearer ${accessToken}`,
              "User-Agent": USER_AGENT,
            },
          });
          ok(response, "getSidebar response not ok");
          const {
            data: { children },
          } = await response.json();
          return children.map(({ data }: { data: RedditUserContent }) => data);
        }

        async function getMe() {
          const response = await fetch(new URL(`/api/v1/me`, API_DOMAIN), {
            method: "GET",
            headers: {
              Authorization: `bearer ${accessToken}`,
              "User-Agent": USER_AGENT,
            },
          });
          ok(response, "getMe response not ok");
          return response.json();
        }

        async function getAccessToken() {
          const body = new FormData();
          body.set("code", code);
          body.set("grant_type", "authorization_code");
          body.set("redirect_uri", redirectUrl);
          const response = await fetch(
            "https://ssl.reddit.com/api/v1/access_token",
            {
              method: "POST",
              body,
              headers: {
                Authorization: REDDIT_CLIENT_BASIC,
                "User-Agent": USER_AGENT,
              },
            }
          );
          ok(response, "getAccessToken response not ok");
          return response.json();
        }
      },
    });
  }

  {
    const querystring = {
      type: "object",
      properties: {},
      additionalProperties: true,
    };
    type Schema = {
      Querystring: Record<string, string>;
    };
    const schema = {
      querystring,
      tags: ["system"],
    };
    fastify.get<Schema>("/reddit/redirect", {
      schema,
      async handler(request, response) {
        const { state: userState } = request.query;

        const scope =
          REDDIT_SCOPE || "identity mysubreddits read flair history";

        const redirectUrl =
          REDDIT_REDIRECT_URL ||
          `${getOrigin()}${fastify.prefix}/reddit/callback`;

        const { stateKey, expiresAt } = await addAuthenticationState({
          type: "reddit",
          userState,
          externalScope: scope,
          redirectUrl,
          // externalPermissions: permissions
        });

        const url = new URL("/api/v1/authorize", "https://ssl.reddit.com");
        url.searchParams.set("client_id", REDDIT_CLIENT_ID);
        url.searchParams.set("response_type", "code");
        url.searchParams.set("state", stateKey);
        url.searchParams.set("redirect_uri", redirectUrl);
        url.searchParams.set(
          "duration",
          REDDIT_AUTHORIZE_DURATION || "temporary"
        );
        url.searchParams.set("scope", scope);

        response.header("Location", url.toString());
        if (expiresAt) {
          response.header("X-Expires-At", expiresAt);
        }
        response.status(302);
        response.send("Redirecting");
      },
    });
  }
}
