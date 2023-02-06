import type { NextPage } from 'next';
import Header from '@/components/header';

const Home: NextPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full flex-1 flex-col items-center px-20">
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900  text-center mb-6">
              About
            </h1>
            <div>
              <h2 className="mt-2 text-2xl leading-8 font-bold tracking-tight text-gray-900">
                Why pharmakarma exists, the mission, and the vision
              </h2>
              <section className="mt-4 max-w-4xl text-xl text-gray-500 lg:mx-auto ">
              <p>Welcome to our educational medicinal cannabis website! Our mission is to provide reliable, science-based information about the use of cannabis as medicine. </p>
              <p>With the increasing legalization of cannabis for medicinal purposes, it is important to have access to accurate information about its potential benefits and risks. </p>
              <p>Our goal is to educate individuals and healthcare professionals on the latest research and developments in the field of medicinal cannabis and help to dispel any myths and misconceptions. </p>
              <p>Join us in our journey to explore the world of medicinal cannabis and its impact on our health and well-being.</p>
              </section>
            </div>
            <div className="mt-6">
              <h2 className=" text-2xl leading-8 font-bold tracking-tight text-gray-900 ">
                Our team
              </h2>
              <section className="mt-4 max-w-4xl text-xl text-gray-500 lg:mx-auto">
                <p>We are a team of passionate individuals who are dedicated to providing the best information about medicinal cannabis. </p>
                <p>We are committed to providing the most up-to-date information on the latest research and developments in the field of medicinal cannabis.</p>
                <p>Most of us were very new to the medicinal cannabis scene in New Zealand, so we decided that we could give it a bit of a push by creating this website.</p>
                <p>This site, and others under the Social Baking umbrella are community-orientated, and we are always looking for ways to improve our content and make it more accessible to everyone.</p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
