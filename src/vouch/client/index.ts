import {Client as ClientInterface, UniqueCode, Partner, SystemLog, PublicUniqueCode, PartnerData, ClientOptions} from "./interface";
import {ok} from "../../is";

export * from "./interface";

export class Client implements ClientInterface {

    private readonly baseUrl: string | URL;
    private readonly headers: Headers;
    private readonly partnerId: string;
    private readonly version: number;
    private readonly prefix: string;

    constructor({ url, accessToken, partnerId, version, prefix }: ClientOptions = {}) {
        this.baseUrl = url ?? "https://vouch.patient.nz";
        version = version ?? 1;
        this.version = version;
        this.partnerId = partnerId;
        this.prefix = prefix ?? `/api/version/${version}`;
        const headers = this.headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");
        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }
        if (partnerId) {
            headers.set("X-Partner-ID", partnerId);
        }

        return this;
    }

    async acceptUniqueCode(uniqueCode: string, value: number) {
        const {
            partnerId,
            baseUrl,
            headers,
            prefix
        } = this;
        console.log(headers)
        const response = await fetch(
            new URL(
                `${prefix}/accept-unique-code`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify({
                    uniqueCode,
                    partnerId,
                    value
                }),
                headers
            }
        );
        ok(response.ok, "acceptUniqueCode response not ok");
        const { success } = await response.json();
        return success;
    }

    async addPartner(partner: PartnerData): Promise<Partner> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/add-partner`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify(partner),
                headers
            }
        );
        ok(response.ok, "addPartner response not ok");
        return await response.json();
    }

    async assignUniqueCode(uniqueCode: string, value: number, partnerId: string): Promise<void> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/assign-unique-code`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify({
                    uniqueCode,
                    partnerId,
                    value
                }),
                headers
            }
        );
        ok(response.ok, "assignUniqueCode response not ok");
        const { success } = await response.json();
        return success;
    }

    async generateUniqueCode(value: number): Promise<string> {
        const {
            partnerId,
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/generate-unique-code`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify({
                    partnerId,
                    value
                }),
                headers
            }
        );
        ok(response.ok, "generateUniqueCode response not ok");
        const { uniqueCode } = await response.json();
        return uniqueCode;
    }

    async getUniqueCode(uniqueCode: string): Promise<UniqueCode> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const url = new URL(
            `${prefix}/unique-code-data`,
            baseUrl
        );
        url.searchParams.set("uniqueCode", uniqueCode);
        const response = await fetch(
            url,
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "getUniqueCode response not ok");
        return response.json();
    }

    async listPartners(): Promise<Partner[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/partners`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listPartners response not ok");
        return response.json();
    }

    async listUniqueCodes(): Promise<UniqueCode[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/unique-codes`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listUniqueCodes response not ok");
        return response.json();
    }

    async processPayment(uniqueCode: string): Promise<void> {
        const {
            partnerId,
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/process-payment`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify({
                    uniqueCode,
                    partnerId
                }),
                headers
            }
        );
        ok(response.ok, "processPayment response not ok");
        const { success } = await response.json();
        return success;
    }

    async verifyUniqueCode(uniqueCode: string, value?: number): Promise<boolean> {
        const {
            partnerId,
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/verify-unique-code`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify({
                    uniqueCode,
                    partnerId,
                    value
                }),
                headers
            }
        );
        ok(response.ok, "verifyUniqueCode response not ok");
        const { success } = await response.json();
        return success;
    }

    async listSystemLogs(): Promise<SystemLog[]> {
        const {
            baseUrl,
            headers,
            prefix,
            partnerId
        } = this;
        const url = new URL(
            `${prefix}/system-logs`,
            baseUrl
        );
        if (partnerId) {
            url.searchParams.set("partnerId", partnerId);
        }
        const response = await fetch(
            url,
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listSystemLogs response not ok");
        return response.json();
    }

    async getPublicUniqueCode(uniqueCode: string): Promise<PublicUniqueCode> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const url = new URL(
            `${prefix}/unique-code-details`,
            baseUrl
        );
        url.searchParams.set("uniqueCode", uniqueCode);
        const response = await fetch(
            url,
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "getPublicUniqueCode response not ok");
        return response.json();
    }

}