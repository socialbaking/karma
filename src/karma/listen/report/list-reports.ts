import { FastifyInstance, FastifyRequest } from "fastify";
import { listReports, reportSchema } from "../../data";
import { authenticate } from "../authentication";
import {getUser} from "../../authentication";

export async function listReportRoutes(fastify: FastifyInstance) {
  const response = {
    200: {
      type: "array",
      items: reportSchema.report,
    },
  };

  const schema = {
    description: "List of reports",
    tags: ["report"],
    summary: "",
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  fastify.get("/", {
    schema,
    preHandler: authenticate(fastify),
    async handler(request: FastifyRequest, response) {
      response.send(await listReports({
        authorizedUserId: getUser().userId
      }));
    },
  });
}
