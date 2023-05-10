# Pharmakarma - Node & JavaScript implementation


[//]: # (badges)

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D18.7.0-blue) 

### Test Coverage

 ![94.73%25 lines covered](https://img.shields.io/badge/lines-94.73%25-brightgreen) ![94.73%25 statements covered](https://img.shields.io/badge/statements-94.73%25-brightgreen) ![88.26%25 functions covered](https://img.shields.io/badge/functions-88.26%25-brightgreen) ![87.08%25 branches covered](https://img.shields.io/badge/branches-87.08%25-brightgreen)

[//]: # (badges)

### Client's TypeScript Interface

[//]: # (typescript client)

```typescript
Category,
    CategoryData,
    Partner,
    PartnerData,
    SystemLog,
    Product,
    ProductData,
    ReportData,
    Report,
} from "./interface.readonly";

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
    getProduct(productId: string): Promise<Product | undefined>;
    getReport(reportId: string): Promise<Report | undefined>
    listPartners(): Promise<Partner[]>;
    listSystemLogs(): Promise<SystemLog[]>;
    listProducts(): Promise<Product[]>;
    listReports(): Promise<Report[]>;
    listCategories(): Promise<Category[]>;
    background(query: Record<string, string> | URLSearchParams): Promise<void>;
}

export interface CategoryData extends Record<string, unknown> {
    categoryName: string;
    countryCode?: string;
}

export interface Category extends CategoryData {
    categoryId: string;
    createdAt: string;
    updatedAt: string;
}

export interface PartnerData extends Record<string, unknown> {
    partnerName: string;
    countryCode?: string; // "NZ"
    location?: string;
    remote?: boolean;
    onsite?: boolean;
    pharmacy?: boolean;
    delivery?: boolean;
    clinic?: boolean;
    website?: string;
}

export interface Partner extends PartnerData {
    partnerId: string;
    accessToken?: string;
    createdAt: string;
    updatedAt: string;
    approved?: boolean;
    approvedAt?: string;
    approvedByUserId?: string;
}

export interface ProductSizeData extends Record<string, unknown> {
    value: string;
    unit: string;
}

export interface ProductData extends Record<string, unknown> {
    productName: string;
    countryCode?: string;
    licencedPartnerId?: string;
    // Flag for products we don't have the exact licence date for
    licenceApprovedBeforeGivenDate?: boolean;
    licenceApprovedAt?: string;
    licenceExpiredAt?: string;
    // ISO 3166-1 alpha-3 country code
    licenceCountryCode?: string;
    // Flag for products we don't have the exact availability date for
    availableBeforeGivenDate?: boolean;
    availableAt?: string;
    // For products that we will no longer have available
    availableUntil?: string;
    sizes?: ProductSizeData[];
    // Direct text about the active ingredients, not specific values
    activeIngredientDescriptions?: string[];
    categoryId?: string;
}

export interface ProductActiveIngredient {
    type: string;
    unit: string;
    value: string;
    prefix?: string;
    calculated?: boolean;
    calculatedUnit?: string;
    size?: ProductSizeData;
}

export interface Product extends ProductData {
    productId: string;
    createdAt: string;
    updatedAt: string;
    activeIngredients?: ProductActiveIngredient[];
}

export interface ReportDateData {
    orderedAt?: string;
    shippedAt?: string;
    receivedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    reportedAt?: string;
}

export interface ReportData extends ReportDateData, Record<string, unknown> {
    countryCode: string; // "NZ"
    note?: string;
    parentReportId?: string;
    productId?: string;
    productName?: string; // Actual productName, not free text
    productText?: string; // User free text of the product
    productPurchase?: boolean;
    productPurchaseTotalCost?: string; // "908.50", capture the user input raw
    productPurchaseItems?: string; // "2", capture the user input raw
    productPurchaseItemCost?: string; // "450", capture the user input raw
    productPurchaseDeliveryCost?: string; // "8.50", capture the user input raw
    productPurchaseFeeCost?: string; // "3.50", capture the user input raw
    productPurchasePartnerId?: string;
    productPurchasePartnerName?: string; // Actual partnerName, not free text
    productPurchasePartnerText?: string; // User free text of the partnerName
    productSize?: ProductSizeData;
    createdByUserId?: string;
    anonymous?: boolean;
}

export interface Report extends ReportData {
    reportId: string;
    createdAt: string;
    updatedAt: string;
    reportedAt: string;
}

export interface SystemLogData extends Record<string, unknown> {
    uniqueCode?: string;
    value?: number;
    partnerId: string;
    message: string;
    timestamp?: string;
    action?: string;
}

export interface SystemLog extends SystemLogData {
    systemLogId: string;
    timestamp: string;
}
```

[//]: # (typescript client)

