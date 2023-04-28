export interface AddPartnerInput {
    partnerName: string;
    location: string;
    remote?: boolean;
    onsite?: boolean;
}

export async function addPartner({ partnerName, location, remote, onsite }: AddPartnerInput): Promise<string> {

    return "1234";
}