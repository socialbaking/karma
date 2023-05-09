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

    const { partnerId, accessToken } = await publicClient.addPartner({
        partnerName,
        location,
        onsite: true,
        remote: true,
        pharmacy: true,
        clinic: true
    });

    ok(accessToken);
    ok(Array.isArray(await publicClient.listSystemLogs()));

    {
        const client = new Client({
            url,
            partnerId,
            accessToken
        });

        console.log(client);

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
                categoryName
            })
            console.log(category);
            ok(category);
            const { categoryId } = category;


            // TODO: Add category lists tests here, make sure its in the list
            // const categories = await client.listCategories():
            // const foundCategory = categories.find(value => value.categoryId === categoryId);
            // ok(foundCategory);

        }



    }

    {

        const response = await fetch(
            new URL(
                "/api/background",
                publicClient.baseUrl
            )
        );
        ok(response.ok);
        await response.blob();

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