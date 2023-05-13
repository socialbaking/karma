import {Metrics} from "./metrics";
import {Products} from "./products";
import {Partners} from "./partners";
import {FunctionComponent} from "react";

export const paths: Record<string, FunctionComponent> = {
    "/metrics": Metrics,
    "/products": Products,
    "/partners": Partners
};