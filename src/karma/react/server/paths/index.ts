import {FunctionComponent} from "react";
import {Metrics} from "./metrics";
import {Products} from "./products";
import {Partners} from "./partners";
import {Calculator} from "./calculator";
import {Settings} from "./settings";
import {Home} from "./home";

export const paths: Record<string, FunctionComponent> = {
    "/home": Home,
    "/metrics": Metrics,
    "/products": Products,
    "/partners": Partners,
    "/calculator": Calculator,
    "/settings": Settings
};

export const pathsAnonymous: Record<string, boolean> = {
    "/home": true,
    "/calculator": true
}