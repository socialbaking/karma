import * as metrics from "./metrics";
import { CalculationConsentItem, CalculationSource } from "../client";

export const calculations = {
  metrics,
} as const;

type UnknownRecord = Record<string, unknown>;

interface HandlerObject extends UnknownRecord {
  handler: Function;
  title: string;
  description: string;
}

export interface CalculationHandler extends CalculationSource, HandlerObject {

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

function getCalculations(object: unknown, key: string): CalculationHandler[] {
  if (!isRecord(object)) return [];

  if (isHandlerObject(object)) {
    return [
      {
        handler: object.handler,
        calculationKey: key,
        title: object.title,
        description: object.description,
      },
    ];
  }

  return Object.entries(object).flatMap(([childKey, value]) =>
    getCalculations(value, `${key}.${childKey}`)
  );
}

export const calculationSources = getCalculations(calculations, "calculations");
export const calculationsHandlerMap = new Map<Function, CalculationHandler>(
    calculationSources.map(
        (value) => [value.handler, value] as const
    )
);
export const calculationKeys = calculationSources.map(
  (value) => value.calculationKey
);

export function getCompleteCalculationConsent(): CalculationConsentItem[] {
  const consentedAt = new Date().toISOString();
  return calculationKeys.map(
    (key): CalculationConsentItem => ({
      calculationKey: key,
      consentedAt,
    })
  );
}

export function hasConsent(
  consent: CalculationConsentItem[] | undefined,
  calculationKey: string | Function | HandlerObject
): boolean {
  if (!consent?.length) return false;
  if (typeof calculationKey === "function") {
    const source = calculationsHandlerMap.get(calculationKey);
    if (!source) return false;
    return hasConsent(consent, source.calculationKey);
  }
  if (typeof calculationKey !== "string") {
    if (!calculationKey?.handler) return false;
    return hasConsent(consent, calculationKey.handler);
  }
  return !!consent.find(
    (value) =>
      value.calculationKey === calculationKey &&
      (value.consented || value.consentedAt)
  );
}
