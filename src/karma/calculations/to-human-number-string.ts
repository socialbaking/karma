export function toHumanNumberString(value: number) {
  const string = value.toString();
  const split = string.split(".");
  if (split.length === 1) return string;
  if (split[1].length <= 2) return string;
  const rounded = Math.round(value * 10000) / 10000;
  return rounded.toString();
}
