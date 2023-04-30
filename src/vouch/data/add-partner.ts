import {getPartnerStore, Partner} from "./partner";
import {v4} from "uuid";
import {createPartnerAccessToken} from "./access-token";

export interface AddPartnerInput {
    partnerName: string;
    location: string;
    remote?: boolean;
    onsite?: boolean;
}

export async function addPartner({ partnerName, location, remote, onsite }: AddPartnerInput): Promise<Partner> {
    const store = getPartnerStore();
    const partnerId = v4();
    const partner: Partner = {
        partnerId,
        partnerName,
        location,
        onsite,
        remote
    };
    await store.set(partnerId, partner)
    const { accessToken } = await createPartnerAccessToken(partnerId);
    return {
        ...partner,
        accessToken
    };
}