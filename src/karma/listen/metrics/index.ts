import { FastifyInstance } from "fastify";
import { listMonthlyMetricsRoutes } from "./list-monthly-metrics";
import { listDailyMetricsRoutes } from "./list-daily-metrics";
import { listReportMetricsRoutes } from "./list-report-metrics";
import { listMetricsRoutes } from "./list-metrics";
import { listProductMetricsRoutes } from "./list-product-metrics";
import { addReportMetricsRoutes } from "./add-report-metrics";

export async function metricRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(listMonthlyMetricsRoutes);
    await fastify.register(listDailyMetricsRoutes);
    await fastify.register(listReportMetricsRoutes);
    await fastify.register(listMetricsRoutes);
    await fastify.register(listProductMetricsRoutes);
    await fastify.register(addReportMetricsRoutes);
  }

  await fastify.register(routes, {
    prefix: "/metrics",
  });
}
