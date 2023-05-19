import { useError } from "../data";

export function Errors() {
  const error = useError();
  return (
    <>
      <h2>Ran into an error!</h2>
      <p>{error instanceof Error ? error.message : String(error)}</p>
      <br />
      <br />
      <a
        href="/"
        className="text-blue-600 hover:bg-white underline hover:underline-offset-2"
      >
        Go to home page
      </a>
    </>
  );
}
