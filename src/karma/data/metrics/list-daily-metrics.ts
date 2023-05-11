import {getDailyMetricsStore} from "./store";

export async function listDailyMetrics() {
    const store = getDailyMetricsStore();
    return store.values();
}