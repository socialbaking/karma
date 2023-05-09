import {getCategoryStore, Category, CategoryData, KeyValueStore, PartnerData, Partner, getPartnerStore} from "./data";
import {v5} from "uuid";

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

export async function seedPartners() {
    const partnerStore = getPartnerStore();
    const approvedAt = createdAt;
    const partners: PartnerData[] = [
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
    ];

    async function putPartner(data: PartnerData) {
        const { partnerName } = data;
        const partnerId = v5(partnerName, namespace);
        const existing = await partnerStore.get(partnerId);
        if (existing && !isChange(data, existing)) {
            return;
        }
        const partner: Partner = {
            ...existing,
            ...data,
            partnerId,
            createdAt,
            updatedAt
        };
        console.log(partner);
        await partnerStore.set(partnerId, partner);
    }

    await Promise.all(
        partners.map(putPartner)
    );
    
    
    
}

export async function seed() {
    await seedCategories();
    await seedPartners();
}

function isChange(left: Record<string, unknown>, right: Record<string, unknown>) {
    return !Object.entries(left).every(([key, value]) => right[key] === value);
}
