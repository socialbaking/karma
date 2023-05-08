import {v4} from "uuid";
import {createPartnerAccessToken} from "../access-token";
import {Partner, PartnerData} from "./types";
import {getPartnerStore} from "./store";

export interface AddPartnerInput extends PartnerData {

}

export async function addPartner({ partnerName, location, remote, onsite }: AddPartnerInput): Promise<Partner> {
    const store = getPartnerStore();
    const partnerId = v4();
    const partner: Partner = {
        partnerId,
        partnerName,
        location,
        onsite,
        remote,
        approved: false,
        createdAt: new Date().toISOString()
    };
    await store.set(partnerId, partner)
    const { accessToken } = await createPartnerAccessToken(partnerId);
    return {
        ...partner,
        accessToken
    };
}