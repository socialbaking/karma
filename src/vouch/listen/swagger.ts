import {FastifyInstance} from "fastify";
import basePlugin from "@fastify/swagger";
import uiPlugin from "@fastify/swagger-ui";
import {getHostname} from "./config";

export async function setupSwagger(fastify: FastifyInstance) {

    const url = getHostname()

    const { host } = new URL(url);

    await fastify.register(basePlugin, {
        swagger: {
            info: {
                title: 'Test swagger',
                description: 'Testing the Fastify swagger API',
                version: '0.1.0'
            },
            externalDocs: {
                url: 'https://swagger.io',
                description: 'Find more info here'
            },
            host,
            schemes: ['http'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [

            ],
            definitions: {

            },
            securityDefinitions: {
                apiKey: {
                    type: 'apiKey',
                    name: 'apiKey',
                    in: 'header'
                }
            }
        }
    })


    fastify.register(uiPlugin, {
        routePrefix: '/api/documentation',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false,
            url
        },
        uiHooks: {
            onRequest: function (request, reply, next) { next() },
            preHandler: function (request, reply, next) { next() }
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
        transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
        transformSpecificationClone: true
    })
}