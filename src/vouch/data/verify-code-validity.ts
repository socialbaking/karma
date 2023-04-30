import {getUniqueCode, updateUniqueCodeState} from "./unique-code";
import {getPartnerStore} from "./partner";

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

    if (process.env.VOUCH_REQUIRE_PARTNER_APPROVAL) {
        const partner = await getPartnerStore().get(document.partnerId);
        if (!partner.approved) return false;
    }

    await updateUniqueCodeState({
        uniqueCode,
        partnerId,
        type: "validated",
        value: value ?? 0
    });
    return true;
}