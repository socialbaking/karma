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

            <input type="hidden" name="countryCode" value="NZ" />
            <input type="hidden" name="timezone" value="Pacific/Auckland" />

            <div>
                <label htmlFor="productPurchase">Product Purchase Calculation?</label>
                <input type="checkbox" name="productPurchase_boolean" defaultChecked className="form-checkbox rounded mx-4" />
            </div>
            <br />
            <br />

            <div>
                <input className="form-input rounded-md" type="text" name="productText" placeholder="Product Name" />
                <input type="hidden" name="productName" />
                <input type="hidden" name="productId" />
                <input className="form-input rounded-md" type="number" name="productPurchaseTotalCost" step="0.01" placeholder="Total Cost" />
                <input className="form-input rounded-md" type="number" name="productPurchaseItems" step="1" placeholder="Item Count" />
                <input className="form-input rounded-md" type="number" name="productPurchaseItemCost" step="0.01" placeholder="Item Cost" disabled hidden />
                <input className="form-input rounded-md" type="number" name="productPurchaseDeliveryCost" step="0.01" placeholder="Delivery Cost" />
                <input className="form-input rounded-md" type="number" name="productPurchaseFeeCost" step="0.01" placeholder="Purchase Fees" />
                <input className="form-input rounded-md" type="text" name="productPurchasePartnerText" placeholder="Purchased From" />
                <input className="form-input rounded-md" type="hidden" name="productPurchasePartnerName" />
                <input className="form-input rounded-md" type="hidden" name="productPurchasePartnerId" />
            </div>
            <br />
            <br />
            <div>
                <label htmlFor="anonymous">Anonymous</label>
                <input type="checkbox" name="anonymous_boolean" className="form-checkbox rounded mx-4" />
            </div>
            <br />
            <br />
            <p>
                I give consent for the above information to be stored and used with the following calculations,
                and be used for any purpose that the calculation results are intended for, including
                but not limited to public publishing of the information.
            </p>
            <ul className="list-none">
                {
                    calculationSources.map(({ calculationKey, title, description }, index) => (
                        <li key={calculationKey} className="my-4">
                            <input name={`calculationConsent[${index}].calculationKey`} type="hidden" value={calculationKey} />
                            <div>
                                <label htmlFor={`calculationConsent[${index}].consented_boolean`}>{title}</label>
                                <input name={`calculationConsent[${index}].consented_boolean`} type="checkbox" className="form-checkbox rounded mx-4" />
                            </div>
                            <div>
                                {description}
                            </div>
                        </li>
                    ))
                }
            </ul>
            <br />
            <button type="submit" className="bg-sky-500 hover:bg-sky-700 px-5 py-2.5 text-sm leading-5 rounded-md font-semibold text-white">
                Submit & Calculate
            </button>
        </form>
    )
}