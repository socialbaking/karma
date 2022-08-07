import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Features from '@/components/features'

const Home: NextPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-1 flex-col items-center px-20">
        <Features />
      </main>
      <Footer />
    </div>
  )
}

export default Home
