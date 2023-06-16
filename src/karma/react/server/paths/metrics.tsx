import { useMetrics, useProducts } from "../data/provider";
import { MetricsGraph } from "../../client/components/graph";

export const path = "/metrics";
export const anonymous = false;

export function Metrics() {
  const metrics = useMetrics();
  const products = useProducts();

  return (
    <div className="metric-list">
      <MetricsGraph metrics={metrics} duration="day" />
      {metrics.map((metric, index) => {
        return (
          <div key={index} className="metric-list-item">
            <div className="metric-list-item-name">
              {metric.duration} {metric[metric.reportingDateKey]}
            </div>
            <br />
            {metric.products.map(({ productId, activeIngredients }) => {
              const product = products.find(
                (product) => product.productId === productId
              );
              if (!product) return undefined;
              const units = [
                ...new Set(activeIngredients.flatMap((value) => value.unit)),
              ];
              return (
                <>
                  <details open>
                    <summary className="cursor-pointer">
                      <strong>Product: {product.productName}</strong>
                    </summary>
                    <ul className="list-none">
                      {units.map((unit, unitIndex) => {
                        const labels = activeIngredients
                          .filter((value) => value.unit === unit)
                          .sort((a, b) => {
                            if (a.type !== b.type)
                              return a.type > b.type ? -1 : 1;
                            if (a.prefix && !b.prefix) return -1;
                            if (b.prefix && !a.prefix) return 1;
                            if (a.proportional) return b.proportional ? 0 : -1;
                            return a.value < b.value ? -1 : 1;
                          })
                          .map(
                            (
                              { type, unit, value, prefix, proportional },
                              index
                            ) => {
                              let valuePrefix = "",
                                valueSuffix = "";
                              if (
                                metric.currencySymbol &&
                                unit.startsWith(`${metric.currencySymbol}/`)
                              ) {
                                valuePrefix = metric.currencySymbol;
                              } else if (!unit.includes("/")) {
                                valueSuffix = unit;
                              }
                              return (
                                <li key={index}>
                                  {type}: {prefix || ""}
                                  {valuePrefix}
                                  {value}
                                  {valueSuffix}
                                  {proportional
                                    ? " (active ingredient cost)"
                                    : ""}
                                </li>
                              );
                            }
                          );
                        return (
                          <li>
                            <details {...(unitIndex ? {} : { open: true })}>
                              <summary className="cursor-pointer">
                                <strong>{unit}</strong>
                              </summary>
                              <ul className="list-none">{labels}</ul>
                            </details>
                          </li>
                        );
                      })}
                    </ul>
                  </details>
                  <br />
                  <hr />
                  <br />
                </>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export const Component = Metrics;