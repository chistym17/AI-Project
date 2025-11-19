import React from 'react';
import { Bot, Headphones, Mic } from 'lucide-react';

const cards = [
  {
    title: 'Voice Concierge',
    subtitle: 'Answer calls, route intents, and collect structured data.',
    icon: Mic,
  },
  {
    title: 'Chat Automation',
    subtitle: 'Embed on your site for instant pre-sales and support.',
    icon: Bot,
  },
  {
    title: 'Live Assist',
    subtitle: 'Blend AI + humans with seamless handoffs and notes.',
    icon: Headphones,
  },
];

const AgentShowcase = () => {
  return (
    <section className="relative mx-auto mt-32 flex max-w-5xl flex-col gap-10 px-4 lg:flex-row">
      <div className="flex-1 space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-emerald-300/70">How it works</p>
        <h2 className="text-4xl font-semibold text-white">Composable agent cards</h2>
        <p className="text-base text-white/70">
          Each card mirrors the glass panels and thin strokes from the Figma board, including the connectors and neon outlines.
        </p>
      </div>
      <div className="flex flex-1 flex-col gap-6">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/0 p-6 shadow-[0_25px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
          >
            <div className="absolute -right-4 top-4 hidden h-24 w-24 rounded-full border border-dashed border-emerald-300/70 opacity-40 lg:block" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <card.icon size={26} />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">0{index + 1}</p>
                <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                <p className="text-sm text-white/65">{card.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AgentShowcase;

