import {
    commit,
    commitAt, commitAuthor,
    packageIdentifier,
    secondsBetweenCommitAndTestCompletion,
    timeBetweenCommitAndBuild,
    timeBetweenCommitAndTestCompletion
} from "../../../package";

export function Home() {
    return (
        <>
            <p>Welcome! You are running {packageIdentifier}</p>
            <p>
                <a href="/api/documentation" className="text-blue-600 hover:bg-white underline hover:underline-offset-2">Checkout the documentation!</a>
            </p>
            <br />
            <br />
            <p>
                <a href="/api/authentication/discord/redirect" className="text-blue-600 hover:bg-white underline hover:underline-offset-2">Login with Discord</a>
            </p>
            <br />
            <br />
            <p data-seconds="${secondsBetweenCommitAndBuild}">
                <strong>Time between commit and build</strong><br/>
                {timeBetweenCommitAndBuild}
            </p>
            {
                timeBetweenCommitAndTestCompletion ? (
                    <p data-seconds={secondsBetweenCommitAndTestCompletion}>
                        <strong>Time between commit and tests completion</strong><br/>
                        {timeBetweenCommitAndTestCompletion}
                    </p>
                ) : "<!-- No tests ran after build -->"
            }
            <p>
                Source code last updated at {commitAt} by {commitAuthor}<br/>
                Commit Hash: {commit}
            </p>
        </>
    )
}