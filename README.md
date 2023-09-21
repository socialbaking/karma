# Karma - Node & JavaScript implementation

[//]: # "badges"

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D18.7.0-blue) 

### Test Coverage

 ![59.91%25 lines covered](https://img.shields.io/badge/lines-59.91%25-yellow) ![59.91%25 statements covered](https://img.shields.io/badge/statements-59.91%25-yellow) ![47.37%25 functions covered](https://img.shields.io/badge/functions-47.37%25-yellow) ![83.38%25 branches covered](https://img.shields.io/badge/branches-83.38%25-brightgreen)

[//]: # "badges"

### Client's TypeScript Interface

[//]: # "typescript client"

```typescript
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
  getReport(reportId: string): Promise<Report | undefined>;
  listPartners(): Promise<Partner[]>;
  listOrganisations(): Promise<Organisation[]>;
  listSystemLogs(): Promise<SystemLog[]>;
  listProducts(): Promise<Product[]>;
  listReports(): Promise<Report[]>;
  listCategories(): Promise<Category[]>;
  listDailyMetrics(): Promise<CountryProductMetrics[]>;
  listMonthlyMetrics(): Promise<CountryProductMetrics[]>;
  listMetrics(): Promise<CountryProductMetrics[]>;
  listReportMetrics(): Promise<ReportMetrics[]>;
  listProductMetrics(productId: string): Promise<CountryProductMetrics[]>;
  listCalculationKeys(): Promise<string[]>;
  listCalculations(): Promise<CalculationSource[]>;
  background(query: Record<string, string> | URLSearchParams): Promise<void>;
}

export type KarmaAuthenticationRole =
  | "moderator"
  | "admin"
  | "owner"
  | "patient"
  | "industry"
  | "member"
  | "pharmacy"
  | "clinic"
  | "booster"
  | "developer"
  | "coordinator"
  | "partner";

declare global {
    interface AuthenticationRoles extends Record<KarmaAuthenticationRole, KarmaAuthenticationRole> {
    }
}

// Used by client
type AuthenticationRole =
    | KarmaAuthenticationRole
    | keyof AuthenticationRoles;

export interface CalculationSource {
  calculationKey: string;
  title: string;
  description: string;
  anonymous: boolean;
}

export interface CategoryData extends Record<string, unknown> {
  categoryName: string;
  defaultUnit?: string;
  defaultSizes?: ProductSizeData[];
  countryCode?: string;
  order?: number;
  associatedTerms?: string[];
}

export interface Category extends CategoryData {
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expiring {
  expiresAt?: string;
}

export type BaseFileStoreType = "product" | "inventory" | "productFile" | "inventoryFile"
export type BaseFileRemoteSourceName = "discord" | BaseFileStoreType;
export type RemoteFileSourceName = BaseFileRemoteSourceName | `${BaseFileRemoteSourceName}_${number}`;

export type FileUploadedSynced = "r2" | "disk";
export type FileType = BaseFileStoreType | `${RemoteFileSourceName}_import`;

export interface ResolvedFilePart extends Record<string, unknown> {

}

export interface FileImageSize extends Expiring {
    width: number;
    height: number;
    signed?: boolean;
    fileName?: string;
    checksum?: Record<string, string>
}

export interface FileSize extends FileImageSize {
    url: string;
    synced: FileUploadedSynced;
    syncedAt: string;
    version: number;
    watermark?: boolean;
    copyright?: string;
    license?: string;
    fileName?: string;
    signed?: boolean;
}

export interface FileErrorDescription {
    stack?: string;
    message: string;
    createdAt: string;
    repeated?: number;
}

export interface FileData extends Record<string, unknown>, Partial<FileImageSize> {
    fileName: string;
    contentType: string;
    size?: number;
    path?: string;
    url?: string;
    pinned?: boolean;
    uploadedAt?: string;
    uploadedByUsername?: string;
    source?: RemoteFileSourceName;
    sourceId?: string;
    synced?: FileUploadedSynced;
    syncedAt?: string;
    version?: number;
    type?: FileType | string;
    sizes?: FileSize[];
    /** @deprecated use remoteUrl */
    externalUrl?: string;
    remoteUrl?: string;
    reactionCounts?: Record<string, number>;
    reactionCountsUpdatedAt?: string;
    resolved?: ResolvedFilePart[];
    resolvedAt?: string;
    errors?: FileErrorDescription[];
}

export interface File extends FileData {
    fileId: string;
    createdAt: string;
    updatedAt: string;
    uploadedAt: string;
}

export interface ResolvedFile extends File {
    url: string;
    synced: FileUploadedSynced;
}

import {
  CalculationConsent,
  CalculationConsentItem,
  ReportDateData,
  ReportRoleData,
} from "../report";



export interface ActiveIngredientMetrics extends Record<string, unknown> {
  type: string;
  unit: string;
  value: string;
  // If the calculation of cost takes into account the
  // proportion of this vs total active ingredients
  proportional?: boolean;
  mean?: boolean;
  size?: ProductSizeData;
  prefix?: string;
  calculation?: "minimum" | "maximum" | "mean" | string;
}

export interface ProductMetricData extends Record<string, unknown> {
  productId: string;
  activeIngredients: ActiveIngredientMetrics[];
}

export interface MetricsData
  extends ReportDateData,
    Expiring,
    CalculationConsent {
  products: ProductMetricData[];
  countryCode: string;
  currencySymbol?: string; // "$"
  timezone?: string; // Pacific/Auckland
  anonymous?: boolean;
}

export interface ReportMetricsData extends MetricsData {
  parentReportId?: string;
  type?: string;
}

export interface ReportMetrics
  extends ReportMetricsData,
    ReportRoleData,
    Record<string, unknown> {
  type?: string;
  metricsId: string;
  reportId: string;
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
  // consent required to be stored
  calculationConsent: CalculationConsentItem[];
}

export type CountryProductMetricDuration = "day" | "month";

export interface CountryProductMetrics extends MetricsData {
  metricsId: string;
  createdAt: string;
  updatedAt: string;
  currencySymbol: string; // "$"
  timezone: string;
  duration: CountryProductMetricDuration;
  reportingDateKey: keyof ReportDateData;
}

export {
    Offer,
    OfferData,
    OfferItem,
    OfferItemType,
    OfferPrice,
    OfferStatus,
    InventoryOffer,
    OrderOfferItem,
    ProductOfferItem,
} from "@opennetwork/logistics";

export interface OrganisationBaseData extends Record<string, unknown> {
  countryCode?: string; // "NZ"
  location?: string;
  remote?: boolean;
  onsite?: boolean;
  pharmacy?: boolean;
  delivery?: boolean;
  clinic?: boolean;
  website?: string;
  associatedBrandingTerms?: string[]; // Eg common names used to refer to the organisation by way of brand
}

export interface OrganisationData extends OrganisationBaseData {
  organisationName: string;
  partnerId?: string;
  approved?: boolean;
  approvedAt?: string;
}

export interface Organisation extends OrganisationData {
  organisationId: string;
  createdAt: string;
  updatedAt: string;
  approvedByUserId?: string;
}

export interface PartnerData extends Record<string, unknown> {
  partnerName: string;
  countryCode?: string;
}

export interface AddPartnerData extends PartnerData, OrganisationBaseData {}

export interface Partner extends PartnerData {
  partnerId: string;
  organisationId: string;
  accessToken?: string;
  createdAt: string;
  updatedAt: string;
  approved?: boolean;
  approvedAt?: string;
  approvedByUserId?: string;
}

export interface Temperature {
  value: string;
  unit: string;
}

export interface IngredientInfo {
  name: string;
  active?: boolean;
  boil?: Temperature;
}

export interface ProductSizeData extends Record<string, unknown> {
  value: string;
  unit: string;
}

export interface ProductInfo {
  title?: string;
  text: string;
  url?: string;
  description?: string;
}

export interface ProductFile extends Partial<FileData> {
  fileId: string;
}

export interface ProductData extends Record<string, unknown> {
  productName: string;
  order?: number;
  countryCode?: string;
  organisationId?: string;
  licencedOrganisationId?: string;
  // Flag for products we don't have the exact licence date for
  licenceApprovedBeforeGivenDate?: boolean;
  licenceApprovedAt?: string;
  licenceExpiredAt?: string;
  licenceApprovalWebsite?: string;
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
  generic?: boolean;
  public?: boolean;
  branded?: boolean;
  genericSearchTerm?: string;
  genericCategoryNames?: string[];
  genericAcronym?: string;
  info?: ProductInfo[];
  files?: ProductFile[];
  obsoleteAt?: string;
  ingredients?: IngredientInfo[];
}

export interface ProductActiveIngredient {
  type: string;
  unit: string;
  value: string;
  prefix?: string;
  calculated?: boolean;
  calculatedUnit?: string;
  size?: ProductSizeData;
  proportional?: boolean;
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
  updatedAt?: string;
  createdAt?: string;
  reportedAt?: string;
}

export interface CalculationConsentItem extends Record<string, unknown> {
  calculationKey: string;
  consented?: boolean;
  consentedAt?: string;
}

export interface CalculationConsent {
  calculationConsent?: CalculationConsentItem[];
}

export interface ReportRoleData {
  roles: AuthenticationRole[];
}

export type ReportType = "purchase" | "product" | "poll";

export interface DeprecatedReportData {
  // TODO No longer used fields, but keeping around until v1.0.0
  productPurchase?: boolean;
  productPurchaseTotalCost?: string | number; // "908.50", capture the user input raw
  productPurchaseItems?: string | number; // "2", capture the user input raw
  productPurchaseItemCost?: string | number; // "450", capture the user input raw
  productPurchaseDeliveryCost?: string | number; // "8.50", capture the user input raw
  productPurchaseFeeCost?: string | number; // "3.50", capture the user input raw
  productPurchaseOrganisationId?: string;
  productPurchaseOrganisationName?: string; // Actual organisationName, not free text
  productPurchaseOrganisationText?: string; // User free text of the organisationName
}

type StringNumber = `${number}` | number | string;

export interface ProductReportData extends DeprecatedReportData {
  productId?: string;
  productName?: string; // Actual productName, not free text
  productText?: string; // User free text of the product
  productSize?: ProductSizeData;
  productTotalCost: StringNumber; // "908.50", capture the user input raw
  productItems: StringNumber; // "2", capture the user input raw
  productItemCost: StringNumber; // "450", capture the user input raw
  productDeliveryCost?: StringNumber; // "8.50", capture the user input raw
  productFeeCost?: StringNumber; // "3.50", capture the user input raw
  productOrganisationId?: string;
  productOrganisationName?: string; // Actual organisationName, not free text
  productOrganisationText?: string; // User free text of the organisationName
}

export interface PollReportOptionData extends Partial<ActiveIngredientMetrics> {
  title: string;
  votes: `${number}` | string;
}

export interface PollReportData {
  title: string;
  url?: string;
  options: PollReportOptionData[];
}

export type PartialReportData = Partial<PollReportData> & Partial<ProductReportData>

export interface ReportData
  extends ReportDateData,
    Expiring,
    CalculationConsent,
    PartialReportData,
    Record<string, unknown> {
  type: ReportType | string;
  countryCode: string; // "NZ"
  currencySymbol?: string; // "$"
  timezone?: string; // Pacific/Auckland
  note?: string;
  parentReportId?: string;
  createdByUserId?: string;
  createdByPartnerId?: string;
  anonymous?: boolean;
}

export interface Report extends ReportData, ReportRoleData {
  reportId: string;
  createdAt: string;
  updatedAt: string;
  reportedAt: string;
  reports?: Report[];
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

[//]: # "typescript client"

### Local Development

#### Dependencies

You will need to install the dependencies with [yarn](https://yarnpkg.com/)

Once you have yarn installed, use the command:

```bash
yarn
```

#### `.env`

First you will need to set up a `.env` file in the same directory as this README.md file

Copy the [`.env.example`](./.env.example) to make your `.env` file

##### Reddit

To setup reddit authentication, you will need to either be provided a client ID if you're working with the 
socialbaking team, or you will need to create a [new application at the bottom of this screen](https://www.reddit.com/prefs/apps)

The local redirect url is http://localhost:3000/api/authentication/reddit/callback 

Once created, copy the value under "web app" and set that as your `REDDIT_CLIENT_ID` 

Copy the "secret" and set that as `REDDIT_CLIENT_SECRET`

Set the reddit community name, and associated flair, as you see fit:

```
REDDIT_NAME=MedicalCannabisNZ
REDDIT_FLAIR="Medical Patient"
```
