import { v4 } from "uuid";
import { createPartnerAccessToken } from "../access-token";
import { Partner, PartnerData } from "./types";
import { getPartnerStore } from "./store";
import { addOrganisation } from "../organisation";

export interface AddPartnerInput extends PartnerData {}

export async function addPartner(data: AddPartnerInput): Promise<Partner> {
  const store = getPartnerStore();
  const partnerId = v4();
  const { partnerName, ...organisationData } = data;
  const { organisationId } = await addOrganisation({
    ...organisationData,
    organisationName: partnerName,
    partnerId,
  });
  const createdAt = new Date().toISOString();
  const partner: Partner = {
    partnerName,
    partnerId,
    organisationId,
    approved: false,
    approvedAt: undefined,
    approvedByUserId: undefined,
    createdAt,
    updatedAt: createdAt,
  };
  await store.set(partnerId, partner);
  const { accessToken } = await createPartnerAccessToken(partnerId);
  return {
    ...partner,
    accessToken,
  };
}
