import {updateUniqueCodeState} from "./unique-code";

export interface ProcessPaymentInput {
    uniqueCode: string
    partnerId?: string
}

export async function processPayment({ uniqueCode, partnerId }: ProcessPaymentInput): Promise<boolean> {
    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "processed",
        value: 0
    });
    return true;

}