// export const url = "/unique-code-data";
// export const query = {
//     uniqueCode: "ABC123"
// }
// export const options = {
//     method: "POST"
// };
// export const response = {
//     uniqueCode: "ABC123",
//     value: 50,
//     partnerId: "1234",
//     partnerName: "ABF Clinic",
//     location: "Auckland",
//     remote: true,
//     onsite: true
// };

export interface RetrieveCodeDataInput {
    uniqueCode: string
    partnerId: string
}

export interface RetrieveCodeDataOutput {
    uniqueCode: string
    partnerId: string
    value: number
    partnerName: string;
    location: string;
    remote?: boolean;
    onsite?: boolean;
}

export async function retrieveCodeData({ uniqueCode, partnerId }: RetrieveCodeDataInput): Promise<RetrieveCodeDataOutput> {


    return {
        uniqueCode,
        partnerId,
        partnerName: "ABF Clinic",
        value: 50,
        location: "Auckland",
        onsite: true,
        remote: true
    }

}