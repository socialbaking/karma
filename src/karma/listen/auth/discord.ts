import {FastifyInstance} from "fastify";
import DiscordOAuth2, {PartialGuild} from "discord-oauth2";
import {ok} from "../../../is";
import {getOrigin} from "../config";
import {getAuthenticationStateByKey, addAuthenticationState, systemLogSchema} from "../../data";

interface DiscordRole extends Record<string, unknown>  {
    id: string;
    name: string;
}

interface DiscordParsedRole extends DiscordRole {
    guild: string;
    user: string;
}

export interface DiscordGuild extends PartialGuild, Record<string, unknown>  {
    roles: DiscordRole[]
}

export interface DiscordGuildMember extends Record<string, unknown> {
    id: string;
    name: string;
    roles: string[]
}

export async function discordAuthenticationRoutes(fastify: FastifyInstance) {

    const {
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        // DISCORD_INVITE_URL,
        DISCORD_REDIRECT_URL,
        DISCORD_SERVER_NAME,
        DISCORD_BOT_PERMISSIONS,
        DISCORD_BOT_TOKEN,
        DISCORD_SERVER_ID
    } = process.env;

    ok(DISCORD_CLIENT_ID, "Expected DISCORD_CLIENT_ID");
    ok(DISCORD_CLIENT_SECRET, "Expected DISCORD_CLIENT_SECRET");
    ok(DISCORD_SERVER_ID, "Expected DISCORD_SERVER_ID");

    const DISCORD_SERVER_NAMES: string[] = DISCORD_SERVER_NAME ?
        decodeURIComponent(DISCORD_SERVER_NAME).split(",") :
        []

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
        const schema = {
            querystring,
            tags: ["system"]
        }
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
                    grantType: "authorization_code",
                })

                const isBot = scope === DISCORD_BOT_SCOPE;
                const user = await oauth.getUser(accessToken);

                const guild = await getGuild();
                const member = await getMember()

                if (!member) {
                    const message = `Please join the discord server with associated with this tooling before logging in`;
                    response.status(500);
                    response.send(message);
                    return;
                }

                const roles = mapRoles();

                console.log({
                    guild,
                    member,
                    isBot,
                    roles
                });

                response.status(200)
                response.send({
                    member,
                    guild,
                    roles,
                    state,
                    isBot
                });

                async function getMember(): Promise<DiscordGuildMember | undefined> {
                    const response = await fetch(
                        new URL(
                            `/api/v10/guilds/${DISCORD_SERVER_ID}/members/${user.id}`,
                            "https://discord.com"
                        ),
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bot ${DISCORD_BOT_TOKEN}`
                            }
                        }
                    );
                    if (response.status === 404) return undefined;
                    ok(response.ok,`getMember returned ${response.status}`);
                    return response.json();
                }

                async function getGuild(): Promise<DiscordGuild> {
                    const response = await fetch(
                        new URL(
                            `/api/v10/guilds/${DISCORD_SERVER_ID}`,
                            "https://discord.com"
                        ),
                        {
                            method: "GET",
                            headers: {
                                "Authorization": `Bot ${DISCORD_BOT_TOKEN}`
                            }
                        }
                    );
                    ok(response.ok, "Expected getGuild to respond ok");
                    return await response.json();
                }

                function mapRoles(): DiscordParsedRole[] {
                    const roleMap = new Map<string, DiscordRole>(
                        guild.roles.map(role => [role.id, role] as const)
                    );
                    return member
                        .roles
                        .map((id: string): DiscordParsedRole => {
                            const role = roleMap.get(id);
                            if (!role) return;
                            return {
                                ...role,
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
        const schema = {
            querystring,
            tags: ["system"]
        }
        fastify.get<Schema>("/discord/redirect", {
            schema,
            async handler(request, response) {

                const { bot, state: userState } = request.query

                let url // = DISCORD_INVITE_URL;

                const scope = bot ? DISCORD_BOT_SCOPE : DISCORD_USER_SCOPE;
                const permissions = (bot && DISCORD_BOT_PERMISSIONS) ? +DISCORD_BOT_PERMISSIONS : undefined;

                const { stateKey, expiresAt } = await addAuthenticationState({
                    type: "discord",
                    userState,
                    externalScope: scope,
                    externalPermissions: permissions
                });

                if (!url) {
                    url = oauth.generateAuthUrl({
                        scope,
                        state: stateKey,
                        permissions,
                        disableGuildSelect: true,
                        guildId: DISCORD_SERVER_ID
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