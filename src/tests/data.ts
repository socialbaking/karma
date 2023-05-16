import {addReport, listOrganisations, listPartners, listProducts, seed, stopData} from "../karma/data";
import {ok} from "../is";
import {background, calculateReportMetrics} from "../karma/background";
import {getCompleteCalculationConsent, Product, ReportData} from "../karma";

// Default full consent for calculations
const calculationConsent = getCompleteCalculationConsent();


{

    const products = await listProducts();
    const organisations = await listOrganisations();

    function findProduct(name: string) {
        const lower = name.toLowerCase();
        const product = products.find(product => product.productName.toLowerCase().includes(lower));
        ok(product, `Expected to find product ${name}`);
        return product;
    }

    function findOrganisation(name: string) {
        const lower = name.toLowerCase();
        const organisation = organisations.find(organisation => organisation.organisationName.toLowerCase().includes(lower));
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

    async function createTestReport(product: Product, data?: Partial<ReportData>) {
        const report = await addReport({
            productId: product.productId,
            productName: product.productName,
            countryCode: product.countryCode || "NZ",
            orderedAt: new Date(now).toISOString(),
            shippedAt: new Date(now + (2 * ONE_DAY_MS)).toISOString(),
            receivedAt: new Date(now + (4 * ONE_DAY_MS)).toISOString(),
            productPurchaseItemCost: "455",
            productPurchaseDeliveryCost: "8.50",
            productPurchaseTotalCost: "918.50",
            productPurchaseFeeCost: "0.00",
            productPurchaseItems: "2",
            productPurchase: true,
            productPurchaseOrganisationId: wellworks.organisationId,
            productPurchaseOrganisationName: wellworks.organisationName,
            productSize: product.sizes?.at(0),
            calculationConsent,
            ...data,
        });

        console.log(report);

        const metrics = await calculateReportMetrics(report);
        console.log(metrics);
    }

    await createTestReport(shishkaberry, {
        productPurchaseItemCost: "455",
        productPurchaseDeliveryCost: "8.50",
        productPurchaseTotalCost: "918.50",
        productPurchaseFeeCost: "0.00",
        productPurchaseItems: "2",
    });
    await createTestReport(zourApple, {
        productPurchaseItemCost: "450",
        productPurchaseDeliveryCost: "0.00",
        productPurchaseTotalCost: "450",
        productPurchaseFeeCost: "0.00",
        productPurchaseItems: "1",
    });
    await createTestReport(eve, {
        productPurchaseItemCost: "205",
        productPurchaseDeliveryCost: "0.00",
        productPurchaseTotalCost: "205",
        productPurchaseFeeCost: "0.00",
        productPurchaseItems: "1",
    });
    await createTestReport(equiposa, {
        productPurchaseItemCost: "205",
        productPurchaseDeliveryCost: "0.00",
        productPurchaseTotalCost: "205",
        productPurchaseFeeCost: "0.00",
        productPurchaseItems: "1",
    });


    // If this env exists, we would have tested the background processing enough by now...
    // we don't want to over run this function if not needed
    if (!process.env.TEST_PRODUCT_COUNT) {
        // Run the background processing on the reports
        await background();
    }

}