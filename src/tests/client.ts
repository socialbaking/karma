import { start } from "../vouch/listen";
import {getHostname} from "../vouch/listen/config";
import {Client} from "../vouch";
import {Chance} from "chance"
import {v4} from "uuid";
import {ok} from "../is";

const chance = new Chance();

async function testClient() {

    const close = await start();

    const url = getHostname();
    const accessToken = v4();

    const publicClient = new Client({
        url,
        accessToken
    });

    ok(Array.isArray(await publicClient.listPartners()));

    const partnerName = chance.company();
    const location = chance.city();

    const partnerId = await publicClient.addPartner(partnerName, location, true, true);

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


        ok(!await client.verifyUniqueCode(v4(), 25));

        {

            const uniqueCode = await client.generateUniqueCode(50);

            ok(await client.getUniqueCode(uniqueCode));
            ok(await client.getPublicUniqueCode(uniqueCode));

            ok(await client.assignUniqueCode(uniqueCode, 50, partnerId));

            ok(await client.verifyUniqueCode(uniqueCode, 25));
            ok(await client.verifyUniqueCode(uniqueCode, 50));

            ok(!await client.verifyUniqueCode(uniqueCode, 50.10), "Expected verify to validate the value provided");

            ok(await client.acceptUniqueCode(uniqueCode, 25));
            ok(await client.acceptUniqueCode(uniqueCode, 25));

            ok(!await client.acceptUniqueCode(uniqueCode, 25), "Expected over usage to be not possible");

            ok(await client.processPayment(uniqueCode));

            const codes = await client.listUniqueCodes();

            const code = codes.find(code => code.uniqueCode === uniqueCode);
            ok(code);

            const logs = await client.listSystemLogs();
            // json string forces all to log
            console.log(JSON.stringify(logs, undefined, "  "));

            ok(Array.isArray(logs));
            ok(logs.length);
            const relatedToCode = logs.filter(log => log.uniqueCode === uniqueCode);
            ok(relatedToCode.length > 0);
            // 1x generate
            // 1x accept
            // 2x validate (failed accept does not log)
            // 2x accept (failed accept does not log)
            // 1x process
            ok(relatedToCode.length === 7, `Expected 7 logs, got ${relatedToCode.length}`);
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