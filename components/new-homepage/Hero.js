import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';

const Hero = () => {
  const { user, accessToken } = useAuth();
  const isAuthenticated = user || accessToken;
  const redirectPath = isAuthenticated ? '/assistants' : '/login';
  const buttonText = isAuthenticated ? 'Create Agent' : 'Get Started';

  return (
    <section
      id="hero"
      className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-4 py-16 text-center"
    >
      <div className="relative flex flex-col items-center justify-center gap-6 w-full">
        <h1 className="text-5xl font-semibold leading-tight text-white sm:text-6xl md:text-[64px] md:leading-[1.1] whitespace-nowrap text-center">
          Build Smart AI Agents Visually
        </h1>
        <p className="max-w-2xl text-lg text-white/70 md:text-xl text-center">
          Design conversation flows with drag-and-drop simplicity. Configure tools, deploy agents, and manage everything in one place
        </p>
        <div className="pt-2 flex justify-center">
          <Link
            href={redirectPath}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#13F584] px-8 py-3 text-base font-semibold text-black hover:bg-[#11e077] transition-colors"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;

