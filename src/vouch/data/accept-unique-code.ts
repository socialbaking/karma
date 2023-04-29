import {getUniqueCode, updateUniqueCodeState} from "./unique-code";

export interface AcceptUniqueCodeInput {
    uniqueCode: string;
    partnerId: string;
    value: number;
}

export async function acceptUniqueCode({ uniqueCode, partnerId, value }: AcceptUniqueCodeInput): Promise<boolean> {
    const document = await getUniqueCode(uniqueCode);
    const remainingValue = document.value - (document.acceptedValue ?? 0);

    if (!remainingValue) return false;
    if (remainingValue < value) return false;

    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "accepted",
        value
    });
    return true;
}