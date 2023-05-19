import { getMonthlyMetricsStore } from "./store";

export async function listMonthlyMetrics() {
  const store = getMonthlyMetricsStore();
  return store.values();
}
