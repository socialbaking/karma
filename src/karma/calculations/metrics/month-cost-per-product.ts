import {CountryProductMetrics} from "../../client";
import {CalculationContext, MetricCalculationContext} from "../types";
import {processReportsForUnit} from "./day-cost-per-product";

export const title = "Cost per size unit";
export const description = "Calculates the value per size unit for the ingredients in the product";

export function handler(context: CalculationContext) {
    return {
        monthlyMetrics: calculate(context)
    } as const;
}

export function calculate(context: CalculationContext): CountryProductMetrics[] {
    const {
        reportingMonths
    } = context;

    return Array.from({ length: reportingMonths })
        .map((ignore, offset) => processReportsForUnit(context, context.dailyMetrics, offset, "month"))
        .filter(Boolean)
}