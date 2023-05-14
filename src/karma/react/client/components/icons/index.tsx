import {GlobeIcon} from "./globe";
import {FunctionComponent} from "react";
import {CannabisIcon} from "./cannabis";
import {EyeDropperIcon} from "./eye-dropper";
import {WrenchIcon} from "./wrench";

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
export * from "./prescription-bottle";

export function CategoryIcon({ categoryName }: { categoryName: string }) {
    const Icon = getCategoryIcon();
    return <Icon />;

    function getCategoryIcon(): FunctionComponent | undefined {
        const lower = categoryName.toLowerCase();
        if (lower === "flower") return CannabisIcon;
        if (lower === "oil") return EyeDropperIcon;
        if (lower === "equipment") return WrenchIcon;
        return GlobeIcon;
    }
}
