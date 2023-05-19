import { getOrganisationStore } from "./store";

export function getOrganisation(organisationId: string) {
  const store = getOrganisationStore();
  return store.get(organisationId);
}
