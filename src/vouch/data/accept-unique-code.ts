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

import {getUniqueCode, getUniqueCodeStore, updateUniqueCodeState} from "./unique-code";

export interface AcceptUniqueCodeInput {
    uniqueCode: string;
    partnerId: string;
    value: number;
}

export async function acceptUniqueCode({ uniqueCode, partnerId, value }: AcceptUniqueCodeInput): Promise<boolean> {
    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "accepted",
        value
    });
    return true;
}