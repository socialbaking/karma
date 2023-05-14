import {FunctionComponent} from "react";
import {Metrics} from "./metrics";
import {Products} from "./products";
import {Partners} from "./partners";
import {Calculator} from "./calculator";
import {Settings} from "./settings";

export const paths: Record<string, FunctionComponent> = {
    "/metrics": Metrics,
    "/products": Products,
    "/partners": Partners,
    "/calculator": Calculator,
    "/settings": Settings
};