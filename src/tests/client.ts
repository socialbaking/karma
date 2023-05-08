import { start } from "../karma/listen";
import {getOrigin} from "../karma/listen/config";
import {Client} from "../karma";
import {Chance} from "chance"
import {v4} from "uuid";
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


        {

            const logs = await client.listSystemLogs();

            ok(Array.isArray(logs));

            // TODO: Add tests here

        }


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