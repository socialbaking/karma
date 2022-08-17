import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Header from '@/components/header'
import Footer from '@/components/footer'
import Features from '@/components/features'
import Logo from '@/components/logo'

const Home: NextPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-1 flex-col items-center px-20">
        <Features />
        <Logo />
        {/* <article className="prose lg:prose-xl">
          <h1>Garlic bread with cheese: What the science tells us</h1>
          <p>
            For years parents have espoused the health benefits of eating garlic bread with cheese to their
            children, with the food earning such an iconic status in our culture that kids will often dress
            up as warm, cheesy loaf for Halloween.
          </p>
          <p>
            But a recent study shows that the celebrated appetizer may be linked to a series of rabies cases
            springing up around the country.
          </p>
        </article> */}
      </main>
      <Footer />
    </div>
  )
}

export default Home
