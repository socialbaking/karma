import {useSortedProducts} from "../data";
import {calculationKeys, calculationSources} from "../../../calculations";

export function Calculator() {
    const products = useSortedProducts();
    return (
        <form name="calculator" action="/api/version/1/reports" method="post">
            {/*
             countryCode: string; // "NZ"
            currencySymbol?: string; // "$"
            timezone?: string; // Pacific/Auckland
            note?: string;
            parentReportId?: string;
            productId?: string;
            productName?: string; // Actual productName, not free text
            productText?: string; // User free text of the product
            productPurchase?: boolean;
            productPurchaseTotalCost?: string; // "908.50", capture the user input raw
            productPurchaseItems?: string; // "2", capture the user input raw
            productPurchaseItemCost?: string; // "450", capture the user input raw
            productPurchaseDeliveryCost?: string; // "8.50", capture the user input raw
            productPurchaseFeeCost?: string; // "3.50", capture the user input raw
            productPurchasePartnerId?: string;
            productPurchasePartnerName?: string; // Actual partnerName, not free text
            productPurchasePartnerText?: string; // User free text of the partnerName
            productSize?: ProductSizeData;
            createdByUserId?: string;
            anonymous?: boolean;
            */}
            <script type="application/json" id="products" dangerouslySetInnerHTML={{__html: JSON.stringify(products)}} />
            <script type="application/json" id="calculations" dangerouslySetInnerHTML={{__html: JSON.stringify(calculationSources)}} />

            <input type="hidden" name="countryCode" value="NZ" />
            <input type="hidden" name="timezone" value="Pacific/Auckland" />

            <div>
                <label htmlFor="productPurchase">Product Purchase Calculation?</label>
                <input type="checkbox" name="productPurchase_boolean" defaultChecked />
            </div>

            <div>
                <input type="text" name="productText" placeholder="Product Name" />
                <input type="hidden" name="productName" />
                <input type="hidden" name="productId" />
                <input type="number" name="productPurchaseTotalCost" placeholder="Total Cost" />
                <input type="number" name="productPurchaseItems" placeholder="Item Count" />
                <input type="number" name="productPurchaseItemCost" placeholder="Item Cost" disabled hidden />
                <input type="number" name="productPurchaseDeliveryCost" placeholder="Delivery Cost" />
                <input type="number" name="productPurchaseFeeCost" placeholder="Purchase Fees" />
                <input type="text" name="productPurchasePartnerText" placeholder="Purchased From" />
                <input type="hidden" name="productPurchasePartnerName" />
                <input type="hidden" name="productPurchasePartnerId" />
            </div>

            <div>
                <label htmlFor="anonymous">Anonymous</label>
                <input type="checkbox" name="anonymous_boolean" />
            </div>

            <p>
                I give consent for the above information to be used with the following calculations,
                and be used for any purpose that the calculation results are intended for including
                but not limited to public publishing of the information.
            </p>
            {
                calculationSources.map(({ calculationKey, title, description }, index) => (
                    <div key={calculationKey}>
                        <input name={`calculationConsent[${index}].calculationKey`} type="hidden" value={calculationKey} />
                        <div>
                            <label htmlFor={`calculationConsent[${index}].consented_boolean`}>{title}</label>
                            <input name={`calculationConsent[${index}].consented_boolean`} type="checkbox" />
                        </div>
                        <div>
                            {description}
                        </div>
                    </div>
                ))
            }
            <button type="submit">
                Submit & Calculate
            </button>
        </form>
    )
}