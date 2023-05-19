import { v4 } from "uuid";
import { OrganisationData, Organisation } from "./types";
import { getOrganisationStore } from "./store";

export interface AddOrganisationInput extends OrganisationData {}

export async function addOrganisation(
  data: AddOrganisationInput
): Promise<Organisation> {
  const store = getOrganisationStore();
  const organisationId = v4();
  const createdAt = new Date().toISOString();
  const organisation: Organisation = {
    ...data,
    organisationId,
    approved: false,
    approvedAt: undefined,
    approvedByUserId: undefined,
    createdAt,
    updatedAt: createdAt,
  };
  await store.set(organisationId, organisation);
  return organisation;
}
