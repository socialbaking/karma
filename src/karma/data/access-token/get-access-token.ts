import {getAccessTokenStore} from "./store";

export async function getAccessToken(accessToken: string) {
    const store = getAccessTokenStore();
    return store.get(accessToken);
}