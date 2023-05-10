import {addReport, listPartners, listProducts} from "../karma/data";
import {ok} from "../is";
import {calculateReportMetrics} from "../karma/background";

{

    const products = await listProducts();
    const partners = await listPartners();

    function findProduct(name: string) {
        const lower = name.toLowerCase();
        const product = products.find(product => product.productName.toLowerCase().includes(lower));
        ok(product, `Expected to find product ${name}`);
        return product;
    }

    function findPartner(name: string) {
        const lower = name.toLowerCase();
        const partner = partners.find(partner => partner.partnerName.toLowerCase().includes(lower));
        ok(partner, `Expected to find partner ${name}`);
        return partner;
    }

    const shishkaberry = findProduct("Shishkaberry");
    const zourApple = findProduct("Zour Apple");
    const eve = findProduct("Eve");

    const wellworks = findPartner("Wellworks");

    const now = Date.now();

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const report = await addReport({
        productId: shishkaberry.productId,
        productName: shishkaberry.productName,
        countryCode: "NZ",
        orderedAt: new Date(now).toISOString(),
        shippedAt: new Date(now + (2 * ONE_DAY_MS)).toISOString(),
        receivedAt: new Date(now + (4 * ONE_DAY_MS)).toISOString(),
        productPurchaseItemCost: "455",
        productPurchaseDeliveryCost: "8.50",
        productPurchaseTotalCost: "918.50",
        productPurchaseFeeCost: "0.00",
        productPurchaseItems: "2",
        productPurchase: true,
        productPurchasePartnerId: wellworks.partnerId,
        productPurchasePartnerName: wellworks.partnerName,
        productSize: shishkaberry.sizes?.at(0),
    });

    console.log(report);

    const metrics = await calculateReportMetrics(report);
    console.log(metrics);


}