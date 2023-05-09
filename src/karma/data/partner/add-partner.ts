import {v4} from "uuid";
import {createPartnerAccessToken} from "../access-token";
import {Partner, PartnerData} from "./types";
import {getPartnerStore} from "./store";

export interface AddPartnerInput extends PartnerData {

}

export async function addPartner(data: AddPartnerInput): Promise<Partner> {
    const store = getPartnerStore();
    const partnerId = v4();
    const createdAt = new Date().toISOString();
    const partner: Partner = {
        ...data,
        partnerId,
        approved: false,
        approvedAt: undefined,
        approvedByUserId: undefined,
        createdAt,
        updatedAt: createdAt
    };
    await store.set(partnerId, partner)
    const { accessToken } = await createPartnerAccessToken(partnerId);
    return {
        ...partner,
        accessToken
    };
}