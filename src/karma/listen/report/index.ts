import { FastifyInstance } from "fastify";
import { listReportRoutes } from "./list-reports";
import { addReportRoutes } from "./add-report";
import { getReportRoutes } from "./get-report";
import { uploadReportRoutes } from "./upload-report";

export async function reportRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(listReportRoutes);
    await fastify.register(addReportRoutes);
    await fastify.register(getReportRoutes);
    await fastify.register(uploadReportRoutes);
  }

  await fastify.register(routes, {
    prefix: "/reports",
  });
}
