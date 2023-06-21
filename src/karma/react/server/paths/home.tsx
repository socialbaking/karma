import {
  commit,
  commitAt,
  commitAuthor,
  homepage,
  packageIdentifier,
  secondsBetweenCommitAndTestCompletion,
  timeBetweenCommitAndBuild,
  timeBetweenCommitAndTestCompletion,
} from "../../../package";
import {
  useData,
  useIsTrusted,
  useMaybeUser,
  useRoles,
} from "../data/provider";
import {DISCORD_CLIENT_ID} from "../../../listen/auth/discord";
import {REDDIT_CLIENT_ID} from "../../../listen/auth/reddit";
import {AUTHSIGNAL_TENANT} from "../../../authentication/authsignal";

export const path = "/home";
export const anonymous = true;

export function Home() {
  const { isAnonymous } = useData();
  const roles = useRoles();
  const isTrusted = useIsTrusted();
  const user = useMaybeUser();
  // console.log({
  //     home: {
  //         roles,
  //         isAnonymous
  //     }
  // })
  return (
    <>
      {isAnonymous ? (
        <>
          <p>Welcome!</p>
          <br />
          <br />
          <p>
            <a
                href="/login"
                className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
            >
              Login
            </a>
          </p>
          <br />
          <br />
          <hr />
          <br />
          <br />
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
        </>
      ) : (
        <>
          You are logged in!
          <br />
          {!roles.length ? (
            "You have no assigned roles"
          ) : (
            <>
              <br />
              You have the roles:
              <br />
              <ul className="list-disc list-outside">
                {roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
              <br />
              {isTrusted && user ? (
                <p>
                  User Id: {user.userId}
                  <br />
                  Authenticated With: {user.externalType}
                </p>
              ) : isTrusted ? (
                "No user associated"
              ) : undefined}
            </>
          )}
        </>
      )}
      <br />
      <br />
      <div id="react-home" />
    </>
  );
}

export const Component = Home;