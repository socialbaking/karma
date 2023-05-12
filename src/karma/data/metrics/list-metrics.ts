import {listDailyMetrics} from "./list-daily-metrics";
import {listMonthlyMetrics} from "./list-monthly-metrics";

export async function listMetrics() {
    const [daily, monthly] = await Promise.all([
        listDailyMetrics(),
        listMonthlyMetrics()
    ])
    return daily.concat(monthly);
}