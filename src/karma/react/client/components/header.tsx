import { Logo } from "./logo";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "About", href: "/about" },
  // { name: 'Contact', href: '/contact' },
];

function Header() {
  return (
    <div>
      <head>
        <title>pharmakarma</title>
        <meta property="og:title" content="pharmakarma" key="title" />
        <link rel="icon" href="/logo.png" />
      </head>
      <header className="relative bg-white">
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Top"
        >
          <div
            className="absolute inset-0 shadow z-30 pointer-events-none"
            aria-hidden="true"
          />
          <div className="w-full py-6 flex items-center justify-between border-b border-green-500 lg:border-none">
            <div className="flex items-center">
              <a href="#">
                <span className="sr-only">pharmakarma</span>
                <Logo iconOnly />
              </a>
              <div className="hidden ml-10 space-x-8 lg:block">
                {navigation?.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-base font-medium  text-black hover:text-green-600"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>
            {/* <div className="ml-10 space-x-4">
              <a
                href="#"
                className="inline-block bg-green-700 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75"
              >
                Sign in
              </a>
              <a
                href="#"
                className="inline-block bg-white py-2 px-4 border border-transparent rounded-md text-base font-medium text-green-600 hover:bg-green-50"
              >
                Sign up
              </a>
            </div> */}
          </div>
        </nav>
      </header>
    </div>
  );
}

export default Header;
