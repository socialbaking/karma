import { ProductSizeData } from "../product";

export interface CategoryData extends Record<string, unknown> {
  categoryName: string;
  defaultUnit?: string;
  defaultSizes?: ProductSizeData[];
  countryCode?: string;
  order?: number;
  associatedTerms?: string[];
}

export interface Category extends CategoryData {
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}
