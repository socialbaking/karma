import {
    commit,
    commitAt, commitAuthor,
    packageIdentifier,
    secondsBetweenCommitAndTestCompletion,
    timeBetweenCommitAndBuild,
    timeBetweenCommitAndTestCompletion
} from "../../../package";
import {useData, useRoles} from "../data/provider";

export function Home() {
    const {isAnonymous} = useData();
    const roles = useRoles();
    // console.log({
    //     home: {
    //         roles,
    //         isAnonymous
    //     }
    // })
    return (
        <>
            <p>Welcome! You are running {packageIdentifier}</p>
            <p>
                <a href="/api/documentation" className="text-blue-600 hover:bg-white underline hover:underline-offset-2">Checkout the documentation!</a>
            </p>
            <br />
            <br />
            {
                isAnonymous ? (
                    <>
                        <p>
                            <a href="/api/authentication/discord/redirect" className="text-blue-600 hover:bg-white underline hover:underline-offset-2">Login with Discord</a>
                        </p>
                        <br />
                        <br />
                    </>
                ) : <>
                    You are logged in!<br />
                    {
                        !roles.length ? (
                            "You have no assigned roles"
                        ) : (
                            <>
                                <br />
                                You have the roles:<br />
                                <ul className="list-disc list-outside">
                                    {roles.map(role => <li key={role}>{role}</li>)}
                                </ul>
                                <br />
                            </>
                        )
                    }
                </>
            }
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
                ) : ""
            }
            <p>
                Source code last updated at {commitAt} by {commitAuthor}<br/>
                Commit Hash: {commit}
            </p>
        </>
    )
}