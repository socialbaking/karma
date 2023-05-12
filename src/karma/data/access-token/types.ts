
export type AccessTokenType = "partner" | "discord"

export interface AccessTokenData extends Record<string, unknown> {
    partnerId?: string;
    accessTokenType?: AccessTokenType | string;
}

export interface AccessToken extends AccessTokenData {
    accessToken: string;
    createdAt: string;
    disabledAt?: string;
}