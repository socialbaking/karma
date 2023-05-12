import {getReportMetricsStore} from "./store";
import {isAnonymous} from "../../authentication";

export async function listReportMetrics() {
    const anonymous = isAnonymous()
    const store = getReportMetricsStore();
    const values = await store.values();
    console.log("listReportMetrics", store.name, values);
    // If the user is anonymous, only show anonymous consented metrics
    // If the user is authenticated, they can view any consented metrics
    return values.filter(value => (value.anonymous || !anonymous) && value.calculationConsent);
}