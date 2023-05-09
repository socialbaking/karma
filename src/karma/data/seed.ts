import {
    getCategoryStore,
    Category,
    CategoryData,
    PartnerData,
    Partner,
    getPartnerStore,
    ProductData,
    getProduct, getProductStore, Product
} from "./data";
import {v5} from "uuid";
import {ok} from "../../is";

const firstSeedingDate = new Date(1683589864494).toISOString();
const createdAt = firstSeedingDate;
const updatedAt = new Date().toISOString()

// Stable uuid namespace
const namespace = "536165e4-aa2a-4d17-ad7e-751251497a11";

async function seedCategories() {
    const categoryStore = getCategoryStore();
    const categories: CategoryData[] = [
        {
            categoryName: "Flower"
        },
        {
            categoryName: "Oil"
        },
        {
            categoryName: "Equipment"
        },
        {
            categoryName: "Product"
        },
        {
            categoryName: "Fee"
        }
    ];

    async function putCategory(data: CategoryData) {
        const { categoryName } = data;
        const categoryId = v5(categoryName, namespace);
        const existing = await categoryStore.get(categoryId);
        if (existing && !isChange(data, existing)) {
            return;
        }
        const category: Category = {
            createdAt,
            ...existing,
            ...data,
            categoryId,
            updatedAt
        };
        await categoryStore.set(categoryId, category);
    }

    await Promise.all(
        categories.map(putCategory)
    );

}

const approvedAt = createdAt;
const partners: Partner[] = [
    {
        partnerName: "Cannabis Clinic",
        clinic: true,
        pharmacy: true,
        delivery: true,
        website: "https://cannabisclinic.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "CannaPlus+",
        clinic: true,
        pharmacy: true,
        delivery: true,
        website: "https://cannaplus.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "The Pain Clinic",
        clinic: true,
        pharmacy: true,
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Green Doctors",
        clinic: true,
        pharmacy: true,
        delivery: true,
        website: "https://greendoctors.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Dr Gulbransen GP",
        clinic: true,
        website: "https://www.cannabiscare.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Koru Medical Clinic",
        clinic: true,
        website: "https://korumedical.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "RestoreMe",
        clinic: true,
        website: "https://www.restoremeclinic.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Wellworks Pharmacy Taranaki Street",
        pharmacy: true,
        delivery: true,
        website: "https://www.wellworks.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Nga Hua Pharmacy",
        pharmacy: true,
        delivery: true,
        website: "https://www.ngahuapharmacy.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Medleaf Therapeutics",
        website: "https://medleaf.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "NUBU Pharmaceuticals",
        website: "https://www.nubupharma.com/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "MedReleaf NZ",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "CDC Pharmaceuticals",
        website: "https://www.cdc.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Helius Therapeutics",
        website: "https://www.helius.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Cannasouth Bioscience",
        website: "https://www.cannasouth.co.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "RUA Bioscience",
        website: "https://www.ruabio.com/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    },
    {
        partnerName: "Emerge Health New Zealand",
        website: "https://emergeaotearoa.org.nz/",
        approvedAt,
        approved: true,
        countryCode: "NZL"
    }
]
    .map((data): Partner => ({
        ...data,
        partnerId: v5(data.partnerName, namespace),
        createdAt,
        updatedAt
    }));



function getPartner(name: string) {
    const found = partners.find(partner => partner.partnerName === name);
    ok(found, `Expected partner ${name}`);
    return found;
}

function getPartnerId(name: string) {
    return getPartner(name).partnerId;
}


export async function seedPartners() {
    const partnerStore = getPartnerStore();


    async function putPartner(data: Partner) {
        const { partnerId } = data;
        const existing = await partnerStore.get(partnerId);
        if (existing && !isChange(data, existing)) {
            return;
        }
        const partner: Partner = {
            createdAt,
            ...existing,
            ...data,
            updatedAt
        };
        await partnerStore.set(partnerId, partner);
    }

    await Promise.all(
        partners.map(putPartner)
    );

}

async function seedProducts() {
    const [
        medleaf,
        nubu,
        medReleaf,
        cdc,
        helius,
        cannasouth,
        rua,
        emerge
    ] = [
        "Medleaf Therapeutics",
        "NUBU Pharmaceuticals",
        "MedReleaf NZ",
        "CDC Pharmaceuticals",
        "Helius Therapeutics",
        "Cannasouth Bioscience",
        "RUA Bioscience",
        "Emerge Health New Zealand"
    ].map(getPartner);

    console.log({
        medleaf,
        nubu,
        medReleaf,
        cdc,
        helius,
        cannasouth,
        rua,
        emerge
    })

    const licenceApprovedAt = createdAt;
    const availableAt = createdAt;

    ok(helius.countryCode, "Expected countryCode to be set");

    const products: ProductData[] = [
        {
            productName: "Helius CBD25 Full Spectrum",
            licenceCountryCode: helius.countryCode,
            licencedPartnerId: helius.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total CBD (CBD+CBDA) 25 mg/mL"
            ],
        },
        {
            productName: "Helius CBD100 Full Spectrum",
            licenceCountryCode: helius.countryCode,
            licencedPartnerId: helius.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total CBD (CBD+CBDA) 100 mg/mL"
            ],
        },
        {
            productName: "RUA CBD100",
            licenceCountryCode: rua.countryCode,
            licencedPartnerId: rua.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total CBD (CBD+CBDA) 100 mg/mL"
            ],
        },
        {
            productName: "Tilray P Oral Solution CBD 100",
            licenceCountryCode: cdc.countryCode,
            licencedPartnerId: cdc.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "20", unit: "ml" }, { size: "40", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total CBD (CBD+CBDA) 106.4 mg/g (100 mg/mL)"
            ],
        },
        {
            productName: "Tilray P Oral Solution CBD 25",
            licenceCountryCode: cdc.countryCode,
            licencedPartnerId: cdc.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "40", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total CBD (CBD+CBDA) 26.6 mg/g (25 mg/mL)"
            ],
        },
        {
            productName: "SubDrops™ CBD100",
            licenceCountryCode: helius.countryCode,
            licencedPartnerId: helius.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total CBD (CBD+CBDA) 100 mg/mL"
            ],
        },
        {
            productName: "SubDrops™ CBD25",
            licenceCountryCode: helius.countryCode,
            licencedPartnerId: helius.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total CBD (CBD+CBDA) 25 mg/mL"
            ],
        },
        {
            productName: "evalaCann THC ≤1 mg: CBD 20 mg",
            licenceCountryCode: cannasouth.countryCode,
            licencedPartnerId: cannasouth.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) ≤1 mg",
                "Total CBD (CBD+CBDA) 20 mg"
            ],
        },
        {
            productName: "evalaCann THC 10 mg: CBD 15 mg",
            licenceCountryCode: cannasouth.countryCode,
            licencedPartnerId: cannasouth.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 10 mg",
                "Total CBD (CBD+CBDA) 15 mg"
            ],
        },
        {
            productName: "evalaCann THC 10 mg: CBD  ≤1 mg",
            licenceCountryCode: cannasouth.countryCode,
            licencedPartnerId: cannasouth.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            // This product is not yet available
            availableAt: undefined,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 10 mg",
                "Total CBD (CBD+CBDA) ≤1 mg"
            ],
        },
        {
            productName: "Helius THC25 Full Spectrum",
            licenceCountryCode: helius.countryCode,
            licencedPartnerId: helius.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 25 mg/mL",
                "Total CBD (CBD+CBDA) ≤2 mg/mL"
            ],
        },
        {
            productName: "Helius THC10:CBD10 Full Spectrum",
            licenceCountryCode: helius.countryCode,
            licencedPartnerId: helius.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 10 mg/mL",
                "Total CBD (CBD+CBDA) 10 mg/mL"
            ],
        },
        {
            productName: "Tilray FS oral Solution THC 25",
            licenceCountryCode: cdc.countryCode,
            licencedPartnerId: cdc.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "40", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 26.44 mg / g (25 mg/ mL)"
            ],
        },
        {
            productName: "Tilray FS Oral Solution THC 10 CBD 10",
            licenceCountryCode: cdc.countryCode,
            licencedPartnerId: cdc.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "40", unit: "ml" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 10.5 mg/g (10 mg/mL)",
                "Total CBD  (CBD+CBDA) 10.5 mg/g (10 mg/mL)"
            ],
        },
        {
            productName: "KIKUYA Dune",
            licenceCountryCode: nubu.countryCode,
            licencedPartnerId: nubu.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "10", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 190 mg/g (19% w/w)",
                "Total CBD (CBD+CBDA) ≤10 mg/g (≤1%w/w)"
            ],
        },
        {
            productName: "KIKUYA Arroyo",
            licenceCountryCode: nubu.countryCode,
            licencedPartnerId: nubu.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "10", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 200 mg/g (20% w/w)",
                "Total CBD (CBD+CBDA) ≤10 mg/g (≤1% w/w)"
            ],
        },
        {
            productName: "Medleaf Medium THC Afghan Haze",
            licenceCountryCode: medleaf.countryCode,
            licencedPartnerId: medleaf.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "10", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 18 % w/w",
                "Total CBD (CBD+CBDA) <1% w/w"
            ],
        },
        {
            productName: "Tilray Whole Flower Dried Cannabis THC 22",
            licenceCountryCode: cdc.countryCode,
            licencedPartnerId: cdc.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "15", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 22 % w/w",
                "Total CBD (CBD+CBDA) ≤1% w/w"
            ],
        },
        {
            productName: "Equiposa",
            licenceCountryCode: medReleaf.countryCode,
            licencedPartnerId: medReleaf.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            // This product is not yet available
            availableAt: undefined,
            sizes: [{ size: "15", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 9.0 % w/w",
                "Total CBD (CBD+CBDA) 8.3 % w/w"
            ],
        },
        {
            productName: "Luminarium",
            licenceCountryCode: medReleaf.countryCode,
            licencedPartnerId: medReleaf.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            // This product is not yet available
            availableAt: undefined,
            sizes: [{ size: "15", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 22.5 % w/w",
                "Total CBD (CBD+CBDA) ≤1.0 % w/w"
            ],
        },
        {
            productName: "Sedaprem",
            licenceCountryCode: medReleaf.countryCode,
            licencedPartnerId: medReleaf.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            // This product is not yet available
            availableAt: undefined,
            sizes: [{ size: "15", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 21.3 % w/w",
                "Total CBD (CBD+CBDA) ≤1.0 % w/w"
            ],
        },
        {
            productName: "ANTG Eve",
            licenceCountryCode: nubu.countryCode,
            licencedPartnerId: nubu.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "10", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 10 mg/g (˂ 1% w/w)",
                "Total CBD (CBD+CBDA) 125 mg/g (12.5% w/w)"
            ],
        },
        {
            productName: "ANTG Mariposa",
            licenceCountryCode: nubu.countryCode,
            licencedPartnerId: nubu.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "10", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 135 mg/g (13.5% w/w)",
                "Total CBD (CBD+CBDA) <10 mg/g (<1% w/w)"
            ],
        },
        {
            productName: "ANTG Rocky",
            licenceCountryCode: nubu.countryCode,
            licencedPartnerId: nubu.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "10", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 250 mg/g (25% w/w)",
                "Total CBD (CBD+CBDA) <10 mg/g (<1% w/w)"
            ],
        },
        {
            productName: "ANTG Solace",
            licenceCountryCode: nubu.countryCode,
            licencedPartnerId: nubu.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "10", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA): 200 mg/g (20% w/w)",
                "Total CBD (CBD+CBDA): <10 mg/g (<1% w/w)"
            ],
        },
        {
            productName: "Medleaf Medium THC Shishkaberry",
            licenceCountryCode: medleaf.countryCode,
            licencedPartnerId: medleaf.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "35", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA): 152.5 mg/g (15.25% w/w)",
                "Total CBD (CBD+CBDA): <5 mg/g (<0.5% w/w)"
            ],
        },
        {
            productName: "Medleaf High THC Zour Apple",
            licenceCountryCode: medleaf.countryCode,
            licencedPartnerId: medleaf.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            availableBeforeGivenDate: true,
            availableAt,
            sizes: [{ size: "30", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 21% w/w",
                "Total CBD (CBD+CBDA) <1%w/w"
            ],
        },
        {
            productName: "Medleaf High THC GG#4",
            licenceCountryCode: medleaf.countryCode,
            licencedPartnerId: medleaf.partnerId,
            licenceApprovedBeforeGivenDate: true,
            licenceApprovedAt,
            // This product is not yet available
            availableAt: undefined,
            sizes: [{ size: "30", unit: "g" }],
            activeIngredientDescriptions: [
                "Total THC (THC+THCA) 24% w/w",
                "Total CBD (CBD+CBDA) <1%w/w"
            ],
        },
        {
            productName: "Sativex oral spray",
            licenceCountryCode: emerge.countryCode,
            licencedPartnerId: emerge.partnerId,
            // This product is generally available
            availableAt: undefined
        }
    ];

    const productStore = getProductStore();

    async function putProduct(data: ProductData) {
        const { productName } = data;
        const productId = v5(productName, namespace);
        const existing = await productStore.get(productId);
        if (existing && !isChange(data, existing)) {
            return;
        }
        const product: Product = {
            ...existing,
            ...data,
            productId,
            createdAt,
            updatedAt
        };
        console.log(product);
        await productStore.set(productId, product);
    }

    await Promise.all(
        products.map(putProduct)
    );

}

export async function seed() {
    await seedCategories();
    await seedPartners();
    await seedProducts();
}

function isChange(left: Record<string, unknown>, right: Record<string, unknown>) {
    return !Object.entries(left).every(([key, value]) => right[key] === value);
}
