import {updateUniqueCodeState} from "./unique-code";

export interface AssignUniqueCodeInput {
    uniqueCode: string
    partnerId: string
    value: number
}

export async function assignUniqueCode({ uniqueCode, partnerId, value }: AssignUniqueCodeInput): Promise<boolean> {
    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "assigned",
        value
    });
    return true;
}