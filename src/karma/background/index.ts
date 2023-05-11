import {
    getBackground,
    getProduct,
    getReport,
    getReportQueueStore,
    isProductReport,
    Report,
    seed,
    toHumanNumberString,
    ActiveIngredientMetrics,
    getDailyMetricsStore,
    getMonthlyMetricsStore,
    getReportMetrics,
    getReportMetricsStore,
    ReportMetrics,
    ProductMetricData,
    isNumberString,
    ProductReport,
    ReportDateData,
    CountryProductMetrics,
    CountryProductMetricDuration, getReportDates
} from "../data";
import {isLike, ok} from "../../is";
import {mean} from "simple-statistics";
import {getCountry} from "countries-and-timezones";
import {DateTime, DateTimeUnit} from "luxon";
import {KeyValueStore} from "../data/types";

const REPORTING_DATE_KEY: keyof ReportDateData = "orderedAt";

export interface BackgroundInput extends Record<string, unknown> {

}

export interface QueryInput extends BackgroundInput {
    query: Record<string, string>
}

export async function calculateReportMetrics(report: Report): Promise<ReportMetrics> {
    const { countryCode, reportId } = report;
    const createdAt = new Date().toISOString();
    let activeIngredients: ActiveIngredientMetrics[] = [];

    if (!isProductReport(report)) return undefined;

    const {
        productId,
        productPurchaseItems,
        productPurchaseTotalCost,
        productPurchaseDeliveryCost,
        productPurchaseFeeCost
    } = report;

    const totalCost = +productPurchaseTotalCost;
    const deliveryCost = +productPurchaseDeliveryCost;
    const items = Math.max(1, +productPurchaseItems);
    const feeCost = +(productPurchaseFeeCost ?? "0");

    const productCost = totalCost - deliveryCost - feeCost;
    const itemCost = productCost / items

    const product = await getProduct(productId);

    if (product?.activeIngredients) {

        const calculated = product
            .activeIngredients
            .filter(value => value.calculated)

        for (const { type, unit, value } of calculated) {

            const numeric = +value;

            // if (productSize && productSize.unit !== unit) {
            //     continue;
            // }

            // console.log({ value, calculated, itemCost });

            activeIngredients.push({
                type,
                unit: `$/${unit}`, // Note this is a specific currency symbol...
                value: toHumanNumberString(itemCost / numeric),
                proportional: false
            });

        }

    }

    const dates = getReportDates(report);

    return {
        ...dates,
        reportId,
        productId,
        activeIngredients,
        createdAt,
        updatedAt: createdAt,
        countryCode
    }
}

async function calculateQueuedReportMetrics() {
    const queue = getReportQueueStore();
    const metrics = getReportMetricsStore();

    for await (const { reportId } of queue) {

        // Metrics already processed
        if (await metrics.has(reportId)) continue;

        const report = await getReport(reportId);

        ok(report, "Report in queue without being in store")

        const calculated = await calculateReportMetrics(report);

        if (!calculated) continue;

        await metrics.set(
            reportId,
            calculated
        );

    }

}

async function calculateQueuedMetrics() {
    const queue = getReportQueueStore();

    const references = await queue.values();

    const reports: ReportMetrics[] = (
        await Promise.all(
            references.map(({ reportId }) => getReportMetrics(reportId))
        )
    )
        .filter(Boolean);

    console.log(reports.length, "reports to process into metrics");

    const stores: Record<CountryProductMetricDuration, KeyValueStore<CountryProductMetrics>> = {
        day: getDailyMetricsStore(),
        month: getMonthlyMetricsStore()
    };

    const countryCodes = new Set(reports.flatMap(report => report.countryCode));

    function getProductMetricData(productId: string, reports: ReportMetrics[]): ProductMetricData | undefined {
        const productReports: ReportMetrics[] = reports.filter(report => report.productId === productId);

        const activeIngredients = productReports
            .flatMap(report => report.activeIngredients);

        const types = new Set(
            activeIngredients.map(value => value.type)
        );

        const results: ActiveIngredientMetrics[] = [];

        for (const type of types) {

            const typeValues = activeIngredients.filter(value => value.type === type);
            const units = new Set(typeValues.map(value => value.unit));

            for (const unit of units) {

                function withValues(values: ActiveIngredientMetrics[]) {
                    const numericValues = values
                        .map(value => value.value)
                        .filter(isNumberString)
                        .map(value => +value);
                    const { length } = numericValues;
                    if (!length) return;
                    results.push({
                        ...values.at(0),
                        type,
                        unit,
                        value: toHumanNumberString(mean(numericValues)),
                        mean: true
                    });
                }

                const unitValues = typeValues.filter(value => value.unit === unit);

                // We don't want to mix these two types of values
                withValues(unitValues.filter(value => value.proportional));
                withValues(unitValues.filter(value => !value.proportional));

            }

        }

        if (!results.length) return undefined;

        return {
            productId,
            activeIngredients: results,
        }
    }

    for (const countryCode of countryCodes) {

        const timezone = getCountry(countryCode);

        if (!timezone) {
            console.warn(`Could not find timezone found countryCode ${countryCode}, so skipping, TODO`);
            continue;
        }

        const zone = timezone.timezones.at(0);

        const products: ProductMetricData[] = [];

        const countryReports: ReportMetrics[] = reports
            .filter(report => report.countryCode === countryCode)
            .filter(report => report[REPORTING_DATE_KEY]);

        // Use index compared of countryReports to get the date
        const countryReportDateInstances: DateTime[] = countryReports
            .map(
                report => {
                    const dateValue = report[REPORTING_DATE_KEY];
                    return DateTime.fromISO(
                        dateValue,
                        {
                            // Pick first timezone unless given in later iteration
                            // Close enough for now
                            zone: timezone.timezones.at(0)
                        }
                    )
                }
            );

        async function processReportsForUnit(minus: number, unit: CountryProductMetricDuration) {
            const store = stores[unit];

            ok(store);

            const targetDate = DateTime
                .local()
                .setZone(zone)
                .startOf(unit)
                .minus({
                    [unit]: minus
                })
                .startOf(unit);

            const timestamp = targetDate.toJSDate().toISOString();

            const dayReports = countryReports.filter((report, index) => {
                const date = countryReportDateInstances.at(index);
                ok(date, `Expected countryReportDateInstances at index ${index} to exist with length ${countryReportDateInstances.length}`);

                return date.hasSame(targetDate, unit);
            });

            console.log(dayReports.length, `reports to process into metrics for ${unit} ${timestamp}`);

            const productIds = new Set(
                dayReports.map(report => report.productId ?? "").filter(Boolean)
            );

            for (const productId of productIds) {
                const data = getProductMetricData(productId, dayReports);
                if (data) products.push(data);
            }

            // console.log(unit, timestamp, countryCode, zone, ...products);

            const createdAt = new Date().toISOString();
            const countryReport: CountryProductMetrics = {
                products,
                createdAt,
                updatedAt: createdAt,
                countryCode,
                duration: unit,
                timestamp,
                timezone: zone
            };

            await store.set(timestamp, countryReport);
        }

        // Only process a few days behind, if a report is made against the
        // report date too late, then
        for (let i = 0; i < 7; i += 1) {
            await processReportsForUnit(i, "day");
        }

        // Process this month and month before
        await processReportsForUnit(0, "month");
        await processReportsForUnit(1, "month");

    }




}

function isQueryInput(input: BackgroundInput): input is QueryInput {
    return isLike<QueryInput>(input) && !!input.query;
}

export async function background(input: BackgroundInput) {

    console.log(`Running background tasks`, input);

    const complete = await getBackground({
        // someInitialData: "start"
    });

    if (isQueryInput(input) && input.query.seed) {
        await seed();
    }

    await calculateQueuedReportMetrics();
    await calculateQueuedMetrics();

    await complete({
        // someCompletedData: "complete"
    });

}