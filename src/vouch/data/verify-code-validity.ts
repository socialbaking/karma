import {getUniqueCode, updateUniqueCodeState} from "./unique-code";

export interface VerifyUniqueCodeInput {
    uniqueCode: string
    partnerId: string;
    value?: number;
}

export async function verifyUniqueCode({ uniqueCode, partnerId, value }: VerifyUniqueCodeInput): Promise<boolean> {
    const document = await getUniqueCode(uniqueCode);
    if (!document) return false;
    if (value && document.value < value) {
        return false;
    }

    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "validated",
        value: value ?? 0
    });
    return true;
}