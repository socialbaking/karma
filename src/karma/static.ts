import { AuthenticationRole } from "./data";

export const HEALTH_GOVT_NZ = "https://www.health.govt.nz";
export const HEALTH_GOVT_NZ_MINIMUM_PRODUCTS = `${HEALTH_GOVT_NZ}/our-work/regulation-health-and-disability-system/medicinal-cannabis-agency/medicinal-cannabis-agency-information-health-professionals/medicinal-cannabis-products-meet-minimum-quality-standard`;
export const SEARCH_NZULM = "https://search.nzulm.org.nz";

export const HEALTH_GOVT_NZ_NAME = "New Zealand's Ministry of Health";

export const COPYRIGHT_TEXT: Record<string, string> = {
  [HEALTH_GOVT_NZ_MINIMUM_PRODUCTS]: HEALTH_GOVT_NZ_NAME,
  [SEARCH_NZULM]: `New Zealand Universal List of Medicines by ${HEALTH_GOVT_NZ_NAME}`,
  [HEALTH_GOVT_NZ]: HEALTH_GOVT_NZ_NAME,
};

export const COPYRIGHT_LINK: Record<string, string> = {
  [HEALTH_GOVT_NZ_MINIMUM_PRODUCTS]: "https://www.health.govt.nz",
  [HEALTH_GOVT_NZ]: HEALTH_GOVT_NZ,
  [SEARCH_NZULM]: SEARCH_NZULM,
};

export const COPYRIGHT_SVG_TEXT: Record<string, string> = {};

export const NZCODE_URL = "https://www.nzcode.com/";
export const AXIOM_NZCODE_URL =
  "https://www.nzcode.com/shop/product/459221/axiom-700161/?variantId=1084232";

export const CC0_URL =
  "https://creativecommons.org/share-your-work/public-domain/cc0/";
export const MIT_URL = "https://snyk.io/learn/what-is-mit-license/";

//// ==------------==

export const TRUSTED_ROLE: AuthenticationRole[] = [
  "admin",
  "industry",
  "moderator",
  "owner",
  "pharmacy",
  "clinic",
  "developer",
  "coordinator",
];
