// export const url = "/process-payment";
// export const body = {
//     uniqueCode: "1234",
//     value: 50
// }
// export const options = {
//     method: "POST",
//     body
// };
// export const response = {
//     success: true
// };

import {updateUniqueCodeState} from "./unique-code";

export interface ProcessPaymentInput {
    uniqueCode: string
    partnerId?: string
}

export async function processPayment({ uniqueCode, partnerId }: ProcessPaymentInput): Promise<boolean> {
    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "processed"
    });
    return true;

}