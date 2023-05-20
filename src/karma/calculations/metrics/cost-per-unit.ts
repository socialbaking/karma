import {
  Report,
  ReportMetrics,
  ActiveIngredientMetrics,
  ProductMetricData,
} from "../../client";
import { BaseCalculationContext } from "../types";
import { isNumberString, isProductReport } from "../is";
import { getReportDates } from "../get-report-dates";
import { ok } from "../../../is";
import { toHumanNumberString } from "../to-human-number-string";
import { v4 } from "uuid";

export const title = "Product Costs";
export const description =
  "Calculates the values related to the product, like cost per active ingredient";

export const anonymous = true;

export function handler(context: BaseCalculationContext) {
  return {
    reportMetrics: context.reports
      .map((report) => calculate(report, context))
      .filter(Boolean),
  } as const;
}

export function calculate(
  report: Report,
  context: Pick<BaseCalculationContext, "currencySymbol" | "products">
): ReportMetrics | undefined {
  if (!isProductReport(report)) return undefined;

  const {
    productId,
    // productItems,
    // productTotalCost,
    productItemCost,
    // productDeliveryCost,
    // productFeeCost,
    productSize,
    calculationConsent,
    countryCode,
    timezone,
    roles,
  } = report;

  const currencySymbol = report.currencySymbol || context.currencySymbol;

  // Only need to check its existence, external to this function the actual consent keys are checked
  if (!calculationConsent) return undefined;

  const product = context.products.find(
    (product) => product.productId === productId
  );

  if (!product) return undefined;

  const productActiveIngredients = product.activeIngredients;

  if (!productActiveIngredients) return undefined;

  // const totalCost = +productTotalCost;
  // const deliveryCost = +productDeliveryCost;
  // const items = Math.max(1, +productItems);
  // const feeCost = +(productFeeCost ?? "0");

  // const productCost = totalCost - deliveryCost - feeCost;
  // const calculatedItemCost = productCost / items;
  const itemCost = +productItemCost;

  const calculated = productActiveIngredients.filter(
    (value) => value.calculated
  );

  const unitTotals = calculated.reduce(
    (totals: Record<string, number>, { unit, value }) => {
      const numeric = +value;
      const current = totals[unit] ?? 0;
      totals[unit] = current + numeric;
      return totals;
    },
    {}
  );

  console.log({ unitTotals, productActiveIngredients });

  const prefixes = productActiveIngredients
    .map((value) => value.prefix)
    .filter(Boolean);
  const prefix = prefixes[0];

  const activeIngredients: ActiveIngredientMetrics[] = [
    ...(productSize ? [productSize] : product.sizes ?? [])
      .filter((size) => isNumberString(size.value))
      .map((size): ActiveIngredientMetrics => {
        const values = calculated.filter((value) => value.unit === size.unit);
        const prefixes = values.map((value) => value.prefix).filter(Boolean);
        const prefix = prefixes[0];
        return {
          type: `${size.unit}`,
          unit: `${currencySymbol}/${size.unit}`,
          value: toHumanNumberString(itemCost / +size.value),
          size,
          prefix,
        };
      }),
    ...Object.keys(unitTotals).map((unit): ActiveIngredientMetrics => {
      const values = calculated.filter((value) => value.unit === unit);
      const prefixes = values.map((value) => value.prefix).filter(Boolean);
      const prefix = prefixes[0];
      return {
        type: [...new Set(values.map((value) => value.type))].join("+"),
        unit,
        value: toHumanNumberString(unitTotals[unit]),
        prefix,
      };
    }),
    ...Object.keys(unitTotals).map((unit): ActiveIngredientMetrics => {
      const values = calculated.filter((value) => value.unit === unit);
      const prefixes = values.map((value) => value.prefix).filter(Boolean);
      const prefix = prefixes[0];
      return {
        type: [...new Set(values.map((value) => value.type))].join("+"),
        unit: `${currencySymbol}/${unit}`,
        value: toHumanNumberString(itemCost / unitTotals[unit]),
        prefix,
      };
    }),
    ...calculated.flatMap(({ type, unit, value, prefix }) => {
      const numeric = +value;
      const totalUnit = unitTotals[unit];
      ok(typeof totalUnit === "number");
      return [
        {
          type,
          unit,
          value,
          prefix,
        },
        {
          type,
          unit: `${currencySymbol}/${unit}`,
          value: toHumanNumberString(itemCost / numeric),
          proportional: false,
          prefix,
        },
        {
          type,
          unit: `${currencySymbol}/${unit}`,
          value: toHumanNumberString(itemCost / totalUnit),
          proportional: true,
          prefix,
        },
      ];
    }),
  ];

  // console.log(activeIngredients);

  const products: ProductMetricData[] = [
    {
      activeIngredients,
      productId: report.productId,
    },
  ];

  const createdAt = new Date().toISOString();
  return {
    ...getReportDates(report),
    metricsId: v4(),
    reportId: report.reportId,
    createdAt,
    updatedAt: createdAt,
    countryCode,
    currencySymbol,
    timezone,
    products,
    calculationConsent,
    roles,
  };
}
