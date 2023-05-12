import {Report, ReportMetrics, ActiveIngredientMetrics, ProductMetricData} from "../../client";
import {BaseCalculationContext} from "../types";
import {isNumberString, isProductReport} from "../is";
import {getReportDates} from "../get-report-dates";
import {ok} from "../../../is";
import {toHumanNumberString} from "../to-human-number-string";

export const title = "Cost per size unit";
export const description = "Calculates the value per size unit for the ingredients in the product";

export function handler(context: BaseCalculationContext) {
    return {
        reportMetrics: context
            .reports
            .map((report) => calculate(report, context))
            .filter(Boolean)
    } as const;
}

export function calculate(report: Report, context: BaseCalculationContext): ReportMetrics | undefined {
    if (!isProductReport(report)) return undefined;

    const { currencySymbol } = context;

    const {
        productId,
        productPurchaseItems,
        productPurchaseTotalCost,
        productPurchaseDeliveryCost,
        productPurchaseFeeCost,
        productSize
    } = report;

    const product = context.products.find(product => product.productId === productId);

    if (!product) return undefined;

    const productActiveIngredients = product.activeIngredients;

    if (!productActiveIngredients) return undefined;

    const totalCost = +productPurchaseTotalCost;
    const deliveryCost = +productPurchaseDeliveryCost;
    const items = Math.max(1, +productPurchaseItems);
    const feeCost = +(productPurchaseFeeCost ?? "0");

    const productCost = totalCost - deliveryCost - feeCost;
    const itemCost = productCost / items;

    const calculated = productActiveIngredients.filter(value => value.calculated)

    const unitTotals = calculated
        .reduce(
            (totals: Record<string, number>, { unit, value }) => {
                const numeric = +value;
                const current = totals[unit] ?? 0;
                totals[unit] = current + numeric;
                return totals;
            },
            {}
        );

    console.log({ unitTotals, productActiveIngredients });

    const activeIngredients: ActiveIngredientMetrics[] = [
        ...(
            (productSize ? [productSize] : (product.sizes ?? []))
                .filter(size => isNumberString(size.value))
                .map((size): ActiveIngredientMetrics => ({
                    type: `${size.unit}`,
                    unit: `${currencySymbol}/${size.unit}`,
                    value: toHumanNumberString(itemCost / (+size.value)),
                    size
                }))
        ),
        ...Object.keys(unitTotals).map((unit): ActiveIngredientMetrics => {
            const values = calculated.filter(value => value.unit === unit);
            const prefixes = values.map(value => value.prefix).filter(Boolean);
            const prefix = prefixes[0];
            return {
                type: [...new Set(
                    values
                        .map(value => value.type)
                )].join("+"),
                unit,
                value: toHumanNumberString(unitTotals[unit]),
                prefix
            }
        }),
        ...Object.keys(unitTotals).map((unit): ActiveIngredientMetrics => {
            const values = calculated.filter(value => value.unit === unit);
            const prefixes = values.map(value => value.prefix).filter(Boolean);
            const prefix = prefixes[0];
            return {
                type: [...new Set(
                    values.map(value => value.type)
                )].join("+"),
                unit: `${currencySymbol}/${unit}`,
                value: toHumanNumberString(
                    itemCost / unitTotals[unit]
                ),
                prefix
            }
        }),
        ...calculated
            .flatMap(({ type, unit, value, prefix }) => {
                const numeric = +value;
                const totalUnit = unitTotals[unit];
                ok(typeof totalUnit === "number");
                return [
                    {
                        type,
                        unit,
                        value,
                        prefix
                    },
                    {
                        type,
                        unit: `${currencySymbol}/${unit}`,
                        value: toHumanNumberString(itemCost / numeric),
                        proportional: false,
                        prefix
                    },
                    {
                        type,
                        unit: `${currencySymbol}/${unit}`,
                        value: toHumanNumberString(itemCost / totalUnit * (numeric / totalUnit)),
                        proportional: true,
                        prefix
                    }
                ];
            })
    ];

    console.log(activeIngredients);

    const products: ProductMetricData[] = [
        {
            activeIngredients,
            productId: report.productId,
        }
    ];

    const createdAt = new Date().toISOString();
    return {
        ...getReportDates(report),
        reportId: report.reportId,
        createdAt,
        updatedAt: createdAt,
        countryCode: report.countryCode,
        products
    };
}