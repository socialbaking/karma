import {
  commit,
  commitAt,
  commitAuthor,
  secondsBetweenCommitAndTestCompletion,
  timeBetweenCommitAndBuild,
  timeBetweenCommitAndTestCompletion,
} from "../../../package.readonly";
import { homepage, packageIdentifier } from "../../../package";

export function Settings() {
  return (
    <>
      <p>You are running {packageIdentifier}</p>
      <p>
        <a
          href="/api/documentation"
          target="_blank"
          className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
        >
          Checkout the API documentation!
        </a>
      </p>
      <p>
        <a
          href={homepage}
          target="_blank"
          className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
        >
          Checkout the source code!
        </a>
      </p>
      <br />
      <br />
      <p>No settings to configure yet!</p>
      <br />
      <hr />
      <br />
      <p data-seconds="${secondsBetweenCommitAndBuild}">
        <strong>Time between commit and build</strong>
        <br />
        {timeBetweenCommitAndBuild}
      </p>
      {timeBetweenCommitAndTestCompletion ? (
        <p data-seconds={secondsBetweenCommitAndTestCompletion}>
          <strong>Time between commit and tests completion</strong>
          <br />
          {timeBetweenCommitAndTestCompletion}
        </p>
      ) : (
        ""
      )}
      <p>
        Source code last updated at {commitAt} by {commitAuthor}
        <br />
        Commit Hash: {commit}
      </p>
    </>
  );
}
