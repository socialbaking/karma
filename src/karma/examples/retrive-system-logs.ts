import type {SystemLogData} from "../data";

export const url = "/system-logs";
export const options = {
    method: "GET"
};
export const response: SystemLogData[] = [
    {
        timestamp: "2022-05-01T10:30:00Z",
        message: "Unique code generated",
        uniqueCode: "ABC123",
        partnerId: "1234",
    },
    {
        timestamp: "2022-05-01T11:00:00Z",
        message: "Unique code redeemed",
        uniqueCode: "ABC123",
        partnerId: "1234",
    },
]