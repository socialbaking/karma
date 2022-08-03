import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '../components/header'
import Footer from '../components/footer'

const Home: NextPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Header />

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-green-600">
            CannaSPY
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          Your experiences. Your data. Your insights.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default Home
