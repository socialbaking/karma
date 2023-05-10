import {FastifyInstance} from "fastify";
import {addReport, ReportData, reportSchema} from "../../data";
import {authenticate} from "../authentication";
import {isAnonymous} from "../../authentication";

export async function addReportRoutes(fastify: FastifyInstance) {

    type Schema = {
        Body: ReportData
    }

    const response = {
        201: {
            description: "A new report",
            ...reportSchema.report
        }
    }

    const schema = {
        description: "Add a new report",
        tags: ["report"],
        summary: "",
        body: reportSchema.reportData,
        response
    }

    fastify.post<Schema>(
        "/",
        {
            schema,
            preHandler: authenticate(fastify, {
                anonymous: true
            }),
            async handler(request, response)  {
                const report = await addReport({
                    ...request.body,
                    anonymous: isAnonymous()
                });
                response.status(201);
                response.send(report);
            }
        }
    )
}

