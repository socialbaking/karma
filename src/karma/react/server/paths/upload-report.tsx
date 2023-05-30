import { CalculationConsent } from "./calculator";
import { FastifyReply, FastifyRequest } from "fastify";
import { uploadReportHandler } from "../../../listen/report/upload-report";
import {useError, useIsAdmin, useIsModerator, useIsTrusted, useMaybeResult, useSubmitted} from "../data";
import { Report } from "../../../client";
import { ReportMetrics } from "../../../data";
import { background } from "../../../background";
import { ok } from "../../../../is";
import { isProductReport } from "../../../calculations";

export async function submit(request: FastifyRequest) {
  const report = await uploadReportHandler(request);
  if (isProductReport(report) || report.reports.find(isProductReport)) {
    await background();
  }
  return {
    report,
  };
}

//"bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"

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

const FILE_CLASS = `
${FORM_CLASS}
border border-solid border-neutral-300 bg-clip-padding 
px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out 
file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid 
file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition 
file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] 
hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary
focus:outline-none
`;

export function UploadReport() {
  const isAdmin = useIsAdmin();
  const isModerator = useIsModerator();
  const isMoreTrusted = isAdmin || isModerator;
  const isTrusted = useIsTrusted();
  ok(isTrusted, "Expected trusted user");
  const submitted = useSubmitted();
  const result = useMaybeResult<{ report: Report; metrics?: ReportMetrics }>();
  const error = useError();
  return (
    <>
      <form
        method="post"
        encType="multipart/form-data"
        action="/upload-report#result-section"
      >
        <label className="flex flex-col" htmlFor="file">
          <span className="inline-block mr-4 mb-2">CSV or JSON Report File</span>
          <input type="file" name="file" id="file" className={FILE_CLASS} />
        </label>
        <hr className="my-8" />
        <CalculationConsent />
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
        >
          Upload
        </button>
      </form>
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
          <>
            <hr className="my-8" />
            <div className="pointer-events-auto flex items-center justify-between gap-x-6 bg-green-200 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
              <p className="text-sm leading-6">
                Upload submitted! {result.report.reports.length} reports added!
              </p>
            </div>
            <hr className="my-8" />
            {
              isMoreTrusted ? (
                  <table className="table">
                    <thead>
                    <tr>
                      <th>Given Text</th>
                      <th>Product Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {result.report.reports.map(
                        (report, index) => (
                            <tr key={index} className={report.productName ? "bg-lime-200" : "bg-red-400"}>
                              <td>{report.productText}</td>
                              <td>{report.productName}</td>
                            </tr>
                        )
                    )}
                    </tbody>
                  </table>
              ) : undefined
            }
          </>
        ) : undefined}
      </section>
    </>
  );
}
