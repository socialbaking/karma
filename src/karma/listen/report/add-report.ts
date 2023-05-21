import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  addReport,
  CalculationConsentItem, Category, listCategories, listOrganisations,
  listProducts, Organisation,
  Product,
  Report,
  ReportData,
  reportSchema,
} from "../../data";
import { authenticate } from "../authentication";
import { isAnonymous } from "../../authentication";
import {
  isAnonymousCalculation,
  isNumberString,
  isProductReport,
  isProductReportData,
} from "../../calculations";
import { REPORTING_DATE_KEY } from "../../background";
import { ok } from "../../../is";
import { getMatchingProducts } from "../../utils";

type Schema = {
  Body: ReportData;
};

export async function addReportFromRequest(
  request: FastifyRequest
): Promise<Report> {
  ok<FastifyRequest<Schema>>(request);
  // Replace the body with the updated
  // report data so that it is consistent
  const products = listProducts();
  const organisations = listOrganisations();
  const categories = listCategories();
  request.body = await getReportDataFromRequestBody(
    request.body,
    await products,
    await organisations,
    await categories
  );
  return addReport(request.body);
}

export async function getReportDataFromRequestBody(
  body: ReportData,
  products: Product[],
  organisations: Organisation[],
  categories: Category[]
): Promise<ReportData> {
  let {
    type,
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
    productDeliveryCost,
    productItemCost,
    productFeeCost,
    productItems,
    productOrganisationId,
    productOrganisationName,
    productOrganisationText,
    productTotalCost,
    productSize,
    productText,
    receivedAt,
    reportedAt,
    shippedAt,
    timezone,
    anonymous,
  } = body;

  anonymous = anonymous || isAnonymous();

  calculationConsent = calculationConsent
    ?.map((value): CalculationConsentItem => {
      const consented =
        !!(value.consented || value.consentedAt) &&
        // May have some part of the UI actually setting the value to false, but leaving consentedAt a value
        value.consented !== false;
      return {
        ...value,
        consented,
        consentedAt: consented
          ? value.consentedAt || new Date().toISOString()
          : undefined,
      };
    })
    .filter((value) => value.consented);

  if (anonymous && calculationConsent) {
    // Only store keys that are related to anonymous users
    // Ensures they can never use calculations not intended for anonymous users
    calculationConsent = calculationConsent.filter((value) =>
      isAnonymousCalculation(value.calculationKey)
    );
  }

  if (!productFeeCost) {
    productFeeCost = "0";
  }

  if (!productDeliveryCost) {
    productDeliveryCost = "0";
  }

  const withTotal = { ...body, productTotalCost: "1" };
  if (!productTotalCost && isProductReportData(withTotal)) {
    const {
      productDeliveryCost,
      productItemCost,
      productFeeCost,
      productItems,
    } = withTotal;

    const totalItemCost = +productItems * +productItemCost;
    const fee = productFeeCost ? +productFeeCost : 0;
    const delivery = productDeliveryCost ? +productDeliveryCost : 0;
    const numeric = totalItemCost + fee + delivery;

    if (!isNaN(numeric)) {
      productTotalCost = numeric.toFixed(2);
    }
  }

  if ((productText || productName) && !productId) {
    const name = productText || productName;
    const matching = getMatchingProducts(products, organisations, categories, name, true);
    if (matching.length > 1) {
      throw new Error(
        `Name "${name}" matches multiple products: ${matching
          .map((value) => `"${value.productName}"`)
          .join(", ")}`
      );
    }
    const product = matching[0];
    if (product) {
      if (!productText) {
        productText = product.productName;
      }
      productName = product.productName;
      productId = product.productId;
      if (product.sizes?.length === 1 && !productSize) {
        productSize = product.sizes[0];
      }
    }
  }

  if (!(productId || productName || productText)) {
    throw new Error("No product name provided");
  }

  if (!(isNumberString(productItemCost) || isNumberString(productTotalCost))) {
    throw new Error("Expected item cost");
  }

  if (!isNumberString(productItems)) {
    throw new Error("Expected item count");
  }

  const data: ReportData = {
    type,
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
    productDeliveryCost,
    productFeeCost,
    productItemCost,
    productItems,
    productOrganisationId,
    productOrganisationName,
    productOrganisationText,
    productTotalCost,
    productSize,
    productText,
    receivedAt,
    reportedAt,
    shippedAt,
    timezone,
    anonymous,
  };

  if (typeof data[REPORTING_DATE_KEY] !== "string") {
    // Assume that the reporting key is today if it is not given
    // For example if the reporting date key is orderedAt, then they are reporting
    // on the day of ordering
    data[REPORTING_DATE_KEY] = new Date().toISOString();
  }

  return {
    ...body,
    ...data,
  };
}

export async function addReportRoutes(fastify: FastifyInstance) {
  const response = {
    201: {
      description: "A new report",
      ...reportSchema.report,
      additionalProperties: true,
    },
  };

  const schema = {
    description: "Add a new report",
    tags: ["report"],
    summary: "",
    body: reportSchema.reportData,
    response,
    security: [
      {
        apiKey: [] as string[],
      },
    ],
  };

  fastify.post<Schema>("/", {
    schema,
    preHandler: authenticate(fastify, {
      anonymous: true,
    }),
    async handler(request, response) {
      const report = await addReportFromRequest(request);
      response.status(201);
      response.send({
        ...report,
        isProductReport: isProductReport(report),
      });
    },
  });
}
