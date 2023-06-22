import {
  CountryProductMetrics,
  ReportMetrics,
  ProductMetricData,
} from "../../client";
import {
  CalculationConfig,
  CalculationContext,
  MetricCalculationContext,
} from "../types";
import { isNumberString } from "../is";
import {
  ActiveIngredientMetrics,
  CountryProductMetricDuration,
} from "../../client";
import { ok } from "../../../is";
import { DateTime } from "luxon";
import { toHumanNumberString } from "../to-human-number-string";
import { mean, min, max } from "simple-statistics";
import { MetricsData } from "../../data";
import { v4 } from "uuid";
import outliers from "outliers";

export const title = "Daily Average";
export const description = "Calculates the average values for a day";

export const anonymous = false;

export function handler(context: CalculationContext) {
  return {
    dailyMetrics: calculate(context),
  } as const;
}

export function processReportsForUnit<M extends MetricsData>(
  config: CalculationConfig,
  metrics: MetricsData[],
  offset: number,
  unit: CountryProductMetricDuration
): CountryProductMetrics | undefined {
  const { countryCode, timezone, reportingDateKey, currencySymbol } = config;

  let targetDate = DateTime.local().setZone(timezone).startOf(unit);

  if (offset) {
    targetDate = targetDate
      .minus({
        [unit]: offset,
      })
      .startOf(unit);
  }

  const timestamp = targetDate.toJSDate().toISOString();

  const dates: (DateTime | undefined)[] = metrics.map((report, index) => {
    const dateValue = report[reportingDateKey];
    if (!dateValue) {
      console.warn(
        `Warning metrics does not have ${reportingDateKey} at index ${index}`
      );
      return undefined;
    }
    return DateTime.fromISO(dateValue, {
      // Pick first timezone unless given in later iteration
      // Close enough for now
      zone: timezone,
    });
  });

  const durationReports = metrics.filter((report, index) => {
    const date = dates.at(index);
    if (!date) return false;
    return date.hasSame(targetDate, unit);
  });

  console.log(
    `${durationReports.length}/${metrics.length} reports to process into metrics for ${countryCode} ${unit} ${reportingDateKey} ${timestamp} `
  );

  if (!durationReports.length) return undefined;

  const durationProducts = durationReports.flatMap(
    (report: ReportMetrics): ProductMetricData[] => report.products
  );

  const productIds = [
    ...new Set(durationProducts.map(({ productId }) => productId)),
  ];

  const products = productIds
    .map((productId): ProductMetricData => {
      const input = durationProducts
        .filter((product) => product.productId === productId)
        .flatMap<ActiveIngredientMetrics>(
          (product) => product.activeIngredients
        );
      const activeIngredients = getProductMetricData(input);
      if (!activeIngredients.length) return undefined;
      return {
        productId,
        activeIngredients,
      };
    })
    .filter(Boolean);

  // console.log(unit, timestamp, countryCode, zone, ...products);

  const createdAt = new Date().toISOString();
  return {
    metricsId: v4(),
    products,
    createdAt,
    updatedAt: createdAt,
    countryCode,
    currencySymbol,
    duration: unit,
    reportingDateKey,
    timezone,
    [reportingDateKey]: timestamp,
  };

  function getProductMetricData(
    activeIngredients: ActiveIngredientMetrics[]
  ): ActiveIngredientMetrics[] {
    const types = [...new Set(activeIngredients.map((value) => value.type))];

    return types.flatMap((type) => {
      const typeValues = activeIngredients.filter(
        (value) => value.type === type
      );
      const units = [...new Set(typeValues.map((value) => value.unit))];

      return units.flatMap((unit) => {
        function withValues(values: ActiveIngredientMetrics[]) {
          const numericValues = values
            .map((value) => value.value)
            .filter(isNumberString)
            .map((value) => +value);

          const outlierValues = outliers(numericValues);
          let withoutOutliers = numericValues;
          if (outlierValues.length) {
            console.log({ outlierValues });
            withoutOutliers = numericValues.filter(value => !outlierValues.includes(value))
          }

          const prefixes = values.map((value) => value.prefix).filter(Boolean);
          const { length } = withoutOutliers;
          if (!length) return [];
          return [
            {
              ...values.at(0),
              type,
              unit,
              value: toHumanNumberString(min(numericValues)),
              calculation: "minimum",
              prefix: prefixes[0],
              outliers: outlierValues
            },
            {
              ...values.at(0),
              type,
              unit,
              value: toHumanNumberString(max(numericValues)),
              calculation: "maximum",
              prefix: prefixes[0],
              outliers: outlierValues
            },
            {
              ...values.at(0),
              type,
              unit,
              value: toHumanNumberString(mean(withoutOutliers)),
              calculation: "mean",
              // If its one value it is not a mean, it is a real value
              // This lets us filter it correctly and not give real values without mixing it
              // with at least one other value
              mean: length > 1 ? true : undefined,
              prefix: prefixes[0]
            },
            {
              ...values.at(0),
              type,
              unit,
              value: toHumanNumberString(mean(numericValues)),
              calculation: "meanWithOutliers",
              // If its one value it is not a mean, it is a real value
              // This lets us filter it correctly and not give real values without mixing it
              // with at least one other value
              mean: length > 1 ? true : undefined,
              prefix: prefixes[0]
            }
          ];
        }

        const unitValues = typeValues.filter((value) => value.unit === unit);

        // We don't want to mix these two types of values
        return [
          ...withValues(unitValues.filter((value) => value.proportional)),
          ...withValues(unitValues.filter((value) => !value.proportional)),
        ].filter(Boolean);
      });
    });
  }
}

export function calculate(
  context: CalculationContext
): CountryProductMetrics[] {
  const { reportingDays } = context;

  let results = [];

  for (let offset = 0; offset <= reportingDays; offset += 1) {
    const data = processReportsForUnit(
      context,
      context.reportMetrics,
      offset,
      "day"
    );
    if (data) {
      results.push(data);
    }
  }

  return results;
}
