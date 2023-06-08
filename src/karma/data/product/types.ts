import {FileData} from "../file";
import {File} from "buffer";

export interface ProductSizeData extends Record<string, unknown> {
  value: string;
  unit: string;
}

export interface ProductInfo {
  title?: string;
  text: string;
  url?: string;
  description?: string;
}

export interface ProductFile extends FileData {
  fileId: string;
}

export interface ProductData extends Record<string, unknown> {
  productName: string;
  order?: number;
  countryCode?: string;
  organisationId?: string;
  licencedOrganisationId?: string;
  // Flag for products we don't have the exact licence date for
  licenceApprovedBeforeGivenDate?: boolean;
  licenceApprovedAt?: string;
  licenceExpiredAt?: string;
  licenceApprovalWebsite?: string;
  // ISO 3166-1 alpha-3 country code
  licenceCountryCode?: string;
  // Flag for products we don't have the exact availability date for
  availableBeforeGivenDate?: boolean;
  availableAt?: string;
  // For products that we will no longer have available
  availableUntil?: string;
  sizes?: ProductSizeData[];
  // Direct text about the active ingredients, not specific values
  activeIngredientDescriptions?: string[];
  categoryId?: string;
  generic?: boolean;
  public?: boolean;
  branded?: boolean;
  genericSearchTerm?: string;
  genericCategoryNames?: string[];
  genericAcronym?: string;
  info?: ProductInfo[];
  files?: ProductFile[];
  obsoleteAt?: string;
}

export interface ProductActiveIngredient {
  type: string;
  unit: string;
  value: string;
  prefix?: string;
  calculated?: boolean;
  calculatedUnit?: string;
  size?: ProductSizeData;
  proportional?: boolean;
}

export interface Product extends ProductData {
  productId: string;
  createdAt: string;
  updatedAt: string;
  activeIngredients?: ProductActiveIngredient[];
}
