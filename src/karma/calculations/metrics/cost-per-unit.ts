import {Report, ReportMetrics} from "../../client";
import {CalculationContext} from "../types";
import {isNumberString, isProductReport} from "../is";
import {getReportDates} from "../get-report-dates";
import {ActiveIngredientMetrics, toHumanNumberString} from "../../data";
import {ok} from "../../../is";

export const title = "Cost per size unit";
export const description = "Calculates the value per size unit for the ingredients in the product";

export function handler(context: CalculationContext): Partial<CalculationContext> {
    return {
        reportMetrics: context
            .reports
            .map((report) => calculate(report, context))
            .filter(Boolean)
    }
}

export function calculate(report: Report, { products, currencySymbol }: CalculationContext): ReportMetrics | undefined {
    if (!isProductReport(report)) return undefined;

    const {
        productId,
        productPurchaseItems,
        productPurchaseTotalCost,
        productPurchaseDeliveryCost,
        productPurchaseFeeCost,
        productSize
    } = report;

    const product = products.find(product => product.productId === productId);

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
        ...Object.keys(unitTotals).map((unit): ActiveIngredientMetrics => ({
            type: [...new Set(
                calculated
                    .filter(value => value.unit === unit)
                    .map(value => value.type)
            )].join("+"),
            unit,
            value: toHumanNumberString(unitTotals[unit])
        })),
        ...Object.keys(unitTotals).map((unit): ActiveIngredientMetrics => ({
            type: [...new Set(
                calculated
                    .filter(value => value.unit === unit)
                    .map(value => value.type)
            )].join("+"),
            unit: `${currencySymbol}/${unit}`,
            value: toHumanNumberString(
                itemCost / unitTotals[unit]
            )
        })),
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

    const createdAt = new Date().toISOString();
    return {
        ...getReportDates(report),
        reportId: report.reportId,
        createdAt,
        updatedAt: createdAt,
        countryCode: report.countryCode,
        activeIngredients,
        productId: report.productId,
    }
}