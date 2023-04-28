export const url = "/system-logs";
export const options = {
    method: "GET"
};
export const response = [
    {
        timestamp: "2022-05-01T10:30:00Z",
        message: "Unique code generated",
        code: "ABC123"
    },
    {
        timestamp: "2022-05-01T11:00:00Z",
        message: "Unique code redeemed",
        code: "ABC123",
        partnerId: "1234"
    },
]