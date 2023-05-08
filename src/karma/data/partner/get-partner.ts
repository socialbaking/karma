import {getPartnerStore} from "./store";

export function getPartner(partnerId: string) {
    const store = getPartnerStore();
    return store.get(partnerId);
}