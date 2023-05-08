export const url = "/verify-unique-code";
export const body = {
    uniqueCode: "ABC123",
    partnerId: "1234"
}
export const options = {
    method: "POST",
    body
};
export const response = {
    valid: true
};