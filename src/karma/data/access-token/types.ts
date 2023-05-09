
export interface AccessTokenData extends Record<string, unknown> {
    partnerId?: string;
}

export interface AccessToken extends AccessTokenData {
    accessToken: string;
    createdAt: string;
    disabledAt?: string;
}