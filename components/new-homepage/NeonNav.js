import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/authContext';

const NeonNav = () => {
  const { user, accessToken } = useAuth();
  const isAuthenticated = user || accessToken;
  const redirectPath = isAuthenticated ? '/assistants' : '/login';
  const buttonText = isAuthenticated ? 'Create Agent' : 'Sign up';

  return (
    <header className="w-full flex justify-center pt-10 px-4">
      <div className="flex items-center justify-between gap-6 rounded-[40px] border border-white/15 bg-white/5 px-6 py-3 backdrop-blur-xl shadow-[0_0_40px_rgba(19,245,132,0.15)] w-full max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-semibold text-black">
            EA
          </div>
          <div className="text-sm uppercase tracking-[0.3em] text-white/70">esap.ai</div>
        </div>
        <Link
          href={redirectPath}
          className="rounded-full bg-white text-black px-5 py-2 text-sm font-semibold shadow-[0_10px_25px_rgba(19,245,132,0.3)] hover:bg-gradient-to-r hover:from-emerald-400 hover:to-green-500 hover:text-black transition-all"
        >
          {buttonText}
        </Link>
      </div>
    </header>
  );
};

export default NeonNav;

