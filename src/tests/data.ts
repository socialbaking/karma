import {
  addReport,
  listOrganisations,
  listPartners,
  listProducts,
  seed,
  stopData,
} from "../karma/data";
import { ok } from "../is";
import { background, calculateReportMetrics } from "../karma/background";
import { getCompleteCalculationConsent, Product, ReportData } from "../karma";

// Default full consent for calculations
const calculationConsent = getCompleteCalculationConsent();

{
  const products = await listProducts();
  const organisations = await listOrganisations();

  function findProduct(name: string) {
    const lower = name.toLowerCase();
    const product = products.find((product) =>
      product.productName.toLowerCase().includes(lower)
    );
    ok(product, `Expected to find product ${name}`);
    return product;
  }

  function findOrganisation(name: string) {
    const lower = name.toLowerCase();
    const organisation = organisations.find((organisation) =>
      organisation.organisationName.toLowerCase().includes(lower)
    );
    ok(organisation, `Expected to find organisation ${name}`);
    return organisation;
  }

  const shishkaberry = findProduct("Shishkaberry");
  const zourApple = findProduct("Zour Apple");
  const eve = findProduct("Eve");
  const equiposa = findProduct("Equiposa");

  const wellworks = findOrganisation("Wellworks");

  const now = Date.now();

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  async function createTestReport(
    product: Product,
    data?: Partial<ReportData>
  ) {
    const report = await addReport({
      type: "purchase",
      productId: product.productId,
      productName: product.productName,
      countryCode: product.countryCode || "NZ",
      orderedAt: new Date(now).toISOString(),
      shippedAt: new Date(now + 2 * ONE_DAY_MS).toISOString(),
      receivedAt: new Date(now + 4 * ONE_DAY_MS).toISOString(),
      productItemCost: "455",
      productDeliveryCost: "8.50",
      productTotalCost: "918.50",
      productFeeCost: "0.00",
      productItems: "2",
      productOrganisationId: wellworks.organisationId,
      productOrganisationName: wellworks.organisationName,
      productSize: product.sizes?.at(0),
      calculationConsent,
      ...data,
    });

    console.log(report);

    const metrics = await calculateReportMetrics(report);
    console.log(metrics);
  }

  await createTestReport(shishkaberry, {
    productItemCost: "455",
    productDeliveryCost: "8.50",
    productTotalCost: "918.50",
    productFeeCost: "0.00",
    productItems: "2",
  });
  await createTestReport(zourApple, {
    productItemCost: "450",
    productDeliveryCost: "0.00",
    productTotalCost: "450",
    productFeeCost: "0.00",
    productItems: "1",
  });
  await createTestReport(eve, {
    productItemCost: "205",
    productDeliveryCost: "0.00",
    productTotalCost: "205",
    productFeeCost: "0.00",
    productItems: "1",
  });
  await createTestReport(equiposa, {
    productItemCost: "205",
    productDeliveryCost: "0.00",
    productTotalCost: "205",
    productFeeCost: "0.00",
    productItems: "1",
  });

  // If this env exists, we would have tested the background processing enough by now...
  // we don't want to over run this function if not needed
  if (!process.env.TEST_PRODUCT_COUNT) {
    // Run the background processing on the reports
    await background();
  }
}
