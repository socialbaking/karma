import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { parse } from "csv";
import { pipeline } from "stream/promises";
import {
  addReport,
  ReportData,
  splitValueUnitPrefix,
  Report,
  listProducts, listOrganisations, listCategories, ProductData, ProductIngredient, CalculationConsentItem, setProduct,
} from "../../data";
import {isLike, ok} from "../../../is";
import { reportDataReportKeys } from "../../data/report/schema";
import { calculations, hasConsent } from "../../calculations";
import { MultipartValue } from "@fastify/multipart";
import { parseStringFields } from "../body-parser";
import { getReportDataFromRequestBody } from "./add-report";
import { authenticate } from "../authentication";
import { Readable } from "node:stream";
import {getMatchingProducts} from "../../utils";

const { UPLOAD_LIMIT: givenLimit } = process.env;

const UPLOAD_LIMIT = givenLimit ? +givenLimit : 4.5 * 1024 * 1024;

async function fromReadable(readable: Readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function fromReadableJSON(readable: Readable) {
  const buffer = await fromReadable(readable);
  return JSON.parse(buffer.toString("utf-8"));
}

type ReportDataRecord = Record<keyof ReportData, string>;

export async function uploadReportHandler(
  request: FastifyRequest
): Promise<Report | undefined> {
  ok(request.isMultipart(), "Expected multi part form upload");


  const fields: MultipartValue[] = [];

  const parser = parse({
    columns: true,
    trim: true,
  });

  const records: Record<string, string>[] = [];
  parser.on("readable", function () {
    let record;
    while ((record = parser.read())) {
      records.push(record);
    }
  });

  let fileParsed = false;

  for await (const part of request.parts({
    limits: {
      fileSize: UPLOAD_LIMIT,
    },
  })) {
    if (part.type === "field") {
      fields.push(part);
    } else if (part.type === "file") {
      ok(!fileParsed, "Expected one file");
      if (part.filename.endsWith(".json")) {
        // TODO
        const json = await fromReadableJSON(part.file);
        ok(Array.isArray(json), "Expected JSON array file");
        records.push(...json);
      } else {
        await pipeline(part.file, parser);
      }
      fileParsed = true;
    }
  }
  const fieldsParams = new URLSearchParams(
    fields.map((field) => [field.fieldname, String(field.value)])
  );
  const fieldsProcessed = parseStringFields(fieldsParams.toString());
  ok<Record<string, string>>(fieldsProcessed);

  ok(records.length, "Expected at least one row");

  console.log(records[0], records.find(isProductIngredientInfo));

  if (records.find(isProductIngredientInfo)) {
    await uploadIngredientInfo(records);
    return undefined;
  } else {
    // addReport shouldn't be throwing
    // where the above getReportDataFromRequestBody does throw
    // this allows us to be sure we aren't uploading half the report file
    return await uploadDefaultReportRecords(records, fieldsProcessed);
  }
}

export async function uploadReportRoutes(fastify: FastifyInstance) {
  fastify.post("/upload", {
    preHandler: authenticate(fastify),
    async handler(request, response) {
      const report = await uploadReportHandler(request);
      response.status(201);
      response.send(report);
    },
  });
}

function isProductIngredientInfo(info: unknown): info is ProductData & { ingredients: ProductIngredient[] } {
  return !!(
      isLike<ProductData>(info) &&
      typeof info.productName === "string" &&
      Array.isArray(info.ingredients) &&
      info.ingredients.every(ingredient => ingredient.name)
  );
}

async function uploadIngredientInfo(records: unknown[]): Promise<void> {
  const filtered = records.filter(isProductIngredientInfo);
  ok(filtered.length === records.length, `${records.length - filtered.length} items are not product ingredient lists`);

  const products = await listProducts();
  const organisations = await listOrganisations();
  const categories = await listCategories();

  for (const { productName, ingredients } of filtered) {
    const [match] = getMatchingProducts(
        products,
        organisations,
        categories,
        productName,
        true
    );

    if (match) {
       await setProduct({
         ...match,
         ingredients
       });
    }
  }
}

async function uploadDefaultReportRecords(records: ReportDataRecord[], fields: Record<string, string>) {
  ok(
      getReportDataRowEntries(records[0]).length,
      `Expected columns to match: ${reportDataReportKeys.join(",")}`
  );

  const data: ReportDataRecord[] = records
      .map((record) => {
        const entries = getReportDataRowEntries(record);
        if (!entries.length) return undefined;
        return getReportDataRow(entries);
      })
      .filter(Boolean);

  const { calculationConsent } = fields;

  ok<CalculationConsentItem[]>(calculationConsent);

  ok(
      hasConsent(calculationConsent, calculations.metrics.costPerUnit),
      `Expected consent for ${calculations.metrics.costPerUnit.title} calculations for CSV report upload`
  );

  const baseData: ReportData = {
    countryCode: data[0].countryCode,
    currencySymbol: data[0].currencySymbol,
    timezone: data[0].timezone,
    type: data[0].type,
    reportedAt: new Date().toISOString(),
    calculationConsent,
  };

  const parentReport = await addReport(baseData);
  const reportData: ReportData[] = [];
  const products = await listProducts();
  const organisations = await listOrganisations();
  const categories = await listCategories();

  for (const row of data) {
    ok(
        !row.countryCode || row.countryCode === baseData.countryCode,
        "Expected all rows to have the same countryCode, or only the first row to contain a countryCode"
    );
    ok(
        !row.currencySymbol || row.currencySymbol === baseData.currencySymbol,
        "Expected all rows to have the same currencySymbol, or only the first row to contain a currencySymbol"
    );
    ok(
        !row.timezone || row.timezone === baseData.timezone,
        "Expected all rows to have the same timezone, or only the first row to contain a timezone"
    );
    ok(
        !row.type || row.type === baseData.type,
        "Expected all rows to have the same type, or only the first row to contain a type"
    );

    const {
      note,
      productText,
      productSize,
      productTotalCost,
      productItemCost,
      productItems,
      productDeliveryCost,
      productFeeCost,
      productOrganisationText,
    } = row;

    const reportInput: ReportData = {
      ...baseData,
      parentReportId: parentReport.reportId,
      calculationConsent,
      note,
      productText,
      productTotalCost,
      productItemCost,
      productItems,
      productDeliveryCost,
      productFeeCost,
      productOrganisationText,
    };

    if (productSize) {
      const { value, unit } = splitValueUnitPrefix(productSize);
      if (value && unit) {
        reportInput.productSize = {
          value,
          unit,
        };
      }
    }
    reportData.push(await getReportDataFromRequestBody(reportInput, products, organisations, categories));
  }

  // addReport shouldn't be throwing
  // where the above getReportDataFromRequestBody does throw
  // this allows us to be sure we aren't uploading half the report file
  const reports = await Promise.all(reportData.map(addReport));

  return {
    ...parentReport,
    reports,
  };

  function getReportDataRowEntries(data: Record<string, string>) {
    return reportDataReportKeys
        .filter((key) => typeof data[key] === "string" && data[key].length)
        .map((key) => [key, data[key]] as const);
  }

  function getReportDataRow(
      entries: ReturnType<typeof getReportDataRowEntries>
  ): ReportDataRecord {
    const result = Object.fromEntries(entries);
    ok<ReportDataRecord>(result);
    return result;
  }
}
