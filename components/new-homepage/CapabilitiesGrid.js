import React from 'react';
import { Workflow, FileText, Plug, Mic, MessageSquare, Wrench } from 'lucide-react';

const cards = [
  {
    title: 'Visual Flow',
    description: 'Design sophisticated conversation flows without writing code',
    icon: Workflow,
  },
  {
    title: 'Text Flow',
    description: 'Build text-based interactions with natural language processing',
    icon: FileText,
  },
  {
    title: 'Integrations',
    description: 'Seamlessly connect with APIs, databases, and third-party services',
    icon: Plug,
  },
  {
    title: 'Voice Agent',
    description: 'Enable natural voice interactions with advanced speech recognition',
    icon: Mic,
  },
  {
    title: 'Chat Agent',
    description: 'Provide instant responses through conversational AI interfaces',
    icon: MessageSquare,
  },
  {
    title: 'Custom Tools',
    description: 'Build and configure custom functions tailored to your needs',
    icon: Wrench,
  },
];

const CapabilitiesGrid = () => {
  return (
    <section id="product" className="relative z-10 mx-auto mt-32 max-w-7xl px-4">
      <div className="flex flex-col items-center gap-4 mb-12">
        <h2 
          className="text-5xl font-semibold text-center"
          style={{
            background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 8%, rgba(188, 188, 188, 1) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Everything You Need
        </h2>
        <p className="text-base text-white/70 text-center max-w-[544px]">
          Build, configure, and deploy AI agents with our comprehensive platform
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.slice(0, 3).map((card) => (
            <div
              key={card.title}
              className="relative rounded-[32px] backdrop-blur-[20px] border border-white/20"
              style={{
                background: `
                  linear-gradient(22deg, rgba(19, 245, 132, 0) 58%, rgba(19, 245, 132, 0.4) 100%),
                  linear-gradient(208deg, rgba(19, 245, 132, 0) 90%, rgba(19, 245, 132, 0.4) 100%),
                  rgba(255, 255, 255, 0.03)
                `,
              }}
            >
              <div className="flex flex-col gap-5 py-8 px-6 min-h-[180px]">
                <div className="flex items-center justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/10">
                    <card.icon className="text-white" size={32} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.slice(3, 6).map((card) => (
            <div
              key={card.title}
              className="relative rounded-[32px] backdrop-blur-[20px] border border-white/20"
              style={{
                background: `
                  linear-gradient(22deg, rgba(19, 245, 132, 0) 58%, rgba(19, 245, 132, 0.4) 100%),
                  linear-gradient(208deg, rgba(19, 245, 132, 0) 90%, rgba(19, 245, 132, 0.4) 100%),
                  rgba(255, 255, 255, 0.03)
                `,
              }}
            >
              <div className="flex flex-col gap-5 py-8 px-6 min-h-[180px]">
                <div className="flex items-center justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-white/10">
                    <card.icon className="text-white" size={32} />
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesGrid;
