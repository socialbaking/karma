import {Report} from "../client";

export interface ProductReport extends Report {
    // These are the expected field for a completed product report
    productPurchase: true
    productPurchaseTotalCost: `${number}` | number;
    productPurchaseItems?: `${number}` | number;
    productPurchaseItemCost: `${number}` | number;
    productPurchaseDeliveryCost: `${number}` | number;
    productPurchaseFeeCost?: `${number}` | number;
}

export function isProductReport(report: Report): report is ProductReport {
    return !!(
        report.productPurchase &&
        isNumberString(report.productPurchaseTotalCost) &&
        (
            isNumberString(report.productPurchaseItemCost) ||
            !report.productPurchaseItemCost
        ) &&
        isNumberString(report.productPurchaseItems) &&
        isNumberString(report.productPurchaseDeliveryCost) &&
        (
            (
                !report.productPurchaseFeeCost &&
                typeof report.productPurchaseFeeCost !== "string"
            ) ||
            isNumberString(report.productPurchaseFeeCost)
        )
    )
}


export function isNumberString(value?: unknown): value is `${number}` | number {
    return (
        (
            typeof value === "string" &&
            /^-?\d+(?:\.\d+)?$/.test(value)
        ) ||
        typeof value === "number"
    );
}