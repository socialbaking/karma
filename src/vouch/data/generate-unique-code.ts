// export const url = "/generate-unique-code";
// export const body = {
//     partnerId: "1234",
//     value: 50
// }
// export const options = {
//     method: "POST",
//     body
// };
// export const response = {
//     uniqueCode: "ABC123",
//     value: 50
// };
import id from "human-readable-ids";

function generateActualCode() {
    return id.hri.random();
}

export interface GenerateUniqueCodeInput {
    partnerId: string
    value: number
}

export interface GenerateUniqueCodeOutput extends GenerateUniqueCodeInput {
    uniqueCode: string
}

export async function generateUniqueCode({ partnerId, value }: GenerateUniqueCodeInput): Promise<GenerateUniqueCodeOutput> {

    const uniqueCode = generateActualCode();
    const document: GenerateUniqueCodeOutput = {
        partnerId,
        value,
        uniqueCode
    }

    return document;
}