import {CountryProductMetrics, ReportMetrics, ProductMetricData} from "../../client";
import {CalculationContext, MetricCalculationContext} from "../types";
import {isNumberString} from "../is";
import {ActiveIngredientMetrics, CountryProductMetricDuration} from "../../client";
import {ok} from "../../../is";
import {DateTime} from "luxon";
import {toHumanNumberString} from "../to-human-number-string";
import {mean} from "simple-statistics";
import {MetricsData} from "../../data";

export const title = "Cost per size unit";
export const description = "Calculates the value per size unit for the ingredients in the product";

export function handler(context: CalculationContext) {
    return {
        dailyMetrics: calculate(context)
    } as const;
}

export function processReportsForUnit<M extends MetricsData>(context: CalculationContext, metrics: MetricsData[], offset: number, unit: CountryProductMetricDuration): CountryProductMetrics | undefined {
    const { countryCode, timezone, reportingDateKey } = context;

    const targetDate = DateTime
        .local()
        .setZone(context.timezone)
        .startOf(unit)
        .minus({
            [unit]: offset
        })
        .startOf(unit);

    const timestamp = targetDate.toJSDate().toISOString();

    const dates: (DateTime | undefined)[] = metrics
        .map(
            report => {
                const dateValue = report[reportingDateKey];
                if (!dateValue) return undefined
                return DateTime.fromISO(
                    dateValue,
                    {
                        // Pick first timezone unless given in later iteration
                        // Close enough for now
                        zone: timezone
                    }
                )
            }
        );

    const durationReports = context.reportMetrics.filter((report, index) => {
        const date = dates.at(index);
        if (!date) return false;
        return date.hasSame(targetDate, unit);
    });

    console.log(durationReports.length, `reports to process into metrics for ${countryCode} ${unit} ${reportingDateKey} ${timestamp} `);

    if (!durationReports.length) return undefined;

    const durationProducts = durationReports
        .flatMap((report: ReportMetrics): ProductMetricData[] => report.products);

    const productIds = [...new Set(
        durationProducts.map(({ productId }) => productId)
    )];

    const products = productIds
        .map((productId): ProductMetricData => {
            const input = durationProducts
                .filter(({ productId }) => productId)
                .flatMap<ActiveIngredientMetrics>(product => product.activeIngredients);
            const activeIngredients = getProductMetricData(input);
            if (!activeIngredients.length) return undefined;
            return {
                productId,
                activeIngredients
            }
        })
        .filter(Boolean)

    // console.log(unit, timestamp, countryCode, zone, ...products);

    const createdAt = new Date().toISOString();
    return {
        products,
        createdAt,
        updatedAt: createdAt,
        countryCode,
        duration: unit,
        reportingDateKey,
        timezone,
        [reportingDateKey]: timestamp
    };

    function getProductMetricData(activeIngredients: ActiveIngredientMetrics[]): ActiveIngredientMetrics[] {

        const types = [...new Set(
            activeIngredients.map(value => value.type)
        )];

        return types
            .flatMap(
                type => {
                    const typeValues = activeIngredients.filter(value => value.type === type);
                    const units = [...new Set(typeValues.map(value => value.unit))];

                    return units.flatMap(
                        unit => {

                            function withValues(values: ActiveIngredientMetrics[]) {
                                const numericValues = values
                                    .map(value => value.value)
                                    .filter(isNumberString)
                                    .map(value => +value);
                                const { length } = numericValues;
                                if (!length) return;
                                return {
                                    ...values.at(0),
                                    type,
                                    unit,
                                    value: toHumanNumberString(mean(numericValues)),
                                    mean: true
                                };
                            }

                            const unitValues = typeValues.filter(value => value.unit === unit);

                            // We don't want to mix these two types of values
                            return [
                                withValues(unitValues.filter(value => value.proportional)),
                                withValues(unitValues.filter(value => !value.proportional))
                            ]
                                .filter(Boolean)
                        }
                    )
                }
            );
    }
}

export function calculate(context: CalculationContext): CountryProductMetrics[] {
    const {
        reportingDays
    } = context;

    return Array.from({ length: reportingDays })
        .map((ignore, offset) => processReportsForUnit(context, context.reportMetrics, offset, "day"))
        .filter(Boolean)
}