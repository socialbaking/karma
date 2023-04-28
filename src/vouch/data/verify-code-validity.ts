import {getUniqueCode, updateUniqueCodeState} from "./unique-code";

export interface VerifyUniqueCodeInput {
    uniqueCode: string
    partnerId: string;
}

export async function verifyUniqueCode({ uniqueCode, partnerId }: VerifyUniqueCodeInput): Promise<boolean> {
    const document = await getUniqueCode(uniqueCode);
    if (!document) return false;
    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "validated"
    });
    return true;
}