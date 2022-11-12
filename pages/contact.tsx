import type { NextPage } from 'next';
import Header from '@/components/header';

const Home: NextPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full h-full flex-1 flex-col items-center ">
        <div className="h-full w-full sm:w-4/5  flex justify-center align-center">
          <form className="flex flex-col w-full sm:w-4/5 px-4 my-auto">
            <label
              htmlFor="name"
              className=" flex justify-center mb-4 text-xl font-bold"
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              className="border border-black mb-4 h-10 rounded-lg"
            />
            <label
              htmlFor="email"
              className=" flex justify-center mb-4 text-xl font-bold"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="border border-black mb-4 h-10 rounded-lg"
            />
            <label
              htmlFor="message"
              className=" flex justify-center mb-4 text-xl font-bold"
            >
              Message
            </label>
            <input
              id="message"
              type="text"
              name="message"
              className="border border-black mb-4 h-40 rounded-lg"
            />
            <button className="inline-block bg-green-700 py-2 px-4 border border-transparent rounded-md text-base font-medium text-white hover:bg-opacity-75">
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Home;
