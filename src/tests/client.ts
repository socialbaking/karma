import { start } from "../karma/listen";
import {getOrigin} from "../karma/listen/config";
import {Client, getCompleteCalculationConsent} from "../karma";
import {Chance} from "chance"
import {ok} from "../is";
import {
    getDailyMetricsStore,
    getReportMetricsStore,
    getMonthlyMetricsStore,
    getReportStore,
    getProductStore,
    getBackgroundStore, getReportQueueStore
} from "../karma/data";
import {KeyValueStore} from "../karma/data/types";
import {isRedis} from "../karma/data/redis-client";


// Default full consent for calculations
const calculationConsent = getCompleteCalculationConsent();

const {
    TEST_PRODUCT_COUNT,
    TEST_REPORT_PER_PRODUCT_COUNT,
    TEST_REPORT_PROCESSING_TIMEOUT_MS
} = process.env;

// Should be inline with vercel max function time
// Hobby is 10 seconds
// Pro is 60 seconds
// Enterprise is 900 seconds
const MAX_REPORT_PROCESSING_MS = TEST_REPORT_PROCESSING_TIMEOUT_MS ? +TEST_REPORT_PROCESSING_TIMEOUT_MS : 60 * 1000;

// if (TEST_PRODUCT_COUNT || TEST_REPORT_PER_PRODUCT_COUNT) {
    // await clear(
    //     getDailyMetricsStore(),
    //     getReportMetricsStore(),
    //     getMonthlyMetricsStore(),
    //     getReportStore(),
    //     getReportQueueStore(),
    //     getProductStore(),
    //     getBackgroundStore()
    // );
// }

const chance = new Chance();

await testClient();

async function testClient() {

    const close = await start();

    const url = getOrigin();

    const publicClient = new Client({
        url
    });

    ok(Array.isArray(await publicClient.listPartners()));
    const calculationKeys = await publicClient.listCalculationKeys();
    ok(Array.isArray(calculationKeys));
    ok(calculationKeys.length);

    const partnerName = chance.company();
    const location = chance.city();

    const countryCode = Math.random() > 0.5 ? "NZ" : "CA"

    const { partnerId, accessToken } = await publicClient.addPartner({
        partnerName,
        location,
        countryCode,
        onsite: true,
        remote: true,
        pharmacy: true,
        clinic: true
    });

    ok(accessToken);

    {
        const client = new Client({
            url,
            partnerId,
            accessToken
        });

        console.log(client);

        // Seed 1 will re-run any seeding that can be done in the background task
        // This should be fine to run over and over with no worries
        await client.background({
            seed: "1"
        });

        // Running background tasks with no seeding, will just run anything in the queue
        await client.background();

        ok(Array.isArray(await client.listSystemLogs()));

        const partners = await client.listPartners();
        const partner = partners.find(partner => partner.partnerId === partnerId);
        ok(partner);

        // There should be seeded partners available
        ok(partners.length > 1);
        const clinics = partners.filter(partner => partner.clinic);
        const pharmacies = partners.filter(partner => partner.pharmacy);
        const onlyPharmacies = partners.filter(partner => partner.pharmacy && !partner.clinic);
        const otherPartners = partners.filter(partner => !(partner.clinic || partner.pharmacy));

        console.log({
            clinics,
            pharmacies,
            onlyPharmacies,
            otherPartners
        })

        ok(clinics.length);
        ok(pharmacies.length);
        ok(onlyPharmacies.length);
        ok(otherPartners.length);



        {

            const logs = await client.listSystemLogs();

            ok(Array.isArray(logs));


            const categoryName = chance.animal();
            const category = await client.addCategory({
                categoryName,
                countryCode
            })
            console.log(category);
            ok(category);
            const { categoryId, createdAt } = category;

            const categories = await client.listCategories();
            const foundCategory = categories.find(value => value.categoryId === categoryId);
            ok(foundCategory);

            const licencedPartner = await client.addPartner({
                countryCode,
                partnerName: chance.company()
            });
            const clinicPartner = await client.addPartner({
                countryCode,
                partnerName: chance.company(),
                clinic: true
            });
            const pharmacyPartner = await client.addPartner({
                countryCode,
                partnerName: chance.company(),
                pharmacy: true
            });

            let products;

            {

                // Simple product

                const productName = chance.animal();

                const product = await client.addProduct({
                    productName,
                    countryCode,
                    categoryId
                });

                ok(product);
                ok(product.productName === productName);
                ok(product.categoryId === categoryId);
                ok(product.createdAt);
                ok(product.updatedAt);

                ok(!product.activeIngredientDescriptions?.length);
                ok(!product.activeIngredients?.length);

                products = await client.listProducts();
                let foundProduct = products.find(value => value.productId === product.productId);
                ok(foundProduct);
                foundProduct = await client.getProduct(product.productId);
                ok(foundProduct);


            }


            const additionalProductCount = (isRedis() && TEST_PRODUCT_COUNT) ? +TEST_PRODUCT_COUNT : 1;
            const reportCountPerProduct = (isRedis() && TEST_REPORT_PER_PRODUCT_COUNT) ? +TEST_REPORT_PER_PRODUCT_COUNT : 1;

            const reportsStartedAt = Date.now();

            console.log({
                additionalProductCount,
                reportCountPerProduct
            })

            for (let productIndex = 0; productIndex <= additionalProductCount; productIndex += 1) {

                // Complex product

                const productName = chance.animal();
                const typeA = chance.string({
                    alpha: true,
                    casing: "upper",
                    length: 3
                })
                const typeANumber = chance.floating({
                    min: 0.1,
                    max: 34,
                });
                const typeB = chance.string({
                    alpha: true,
                    casing: "upper",
                    length: 3
                })
                const typeBPercentageNumber = chance.floating({
                    min: 0.1,
                    max: 34,
                });
                const size = chance.integer({
                    min: 1,
                    max: 150
                });
                const typeBNumber = Math.round(size * typeBPercentageNumber) / 100
                const sizeUnit = chance.string({
                    alpha: true,
                    casing: "lower",
                    length: 2
                })
                const measurementUnit = chance.string({
                    alpha: true,
                    casing: "lower",
                    length: 2
                })
                const product = await client.addProduct({
                    productName,
                    countryCode,
                    categoryId,
                    licencedPartnerId: licencedPartner.partnerId,
                    licenceCountryCode: licencedPartner.countryCode,
                    licenceApprovedAt: createdAt,
                    availableAt: createdAt,
                    sizes: [
                        {
                            value: size.toString(),
                            unit: sizeUnit
                        },
                        {
                            // Alpha sizes can be provided with alternative
                            // unit descriptions
                            //
                            // These will not be used in activeIngredient calculations
                            value: chance.string({ alpha: true }),
                            unit: chance.string({ alpha: true })
                        }
                    ],
                    activeIngredientDescriptions: [
                        `Total ${typeA} ${typeANumber}%`,
                        `Total ${typeB} (${typeB}+${typeB}Z) ${typeBPercentageNumber}% (${typeBNumber} ${measurementUnit}/${sizeUnit})`
                    ]
                });

                console.log(product);
                ok(product);
                ok(product.productName === productName);

                // 2 percentage, 1 type b unit/unit, 3 units
                ok(product.activeIngredients.length >= 5);
                ok(product.sizes);
                ok(product.sizes.length === 2);

                const calculated = product.activeIngredients.filter(value => value.calculated);
                // 2 percentage units, 1 multiple unit
                ok(calculated.length >= 3);

                const typeACalculated = calculated.filter(value => value.type === typeA);
                ok(typeACalculated.length >= 1);

                const typeBCalculated = calculated.filter(value => value.type === typeB);
                ok(typeBCalculated.length >= 2);


                for (let reportIndex = 0; reportIndex <= reportCountPerProduct; reportIndex += 1) {
                    const { productId, productName } = product;

                    const now = Date.now();

                    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

                    const itemCost = chance.natural({ min: 100, max: 700 });
                    const deliveryCost = chance.natural({ min: 0, max: 25 });
                    // I have personally ordered 16 of one product before,
                    // 24 was the next bundle size I was looking to get
                    // Specifically we will see high item counts for cancer patients
                    const items = chance.integer({ min: 1, max: 25 });
                    // There are sometimes fees charged to actually purchase the product sometimes
                    // Could be say buy now pay later fees
                    const feeCost = chance.natural({ min: 0, max: 30 });

                    // Total cost of just the product excluding the prescription fee
                    const totalCost = (
                        (items * itemCost) +
                        deliveryCost +
                        feeCost
                    );

                    // There are sometimes fees charged to prescribe the product by a medical professional
                    const prescriptionFeeCost = chance.natural({ min: 0, max: 100 });

                    const report = await client.addReport({
                        productId: productId,
                        productName,
                        countryCode,
                        orderedAt: new Date(now).toISOString(),
                        shippedAt: new Date(now + (2 * ONE_DAY_MS)).toISOString(),
                        receivedAt: new Date(now + (4 * ONE_DAY_MS)).toISOString(),
                        productPurchaseItemCost: itemCost.toFixed(2),
                        productPurchaseDeliveryCost: deliveryCost.toFixed(2),
                        productPurchaseTotalCost: totalCost.toFixed(2),
                        productPurchaseFeeCost: feeCost.toFixed(2),
                        productPurchaseItems: items.toString(),
                        productPurchase: true,
                        productPurchasePartnerId: pharmacyPartner.partnerId,
                        productPurchasePartnerName: pharmacyPartner.partnerName,
                        productPrescription: true,
                        productPrescriptionAt: new Date(now).toISOString(),
                        productPrescriptionPartnerName: clinicPartner.partnerName,
                        productPrescriptionPartnerId: clinicPartner.partnerId,
                        productPrescriptionFeeCost: prescriptionFeeCost.toFixed(2),
                        productSize: product.sizes.at(0),
                        calculationConsent
                    });

                    ok(report);
                    ok(report.productId === productId);

                    let foundReport = await client.getReport(report.reportId);
                    ok(foundReport);

                    if (reportIndex <= 1 && productIndex <= 1) {
                        const reports = await client.listReports();
                        foundReport = reports.find(value => value.reportId === report.reportId);
                        ok(foundReport);
                    }

                }

            }

            const reportsSubmittedAt = Date.now();

            // Trigger background tasks, after all reports submitted :)
            await client.background();

            const reportsProcessedAt = Date.now();

            const reportsBackgroundTotalProcessing = reportsProcessedAt - reportsSubmittedAt;

            console.log({
                additionalProductCount,
                reportCountPerProduct,
                reportsStartedAt: new Date(reportsStartedAt),
                reportsSubmittedAt: new Date(reportsSubmittedAt),
                reportsProcessedAt: new Date(reportsProcessedAt),
                reportsBackgroundTotalProcessing
            });

            if (reportsBackgroundTotalProcessing > MAX_REPORT_PROCESSING_MS) {
                console.warn(`Processing reports took longer than ${MAX_REPORT_PROCESSING_MS}ms`)
            }

            // Only fail if its 1.5x as much time, we can see the earlier log
            const allowedFactor = 1.5
            ok(reportsBackgroundTotalProcessing < (MAX_REPORT_PROCESSING_MS * allowedFactor), `Processing reports took longer than ${MAX_REPORT_PROCESSING_MS * allowedFactor}ms`);



        }


        {
            // Ensure we can still completely list all the values available
            // This will also show us the times for how long each of these take with the count we have
            const reports = await client.listReports();
            const products = await client.listProducts();
            const partners = await client.listPartners();
            const categories = await client.listCategories();
            const systemLogs = await client.listSystemLogs();

            console.log({
                reports: reports.length,
                products: products.length,
                partners: partners.length,
                categories: categories.length,
                systemLogs: systemLogs.length
            });
        }
    }

    await close();
}

// {
//     if (!process.env.REDIS_URL) {
//         process.env.REDIS_MEMORY = "1";
//     }
//
//     await testClient();
//
//     process.env.REDIS_MEMORY = "";
// }


async function clear(...stores: KeyValueStore<unknown>[]) {
    await Promise.all(
        stores.map(store => store.clear())
    );
}