import {
  useCategory,
  useError,
  useMaybeBody,
  useMaybeResult,
  useProduct,
  useProductMetrics,
  useSubmitted,
  useProductByName,
  useQuerySearch,
  useData,
} from "../data";
import {
  calculationSources,
  hasConsent,
  isAnonymousCalculation,
  isProductReport,
} from "../../../calculations";
import { ReportData, Report } from "../../../client";
import { FastifyRequest } from "fastify";
import { addReportFromRequest } from "../../../listen/report/add-report";
import { background } from "../../../background";
import { ProductListItem } from "../../client/components/product/list-item";
import { getReportMetrics, ReportMetrics } from "../../../data";

export const path = "/calculator";
export const anonymous = true;

export async function submit(request: FastifyRequest) {
  // 👀
  const report = await addReportFromRequest(request);

  // For now try to trigger the background job for the
  // report processing.
  //
  // ... it will block the submission until then
  //
  // Later we will do this only on a schedule
  if (isProductReport(report)) {
    await background();
  } else {
    console.log("Is not product report", report);
  }

  return {
    report,
    metrics: await getReportMetrics(report.reportId),
  };
}

const FORM_CLASS = `
mt-1
block
w-full
md:max-w-sm
rounded-md
border-gray-300
shadow-sm
focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50
disabled:bg-slate-300 disabled:cursor-not-allowed
`.trim();

const FORM_GROUP_CLASS = `block py-2`;

export function CalculationConsent() {
  const body = useMaybeBody<Pick<ReportData, "calculationConsent">>();
  const { isAnonymous } = useData();
  let calculations = calculationSources;
  if (isAnonymous) {
    calculations = calculations.filter((source) =>
      isAnonymousCalculation(source.calculationKey)
    );
  }
  return (
    <ul className="list-none" id="select-calculations">
      {calculations.map(({ calculationKey, title, description }, index) => {
        const consented = !!body?.calculationConsent?.find(
          (value) => value.calculationKey === calculationKey
        )?.consented;
        const consentedKey = `calculationConsent[${index}].consented_boolean`;
        return (
          <li key={calculationKey} className="my-4 flex flex-row align-start">
            <input
              name={`calculationConsent[${index}].calculationKey`}
              type="hidden"
              value={calculationKey}
            />
            <input
              name={consentedKey}
              id={consentedKey}
              type="checkbox"
              className="form-checkbox rounded m-1"
              defaultChecked={consented}
            />
            <label htmlFor={consentedKey} className="flex flex-col ml-4">
              <span>{title}</span>
              <span>
                {description}
                {index > 0 ? " and includes the results in our metrics" : ""}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export function Calculator() {
  const body = useMaybeBody<ReportData>();
  const submitted = useSubmitted();
  const result = useMaybeResult<{ report: Report; metrics?: ReportMetrics }>();
  const error = useError();
  const productName = useQuerySearch();
  const submittedProduct = useProduct(body?.productId);
  const category = useCategory(submittedProduct?.categoryId);
  const metrics = useProductMetrics("month");
  const searchedProduct = useProductByName(productName);
  const searchedProductCategory = useCategory(searchedProduct?.categoryId);
  console.log({
    error, result, submitted, submittedProduct
  });
  return (
    <form name="calculator" action="/calculator#action-section" method="post">
      {result ? (
        <script
          type="application/json"
          id="result-json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(result, undefined, "  "),
          }}
        />
      ) : undefined}
      {searchedProduct ? (
        <script
          type="application/json"
          id="product-json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(searchedProduct) }}
        />
      ) : undefined}

      <input
        type="hidden"
        name="countryCode"
        value={body?.countryCode ?? "NZ"}
      />
      <input
        type="hidden"
        name="timezone"
        value={body?.timezone ?? "Pacific/Auckland"}
      />

      {searchedProduct ? (
        <ul className="list-none">
          <ProductListItem
            isDefaultVisible
            url="/products"
            product={searchedProduct}
            category={searchedProductCategory}
            metrics={metrics[searchedProduct.productId]}
            overrideClassName="block hover:bg-gray-50 -mx-4 py-4 px-4"
          />
        </ul>
      ) : undefined}

      {/* report type */}
      <input type="hidden" value="purchase" name="type" />

      <div className="flex flex-col">
        <label className={FORM_GROUP_CLASS}>
          <span className="text-gray-700">Product Name</span>
          <input
            className={FORM_CLASS}
            type="text"
            name="productText"
            placeholder="Product Name"
            disabled={!!productName}
            defaultValue={
              productName ||
              body?.productText ||
              body?.productName ||
              submittedProduct?.productName
            }
          />
          {productName ? (
            <input type="hidden" value={productName} name="productName" />
          ) : undefined}
        </label>
        <label className={FORM_GROUP_CLASS}>
          <span className="text-gray-700">Item Cost</span>
          <input
            className={FORM_CLASS}
            type="number"
            name="productItemCost"
            step="0.01"
            placeholder="Item Cost"
            defaultValue={body?.productItemCost}
          />
        </label>
        <label className={FORM_GROUP_CLASS}>
          <span className="text-gray-700">Item Count</span>
          <input
            className={FORM_CLASS}
            type="number"
            name="productItems"
            step="1"
            placeholder="Item Count"
            defaultValue={body?.productItems ?? "1"}
          />
        </label>
        {/*<label className={FORM_GROUP_CLASS}>*/}
        {/*    <span className="text-gray-700">Delivery Cost</span>*/}
        {/*    <input className={FORM_CLASS} type="number" name="productDeliveryCost" step="0.01" placeholder="Delivery Cost" defaultValue={body?.productDeliveryCost} />*/}
        {/*</label>*/}
        {/*<label className={FORM_GROUP_CLASS}>*/}
        {/*    <span className="text-gray-700">Purchase Fees (e.g. Health Now)</span>*/}
        {/*    <input className={FORM_CLASS} type="number" name="productFeeCost" step="0.01" placeholder="Purchase Fees" defaultValue={body?.productFeeCost} />*/}
        {/*</label>*/}
        {/*<label className={FORM_GROUP_CLASS}>*/}
        {/*    <span className="text-gray-700">Purchased From (e.g. Pharmacy or Clinic Name)</span>*/}
        {/*    <input className={FORM_CLASS} type="text" name="productOrganisationText" placeholder="Purchased From" defaultValue={body?.productOrganisationText} />*/}
        {/*</label>*/}
      </div>
      {/*<hr className="my-8" />*/}
      {/*<div className="flex flex-row">*/}
      {/*    <input type="checkbox" name="anonymous_boolean" id="anonymous_boolean" className="form-checkbox rounded m-1" defaultChecked={body?.anonymous ?? false} />*/}
      {/*    <label htmlFor="anonymous_boolean" className="ml-4 flex">Anonymous</label>*/}
      {/*</div>*/}
      <hr className="my-8" />
      <p>
        I give consent for the above information to be stored and used with the
        following calculations, and be used for any purpose that the calculation
        results are intended for, including but not limited to public publishing
        of the information.
      </p>
      <CalculationConsent />
      <hr className="my-8" />
      <div id="action-section">
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
        >
          Submit & Calculate
        </button>
        <section id="result-section">
          {error ? (
            <>
              <hr className="my-8" />
              <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-red-400 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
                <p className="text-sm leading-6 text-white">
                  {error instanceof Error ? error.message : String(error)}
                </p>
              </div>
              <hr className="my-8" />
            </>
          ) : undefined}
          {submitted && result ? (
            <div>
              <hr className="my-8" />
              {submittedProduct ? (
                <>
                  {!hasConsent(
                    result.report.calculationConsent,
                    "calculations.metrics.costPerUnit"
                  ) ? (
                    <div>
                      No calculation performed, please tick{" "}
                      <a
                        href="#select-calculations"
                        className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
                      >
                        the boxes above
                      </a>{" "}
                      if you would like to calculate a value or contribute to
                      our running metrics
                      <br />
                      <br />
                      Showing default product details below for the product
                      selected
                      <hr className="my-8" />
                    </div>
                  ) : undefined}
                  {!result.metrics ? (
                    <div>
                      Could not calculate product metrics from report
                      <br />
                      This may be an error, or we do not have enough information
                      about the product to do the calculation.
                      <br />
                      <br />
                      Showing default product details below for the product
                      selected
                      <hr className="my-8" />
                    </div>
                  ) : undefined}
                  <ul className="list-none">
                    <ProductListItem
                      isDefaultVisible
                      url="/products"
                      report={!!result.metrics}
                      product={submittedProduct}
                      category={category}
                      metrics={
                        result.metrics
                          ? {
                              metrics: [result.metrics],
                              products: result.metrics.products,
                            }
                          : metrics[submittedProduct.productId]
                      }
                      overrideClassName="block hover:bg-gray-50 -mx-2 py-2 sm:-mx-4 sm:py-4 px-4"
                    />
                  </ul>
                </>
              ) : (
                <>
                  Provided Name: {result.report.productText}
                  <br />
                  Product not found in database
                  <br />
                  Metrics stored, but not applied to daily metrics
                </>
              )}
              {result.report.productId && !submittedProduct?.activeIngredients
                ? "No active ingredients listed for product"
                : ""}
            </div>
          ) : undefined}
        </section>
      </div>
    </form>
  );
}

export const Component = Calculator;