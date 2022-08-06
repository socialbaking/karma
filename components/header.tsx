import Head from 'next/head'
import Image from 'next/image'
import logo from "@/public/logo.png"

function Header() {
  return (
    <div>
      <Head>
        <title>CannaSPY</title>
        <meta property="og:title" content="CannaSPY" key="title" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <h1 className="flex title-font font-medium items-center md:justify-start justify-center text-green-600">
          <Image className="justify-self-center" src={logo} width={50} height={50} alt="CannaSPY Logo" />
          <span className="ml-3 text-4xl">CannaSPY</span>
        </h1>
      </div>
      {/* <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-green-600">
            CannaSPY
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          Your experiences. Your data. Your insights.
        </p>
      </div> */}
    </div>
  )
}

export default Header