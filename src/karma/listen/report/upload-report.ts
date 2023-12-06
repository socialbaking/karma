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
import xlsx from "xlsx";

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

type RowRecord = Record<string, string>;

type ReportDataRecord = Record<keyof ReportData, string>;

function parseProductRows(rows: RowRecord[] = []) {
  const pricePerUnitIndex = rows.findIndex(isPricePerUnitRow);
  const totalUnitPrices = rows.slice(0, pricePerUnitIndex - 1);
  return totalUnitPrices.filter(getRowProductName);

  function isPricePerUnitRow(row: RowRecord) {
    const name = getRowProductName(row);
    return (
        name === "Product (price per gram)" ||
        name === "Product (full spectrum) price per mg" ||
        name === "Product (Isolate or synthetic) price per mg" ||
        name === "Product price (balanced) per mg" ||
        name === "Product price (high THC) per mg" ||
        name === "Product price per mg" ||
        name === "Price per mg"
    );
  }
}

function getRowProductName(row: RowRecord) {
  return (
      row["Product Name"] ??
      row["Product (Full spectrum)"] ??
      row["Product (Isolate or synthetic)"] ??
      row["Product (Flower)"] ??
      row["Product (Isolate or synthetic)"] ??
      row["Product"] ??
      row["Device"]
  );
}

function parseProductWorkSheet(sheet: xlsx.WorkSheet) {
  const json = xlsx.utils.sheet_to_json<RowRecord>(sheet, {
    defval: "",
    blankrows: true
  });
  return parseProductRows(json);
}

function flattenProducts(sheet: RowRecord[]): ReportDataRecord[] {
  return sheet.flatMap(
      (row): ReportDataRecord[] => {

        return Object.entries(row)
            .filter(([key]) => !(key.includes("%") || key === "Size" || key === "Total mg" || key === "Total g" || key === "mg/ml" || getRowProductName(row).includes("updated or checked")))
            .filter(([, value]) => typeof value === "number")
            .map(([key, value]): ReportDataRecord => {
              let singleLine = key
                  .replace(/\s+/g, " ")
                  // Special characters for references etc
                  .replace(/[‡*]+/g, "")
                  .trim()

              function formatNumber(value: number | string) {
                return String(Math.round(Number(value) * 100) / 100)
              }

              let size = `${row["Size"]}g`,
                  items = "1",
                  totalCost = formatNumber(row[key]),
                  itemCost = totalCost,
                  deliveryCost = "",
                  feeCost = "";

              const itemsMatch = singleLine.match(/x(\d+)/);
              if (itemsMatch) {
                items = itemsMatch[1];
                singleLine = singleLine.replace(itemsMatch[0], "").trim();
              }

              const sizeMatch = singleLine.match(/(\d+)g/);
              if (sizeMatch) {
                size = sizeMatch[1];
                singleLine = singleLine.replace(sizeMatch[0], "").trim()
              }

              if (items !== "1") {
                totalCost = formatNumber(Number(row[key]) * Number(items))
              }

              return {
                type: "product",
                countryCode: "NZ",
                currencySymbol: "$",
                timezone: "Pacific/Auckland",
                note: "",
                productText: [
                  row["Brand"],
                  getRowProductName(row)
                ]
                    .filter(Boolean)
                    .join(" "),
                // TODO replace size if in key
                productSize: size,
                productTotalCost: totalCost,
                productItemCost: itemCost,
                productItems: items,
                productDeliveryCost: deliveryCost,
                productFeeCost: feeCost,
                productOrganisationText: singleLine
              }
            })

      }
  )
}

async function parseXLSXFile(file: Readable) {
  const records: RowRecord[] = [];

  const workbook = xlsx.read(await fromReadable(file));

  const flower = workbook.Sheets["Flower"]
  const oilCBD = workbook.Sheets["CBD Oil (FS)"];
  const oilCBDIsolate = workbook.Sheets["CBD Oil (Iso)"];
  const oilCBDTHC = workbook.Sheets["CBD:THC Oil"];
  const oilTHC = workbook.Sheets["THC Oil"];
  // const edibles = workbook.Sheets["Edibles"];
  // const vapes = workbook.Sheets["Vapes"];

  if (flower) {
    const products = parseProductWorkSheet(flower);
    const branded = products.filter(row => row["Brand"]);
    records.push(...flattenProducts(branded))
  }

  if (oilCBD) {
    records.push(...flattenProducts(parseProductWorkSheet(oilCBD)));
  }

  if (oilCBDIsolate) {
    records.push(...flattenProducts(parseProductWorkSheet(oilCBDIsolate)));
  }

  if (oilCBDTHC) {
    records.push(...flattenProducts(parseProductWorkSheet(oilCBDTHC)));
  }

  if (oilTHC) {
    records.push(...flattenProducts(parseProductWorkSheet(oilTHC)));
  }

  return records;
}

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
      } else if (part.filename.endsWith(".xlsx")) {
        records.push(...await parseXLSXFile(part.file));
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
