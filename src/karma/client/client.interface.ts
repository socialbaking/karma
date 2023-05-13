// Run build again or pre-build and all the data types will be available from this import
import {
    Category,
    CategoryData,
    Partner,
    PartnerData,
    SystemLog,
    Product,
    ProductData,
    ReportData,
    Report,
    ReportMetrics,
    ReportMetricsData, CountryProductMetrics, CalculationSource,
} from "./interface.readonly";
// Client start
export interface ClientOptions {
    partnerId?: string;
    accessToken?: string;
    version?: number;
    prefix?: string;
    url?: string | URL;
}

export interface Client {
    addPartner(partner: PartnerData): Promise<Partner>;
    addCategory(category: CategoryData): Promise<Category>;
    addProduct(product: ProductData): Promise<Product>;
    addReport(report: ReportData): Promise<Report>;
    addReportMetrics(data: ReportMetricsData): Promise<ReportMetrics>;
    getProduct(productId: string): Promise<Product | undefined>;
    getReport(reportId: string): Promise<Report | undefined>
    listPartners(): Promise<Partner[]>;
    listSystemLogs(): Promise<SystemLog[]>;
    listProducts(): Promise<Product[]>;
    listReports(): Promise<Report[]>;
    listCategories(): Promise<Category[]>;
    listDailyMetrics(): Promise<CountryProductMetrics[]>;
    listMonthlyMetrics(): Promise<CountryProductMetrics[]>;
    listMetrics(): Promise<CountryProductMetrics[]>;
    listReportMetrics(): Promise<ReportMetrics[]>;
    listProductMetrics(productId: string): Promise<CountryProductMetrics[]>;
    listCalculationKeys(): Promise<string[]>
    listCalculations(): Promise<CalculationSource[]>;
    background(query: Record<string, string> | URLSearchParams): Promise<void>;
}