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
            ...existing,
            ...data,
            categoryId,
            createdAt,
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
        approved: true
    },
    {
        partnerName: "CannaPlus+",
        clinic: true,
        pharmacy: true,
        delivery: true,
        website: "https://cannaplus.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "The Pain Clinic",
        clinic: true,
        pharmacy: true,
        approvedAt,
        approved: true
    },
    {
        partnerName: "Green Doctors",
        clinic: true,
        pharmacy: true,
        delivery: true,
        website: "https://greendoctors.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Dr Gulbransen GP",
        clinic: true,
        website: "https://www.cannabiscare.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Koru Medical Clinic",
        clinic: true,
        website: "https://korumedical.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "RestoreMe",
        clinic: true,
        website: "https://www.restoremeclinic.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Wellworks Pharmacy Taranaki Street",
        pharmacy: true,
        delivery: true,
        website: "https://www.wellworks.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Nga Hua Pharmacy",
        pharmacy: true,
        delivery: true,
        website: "https://www.ngahuapharmacy.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Medleaf Therapeutics",
        website: "https://medleaf.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "NUBU Pharmaceuticals",
        website: "https://www.nubupharma.com/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "MedReleaf NZ",
        approvedAt,
        approved: true
    },
    {
        partnerName: "CDC Pharmaceuticals",
        website: "https://www.cdc.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Helius Therapeutics",
        website: "https://www.helius.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Cannasouth Bioscience",
        website: "https://www.cannasouth.co.nz/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "RUA Bioscience",
        website: "https://www.ruabio.com/",
        approvedAt,
        approved: true
    },
    {
        partnerName: "Emerge Health New Zealand",
        website: "https://emergeaotearoa.org.nz/",
        approvedAt,
        approved: true
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
            ...existing,
            ...data,
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
    ].map(getPartnerId);

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

    const products: ProductData[] = [
        {
            productName: "Helius CBD25 Full Spectrum",
            licencedPartnerId: helius
        },
        {
            productName: "Helius CBD100 Full Spectrum",
            licencedPartnerId: helius
        },
        {
            productName: "RUA CBD100",
            licencedPartnerId: rua
        },
        {
            productName: "Tilray P Oral Solution CBD 100",
            licencedPartnerId: cdc
        },
        {
            productName: "Tilray P Oral Solution CBD 25",
            licencedPartnerId: cdc
        },
        {
            productName: "SubDrops™ CBD100",
            licencedPartnerId: helius
        },
        {
            productName: "SubDrops™ CBD25",
            licencedPartnerId: helius
        },
        {
            productName: "evalaCann THC ≤1 mg: CBD 20 mg",
            licencedPartnerId: cannasouth
        },
        {
            productName: "evalaCann THC 10 mg: CBD 15 mg",
            licencedPartnerId: cannasouth
        },
        {
            productName: "evalaCann THC 10 mg: CBD  ≤1 mg",
            licencedPartnerId: cannasouth
        },
        {
            productName: "Helius THC25 Full Spectrum",
            licencedPartnerId: helius
        },
        {
            productName: "Helius THC10:CBD10 Full Spectrum",
            licencedPartnerId: helius
        },
        {
            productName: "Tilray FS oral Solution THC 25",
            licencedPartnerId: cdc
        },
        {
            productName: "Tilray FS Oral Solution THC 10 CBD 10",
            licencedPartnerId: cdc
        },
        {
            productName: "KIKUYA Dune",
            licencedPartnerId: nubu
        },
        {
            productName: "KIKUYA Arroyo",
            licencedPartnerId: nubu
        },
        {
            productName: "Medleaf Medium THC Afghan Haze",
            licencedPartnerId: medleaf
        },
        {
            productName: "Tilray Whole Flower Dried Cannabis THC 22",
            licencedPartnerId: cdc
        },
        {
            productName: "Equiposa",
            licencedPartnerId: medReleaf
        },
        {
            productName: "Luminarium",
            licencedPartnerId: medReleaf
        },
        {
            productName: "Sedaprem",
            licencedPartnerId: medReleaf
        },
        {
            productName: "ANTG Eve",
            licencedPartnerId: nubu
        },
        {
            productName: "ANTG Mariposa",
            licencedPartnerId: nubu
        },
        {
            productName: "ANTG Rocky",
            licencedPartnerId: nubu
        },
        {
            productName: "ANTG Solace",
            licencedPartnerId: nubu
        },
        {
            productName: "Medleaf Medium THC Shishkaberry",
            licencedPartnerId: medleaf
        },
        {
            productName: "Medleaf High THC Zour Apple",
            licencedPartnerId: medleaf
        },
        {
            productName: "Medleaf High THC GG#4",
            licencedPartnerId: medleaf
        },
        {
            productName: "Sativex oral spray",
            licencedPartnerId: emerge
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
        const category: Product = {
            ...existing,
            ...data,
            productId,
            createdAt,
            updatedAt
        };
        await productStore.set(productId, category);
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
