import React from 'react';

const industries = [
  'Financial Services',
  'Healthcare',
  'Restaurants',
  'Hospitality',
  'Retail & E‑com',
  'Logistics',
  'Real Estate',
  'Automotive',
  'Public Sector',
  'Education',
  'BPO',
  'Telecom',
];

const IndustryGrid = () => {
  return (
    <section id="industries" className="relative mx-auto mt-32 max-w-6xl px-4">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-300/70">Built for every industry</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">One canvas, every use case</h2>
      </div>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {industries.map((industry) => (
          <div
            key={industry}
            className="rounded-3xl border border-emerald-200/10 bg-white/5 px-6 py-5 text-left text-white/80 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-emerald-300/40 hover:text-white"
          >
            <div className="text-sm uppercase tracking-[0.35em] text-emerald-200">{industry}</div>
            <p className="mt-2 text-base text-white">{industry}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default IndustryGrid;

