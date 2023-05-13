import {CountryProductMetrics} from "../../client";
import {CalculationContext, MetricCalculationContext} from "../types";
import {processReportsForUnit} from "./day-cost-per-product";

export const title = "Montly Average";
export const description = "Calculates the average values for a month";

export function handler(context: CalculationContext) {
    return {
        monthlyMetrics: calculate(context)
    } as const;
}

export function calculate(context: CalculationContext): CountryProductMetrics[] {
    const {
        reportingMonths
    } = context;

    let results = [];

    for (let offset = 0; offset <= reportingMonths; offset += 1) {
        const data = processReportsForUnit(context, context.dailyMetrics, offset,"month");
        if (data) {
            results.push(data);
        }
    }

    return results;
}