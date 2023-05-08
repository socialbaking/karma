import {getKeyValueStore} from "../kv";
import {AccessToken} from "./types";

const STORE_NAME = "accessToken"

export function getAccessTokenStore() {
    return getKeyValueStore<AccessToken>(STORE_NAME);
}