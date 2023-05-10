import { start } from "../karma/listen";
import {getOrigin} from "../karma/listen/config";
import {Client} from "../karma";
import {Chance} from "chance"
import {ok} from "../is";

const chance = new Chance();

async function testClient() {

    const close = await start();

    const url = getOrigin();

    const publicClient = new Client({
        url
    });

    ok(Array.isArray(await publicClient.listPartners()));

    const partnerName = chance.company();
    const location = chance.city();

    const countryCode = Math.random() > 0.5 ? "NZL" : "CAN"

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


            }

            {

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

            }

        }


        // Running any post reporting background task
        await client.background();

    }

    await close();
}

await testClient();

// I want to test with redis enabled too
// TODO
//
// {
//     if (!process.env.REDIS_URL) {
//         process.env.REDIS_MEMORY = "1";
//     }
//
//     await testClient();
//
//     process.env.REDIS_MEMORY = "";
// }