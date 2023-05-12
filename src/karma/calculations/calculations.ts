import * as metrics from "./metrics";
import {CalculationConsent, CalculationConsentItem} from "../client";

export const calculations = {
    metrics
} as const;

function getCalculationKeys(object: unknown, key: string): string[] {
    type UnknownRecord = Record<string, unknown>;
    interface HandlerObject extends UnknownRecord {
        handler: Function
    }

    if (!isRecord(object)) return [];

    if (isHandlerObject(object)) {
        return [
            key
        ]
    }

    return Object.entries(object)
        .flatMap(([childKey, value]) => (
            getCalculationKeys(value, `${key}.${childKey}`)
        ))

    function isRecord(value: unknown): value is UnknownRecord {
        return !!(value && typeof value === "object");
    }

    function isHandlerObject(value: UnknownRecord): value is HandlerObject {
        return typeof value.handler === "function";
    }

}

export const calculationKeys = getCalculationKeys(calculations, "calculations");

export function getCompleteCalculationConsent(): CalculationConsentItem[] {
    const consentedAt = new Date().toISOString()
    return calculationKeys.map(
        (key): CalculationConsentItem => ({
            calculationKey: key,
            consentedAt
        })
    )
}