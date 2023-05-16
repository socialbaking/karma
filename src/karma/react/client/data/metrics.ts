import {ActiveIngredientMetrics, CountryProductMetrics, ProductMetricData} from "../../../client";
import {useMemo} from "react";
import {isNumberString} from "../../../calculations";

export type SingleProductMetrics = {
    metrics: CountryProductMetrics[]
    products: ProductMetricData[]
};

export interface MetricOptions {
    unit: string;
    type?: string;
    numeric?: boolean;
}

export function useMetric(metrics: SingleProductMetrics | undefined, { unit, type, numeric }: MetricOptions) {
    return useMemo(() => {
        if (!metrics?.products) return undefined;
        const [data] = metrics.products;
        if (!data) return;
        const {activeIngredients} = data;
        const match = activeIngredients.filter(isMatch);
        // console.log(match, activeIngredients, data);
        if (!match.length) return undefined;
        if (match.length === 1) return match[0];
        console.warn(`TODO implement match for ${unit} ${type || "(no type)"} with ${match.length} matches`);
        return match[0];

        function isMatch(value: ActiveIngredientMetrics) {
            if (numeric && !isNumberString(value.value)) return false;
            if (type && value.type !== type) return false;
            return value.unit === unit;
        }

    }, [metrics, unit, type])
}