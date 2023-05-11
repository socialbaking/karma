import {FastifyInstance} from "fastify";
import DiscordOAuth2, {PartialGuild} from "discord-oauth2";
import {ok} from "../../../is";
import {getOrigin} from "../config";
import {v4} from "uuid";
import {getAuthenticationStateByKey, addAuthenticationState} from "../../data";

interface DiscordRole {
    id: string;
    name: string;
    guild: string;
    user: string;
}

export async function discordAuthenticationRoutes(fastify: FastifyInstance) {

    const {
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        DISCORD_INVITE_URL,
        DISCORD_REDIRECT_URL,
        DISCORD_SERVER_NAME,
        DISCORD_SERVER_ROLE_IDS
    } = process.env;

    ok(DISCORD_CLIENT_ID, "Expected DISCORD_CLIENT_ID");
    ok(DISCORD_CLIENT_SECRET, "Expected DISCORD_CLIENT_SECRET");
    ok(DISCORD_SERVER_NAME, "Expected DISCORD_SERVER_NAME");
    ok(DISCORD_SERVER_ROLE_IDS, "Expected DISCORD_SERVER_ROLE_IDS");

    const DISCORD_SERVER_NAMES = decodeURIComponent(DISCORD_SERVER_NAME).split(",");

    const ROLE_ERROR = "Expected DISCORD_SERVER_ROLE_IDS in the format 111|Name One,222|Name Two,333|Name Three";

    const DISCORD_EXPECTED_ROLES = new Map(
        decodeURIComponent(DISCORD_SERVER_ROLE_IDS)
            .split(",")
            .map(role => {
                const [key, value, ...rest] = role.split("|");
                ok(key, ROLE_ERROR);
                ok(value, ROLE_ERROR);
                ok(!rest.length, ROLE_ERROR);
                return [key, value] as const;
            })
    )

    const DISCORD_USER_SCOPE = "identify";
    const DISCORD_BOT_SCOPE = "bot";

    const redirectUri = DISCORD_REDIRECT_URL || `${getOrigin()}${fastify.prefix}/discord/callback`;
    const oauth = new DiscordOAuth2({
        clientId: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        redirectUri,
    });

    {
        const querystring = {
            type: "object",
            properties: {
                code: {
                    type: "string"
                },
                state: {
                    type: "string"
                }
            },
            required: ["code", "state"]
        };
        type Schema = {
            Querystring: {
                code: string;
                state: string;
            }
        }
        const schema = { querystring }
        fastify.get<Schema>("/discord/callback", {
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

                const { externalScope: scope } = state;

                ok(scope, "Expected externalScope with discord state");

                const { access_token: accessToken } = await oauth.tokenRequest({
                    code,
                    scope,
                    grantType: "authorization_code"
                })

                const isBot = scope === DISCORD_BOT_SCOPE;
                const user = await oauth.getUser(accessToken);
                const guilds = await oauth.getUserGuilds(accessToken);

                const guild = (
                    // Prefer the first server listed
                    guilds.find(guild => DISCORD_SERVER_NAMES.at(0) === guild.name) ??
                    // But check all the names if the first one isn't available
                    guilds.find(guild => DISCORD_SERVER_NAMES.includes(guild.name))
                );

                if (!guild) {
                    const message = `Please first join discord server/s ${DISCORD_SERVER_NAMES.join(", ")} before using this tool`;
                    response.status(500);
                    response.send(message);
                    return;
                }

                const roles = await getUserRolesFromGuild(guild);

                response.status(200)
                response.send({
                    user,
                    guild,
                    roles,
                    state,
                    isBot
                });

                async function getUserRolesFromGuild(guild: PartialGuild): Promise<DiscordRole[]> {
                    const response = await fetch(
                        new URL(
                            `/api/v9/users/@me/guilds/${guild.id}/member`,
                            "https://discord.com"
                        ),
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${accessToken}`
                            }
                        }
                    );
                    if (!response.ok) return [];
                    const { roles } = await response.json();
                    return roles
                        .map((id: string): DiscordRole => {
                            const name = DISCORD_EXPECTED_ROLES.get(id);
                            if (!name) return;
                            return {
                                id,
                                name,
                                guild: guild.id,
                                user: user.id
                            };
                        })
                        .filter(Boolean);
                }
            }
        })
    }

    {
        const querystring = {
            type: "object",
            properties: {

            },
            additionalProperties: true
        };
        type Schema = {
            Querystring: Record<string, string>
        }
        const schema = { querystring }
        fastify.get<Schema>("/discord/redirect", {
            schema,
            async handler(request, response) {

                const { bot, state: userState } = request.query

                let url // = DISCORD_INVITE_URL;

                const scope = bot ? DISCORD_BOT_SCOPE : DISCORD_USER_SCOPE;

                const { stateKey, expiresAt } = await addAuthenticationState({
                    type: "discord",
                    userState,
                    externalScope: scope
                });

                if (!url) {
                    url = oauth.generateAuthUrl({
                        scope,
                        state: stateKey
                    });
                }

                response.header("Location", url);
                if (expiresAt) {
                    response.header("X-Expires-At", expiresAt);
                }
                response.status(302);
                response.send("Redirecting");
            }
        })
    }

}