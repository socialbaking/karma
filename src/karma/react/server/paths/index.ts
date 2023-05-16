import {FunctionComponent} from "react";
import {Metrics} from "./metrics";
import {Products} from "./products";
import {Partners} from "./partners";
import {Calculator, submit} from "./calculator";
import {Settings} from "./settings";
import {Home} from "./home";
import {Organisations} from "./organisations";

export const paths: Record<string, FunctionComponent> = {
    "/home": Home,
    "/metrics": Metrics,
    "/products": Products,
    "/partners": Partners,
    "/calculator": Calculator,
    "/settings": Settings,
    "/organisations": Organisations
};

export const pathsAnonymous: Record<string, boolean> = {
    "/home": true,
    "/calculator": true
}

export const pathsSubmit: Record<string, (...args: unknown[]) => Promise<unknown | void> | unknown | void> = {
    "/calculator": submit
}