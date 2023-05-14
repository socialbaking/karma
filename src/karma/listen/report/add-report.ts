import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import {addReport, CalculationConsentItem, listProducts, Report, ReportData, reportSchema} from "../../data";
import {authenticate} from "../authentication";
import {isAnonymous} from "../../authentication";
import {isProductReport} from "../../calculations";
import {REPORTING_DATE_KEY} from "../../background";
import {ok} from "../../../is";


type Schema = {
    Body: ReportData
}

export async function addReportFromRequest(request: FastifyRequest): Promise<Report>  {
    ok<FastifyRequest<Schema>>(request);
    let {
        calculationConsent,
        countryCode,
        createdAt,
        createdByUserId,
        currencySymbol,
        expiresAt,
        note,
        orderedAt,
        parentReportId,
        productId,
        productName,
        productPurchase,
        productPurchaseDeliveryCost,
        productPurchaseItemCost,
        productPurchaseFeeCost,
        productPurchaseItems,
        productPurchasePartnerId,
        productPurchasePartnerName,
        productPurchasePartnerText,
        productPurchaseTotalCost,
        productSize,
        productText,
        receivedAt,
        reportedAt,
        shippedAt,
        timezone,
        anonymous
    } = request.body;

    calculationConsent = calculationConsent?.map((value): CalculationConsentItem => {
        const consented = !!(
            value.consented ||
            value.consentedAt
        ) && (
            // May have some part of the UI actually setting the value to false, but leaving consentedAt a value
            value.consented !== false
        );
        return {
            ...value,
            consented,
            consentedAt: consented ? (value.consentedAt || new Date().toISOString()) : undefined
        };
    });

    if (productText && !productId) {
        const products = await listProducts();
        const lower = productText.toLowerCase();
        const product = products.find(product => product.productName.toLowerCase().includes(lower));
        if (product) {
            productName = product.productName;
            productId = product.productId;
            if (product.sizes?.length === 1) {
                productSize = product.sizes[0];
            }
        }
    }

    const data: ReportData = {
        calculationConsent,
        countryCode,
        createdAt,
        createdByUserId,
        currencySymbol,
        expiresAt,
        note,
        orderedAt,
        parentReportId,
        productId,
        productName,
        productPurchase,
        productPurchaseDeliveryCost,
        productPurchaseFeeCost,
        productPurchaseItemCost,
        productPurchaseItems,
        productPurchasePartnerId,
        productPurchasePartnerName,
        productPurchasePartnerText,
        productPurchaseTotalCost,
        productSize,
        productText,
        receivedAt,
        reportedAt,
        shippedAt,
        timezone,
        anonymous: anonymous || isAnonymous()
    };

    if (typeof data[REPORTING_DATE_KEY] !== "string") {
        // Assume that the reporting key is today if it is not given
        // For example if the reporting date key is orderedAt, then they are reporting
        // on the day of ordering
        data[REPORTING_DATE_KEY] = new Date().toISOString();
    }

    return await addReport(data);
}

export async function addReportRoutes(fastify: FastifyInstance) {

    const response = {
        201: {
            description: "A new report",
            ...reportSchema.report,
            additionalProperties: true
        }
    }

    const schema = {
        description: "Add a new report",
        tags: ["report"],
        summary: "",
        body: reportSchema.reportData,
        response,
        security: [
            {
                apiKey: [] as string[]
            }
        ]
    }

    fastify.post<Schema>(
        "/",
        {
            schema,
            preHandler: authenticate(fastify, {
                anonymous: true
            }),
            async handler(request, response)  {

                const report = await addReportFromRequest(request);
                response.status(201);
                response.send({
                    ...report,
                    isProductReport: isProductReport(report)
                });
            }
        }
    )
}

