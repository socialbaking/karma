import { start } from "../vouch/listen";
import {getHostname} from "../vouch/listen/config";
import {Client} from "../vouch";
import {Chance} from "chance"
import {v4} from "uuid";
import {ok} from "../is";

const chance = new Chance();

const close = await start();

const url = getHostname();
const accessToken = v4();

const publicClient = new Client({
    url,
    accessToken
});

const partnerName = chance.company();
const location = chance.city();

const partnerId = await publicClient.addPartner(partnerName, location, true, true);

{
    const client = new Client({
        url,
        partnerId,
        accessToken
    });

    console.log(client);

    {

        const uniqueCode = await client.generateUniqueCode(50);

        ok(await client.verifyUniqueCode(uniqueCode, 25));
        ok(await client.verifyUniqueCode(uniqueCode, 50));

        ok(!await client.verifyUniqueCode(uniqueCode, 50.10), "Expected verify to validate the value provided");

    }


}

await close();