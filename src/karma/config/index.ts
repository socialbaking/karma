import { withConfig } from "@opennetwork/logistics";
import {views} from "../react/server/paths";
import {alternativeRoleNames, namedRoles} from "../data";

export function configure<R>(fn: () => R): R {
    return withConfig({
        views,
        namedRoles,
        alternativeRoleNames
    }, fn);
}