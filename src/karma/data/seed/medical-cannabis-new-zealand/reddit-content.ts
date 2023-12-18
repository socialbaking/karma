import {ok} from "../../../../is";
import {packageIdentifier} from "../../../package";
import {getOrigin} from "../../../listen/config";
import {v4} from "uuid";

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

export async function seedRedditContent() {
    if (!REDDIT_CLIENT_ID) return;
    ok(REDDIT_CLIENT_ID, "Expected REDDIT_CLIENT_ID");
    ok(REDDIT_CLIENT_SECRET, "Expected REDDIT_CLIENT_SECRET");
    ok(REDDIT_NAME, "Expected REDDIT_NAME");
    ok(REDDIT_FLAIR, "Expected REDDIT_FLAIR");

    console.log("seed reddit content for", REDDIT_NAME);

    const REDDIT_CLIENT_BASIC = `Basic ${Buffer.from(
        `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`
    ).toString("base64")}`;

    const USER_AGENT = `SSO by ${packageIdentifier}`;

    const API_DOMAIN = "https://oauth.reddit.com";
    
    const { message, access_token: accessToken } = await getAccessToken();

    ok(accessToken, message || "Expected access_token to be returned");

    const newPosts = await getPosts("top", {
        limit: 100,
        show: "all"
    });

    console.log(
        JSON.stringify(newPosts
            .map(({ permalink, title, link_flair_text, author }) => ({
                link_flair_text,
                title,
                permalink,
                author,
            })), undefined, "  ")
    );

    interface RedditUserContent extends Record<string, unknown> {
        author_flair_text?: string;
        link_flair_text?: string;
        subreddit?: string;
        author?: string;
    }

    interface GetPostsOptions {
        limit?: number;
        show?: "all";
        sr_detail?: boolean;
        before?: string;
        after?: string;
        count?: number;
    }

    async function getPosts(type: "new" | "hot" | "random" | "rising" | "top" | "controversial", options?: GetPostsOptions): Promise<RedditUserContent[]> {
        const url = new URL(`/r/${REDDIT_NAME}/${type}`, API_DOMAIN);
        url.search = new URLSearchParams(Object.entries(options).filter(([, value]) => value).map(([key, value]) => [key, String(value)])).toString()
        const response = await fetch(
            url,
            {
                method: "GET",
                headers: {
                    Authorization: `bearer ${accessToken}`,
                    "User-Agent": USER_AGENT,
                },
            }
        );
        ok(response.ok, "getPosts response not ok");
        const {
            data: { children },
        } = await response.json();
        return children.map(({ data }: { data: RedditUserContent }) => data);
    }

    async function getAccessToken() {
        const redirectUrl =
            REDDIT_REDIRECT_URL ||
            `${getOrigin()}/api/authentication/reddit/callback`;
        const scope =
            REDDIT_SCOPE || "identity mysubreddits read flair history";
        const body = new FormData();
        body.set("client_id", REDDIT_CLIENT_ID);
        body.set("grant_type", "client_credentials");
        body.set("device_id", v4());
        body.set("scope", scope);
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
        ok(response.ok, "getAccessToken response not ok");
        return await response.json();
    }


}