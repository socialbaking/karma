import {getPartnerStore, Partner} from "./partner";

export async function retrievePartners(): Promise<Partner[]> {
    const store = getPartnerStore();
    return store.values()
}