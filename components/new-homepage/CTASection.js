import React from 'react';
import Link from 'next/link';

const CTASection = () => {
  return (
    <section id="pricing" className="relative mx-auto mt-32 max-w-4xl overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-r from-emerald-500/20 via-emerald-400/20 to-emerald-300/10 px-8 py-16 text-center backdrop-blur-2xl">
      <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(19,245,132,0.5), transparent 60%)' }} />
      <div className="relative space-y-6">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-100/80">Ready to launch</p>
        <h2 className="text-4xl font-semibold text-white">Start building your agent</h2>
        <p className="text-lg text-white/80">No credit card needed • Ship in 5 minutes • Cancel anytime</p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/assistants"
            className="rounded-full bg-white px-8 py-3 text-base font-semibold text-black shadow-[0_15px_35px_rgba(19,245,132,0.45)]"
          >
            Access dashboard
          </Link>
          <Link
            href="/chatbot"
            className="rounded-full border border-white/30 px-8 py-3 text-base font-semibold text-white/80 hover:text-white hover:border-white/60 transition"
          >
            View live demo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

