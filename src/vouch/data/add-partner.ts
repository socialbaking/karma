import {getPartnerStore} from "./partner";
import {v4} from "uuid";

export interface AddPartnerInput {
    partnerName: string;
    location: string;
    remote?: boolean;
    onsite?: boolean;
}

export async function addPartner({ partnerName, location, remote, onsite }: AddPartnerInput): Promise<string> {
    const store = getPartnerStore();
    const partnerId = v4();
    await store.set(partnerId, {
        partnerId,
        partnerName,
        location,
        onsite,
        remote
    })
    return partnerId;
}