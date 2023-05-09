# Pharmakarma - Node & JavaScript implementation


[//]: # (badges)

### Support

 ![Node.js supported](https://img.shields.io/badge/node-%3E%3D18.7.0-blue) 

### Test Coverage

 ![91.65%25 lines covered](https://img.shields.io/badge/lines-91.65%25-brightgreen) ![91.65%25 statements covered](https://img.shields.io/badge/statements-91.65%25-brightgreen) ![77.27%25 functions covered](https://img.shields.io/badge/functions-77.27%25-yellow) ![82.69%25 branches covered](https://img.shields.io/badge/branches-82.69%25-brightgreen)

[//]: # (badges)

### Client's TypeScript Interface

[//]: # (typescript client)

```typescript
export interface SystemLog extends Record<string, unknown> {
    message: string;
    uniqueCode?: string;
    value?: number;
    partnerId?: string;
    action?: string;
}
export interface PartnerData {
    partnerName: string;
    location: string;
    onsite?: boolean;
    remote?: boolean;
    clinic?: boolean;
    pharmacy?: boolean;
    partnerDescription?: string;
}
export interface Partner extends PartnerData {
    partnerId: string;
    accessToken?: string;
}
export interface CategoryData {
    categoryName: string;
}
export interface Category extends CategoryData {
    categoryId: string;
}
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
    listPartners(): Promise<Partner[]>;
    listSystemLogs(): Promise<SystemLog[]>;
}
```

[//]: # (typescript client)

