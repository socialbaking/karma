import {
  getBackground,
  getProduct,
  getReport,
  getReportQueueStore,
  Report,
  seed,
  ActiveIngredientMetrics,
  getDailyMetricsStore,
  getMonthlyMetricsStore,
  getReportMetrics,
  getReportMetricsStore,
  ReportMetrics,
  ProductMetricData,
  ReportDateData,
  CountryProductMetrics,
  CountryProductMetricDuration,
  isNoReportMetricsId,
  ReportReference,
} from "../data";
import { isLike, ok } from "../../is";
import { mean } from "simple-statistics";
import { getCountry } from "countries-and-timezones";
import { DateTime } from "luxon";
import { KeyValueStore } from "../data/types";
import {
  CalculationConfig,
  CalculationContext,
  calculations,
  hasConsent,
  isNumberString,
  toHumanNumberString,
} from "../calculations";
import { DAY_MS, getExpiresAt, MONTH_MS } from "../data/expiring-kv";

export const REPORTING_DATE_KEY: keyof ReportDateData = "orderedAt";

const EXPIRE_DURATION_MULTIPLIER = 4;

export interface BackgroundInput extends Record<string, unknown> {}

export interface QueryInput extends BackgroundInput {
  query: Record<string, string>;
}

export async function calculateReportMetrics(
  report: Report
): Promise<ReportMetrics> {
  const { productId } = report;
  if (!productId) return undefined;
  const product = await getProduct(productId);
  if (!product) return undefined;
  // const categories = [];
  // if (product.categoryId) {
  //     const category = await getCategory(product.categoryId);
  //     if (category) categories.push(category);
  // }
  if (
    !hasConsent(report.calculationConsent, "calculations.metrics.costPerUnit")
  )
    return undefined;

  return calculations.metrics.costPerUnit.calculate(report, {
    products: [product],
    reports: [report],
    categories: [],
    currencySymbol: report.currencySymbol || "$", // TODO make configurable
  });
}

async function calculateQueuedReportMetrics(references: ReportReference[]) {
  const metrics = getReportMetricsStore();

  for await (const { reportId } of references) {
    if (isNoReportMetricsId(reportId)) continue;

    // Metrics already processed
    if (await metrics.has(reportId)) continue;

    const report = await getReport(reportId);

    ok(report, "Report in queue without being in store");

    console.log(
      report.reportId,
      report.productId,
      report.calculationConsent?.length
    );

    // No consent to calculate
    if (!report.calculationConsent?.length) continue;

    const calculated = await calculateReportMetrics(report);

    console.log(report.reportId, report.productId, calculated);

    if (!calculated) continue;

    await metrics.set(reportId, calculated);
  }
}

async function calculateQueuedMetrics(references: ReportReference[]) {
  const reports: ReportMetrics[] = (
    await Promise.all(
      references.map(({ reportId }) => getReportMetrics(reportId))
    )
  ).filter(Boolean);

  console.log(
    `${reports.length}/${references.length} reports to process into metrics`
  );

  const countryCodes = new Set(reports.flatMap((report) => report.countryCode));

  for (const countryCode of countryCodes) {
    const timezone = getCountry(countryCode);

    if (!timezone) {
      console.warn(
        `Could not find timezone found countryCode ${countryCode}, so skipping, TODO`
      );
      continue;
    }

    const zone = timezone.timezones.at(0);

    const countryReports: ReportMetrics[] = reports
      .filter((report) => report.countryCode === countryCode)
      .filter((report) => report[REPORTING_DATE_KEY]);

    const config: CalculationConfig = {
      currencySymbol: "$",
      timezone: zone,
      reportingDateKey: REPORTING_DATE_KEY,
      reportingDays: 7,
      reportingMonths: 2,
      countryCode,
    };

    const context: CalculationContext = {
      reports: [],
      products: [],
      categories: [],
      ...config,
      reportMetrics: countryReports,
      dailyMetrics: [],
      monthlyMetrics: [],
    };

    const dailyUpdate = calculations.metrics.dayCostPerProduct.handler(context);

    async function save(
      store: KeyValueStore<CountryProductMetrics>,
      metrics: CountryProductMetrics[],
      expiresInMs: number
    ) {
      for (const data of metrics) {
        const { reportingDateKey, countryCode } = data;
        const timestamp = data[reportingDateKey];
        if (!timestamp) {
          console.warn(
            `Warning, daily metrics returned without the reporting date key of ${reportingDateKey}`
          );
          continue;
        }
        const key = `${countryCode}_${reportingDateKey}_${timestamp}`;
        await store.set(key, {
          ...data,
          expiresAt: getExpiresAt(expiresInMs),
        });
      }
    }

    await save(
      getDailyMetricsStore(),
      dailyUpdate.dailyMetrics,
      context.reportingDays * EXPIRE_DURATION_MULTIPLIER * DAY_MS
    );

    context.dailyMetrics.push(...dailyUpdate.dailyMetrics);

    // No longer need access to report specific metrics
    // Clear to be sure we are not relying on them past here
    context.reportMetrics = [];

    const monthlyUpdate =
      calculations.metrics.monthCostPerProduct.handler(context);

    await save(
      getMonthlyMetricsStore(),
      monthlyUpdate.monthlyMetrics,
      context.reportingMonths * EXPIRE_DURATION_MULTIPLIER * MONTH_MS
    );
  }
}

function isQueryInput(input: BackgroundInput): input is QueryInput {
  return isLike<QueryInput>(input) && !!input.query;
}

export async function background(input: BackgroundInput = {}) {
  console.log(`Running background tasks`, input);

  const complete = await getBackground({
    // someInitialData: "start"
  });

  if (isQueryInput(input) && input.query.seed) {
    await seed();
  }

  const queue = getReportQueueStore();
  const references = await queue.values();
  await calculateQueuedReportMetrics(references);
  await calculateQueuedMetrics(references);

  await complete({
    // someCompletedData: "complete"
  });
}
