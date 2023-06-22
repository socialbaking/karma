import { FastifyInstance } from "fastify";
import { listProductRoutes } from "./list-products";
import { addProductRoutes } from "./add-product";
import { getProductRoutes } from "./get-product";
import {getProductFileRoutes} from "./get-product-file";
import {getProductImageWatermarkRoutes} from "./get-product-image-watermark";

export async function productRoutes(fastify: FastifyInstance) {
  async function routes(fastify: FastifyInstance) {
    await fastify.register(listProductRoutes);
    await fastify.register(addProductRoutes);
    await fastify.register(getProductRoutes);
    await fastify.register(getProductFileRoutes);
    await fastify.register(getProductImageWatermarkRoutes);
  }

  await fastify.register(routes, {
    prefix: "/products",
  });
}
