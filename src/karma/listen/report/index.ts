import { FastifyInstance } from "fastify";
import { listReportRoutes } from "./list-reports";
import { addReportRoutes } from "./add-report";
import { getReportRoutes } from "./get-report";
import { uploadReportRoutes } from "./upload-report";

export async function reportRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    fastify.register(listReportRoutes);
    fastify.register(addReportRoutes);
    fastify.register(getReportRoutes);
    fastify.register(uploadReportRoutes);
  }

  fastify.register(routes, {
    prefix: "/reports",
  });
}
