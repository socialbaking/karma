import {views as MODULE_VIEWS } from "../react/server/paths";
import {View, getConfig, views as BASE_VIEWS} from "@opennetwork/logistics";
import {ok} from "../../is";

export function getAllViews(): View[] {
    const config = getConfig();
    const { views = [] } = config;
    return [
        ...views,
        ...MODULE_VIEWS,
        ...BASE_VIEWS
    ]
}

export function getViews(): View[] {
    return getAllViews()
        .filter(
            ({ path }, index, array) => {
                const before = array.slice(0, index);
                return !before.find(
                    view => view.path === path
                );
            }
        )
}

export function getView(path: string) {
    const views = getAllViews();
    return views.find(view => view.path === path);
}