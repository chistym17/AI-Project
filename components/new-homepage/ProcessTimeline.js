import React from 'react';
import { ArrowRight } from 'lucide-react';

const steps = [
  {
    title: 'Visual Flow Editor',
    description: 'Drag conversation nodes, configure prompts, and add tools without code.',
    detail: 'Builder',
  },
  {
    title: 'Knowledge & Tools',
    description: 'Attach documents, APIs, CRMs, and function calls with guardrails.',
    detail: 'Brain',
  },
  {
    title: 'Deploy & Monitor',
    description: 'Push to voice or chat, observe transcripts, and iterate quickly.',
    detail: 'Launch',
  },
];

const ProcessTimeline = () => {
  return (
    <section id="how-it-works" className="relative mx-auto mt-32 max-w-5xl px-4">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-300/70">How it works</p>
        <h2 className="mt-4 text-4xl font-semibold text-white">Ship agents in minutes</h2>
      </div>
      <div className="relative mt-16 flow-root rounded-[36px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="absolute inset-x-12 top-1/2 hidden h-px bg-gradient-to-r from-white/0 via-white/40 to-white/0 md:block" />
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col gap-4 text-center md:text-left">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/5 text-sm font-semibold tracking-[0.35em] text-white/80 md:mx-0">
                {step.detail}
              </div>
              <h3 className="text-xl font-semibold text-white">{step.title}</h3>
              <p className="text-sm text-white/65">{step.description}</p>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden text-emerald-300 md:block" size={18} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;

