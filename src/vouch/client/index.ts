import { VouchClient, UniqueCode, Partner } from "./interface";
import {ok} from "../../is";

export * from "./interface"

export interface ClientOptions {
    partnerId: string;
    apiKey: string;
    baseUrl: string
}

export class Client implements VouchClient {

    private readonly baseUrl: string;
    private readonly headers: Headers;
    private readonly partnerId: string;

    constructor({ baseUrl, apiKey, partnerId }: ClientOptions) {
        this.baseUrl = baseUrl;
        const headers = this.headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Accept", "application/json");
        headers.set("Authorization", `Bearer ${apiKey}`);
        headers.set("X-Partner-ID", partnerId);
    }

    async acceptUniqueCode(uniqueCode: string, value: number) {
        const {
            partnerId,
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/accept-unique-code",
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
        ok(response.ok);
        const { success } = await response.json();
        return success;
    }

    async addPartner(partnerName: string, location: string, remote?: boolean, onsite?: boolean): Promise<string> {
        const {
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/add-partner",
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify({
                    partnerName,
                    location,
                    remote,
                    onsite
                }),
                headers
            }
        );
        ok(response.ok);
        const { partnerId } = await response.json();
        return partnerId;
    }

    async assignUniqueCode(uniqueCode: string, value: number): Promise<void> {
        const {
            partnerId,
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/assign-unique-code",
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
        ok(response.ok);
        const { success } = await response.json();
        return success;
    }

    async generateUniqueCode(value: number): Promise<string> {
        const {
            partnerId,
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/generate-unique-code",
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
        ok(response.ok);
        const { uniqueCode } = await response.json();
        return uniqueCode;
    }

    async getUniqueCode(uniqueCode: string): Promise<UniqueCode> {
        const {
            baseUrl,
            headers
        } = this;
        const url = new URL(
            "/unique-code-data",
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
        ok(response.ok);
        return response.json();
    }

    async listPartners(): Promise<Partner[]> {
        const {
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/partners",
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok);
        return response.json();
    }

    async listUniqueCodes(): Promise<UniqueCode[]> {
        const {
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/unique-codes",
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok);
        return response.json();
    }

    async processPayment(uniqueCode: string): Promise<void> {
        const {
            partnerId,
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/process-payment",
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
        ok(response.ok);
        const { success } = await response.json();
        return success;
    }

    async verifyUniqueCode(uniqueCode: string, value?: number): Promise<boolean> {
        const {
            partnerId,
            baseUrl,
            headers
        } = this;
        const response = await fetch(
            new URL(
                "/verify-unique-code",
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
        ok(response.ok);
        const { success } = await response.json();
        return success;
    }

}