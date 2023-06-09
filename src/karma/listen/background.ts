import { FastifyInstance } from "fastify";
import { background } from "../background";
import {capture} from "../request-logs";

export async function backgroundRoutes(fastify: FastifyInstance) {

  type Schema = {
    Querystring: {
      captureKey: string
    }
  }

  fastify.get<Schema>("/background", {
    async handler(request, response) {
      console.log(request.headers);

      const capturing = capture(request.query.captureKey);

      await background({
        query: request.query,
      });

      capturing?.release();

      response.status(200);
      response.send(capturing?.logs);
    },
  });
}
