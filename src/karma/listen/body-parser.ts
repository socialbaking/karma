import qs from "qs";

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === "object";
}

export function processStringFields(value: unknown): unknown {
  if (!value) return value;

  if (Array.isArray(value)) {
    return value.map((item) => processStringFields(item));
  }

  if (!isRecordLike(value)) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map((entry) => {
      const [key, value] = entry;
      if (key.endsWith("_boolean")) {
        return [key.replace(/_boolean$/, ""), isBooleanLike(value)];
      }
      return [key, processStringFields(value)];
    })
  );
}

function isBooleanLike(value: unknown) {
  return value === "1" || value === "true" || value === "on";
}

export function parseStringFields(string: string): unknown {
  const parsed = qs.parse(string, {
    allowDots: true,
  });
  return processStringFields(parsed);
}
