// export const url = "/assign-unique-code";
// export const body = {
//     partnerId: "1234",
//     uniqueCode: "ABC123",
//     value: 25
// }
// export const options = {
//     method: "POST",
//     body
// };
// export const response = {
//     success: true
// };


import {updateUniqueCodeState} from "./unique-code";

export interface AssignUniqueCodeInput {
    uniqueCode: string
    partnerId: string
    value: number
}

export async function assignUniqueCode({ uniqueCode, partnerId, value }: AssignUniqueCodeInput): Promise<boolean> {
    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "assigned",
        value
    });
    return true;
}