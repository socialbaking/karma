import { FastifyInstance, FastifyRequest } from "fastify";
import {listOffers, listSpeculativeOffers, offerSchema} from "../../data";
import { authenticate } from "../authentication";
import {isAnonymous} from "../../authentication";

export async function listOfferRoutes(fastify: FastifyInstance) {
  const response = {
    200: {
      type: "array",
      items: offerSchema.offer,
    },
  };

  const schema = {
    description: "List of offers",
    tags: ["offer"],
    summary: "",
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  await fastify.get("/", {
    schema,
    preHandler: authenticate(fastify),
    async handler(request: FastifyRequest, response) {
      const offerPromise = listOffers({
        public: isAnonymous()
      });
      const speculativeOffersPromise = listSpeculativeOffers({
        public: isAnonymous()
      });
      const [offers, speculativeOffers] = await Promise.all([
          offerPromise,
          speculativeOffersPromise
      ]);
      response.send(speculativeOffers.concat(offers));
    },
  });
}
