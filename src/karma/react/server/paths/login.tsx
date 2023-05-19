import { useData } from "../data";

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

export function Login() {
  const { isAnonymous } = useData();
  if (!isAnonymous) {
    return <p>You're already logged in!</p>;
  }
  return (
    <form
      name="login-authsignal"
      action="/api/authentication/authsignal/redirect"
      method="post"
    >
      <div className="flex flex-col">
        <label className={FORM_GROUP_CLASS}>
          <span className="text-gray-700">Email Address</span>
          <input
            className={FORM_CLASS}
            type="email"
            name="email"
            placeholder="Email Address"
          />
        </label>
      </div>
      <div id="action-section">
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-700 px-4 py-2.5 text-sm leading-5 rounded-md font-semibold text-white"
        >
          Login with Email / Magic Link / Authenticator
        </button>
      </div>
    </form>
  );
}
