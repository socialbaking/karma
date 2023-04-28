export interface RetrieveCodePublicDetailsInput {
    uniqueCode: string
}

export interface RetrieveCodePublicDetailsOutput {
    uniqueCode: string
    partnerId: string
    value: number
    partnerName: string;
}

export async function retrieveCodePublicDetails({ uniqueCode }: RetrieveCodePublicDetailsInput): Promise<RetrieveCodePublicDetailsOutput> {


    return {
        uniqueCode,
        partnerId: "1234",
        partnerName: "ABF Clinic",
        value: 50
    }

}