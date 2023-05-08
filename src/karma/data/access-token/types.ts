
export interface AccessTokenData {
    partnerId?: string;
}

export interface AccessToken extends AccessTokenData {
    accessToken: string;
    createdAt: string;
    disabledAt?: string;
}