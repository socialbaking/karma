import { GlobeIcon } from "./globe";
import { FunctionComponent } from "react";
import { CannabisIcon } from "./cannabis";
import { EyeDropperIcon } from "./eye-dropper";
import { WrenchIcon } from "./wrench";
import { IconProps } from "./types";

export * from "./calendar";
export * from "./globe";
export * from "./x-circle";
export * from "./annotation";
export * from "./globe-alt";
export * from "./lightning-bolt";
export * from "./scale";
export * from "./eye-dropper";
export * from "./wrench";
export * from "./cannabis";
export * from "./cannabis-solid";
export * from "./prescription-bottle";
export * from "./svg-text";

export const BASIC_CATEGORY_FLOWER = "flower" as const;
export const BASIC_CATEGORY_LIQUID = "liquid" as const;
export const BASIC_CATEGORY_EQUIPMENT = "equipment" as const;
export const BASIC_CATEGORIES = [
  BASIC_CATEGORY_FLOWER,
  BASIC_CATEGORY_LIQUID,
  BASIC_CATEGORY_EQUIPMENT,
];

export function CategoryIcon({
  categoryName,
  ...rest
}: { categoryName: string } & IconProps) {
  const Icon = getCategoryIcon();
  return <Icon {...rest} />;

  function getCategoryIcon(): FunctionComponent | undefined {
    const lower = categoryName.toLowerCase();
    if (lower === BASIC_CATEGORY_FLOWER) return CannabisIcon;
    if (lower === BASIC_CATEGORY_LIQUID || lower === "oil")
      return EyeDropperIcon;
    if (lower === BASIC_CATEGORY_EQUIPMENT) return WrenchIcon;
    return GlobeIcon;
  }
}
