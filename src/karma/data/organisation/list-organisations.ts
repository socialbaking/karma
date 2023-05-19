import { Organisation } from "./types";
import { getOrganisationStore } from "./store";

export interface ListOrganisationsInput {
  authorizedOrganisationId?: string;
}

export async function listOrganisations({
  authorizedOrganisationId,
}: ListOrganisationsInput = {}): Promise<Organisation[]> {
  const store = getOrganisationStore();
  const organisations = await store.values();
  return organisations.filter(
    (organisation) =>
      organisation.approvedAt ||
      organisation.organisationId === authorizedOrganisationId
  );
}
