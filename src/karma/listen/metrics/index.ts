import {FastifyInstance} from "fastify";
import {listMonthlyMetricsRoutes} from "./list-monthly-metrics";
import {listDailyMetricsRoutes} from "./list-daily-metrics";
import {listReportMetricsRoutes} from "./list-report-metrics";

export async function metricRoutes(fastify: FastifyInstance) {

    async function routes(fastify: FastifyInstance) {
        fastify.register(listMonthlyMetricsRoutes);
        fastify.register(listDailyMetricsRoutes);
        fastify.register(listReportMetricsRoutes);
    }

    fastify.register(routes, {
        prefix: "/metrics"
    });

}