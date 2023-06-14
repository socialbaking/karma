import {
  commit,
  commitAt,
  commitAuthor,
  secondsBetweenCommitAndTestCompletion,
  timeBetweenCommitAndBuild,
  timeBetweenCommitAndTestCompletion,
} from "../../../package.readonly";
import { homepage, packageIdentifier } from "../../../package";
import {useIsAdmin, useIsTrusted} from "../data";
import {readdirSync, statSync} from "fs";
import {join} from "node:path";


function isDirectory(path: string) {
    try {
        const stat = statSync(path);
        return stat.isDirectory()
    } catch {
        return false;
    }
}

interface DirectoryInfo {
    path: string;
    directories: DirectoryInfo[],
    files: string[]
}

function readdirRecursive(path: string): DirectoryInfo | undefined {
    try {
        const paths = readdirSync(path)
            .filter(name => ![".git", "node_modules", ".env", ".cache", ".github", ".idea", "coverage"].includes(name))
            .map(name => join(path, name));

        const directories = paths.filter(isDirectory);
        const files = paths.filter(path => !directories.includes(path));

        const info = directories.map(readdirRecursive).filter(Boolean);

        return {
            path,
            directories: info,
            files
        };
    } catch {
        return undefined;
    }
}

function Admin() {

    return <pre>
        {JSON.stringify(
            readdirRecursive("node_modules/@socialbaking/karma") ?? readdirRecursive(process.env.IS_LOCAL ? process.cwd() : "/var"),
            undefined,
            "  "
        )}
    </pre>

}

export function Settings() {
  const trusted = useIsTrusted()
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
        {trusted ? <Admin /> : undefined}
    </>
  );
}
