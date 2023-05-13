import * as metrics from "./metrics";
import {CalculationConsentItem, CalculationSource} from "../client";

export const calculations = {
    metrics
} as const;

type UnknownRecord = Record<string, unknown>;

interface HandlerObject extends UnknownRecord {
    handler: Function
    title: string;
    description: string;
}

function isRecord(value: unknown): value is UnknownRecord {
    return !!(value && typeof value === "object");
}

function isHandlerObject(value: UnknownRecord): value is HandlerObject {
    return (
        typeof value.handler === "function" &&
        typeof value.title === "string" &&
        typeof value.description === "string"
    );
}

function getCalculations(object: unknown, key: string): CalculationSource[] {

    if (!isRecord(object)) return [];

    if (isHandlerObject(object)) {
        return [
            {
                calculationKey: key,
                title: object.title,
                description: object.description
            }
        ]
    }

    return Object.entries(object)
        .flatMap(([childKey, value]) => (
            getCalculations(value, `${key}.${childKey}`)
        ))

}

export const calculationSources = getCalculations(calculations, "calculations");
export const calculationKeys = calculationSources.map(value => value.calculationKey);

export function getCompleteCalculationConsent(): CalculationConsentItem[] {
    const consentedAt = new Date().toISOString()
    return calculationKeys.map(
        (key): CalculationConsentItem => ({
            calculationKey: key,
            consentedAt
        })
    )
}