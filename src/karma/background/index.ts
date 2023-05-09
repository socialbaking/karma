import {
    getBackground,
    getProduct,
    getReport,
    getReportQueueStore,
    isProductReport,
    Report,
    toHumanNumberString
} from "../data";
import {
    ActiveIngredientMetrics,
    getDailyMetricsStore,
    getMonthlyMetricsStore,
    getReportMetricsStore,
    ReportMetrics
} from "../data/metrics";

export interface BackgroundInput extends Record<string, unknown> {

}

export async function getReportMetrics(report: Report): Promise<ReportMetrics> {
    const { countryCode, reportId } = report;
    const createdAt = new Date().toISOString();
    let activeIngredients: ActiveIngredientMetrics[] = [];

    if (isProductReport(report)) {
        const {
            productId,
            productPurchaseItems,
            productPurchaseTotalCost,
            productPurchaseDeliveryCost,
            productPurchaseFeeCost,
            productSize
        } = report;

        const totalCost = +productPurchaseTotalCost;
        const deliveryCost = +productPurchaseDeliveryCost;
        const items = Math.max(1, +productPurchaseItems);
        const feeCost = +(productPurchaseFeeCost ?? "0");

        const productCost = totalCost - deliveryCost - feeCost;
        const itemCost = productCost / items

        if (productId) {
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

                    console.log({ value, calculated, itemCost });

                    activeIngredients.push({
                        type,
                        unit: `$/${unit}`, // Note this is a specific currency symbol...
                        value: toHumanNumberString(itemCost / numeric),
                        proportional: false
                    });

                }



            }

        }

    }

    return {
        reportId,
        activeIngredients,
        createdAt,
        updatedAt: createdAt,
        countryCode
    }
}

async function calculateReportMetrics() {
    const queue = getReportQueueStore();
    const metrics = getReportMetricsStore();

    for await (const { reportId } of queue) {

        // Metrics already processed
        if (await metrics.has(reportId)) continue;

        const report = await getReport(reportId);

        if (!report) continue;

        await metrics.set(
            reportId,
            await getReportMetrics(report)
        );

    }

}

async function calculateDailyMetrics() {
    const queue = getReportQueueStore();

    const references = await queue.values();

    const reports = await Promise.all(
        references.map(({ reportId }) => getReport(reportId))
    );

    console.log(reports.length, "reports to process into daily metrics");

    const store = getDailyMetricsStore();




}

async function calculateMonthlyMetrics() {

    const store = getMonthlyMetricsStore();

}

export async function background(input: BackgroundInput) {

    console.log(`Running background tasks`, input);

    const complete = await getBackground({
        // someInitialData: "start"
    });

    await calculateDailyMetrics();
    await calculateMonthlyMetrics();

    await complete({
        // someCompletedData: "complete"
    });

}