import {
  ActiveIngredientMetrics,
  MetricsData,
  ProductMetricData,
} from "../../../client";
import { useMemo } from "react";
import { isNumberString } from "../../../calculations";

export type SingleProductMetrics = {
  metrics: MetricsData[];
  products: ProductMetricData[];
};

function isMetricMatch(
  value: ActiveIngredientMetrics,
  { numeric, type, unit }: Partial<MetricOptions>
) {
  if (numeric && !isNumberString(value.value)) return false;
  if (type && value.type !== type) return false;
  if (!unit) return true;
  return value.unit === unit;
}

export function useMetrics(
  metrics: SingleProductMetrics | undefined,
  { numeric, type, unit }: MetricOptions
): ActiveIngredientMetrics[] {
  return useMemo(() => {
    if (!metrics?.products) return [];
    const [data] = metrics.products;
    if (!data) return [];
    const { activeIngredients } = data;
    const options = { numeric, type, unit };
    return activeIngredients.filter((value) => isMetricMatch(value, options));
  }, [metrics, unit, type, numeric]);
}

export interface MetricOptions {
  unit: string;
  type?: string;
  numeric?: boolean;
}

export function useMetric(
  metrics: SingleProductMetrics | undefined,
  options: MetricOptions
) {
  const match = useMetrics(metrics, options);
  return useMetricMatch(match);
}

export function useMetricMatch(
  match?: ActiveIngredientMetrics[],
  { numeric, type, unit }: Partial<MetricOptions> = {}
) {
  return useMemo(() => {
    const options = { numeric, type, unit };
    return match?.find((value) => isMetricMatch(value, options));
  }, [match, numeric, type, unit]);
}
