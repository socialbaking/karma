// export const url = "/accept-unique-code";
// export const body = {
//     uniqueCode: "ABC123"
// }
// export const options = {
//     method: "POST",
//     body
// };
// export const response = {
//     success: true
// };

export interface AcceptUniqueCodeInput {
    uniqueCode: string;
    partnerId: string;
}

export async function acceptUniqueCode({ uniqueCode, partnerId }: AcceptUniqueCodeInput): Promise<boolean> {


    return true;
}