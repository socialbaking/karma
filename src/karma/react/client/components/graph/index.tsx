import {
  ActiveIngredientMetrics,
  CountryProductMetricDuration,
  CountryProductMetrics,
  ReportDateData,
} from "../../../../client";
import { useMemo } from "react";
import { DateTime, DurationUnit } from "luxon";
import { ok } from "../../../../../is";
import { ProductMetricData } from "../../../../client";
import { isNumberString } from "../../../../calculations";

type ReportDateDataKey = keyof ReportDateData;

export interface ProductValue {
  productId: string;
  value: number;
  date: DateTime;
  label: string;
  values: number[];
}

export interface Timestamp {
  date: DateTime;
  metrics: CountryProductMetrics[];
  values: ProductValue[];
  label: string;
}

export interface MetricsGraphProps {
  metrics: CountryProductMetrics[];
  // All these will be defaulted if not provided
  countryCode?: string;
  duration?: CountryProductMetricDuration;
  width?: number;
  height?: number;
  unit?: string;
  type?: string;
}

export interface ProductMetricsProps extends MetricsGraphProps {
  unit: string;
  duration: CountryProductMetricDuration;
  timestamps: Timestamp[];
  productId: string;
  width: number;
  height: number;
  values: number[];
  minValue: number;
  maxValue: number;
}

export interface ProductMetricsDotProps extends ProductMetricsProps {
  product: ProductValue;
}

export interface ProductMetricsLineProps extends ProductMetricsProps {
  product: ProductMetricData;
}

const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 128;

function getProductsFromMetrics(
  metrics: CountryProductMetrics,
  productId: string
) {
  return metrics.products.filter((value) => value.productId === productId);
}

function isProductInMetrics(metrics: CountryProductMetrics, productId: string) {
  return !!getProductsFromMetrics(metrics, productId);
}

function getXY(props: ProductMetricsProps, metric: ProductValue) {
  const first = props.timestamps[0].date;
  const last = props.timestamps[props.timestamps.length - 1].date;

  const ms = first.diff(last).as("minutes");
  const { width, height, minValue, maxValue, values } = props;
  const valueSpan = Math.max(
    values.length < 1 ? 150 : maxValue - minValue,
    150
  );
  const yRatio = !valueSpan ? 1 : height / valueSpan;
  const xRatio = !ms ? 1 : width / ms;

  const { value } = metric;
  const y = yRatio * Math.max((value - minValue) / valueSpan, 0);
  const x = xRatio * Math.max(first.diff(metric.date).as("seconds"), 0);

  console.log({
    xRatio,
    yRatio,
    x,
    y,
    ms,
    width,
    height,
    minValue,
    maxValue,
    first: first.toString,
    date: metric.date.toString(),
  });

  return {
    y,
    x,
  };
}

export function MetricsProductDot(props: ProductMetricsDotProps) {
  const { x, y } = getXY(props, props.product);
  return <circle cx={x} cy={y} r={4} fill="green" />;
}

function getPath(props: ProductMetricsProps, values: ProductValue[]) {
  const path = values.map((value) => getXY(props, value));
  return path
    .map(({ x, y }, index) => `${index ? "L" : "M"} ${x} ${y}`)
    .join(" ");
}

export function MetricsProduct(props: ProductMetricsProps) {
  const { productId } = props;

  const timestamps = useMemo(() => {
    return props.timestamps.filter(
      (timestamp) =>
        !!timestamp.metrics.find((metrics) =>
          isProductInMetrics(metrics, productId)
        )
    );
  }, [props.timestamps, productId]);

  const products = useMemo(() => {
    return timestamps.flatMap<ProductValue>((timestamp) => timestamp.values);
  }, [productId, timestamps]);

  return (
    <>
      {products.map((product) => {
        return <MetricsProductDot {...props} product={product} />;
      })}
      {products.length ? (
        <path path={getPath(props, products)} stroke="orange" strokeWidth={2} />
      ) : undefined}
    </>
  );
}

export function MetricsGraph(props: MetricsGraphProps) {
  const { metrics, type } = props;
  const width = props.width || DEFAULT_WIDTH;
  const height = props.height || DEFAULT_HEIGHT;

  const givenCountryCode = props.countryCode;

  const duration = props.duration || metrics[0]?.duration || "day";

  const { durationMetrics, reportingDateKey, countryCode } = useMemo(() => {
    let durationMetrics = metrics.filter(
      (value) => value.duration === duration
    );
    const countryCode =
      givenCountryCode || durationMetrics[0]?.countryCode || "NZ";
    durationMetrics = durationMetrics.filter(
      (value) => value.countryCode === countryCode
    );
    const reportingDateKey: ReportDateDataKey =
      durationMetrics[0]?.reportingDateKey || "orderedAt";
    return {
      countryCode,
      reportingDateKey,
      durationMetrics: durationMetrics.filter(
        (value) => value.reportingDateKey === reportingDateKey
      ),
    } as const;
  }, [metrics, duration, givenCountryCode]);

  console.log({
    durationMetrics: durationMetrics.length,
    reportingDateKey,
    countryCode,
  });

  const unit =
    props.unit ||
    (durationMetrics[0]?.currencySymbol
      ? `${durationMetrics[0]?.currencySymbol}/g`
      : undefined) ||
    "$/g";

  const productIds = useMemo(
    () =>
      durationMetrics.flatMap<string>((value) =>
        value.products.map((value) => value.productId)
      ),
    [durationMetrics]
  );

  console.log({ productIds });

  function isMatchingUnit(value: ActiveIngredientMetrics) {
    return (
      isNumberString(value.value) &&
      value.unit === unit &&
      (!type || value.type === type)
    );
  }

  const { values, minValue, maxValue } = useMemo(() => {
    const allValues = durationMetrics.flatMap<number>((value) =>
      value.products.flatMap<number>((product) =>
        product.activeIngredients
          .filter(isMatchingUnit)
          .map((value) => +value.value)
      )
    );
    const values = [...new Set(allValues)]
      // Largest value first please
      .sort((a, b) => (a > b ? -1 : 1));

    return {
      values,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    } as const;
  }, [durationMetrics, unit, type]);

  console.log({ values, minValue, maxValue });

  const timestamps = useMemo(() => {
    if (!durationMetrics.length) return [];
    const { timezone } = durationMetrics[0];
    const indexedDates = durationMetrics.map((value) =>
      DateTime.fromISO(value[reportingDateKey], { zone: timezone })
    );

    const dates = indexedDates.sort((a, b) => a.diff(b).as("milliseconds"));

    if (dates.length > 1) {
      // Just need to confirm my thinking here, it's a bit confusing using diff
      // not sure which way a vs b is meant to go
      ok(dates[0].toMillis() < dates[1].toMillis());
    }

    const first = dates[0];

    const units: DurationUnit[] = ["minute", "day", "month", "year"];
    const durationIndex = units.indexOf(duration);
    const before = units[durationIndex - 1];
    const after = units[durationIndex + 1];

    const unitAfter = dates[0]
      .plus({ [after]: 1 })
      .minus({ [before]: 1 })
      .endOf(duration);

    const datesLast = dates[dates.length - 1];
    const last =
      unitAfter.diff(datesLast).as("milliseconds") < 0
        ? datesLast
        : unitAfter.startOf(duration);

    const difference = Math.max(1, first.diff(last).as(duration));

    console.log({ difference });

    return Array.from({ length: difference }, (ignore, index): Timestamp => {
      const date = first.plus({ [duration]: index }).startOf(duration);
      const label = getLabel(date);

      const metrics = durationMetrics.filter((metric, index) => {
        const metricDate = indexedDates[index];
        ok(metricDate);
        return date.hasSame(metricDate, duration);
      });
      const values = metrics.flatMap<ProductValue>((metrics) =>
        metrics.products.map((product): ProductValue => {
          const units = product.activeIngredients.filter(isMatchingUnit);
          const types = [...new Set(units.map((value) => value.type))].sort(
            (a, b) => {
              if (a === b) return 0;
              if (a.includes("+")) return -1;
              if (b.includes("+")) return -1;
              return a > b ? -1 : 1;
            }
          );
          // Just make sure we are dealing with a single value unit and type
          // meaning we don't accidentally mix values
          const type = types[0];

          const values = product.activeIngredients
            .filter((value) => value.type === type)
            .map((value) => +value.value);

          return {
            productId: product.productId,
            value: Math.min(...values),
            date,
            label,
            values: [...new Set(values)],
          };
        })
      );

      return {
        date,
        metrics,
        label,
        values,
      };

      function getLabel(date: DateTime) {
        if (duration === "month") {
          return date.toFormat("MMM y");
        }
        return date.toFormat("d MMM y");
      }
    });
  }, [durationMetrics, unit, type]);
  if (!timestamps.length) {
    console.log(`No matching timestamps for ${unit} ${type} ${duration}`);
    return null;
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="presentation">
      {productIds.map((productId) => (
        <MetricsProduct
          {...props}
          productId={productId}
          width={width}
          height={height}
          type={type}
          unit={unit}
          countryCode={countryCode}
          timestamps={timestamps}
          values={values}
          minValue={minValue}
          maxValue={maxValue}
          duration={duration}
        />
      ))}
    </svg>
  );
}
