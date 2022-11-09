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
                Why CannaSpy exists
              </h2>
              <p className="mt-4 max-w-4xl text-xl text-gray-500 lg:mx-auto ">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
            <div className="mt-6">
              <h2 className=" text-2xl leading-8 font-bold tracking-tight text-gray-900 ">
                How CannaSpy came to be
              </h2>
              <p className="mt-4 max-w-4xl text-xl text-gray-500 lg:mx-auto">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
                nulla pariatur. Excepteur sint occaecat cupidatat non proident,
                sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
