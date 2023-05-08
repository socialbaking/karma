import {Partner} from "./types";
import {getPartnerStore} from "./store";

export async function listPartners(): Promise<Partner[]> {
    const store = getPartnerStore();
    return store.values()
}