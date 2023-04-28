export interface VerifyUniqueCodeInput {
    uniqueCode: string
    partnerId: string;
}

export async function verifyUniqueCode({ uniqueCode, partnerId }: VerifyUniqueCodeInput): Promise<boolean> {

    return true;
}