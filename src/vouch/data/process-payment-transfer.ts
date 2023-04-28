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

export interface ProcessPaymentInput {
    uniqueCode: string
    partnerId?: string
}

export async function processPayment({ uniqueCode, partnerId }: ProcessPaymentInput): Promise<boolean> {

    return true;

}