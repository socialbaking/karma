import {
    useCategory,
    useError,
    useMaybeBody,
    useMaybeResult,
    useMetrics,
    useProduct, useProductMetrics,
    useQuery,
    useSortedProducts,
    useSubmitted,
    useProductByName, useQuerySearch
} from "../data";
import {calculationSources, hasConsent} from "../../../calculations";
import {ReportData, Report} from "../../../client";
import {FastifyRequest} from "fastify";
import {addReportFromRequest} from "../../../listen/report/add-report";
import {background} from "../../../background";
import {ProductListItem} from "../../client/components/product/list-item";
import {addFormMeta, FormMeta, FormMetaData, getReportMetrics, ReportMetrics} from "../../../data";
import {ok} from "../../../../is";
import {bugsUrl, homepage} from "../../../package";
import {CC0_URL, MIT_URL, NZCODE_URL} from "../../../static";

export interface FeedbackFormMetaData extends FormMetaData {
    type: "feedback";
    title: string;
    message: string;
    locatedInNewZealand?: boolean;
    storageConsent?: boolean;
}

function assertFeedback(value: unknown): asserts value is FeedbackFormMetaData {
    ok<FeedbackFormMetaData>(value);
    ok(value.type === "feedback");
    ok(value.title?.trim().length, "Expected title");
    ok(value.message?.trim().length, "Expected message");
    ok(value.locatedInNewZealand, "We can only accept feedback from people located in New Zealand at this time");
    ok(value.storageConsent, "Feedback cannot be stored as no consent provided");
}

export async function submit(request: FastifyRequest) {
    const data = request.body;
    assertFeedback(data);

    const meta = await addFormMeta(data);

    return { success: true, meta }
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

export function Feedback() {
    const body = useMaybeBody<FeedbackFormMetaData>();
    const submitted = useSubmitted();
    const result = useMaybeResult<{ success: boolean, meta: FormMeta }>();
    const error = useError();

    return (
        <form name="calculator" action="/feedback#action-section" method="post">
            {
                result ? (
                    <script type="application/json" id="result-json" dangerouslySetInnerHTML={{__html: JSON.stringify(result, undefined, "  ")}} />
                ) : undefined
            }
            <input type="hidden" name="type" value="feedback" />

            <div className="flex flex-col">
                <label className={FORM_GROUP_CLASS}>
                    <span className="text-gray-700">Title</span>
                    <input className={FORM_CLASS} type="text" name="title" placeholder="Feedback Title" defaultValue={result?.success ? "" : body?.title || ""} />
                </label>
                <label className={FORM_GROUP_CLASS}>
                    <span className="text-gray-700">Message</span>
                    <textarea className={FORM_CLASS} name="message" placeholder="Feedback Message">{result?.success ? "" : body?.message || ""}</textarea>
                </label>
            </div>
            <hr className="my-8" />
            <label htmlFor="locatedInNewZealand" className="my-4 flex flex-row items-center">
                <input name="locatedInNewZealand" id="locatedInNewZealand" type="checkbox" className="form-checkbox rounded m-1" defaultChecked={result?.success ? false : body?.locatedInNewZealand || false} />
                <span  className="block ml-4">
                    We adhere to the&nbsp;<a href={NZCODE_URL} target="_blank" rel="noreferrer">New Zealand Code</a>&nbsp;licence.
                    Because of this, we would like to acknowledge and understand if feedback or feature requests are by New Zealanders.<br/>
                    By ticking this checkbox you are confirming you are located in New Zealand T
                </span>
            </label>
            <label htmlFor="storageConsent" className="my-4 flex flex-row items-center">
                <input name="storageConsent" id="storageConsent" type="checkbox" className="form-checkbox rounded m-1" defaultChecked={result?.success ? false : body?.storageConsent || false} />
                <ul  className="ml-4 list-none divide-y divide-dashed">
                    <li>I give consent for the provided information to be stored.</li>
                    <li>I give consent for the provided information to be published publicly, for example on sites like <a href={bugsUrl} target="_blank" rel="noreferrer">GitHub</a></li>
                    <li>I give consent for the feedback to be used to implement features potentially in more than one codebase, including code bases licenced using the <a href={MIT_URL} target="_blank" rel="noreferrer">GitHub</a> licence or <a href={CC0_URL} target="_blank" rel="noreferrer">GitHub</a></li>
                    <li>I understand that the feedback will be taken into consideration and may or may not be included as a feature</li>
                </ul>
            </label>
            <hr className="my-8" />
            <div id="action-section">
                <button type="submit" className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white">
                    Submit Feedback
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
                    {
                        submitted && result ? (
                            <div>
                                <hr className="my-8" />
                                {result.success ? (
                                    <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-emerald-500 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
                                        <p className="text-sm leading-6 text-white">
                                            Feedback successfully submitted! Cheers
                                        </p>
                                    </div>
                                ) : undefined}
                            </div>
                        ) : undefined
                    }
                </section>
            </div>
        </form>
    )
}