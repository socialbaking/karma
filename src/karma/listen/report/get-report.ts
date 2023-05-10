import {FastifyInstance} from "fastify";
import {getReport, reportSchema} from "../../data";
import {authenticate} from "../authentication";

export async function getReportRoutes(fastify: FastifyInstance) {

    const params = {
        type: "object",
        properties: {
            reportId: {
                type: "string"
            }
        },
        required: [
            "reportId"
        ]
    };

    const response = {
        200: {
            description: "A report",
            ...reportSchema.report
        }
    }

    const schema = {
        description: "Get a report",
        tags: ["report"],
        summary: "",
        response,
        params,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    };

    type Schema = {
        Params: {
            reportId: string;
        }
    }

    fastify.get<Schema>(
        "/:reportId",
        {
            schema,
            preHandler: authenticate(fastify),
            async handler(request, response) {
                const report = await getReport(request.params.reportId);
                if (!report) response.status(404);
                response.send(report);
            }
        }
    );
}

