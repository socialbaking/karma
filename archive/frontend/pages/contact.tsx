import type { NextPage } from 'next';
import Header from '@/components/header';
import { useRef } from 'react';
// import axios from 'axios';
import { useRouter } from 'next/router';
const Home: NextPage = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    // TODO: Actually complete this
    // const res = await axios.post('/api/contact', {
    //   name: nameRef.current?.value,
    //   email: emailRef.current?.value,
    //   message: messageRef.current?.value,
    // });

    router.push('/');

    // nameRef.current.value = '';
    // emailRef.current.value = '';
    // messageRef.current.value = '';
  };
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex w-full h-full flex-1 flex-col items-center ">
        <div className="h-full w-full sm:w-4/5  flex justify-center align-center">
          <form
            className="flex flex-col w-full sm:w-4/5 px-4 my-auto"
            onSubmit={handleSubmit}
          >
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
              ref={nameRef}
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
              ref={emailRef}
            />
            <label
              htmlFor="message"
              className=" flex justify-center mb-4 text-xl font-bold"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className="border border-black mb-4 h-40 rounded-lg px-2 py-2"
              ref={messageRef}
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
