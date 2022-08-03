import Head from 'next/head'

function Header() {
  return (
    <div>
      <Head>
        <title>CannaSPY</title>
        <meta property="og:title" content="CannaSPY" key="title" />
        <link rel="icon" href="/logo.png" />
      </Head>
    </div>
  )
}

export default Header