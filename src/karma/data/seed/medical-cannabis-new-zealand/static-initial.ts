import {
  getCategoryStore,
  Category,
  CategoryData,
  Partner,
  getPartnerStore,
  ProductData,
  getProductStore,
  Product,
  setProduct,
  Organisation,
  getOrganisationStore,
  OrganisationData,
} from "../../data";
import { v5 } from "uuid";
import { ok } from "../../../../is";
import { HEALTH_GOVT_NZ_MINIMUM_PRODUCTS } from "../../../static";

const firstSeedingDate = new Date(1683589864494).toISOString();
export const createdAt = firstSeedingDate;
export const updatedAt = new Date().toISOString();

// Stable uuid namespace
export const namespace = "536165e4-aa2a-4d17-ad7e-751251497a11";

const categoryData: CategoryData[] = [
  {
    categoryName: "Liquid",
    defaultUnit: "mg/mL",
    defaultSizes: [{ value: "30", unit: "mL" }],
    associatedTerms: ["Oil", "Dropper", "Sublingual Solution"],
  },
  {
    categoryName: "Flower",
    defaultUnit: "g",
    defaultSizes: [
      { value: "10", unit: "g" },
      { value: "15", unit: "g" },
      { value: "30", unit: "g" },
    ],
    associatedTerms: ["Dried Flower", "Dried Herb", "Whole Flower"],
  },
  {
    categoryName: "Equipment",
  },
  {
    categoryName: "Product",
  },
  {
    categoryName: "Fee",
  },
];

export const categories: Category[] = categoryData.map(
  (data: CategoryData, index): Category => ({
    ...data,
    categoryId: v5(data.categoryName, namespace),
    createdAt,
    updatedAt,
    order: index,
  })
);

export async function seedCategories() {
  const categoryStore = getCategoryStore();

  async function putCategory(data: Category) {
    const { categoryName } = data;
    const categoryId = v5(categoryName, namespace);
    const existing = await categoryStore.get(categoryId);
    const category: Category = {
      ...existing,
      ...data,
      categoryId,
      updatedAt,
    };
    await categoryStore.set(categoryId, category);
  }

  await Promise.all(categories.map(putCategory));
}

const approvedAt = createdAt;
const organisationData: (OrganisationData & { partner?: boolean })[] = [
  {
    organisationName: "Cannabis Clinic",
    clinic: true,
    pharmacy: true,
    delivery: true,
    website: "https://cannabisclinic.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    partner: true,
    associatedBrandingTerms: ["CC", "CannaClinic"],
  },
  {
    organisationName: "CannaPlus+",
    clinic: true,
    pharmacy: true,
    delivery: true,
    website: "https://cannaplus.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    partner: true,
    associatedBrandingTerms: ["CannaPlus", "Canna Plus", "Canna Plus+", "C+"],
  },
  {
    organisationName: "The Pain Clinic",
    clinic: true,
    pharmacy: true,
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Pain Clinic"],
  },
  {
    organisationName: "Green Doctors",
    clinic: true,
    pharmacy: true,
    delivery: true,
    website: "https://greendoctors.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["GD"],
  },
  {
    organisationName: "Dr Gulbransen GP",
    clinic: true,
    website: "https://www.cannabiscare.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["CannabisCare", "Cannabis Care"],
  },
  {
    organisationName: "Koru Medical Clinic",
    clinic: true,
    website: "https://korumedical.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Koru"],
  },
  {
    organisationName: "RestoreMe",
    clinic: true,
    website: "https://www.restoremeclinic.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
  },
  {
    organisationName: "Wellworks Pharmacy Taranaki Street",
    pharmacy: true,
    delivery: true,
    website: "https://www.wellworks.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Wellworks"],
  },
  {
    organisationName: "Nga Hua Pharmacy",
    pharmacy: true,
    delivery: true,
    website: "https://www.ngahuapharmacy.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    partner: true,
    associatedBrandingTerms: ["Nga Hua"],
  },
  {
    organisationName: "Medleaf Therapeutics",
    website: "https://medleaf.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Medleaf", "JC Logistics"],
  },
  {
    organisationName: "NUBU Pharmaceuticals",
    website: "https://www.nubupharma.com/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["NUBU", "KIKUYA", "ANTG", "MW Pharma"],
  },
  {
    organisationName: "MedReleaf NZ",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Indica Industries", "MedReleaf"],
  },
  {
    organisationName: "CDC Pharmaceuticals",
    website: "https://www.cdc.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Tilray"],
  },
  {
    organisationName: "Helius Therapeutics",
    website: "https://www.helius.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Helius"],
  },
  {
    organisationName: "Cannasouth Bioscience",
    website: "https://www.cannasouth.co.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["Cannasouth", "evalaCann"],
  },
  {
    organisationName: "RUA Bioscience",
    website: "https://www.ruabio.com/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: ["RUA"],
  },
  {
    organisationName: "Emerge Health New Zealand",
    website: "https://emergeaotearoa.org.nz/",
    approvedAt,
    approved: true,
    countryCode: "NZ",
    associatedBrandingTerms: [],
  },
];

const partners = organisationData
  .filter(({ partner }) => partner)
  .map(
    ({
      organisationName,
      approved,
      approvedAt,
    }: OrganisationData): Partner => ({
      partnerName: organisationName,
      partnerId: v5(organisationName, namespace),
      organisationId: v5(organisationName, namespace),
      createdAt,
      updatedAt,
      approved,
      approvedAt,
    })
  );

ok(partners.length);

export const organisations = organisationData.map(
  ({ organisationName, partner, ...data }): Organisation => ({
    ...data,
    organisationName,
    partnerId: partner ? v5(organisationName, namespace) : undefined,
    organisationId: v5(organisationName, namespace),
    createdAt,
    updatedAt,
  })
);

export function getPartner(name: string): Partner | undefined {
  const found = partners.find((partner) => partner.partnerName === name);
  if (!found && name.includes("t/a")) {
    const [baseName, tradingAs] = name.split("t/a");
    try {
      return getPartner(tradingAs.trim());
    } catch {
      return getPartner(baseName.trim());
    }
  }
  if (!found && name.endsWith("Limited")) {
    return getPartner(name.replace("Limited", "").trim());
  }
  if (!found && name.endsWith("Ltd")) {
    return getPartner(name.replace("Ltd", "").trim());
  }
  ok(found, `Expected partner ${name}`);
  return found;
}

export function getOrganisation(name: string): Organisation | undefined {
  const found = organisations.find(
    (organisation) => organisation.organisationName === name
  );
  if (!found && name.includes("t/a")) {
    const [baseName, tradingAs] = name.split("t/a");
    try {
      return getOrganisation(tradingAs.trim());
    } catch {
      return getOrganisation(baseName.trim());
    }
  }
  if (!found && name.endsWith("Limited")) {
    return getOrganisation(name.replace("Limited", "").trim());
  }
  if (!found && name.endsWith("Ltd")) {
    return getOrganisation(name.replace("Ltd", "").trim());
  }
  ok(found, `Expected organisation ${name}`);
  return found;
}

export function getCategory(name: string) {
  const found = categories.find((category) => category.categoryName === name);
  ok(found, `Expected category ${name}`);
  return found;
}

export function getPartnerId(name: string) {
  return getPartner(name).partnerId;
}

export async function seedPartners() {
  const partnerStore = getPartnerStore();
  const organisationStore = getOrganisationStore();

  async function putPartner(data: Partner) {
    const { partnerId } = data;
    const existing = await partnerStore.get(partnerId);
    if (existing && !isChange(data, existing)) {
      return;
    }
    const partner: Partner = {
      ...existing,
      ...data,
      updatedAt,
    };
    await partnerStore.set(partnerId, partner);
  }

  async function putOrganisation(data: Organisation) {
    const { organisationId } = data;
    const existing = await organisationStore.get(organisationId);
    const organisation: Organisation = {
      ...existing,
      ...data,
      updatedAt,
    };
    await organisationStore.set(organisationId, organisation);
  }

  await Promise.all(organisations.map(putOrganisation));

  await Promise.all(partners.map(putPartner));
}

export async function seedProducts() {
  const [medleaf, nubu, medReleaf, cdc, helius, cannasouth, rua, emerge] = [
    "Medleaf Therapeutics",
    "NUBU Pharmaceuticals",
    "MedReleaf NZ",
    "CDC Pharmaceuticals",
    "Helius Therapeutics",
    "Cannasouth Bioscience",
    "RUA Bioscience",
    "Emerge Health New Zealand",
  ].map(getOrganisation);

  // console.log({
  //     medleaf,
  //     nubu,
  //     medReleaf,
  //     cdc,
  //     helius,
  //     cannasouth,
  //     rua,
  //     emerge
  // })

  const licenceApprovedAt = createdAt;
  const availableAt = createdAt;

  ok(helius.countryCode, "Expected countryCode to be set");

  // The below product information was sourced from this licenceApprovalWebsite url
  const licenceApprovalWebsite = HEALTH_GOVT_NZ_MINIMUM_PRODUCTS;

  const flower = getCategory("Flower");
  const liquid = getCategory("Liquid");

  const products: ProductData[] = [
    {
      productName: "Helius CBD25 Full Spectrum",
      categoryId: liquid.categoryId,
      licenceCountryCode: helius.countryCode,
      licencedOrganisationId: helius.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: ["Total CBD (CBD+CBDA) 25 mg/mL"],
    },
    {
      productName: "Helius CBD100 Full Spectrum",
      categoryId: liquid.categoryId,
      licenceCountryCode: helius.countryCode,
      licencedOrganisationId: helius.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: ["Total CBD (CBD+CBDA) 100 mg/mL"],
    },
    {
      productName: "RUA CBD100",
      categoryId: liquid.categoryId,
      licenceCountryCode: rua.countryCode,
      licencedOrganisationId: rua.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: ["Total CBD (CBD+CBDA) 100 mg/mL"],
    },
    {
      productName: "Tilray P Oral Solution CBD 100",
      categoryId: liquid.categoryId,
      licenceCountryCode: cdc.countryCode,
      licencedOrganisationId: cdc.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [
        { value: "20", unit: "mL" },
        { value: "40", unit: "mL" },
      ],
      activeIngredientDescriptions: [
        "Total CBD (CBD+CBDA) 106.4 mg/g (100 mg/mL)",
      ],
    },
    {
      productName: "Tilray P Oral Solution CBD 25",
      categoryId: liquid.categoryId,
      licenceCountryCode: cdc.countryCode,
      licencedOrganisationId: cdc.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "40", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total CBD (CBD+CBDA) 26.6 mg/g (25 mg/mL)",
      ],
    },
    {
      productName: "SubDrops™ CBD100",
      categoryId: liquid.categoryId,
      licenceCountryCode: helius.countryCode,
      licencedOrganisationId: helius.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: ["Total CBD (CBD+CBDA) 100 mg/mL"],
    },
    {
      productName: "SubDrops™ CBD25",
      categoryId: liquid.categoryId,
      licenceCountryCode: helius.countryCode,
      licencedOrganisationId: helius.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: ["Total CBD (CBD+CBDA) 25 mg/mL"],
    },
    {
      productName: "evalaCann THC ≤1 mg: CBD 20 mg",
      categoryId: liquid.categoryId,
      licenceCountryCode: cannasouth.countryCode,
      licencedOrganisationId: cannasouth.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) ≤1 mg",
        "Total CBD (CBD+CBDA) 20 mg",
      ],
    },
    {
      productName: "evalaCann THC 10 mg: CBD 15 mg",
      categoryId: liquid.categoryId,
      licenceCountryCode: cannasouth.countryCode,
      licencedOrganisationId: cannasouth.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 10 mg",
        "Total CBD (CBD+CBDA) 15 mg",
      ],
    },
    {
      productName: "evalaCann THC 10 mg: CBD  ≤1 mg",
      categoryId: liquid.categoryId,
      licenceCountryCode: cannasouth.countryCode,
      licencedOrganisationId: cannasouth.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      // This product is not yet available
      availableAt: undefined,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 10 mg",
        "Total CBD (CBD+CBDA) ≤1 mg",
      ],
    },
    {
      productName: "Helius THC25 Full Spectrum",
      categoryId: liquid.categoryId,
      licenceCountryCode: helius.countryCode,
      licencedOrganisationId: helius.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 25 mg/mL",
        "Total CBD (CBD+CBDA) ≤2 mg/mL",
      ],
    },
    {
      productName: "Helius THC10:CBD10 Full Spectrum",
      categoryId: liquid.categoryId,
      licenceCountryCode: helius.countryCode,
      licencedOrganisationId: helius.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 10 mg/mL",
        "Total CBD (CBD+CBDA) 10 mg/mL",
      ],
    },
    {
      productName: "Tilray FS oral Solution THC 25",
      categoryId: liquid.categoryId,
      licenceCountryCode: cdc.countryCode,
      licencedOrganisationId: cdc.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "40", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 26.44 mg / g (25 mg/ mL)",
      ],
    },
    {
      productName: "Tilray FS Oral Solution THC 10 CBD 10",
      categoryId: liquid.categoryId,
      licenceCountryCode: cdc.countryCode,
      licencedOrganisationId: cdc.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "40", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 10.5 mg/g (10 mg/mL)",
        "Total CBD  (CBD+CBDA) 10.5 mg/g (10 mg/mL)",
      ],
    },
    {
      productName: "Tilray FS Oral Solution THC 5:  CBD 20",
      categoryId: liquid.categoryId,
      licenceCountryCode: cdc.countryCode,
      licencedOrganisationId: cdc.organisationId,
      licenceApprovedAt: "2023-05-10T02:20:00.000Z",
      licenceApprovalWebsite,
      availableAt: undefined,
      sizes: [{ value: "40", unit: "mL" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 5.3 mg/g (5 mg/mL)",
        "Total CBD (CBD+CBDA)  21.3 mg/g (20 mg/mL)",
      ],
    },
    {
      productName: "KIKUYA Dune",
      categoryId: flower.categoryId,
      licenceCountryCode: nubu.countryCode,
      licencedOrganisationId: nubu.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 190 mg/g (19% w/w)",
        "Total CBD (CBD+CBDA) ≤10 mg/g (≤1%w/w)",
      ],
    },
    {
      productName: "KIKUYA Arroyo",
      categoryId: flower.categoryId,
      licenceCountryCode: nubu.countryCode,
      licencedOrganisationId: nubu.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 200 mg/g (20% w/w)",
        "Total CBD (CBD+CBDA) ≤10 mg/g (≤1% w/w)",
      ],
    },
    {
      productName: "KIKUYA Peak",
      categoryId: flower.categoryId,
      licenceCountryCode: nubu.countryCode,
      licencedOrganisationId: nubu.organisationId,
      licenceApprovedAt: "2023-05-10T02:20:00.000Z",
      licenceApprovalWebsite,
      availableAt: undefined,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 255 mg/g (25.5 % w/w)",
        "Total CBD (CBD+CBDA) ≤10 mg/g (≤1% w/w)",
      ],
    },
    {
      productName: "Medleaf Medium THC Afghan Haze",
      categoryId: flower.categoryId,
      licenceCountryCode: medleaf.countryCode,
      licencedOrganisationId: medleaf.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 18 % w/w",
        "Total CBD (CBD+CBDA) <1% w/w",
      ],
    },
    {
      productName: "Tilray Whole Flower Dried Cannabis THC 22",
      categoryId: flower.categoryId,
      licenceCountryCode: cdc.countryCode,
      licencedOrganisationId: cdc.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "15", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 22 % w/w",
        "Total CBD (CBD+CBDA) ≤1% w/w",
      ],
    },
    {
      productName: "Equiposa",
      categoryId: flower.categoryId,
      licenceCountryCode: medReleaf.countryCode,
      licencedOrganisationId: medReleaf.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      // This product is not yet available
      availableAt: undefined,
      sizes: [{ value: "15", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 9.0 % w/w",
        "Total CBD (CBD+CBDA) 8.3 % w/w",
      ],
    },
    {
      productName: "Luminarium",
      categoryId: flower.categoryId,
      licenceCountryCode: medReleaf.countryCode,
      licencedOrganisationId: medReleaf.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      // This product is not yet available
      availableAt: undefined,
      sizes: [{ value: "15", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 22.5 % w/w",
        "Total CBD (CBD+CBDA) ≤1.0 % w/w",
      ],
    },
    {
      productName: "Sedaprem",
      categoryId: flower.categoryId,
      licenceCountryCode: medReleaf.countryCode,
      licencedOrganisationId: medReleaf.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      // This product is not yet available
      availableAt: undefined,
      sizes: [{ value: "15", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 21.3 % w/w",
        "Total CBD (CBD+CBDA) ≤1.0 % w/w",
      ],
    },
    {
      productName: "ANTG Eve",
      categoryId: flower.categoryId,
      licenceCountryCode: nubu.countryCode,
      licencedOrganisationId: nubu.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 10 mg/g (˂ 1% w/w)",
        "Total CBD (CBD+CBDA) 125 mg/g (12.5% w/w)",
      ],
    },
    {
      productName: "ANTG Mariposa",
      categoryId: flower.categoryId,
      licenceCountryCode: nubu.countryCode,
      licencedOrganisationId: nubu.partnerId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 135 mg/g (13.5% w/w)",
        "Total CBD (CBD+CBDA) <10 mg/g (<1% w/w)",
      ],
    },
    {
      productName: "ANTG Rocky",
      categoryId: flower.categoryId,
      licenceCountryCode: nubu.countryCode,
      licencedOrganisationId: nubu.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 250 mg/g (25% w/w)",
        "Total CBD (CBD+CBDA) <10 mg/g (<1% w/w)",
      ],
    },
    {
      productName: "ANTG Solace",
      categoryId: flower.categoryId,
      licenceCountryCode: nubu.countryCode,
      licencedOrganisationId: nubu.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "10", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA): 200 mg/g (20% w/w)",
        "Total CBD (CBD+CBDA): <10 mg/g (<1% w/w)",
      ],
    },
    {
      productName: "Medleaf Medium THC Shishkaberry",
      categoryId: flower.categoryId,
      licenceCountryCode: medleaf.countryCode,
      licencedOrganisationId: medleaf.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "35", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA): 152.5 mg/g (15.25% w/w)",
        "Total CBD (CBD+CBDA): <5 mg/g (<0.5% w/w)",
      ],
    },
    {
      productName: "Medleaf High THC Zour Apple",
      categoryId: flower.categoryId,
      licenceCountryCode: medleaf.countryCode,
      licencedOrganisationId: medleaf.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      availableBeforeGivenDate: true,
      availableAt,
      sizes: [{ value: "30", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 21% w/w",
        "Total CBD (CBD+CBDA) <1%w/w",
      ],
    },
    {
      productName: "Medleaf High THC GG#4",
      categoryId: flower.categoryId,
      licenceCountryCode: medleaf.countryCode,
      licencedOrganisationId: medleaf.organisationId,
      licenceApprovedBeforeGivenDate: true,
      licenceApprovedAt,
      licenceApprovalWebsite,
      // This product is not yet available
      availableAt: undefined,
      sizes: [{ value: "30", unit: "g" }],
      activeIngredientDescriptions: [
        "Total THC (THC+THCA) 24% w/w",
        "Total CBD (CBD+CBDA) <1%w/w",
      ],
    },
    {
      productName: "Sativex oral spray",
      licenceCountryCode: emerge.countryCode,
      licencedOrganisationId: emerge.organisationId,
      licenceApprovalWebsite,
      // This product is generally available
      availableAt: undefined,
    },
  ].map((data, index) => ({
    ...data,
    order: index,
  }));

  const productStore = getProductStore();

  async function putProduct(data: ProductData) {
    const { productName } = data;
    const productId = v5(productName, namespace);
    const existing = await productStore.get(productId);
    const product = await setProduct({
      ...existing,
      ...data,
      productId,
      createdAt,
    });
    console.log(product.productName, product.activeIngredients);
  }

  await Promise.all(
    products
      .map((data) => ({
        ...data,
        organisationId: data.organisationId ?? data.licencedOrganisationId,
      }))
      .map(putProduct)
  );
}

export async function seed() {
  await seedCategories();
  await seedPartners();
  await seedProducts();
}

const IGNORE_KEYS: string[] = ["updatedAt", "createdAt"];

function isChange(
  left: Record<string, unknown>,
  right: Record<string, unknown>
) {
  return !Object.entries(left)
    .filter((pair) => !IGNORE_KEYS.includes(pair[0]))
    .every(([key, value]) => right[key] === value);
}
