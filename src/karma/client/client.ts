import {
    Category,
    CategoryData,
    Partner,
    PartnerData,
    SystemLog,
    Product,
    ProductData,
    ReportData,
    Report, MetricsData, ReportMetrics, ReportMetricsData,
} from "./interface.readonly";
import {
    Client as ClientInterface,
    ClientOptions
} from "./client.interface"
import {ok} from "../../is";
import {CountryProductMetrics} from "../data";

export * from "./client.interface";

export class Client implements ClientInterface {

    readonly baseUrl: string | URL;
    readonly headers: Headers;
    readonly partnerId: string | undefined;
    readonly version: number;
    readonly prefix: string;

    constructor({ url, accessToken, partnerId, version, prefix }: ClientOptions = {}) {
        this.baseUrl = url ?? "https://karma.patient.nz";
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

    async addPartner(partner: PartnerData): Promise<Partner> {
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
                method: "POST",
                body: JSON.stringify(partner),
                headers
            }
        );
        ok(response.ok, "addPartner response not ok");
        return await response.json();
    }


    async addCategory(category: CategoryData): Promise<Category> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/categories`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify(category),
                headers
            }
        );
        ok(response.ok, "addCategory response not ok");
        return await response.json();
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

    async addProduct(product: ProductData): Promise<Product> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/products`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify(product),
                headers
            }
        );
        ok(response.ok, "addProduct response not ok");
        return await response.json();
    }

    async addReport(report: ReportData): Promise<Report> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/reports`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify(report),
                headers
            }
        );
        ok(response.ok, "addReport response not ok");
        return await response.json();
    }

    async background(query?: Record<string, string> | URLSearchParams): Promise<void> {
        const {
            baseUrl,
            headers
        } = this;
        const url = new URL(
            "/api/background",
            baseUrl
        );
        url.search = new URLSearchParams(query).toString();
        const response = await fetch(
            url,
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "background response not ok");
        await response.blob();
    }

    async listCategories(): Promise<Category[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/categories`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listCategories response not ok");
        return response.json();
    }

    async listProducts(): Promise<Product[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/products`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listProducts response not ok");
        return response.json();
    }

    async listReports(): Promise<Report[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/reports`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listReports response not ok");
        return response.json();
    }

    async getProduct(productId: string): Promise<Product | undefined> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/products/${productId}`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        if (response.status === 404) return undefined;
        ok(response.ok, "getProduct response not ok");
        return response.json();
    }

    async getReport(reportId: string): Promise<Report | undefined> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/reports/${reportId}`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        if (response.status === 404) return undefined;
        ok(response.ok, "getReport response not ok");
        return response.json();
    }

    async addReportMetrics(data: ReportMetricsData): Promise<ReportMetrics> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/metrics/reports`,
                baseUrl
            ),
            {
                method: "POST",
                body: JSON.stringify(data),
                headers
            }
        );
        ok(response.ok, "addReportMetrics response not ok");
        return await response.json();
    }

    async listDailyMetrics(): Promise<CountryProductMetrics[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/metrics/days`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listDailyMetrics response not ok");
        return response.json();
    }

    async listMetrics(): Promise<CountryProductMetrics[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/metrics`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listMetrics response not ok");
        return response.json();
    }

    async listMonthlyMetrics(): Promise<CountryProductMetrics[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/metrics/months`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listMonthlyMetrics response not ok");
        return response.json();
    }

    async listReportMetrics(): Promise<ReportMetrics[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/metrics/reports`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listReportMetrics response not ok");
        return response.json();
    }

    async listProductMetrics(productId: string): Promise<CountryProductMetrics[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/metrics/products/${productId}`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listProductMetrics response not ok");
        return response.json();
    }

    async listCalculationKeys(): Promise<string[]> {
        const {
            baseUrl,
            headers,
            prefix
        } = this;
        const response = await fetch(
            new URL(
                `${prefix}/calculations/keys`,
                baseUrl
            ),
            {
                method: "GET",
                headers
            }
        );
        ok(response.ok, "listCalculationKeys response not ok");
        return response.json();
    }


}