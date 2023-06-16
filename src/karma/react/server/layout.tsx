import { PropsWithChildren, ReactElement } from "react";
import {description, importmap, namespace, project, name} from "../../package";
import { getOrigin } from "../../listen/config";
import { useData, useIsTrusted, useQuerySearch } from "./data";

export interface LayoutProps {
  title?: string;
  url: string;
}

interface MenuItem {
  path: string;
  name: string;
}

interface UserMenuItem extends MenuItem {
  icon: ReactElement;
  trusted?: boolean;
}

const publicItems: MenuItem[] = [
  {
    path: "/",
    name: "Home",
  },
  {
    path: "/products",
    name: "Products",
  },
  {
    path: "/calculator",
    name: "Calculator",
  },
  {
    path: "/feedback",
    name: "Feedback",
  },
];

const items: UserMenuItem[] = [
  {
    path: "/home",
    name: "Home",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
        />
      </svg>
    ),
  },
  {
    path: "/products",
    name: "Products",
    icon: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
        >
          <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
          />
        </svg>
    ),
  },
  {
    path: "/images",
    name: "Images",
    icon: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>

    ),
  },
  {
    path: "/calculator",
    name: "Calculator",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z"
        />
      </svg>
    ),
  },
  {
    path: "/upload-report",
    name: "Upload CSV",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
    ),
    trusted: true,
  },
  {
    path: "/feedback",
    name: "Feedback",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
    ),
  },
  {
    path: "/logout",
    name: "Logout",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
        />
      </svg>
    ),
  },
  // {
  //     path: "/metrics",
  //     name: "3. Metrics",
  //     icon: (
  //         <svg className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white" fill="none" viewBox="0 0 24 24"
  //              strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
  //             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z"/>
  //             <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z"/>
  //         </svg>
  //     )
  // },
];

function Logo() {
  return (
    <div className="flex flex-row align-start items-center">
      <img
        role="presentation"
        src="/public/example-1.svg"
        alt="Brand Image"
        className="h-8 w-auto fill-white"
        title="Social Baking Karma"
      />
      <img
        role="presentation"
        src="/public/example-2.svg"
        alt="Brand Image"
        className="h-8 mx-2 w-auto fill-white"
        title="Social Baking Karma"
      />
      <img
        role="presentation"
        src="/public/example-3.svg"
        alt="Brand Image"
        className="h-8 w-auto fill-white"
        title="Social Baking Karma"
      />
    </div>
  );
}

const SETTINGS_ICON = (
  <svg
    className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

export function BaseLayout({
  children,
  title,
}: PropsWithChildren<LayoutProps>) {
  const script = `
    const { client } = await import("/client/pages/index.js");
    try {
        await client();
    } catch (error) {
       console.error(error);
    }
    `;

  const origin = getOrigin();
  const importmapJSON = JSON.stringify({
    ...importmap,
    imports: Object.fromEntries(
        Object.entries(importmap.imports)
            .flatMap(entry => {
              if (!(entry[0].startsWith(".") || entry[0].startsWith("/"))) {
                return [entry]
              }
              return [
                  entry,
                  [
                      new URL(entry[0], origin).toString(),
                      entry[1]
                  ]
              ]
            })
    )
  })

  return (
    <html lang="en" className="h-full bg-white">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title || project}</title>
        <meta name="description" content={description} />
        <meta name="author" content={namespace} />
        <link href={`/${name}/server.css`} rel="stylesheet" />
        <script type="importmap" dangerouslySetInnerHTML={{ __html: importmapJSON }} />
      </head>
      <body className="h-full">
        <div className="lg:pl-72 flex items-center gap-x-6 bg-gray-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 sm:after:flex-1 justify-center">
          <p className="text-sm leading-6 text-white">
            <span className="flex items-center flex-row justify-center">
              <strong className="font-semibold">
                This software is still being refined
              </strong>
              &nbsp;&nbsp;
              <svg
                viewBox="0 0 2 2"
                className="hidden lg:block mx-2 inline h-0.5 w-0.5 fill-current"
                aria-hidden="true"
              >
                <circle cx="1" cy="1" r="1" />
              </svg>
              &nbsp;&nbsp;
              <span>
                Data displayed is not currently verified or checked, and will be
                removed without further notice.
                <br />
                Data is intended to be used only for user experience testing.
              </span>
            </span>
          </p>
        </div>
        {children}
        <script type="module" dangerouslySetInnerHTML={{ __html: script }} />
      </body>
    </html>
  );
}

export function AnonymousLayout(props: PropsWithChildren<LayoutProps>) {
  const { children } = props;
  const { url } = useData();
  const { pathname } = new URL(url, getOrigin());
  return (
    <BaseLayout {...props}>
      <div className="min-h-full">
        <nav className="bg-indigo-600">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Logo />
                </div>
                <div className="flex flex-row">
                  {publicItems.map(({ path, name }, index) => {
                    const isPath =
                      path === "/"
                        ? pathname === path || pathname === "/home"
                        : pathname.startsWith(path);
                    return (
                      <div
                        className="ml-10 flex items-baseline space-x-4"
                        key={index}
                      >
                        <a
                          href={path}
                          className={`${
                            isPath ? "bg-indigo-700" : ""
                          } text-white hover:bg-indigo-500 hover:bg-opacity-75 rounded-md px-3 py-2 text-sm font-medium`}
                        >
                          {name}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </BaseLayout>
  );
}

export function Layout(props: PropsWithChildren<LayoutProps>) {
  const { children, url } = props;
  const { pathname } = new URL(url, getOrigin());
  const search = useQuerySearch();
  const isTrusted = useIsTrusted();
  const userMenuItems = items.filter(({ trusted }) => !trusted || isTrusted);
  // console.log(userMenuItems.map((value) => value.path));
  return (
    <BaseLayout {...props}>
      <div>
        <noscript className="lg:hidden">
          <ul role="list" className="-mx-2 space-y-1 list-none">
            {userMenuItems.map(({ path, name, icon }, index) => (
              <li key={index}>
                <a
                  href={path}
                  className="text-blue-600 hover:bg-white underline hover:underline-offset-2 flex flex-row align-center justify-left p-4"
                >
                  {icon}
                  <span className="px-4">{name}</span>
                </a>
              </li>
            ))}
            <li>
              <a
                href="/settings"
                className="text-blue-600 hover:bg-white underline hover:underline-offset-2 flex flex-row align-center justify-left p-4"
              >
                {SETTINGS_ICON}
                <span className="px-4">Settings</span>
              </a>
            </li>
          </ul>
          <hr />
        </noscript>
        {/* Off-canvas menu for mobile, show/hide based on off-canvas menu state. */}
        <div
          className="hidden sidebar lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/*
                      Off-canvas menu backdrop, show/hide based on off-canvas menu state.
                
                      Entering: "transition-opacity ease-linear duration-300"
                        From: "opacity-0"
                        To: "opacity-100"
                      Leaving: "transition-opacity ease-linear duration-300"
                        From: "opacity-100"
                        To: "opacity-0"
                    */}
          <div className="fixed inset-0 bg-gray-900/80 sidebar-backdrop" />

          <div className="fixed inset-0 flex">
            {/*
                          Off-canvas menu, show/hide based on off-canvas menu state.
                  
                          Entering: "transition ease-in-out duration-300 transform"
                            From: "-translate-x-full"
                            To: "translate-x-0"
                          Leaving: "transition ease-in-out duration-300 transform"
                            From: "translate-x-0"
                            To: "-translate-x-full"
                        */}
            <div className="relative mr-16 flex w-full max-w-xs flex-1 sidebar-menu">
              {/*
                              Close button, show/hide based on off-canvas menu state.
                    
                              Entering: "ease-in-out duration-300"
                                From: "opacity-0"
                                To: "opacity-100"
                              Leaving: "ease-in-out duration-300"
                                From: "opacity-100"
                                To: "opacity-0"
                            */}
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="sidebar-close-button -m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4 sidebar-contents">
                <div className="flex h-16 shrink-0 items-center">
                  <Logo />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {userMenuItems.map(({ path, name, icon }, index) => (
                          <li key={index}>
                            <a
                              href={path}
                              className={`${
                                pathname.startsWith(path)
                                  ? "bg-indigo-700 text-white"
                                  : "text-indigo-200 hover:text-white hover:bg-indigo-700"
                              } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
                            >
                              {icon}
                              {name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <a
                        href="/settings"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                      >
                        {SETTINGS_ICON}
                        Settings
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <Logo />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {userMenuItems.map(({ path, name, icon }, index) => (
                      <li key={index}>
                        <a
                          href={path}
                          className={`${
                            pathname.startsWith(path)
                              ? "bg-indigo-700 text-white"
                              : "text-indigo-200 hover:text-white hover:bg-indigo-700"
                          } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
                        >
                          {icon}
                          {name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
                <li className="mt-auto">
                  <a
                    href="/settings"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
                  >
                    {SETTINGS_ICON}
                    Settings
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-72">
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <button
              type="button"
              className="hidden script-visible sidebar-open-button -m-2.5 p-2.5 text-gray-700 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            {/* Separator */}
            <div
              className="h-6 w-px bg-gray-900/10 lg:hidden hidden script-visible"
              aria-hidden="true"
            ></div>

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <form
                className="relative flex flex-1"
                action="/products"
                method="GET"
                id="search-form"
                autoComplete="off"
              >
                <input autoComplete="false" name="_" type="text" style={{ display: "none" }} />
                <label htmlFor="search-field" className="sr-only">
                  Search Products
                </label>
                <svg
                  className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  id="search-field"
                  className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                  placeholder="Search products..."
                  type="search"
                  name="search"
                  defaultValue={search}
                />
                <input type="submit" value="Search" style={{ display: "none" }} />
              </form>
            </div>
          </div>

          <main className="py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </BaseLayout>
  );
}
