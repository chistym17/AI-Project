import React from 'react';
import { Plus, Workflow, Settings } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    title: 'Create',
    text: 'Set up your AI agent',
    description: 'Set up your AI agent with a name and description',
    icon: Plus,
  },
  {
    title: 'Design Flows',
    text: 'Create conversation flows',
    description: 'Use the visual editor to create conversation flows',
    icon: Workflow,
  },
  {
    title: 'Deploy and Test',
    text: 'Launch your agent',
    description: 'Launch your agent and start serving customers',
    icon: Settings,
  },
];

const HowItWorks = () => {
  return (
    <section className="relative mx-auto mt-32 w-full bg-[#000B06] px-4 py-20">
      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 flex flex-col items-center gap-4">
          <h2 
            className="text-5xl font-semibold text-center"
            style={{
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 8%, rgba(188, 188, 188, 1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            How It Works
          </h2>
          <p className="max-w-[544px] text-center text-base text-white/70">
            Get your AI agent up and running in minutes
          </p>
        </div>

        {/* Large Nodes with Arrows */}
        <div className="relative flex items-start justify-center gap-12 md:gap-24 min-h-[500px] py-8">
          {/* Node 1 - Create */}
          <div className="relative z-10">
            {(() => {
              const Icon1 = steps[0].icon;
              return (
                <div 
                  className="relative w-[315px] rounded-[32px] p-6 backdrop-blur-[20px] flex flex-col items-center gap-4"
                  style={{
                    background: `
                      linear-gradient(22deg, rgba(19, 245, 132, 0) 58%, rgba(19, 245, 132, 0.2) 100%),
                      linear-gradient(208deg, rgba(19, 245, 132, 0) 90%, rgba(19, 245, 132, 0.2) 100%),
                      rgba(255, 255, 255, 0.03)
                    `,
                  }}
                >
                  {/* Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#13F584] bg-white/5">
                    <Icon1 className="text-white" size={32} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white">{steps[0].title}</h3>
                  
                  {/* One line text */}
                  <p className="text-sm font-medium text-white/90">{steps[0].text}</p>
                  
                  {/* One line description */}
                  <p className="text-sm text-white/70 text-center">
                    {steps[0].description}
                  </p>
                </div>
              );
            })()}
            
            {/* Arrow from Node 1 to Node 2 */}
            <svg
              className="absolute left-full top-[50%] hidden md:block -translate-y-[50%]"
              width="411"
              height="280"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id="arrowhead-green-1"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="#13F584"
                  />
                </marker>
              </defs>
              <path
                d="M 0 140 Q 48 180, 96 220"
                stroke="#13F584"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead-green-1)"
                opacity="0.6"
              />
            </svg>

            {/* Arrow from Node 1 to Node 3 */}
            <svg
              className="absolute left-full top-[50%] hidden md:block -translate-y-[50%]"
              width="507"
              height="200"
              xmlns="http://www.w3.org/2000/svg"
              style={{ pointerEvents: 'none', zIndex: 5 }}
            >
              <defs>
                <marker
                  id="arrowhead-green-2"
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="#13F584"
                  />
                </marker>
              </defs>
              <path
                d="M 0 100 Q 253.5 60, 507 100"
                stroke="#13F584"
                strokeWidth="3"
                fill="none"
                markerEnd="url(#arrowhead-green-2)"
                opacity="0.9"
              />
            </svg>
          </div>

          {/* Node 2 - Design Flows (positioned lower) */}
          <div className="relative z-10 mt-20">
            {(() => {
              const Icon2 = steps[1].icon;
              return (
                <div 
                  className="relative w-[315px] rounded-[32px] p-6 backdrop-blur-[20px] flex flex-col items-center gap-4"
                  style={{
                    background: `
                      linear-gradient(22deg, rgba(19, 245, 132, 0) 58%, rgba(19, 245, 132, 0.2) 100%),
                      linear-gradient(208deg, rgba(19, 245, 132, 0) 90%, rgba(19, 245, 132, 0.2) 100%),
                      rgba(255, 255, 255, 0.03)
                    `,
                  }}
                >
                  {/* Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#13F584] bg-white/5">
                    <Icon2 className="text-white" size={32} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white">{steps[1].title}</h3>
                  
                  {/* One line text */}
                  <p className="text-sm font-medium text-white/90">{steps[1].text}</p>
                  
                  {/* One line description */}
                  <p className="text-sm text-white/70 text-center">
                    {steps[1].description}
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Node 3 - Deploy and Test */}
          <div className="relative z-10">
            {(() => {
              const Icon3 = steps[2].icon;
              return (
                <div 
                  className="relative w-[315px] rounded-[32px] p-6 backdrop-blur-[20px] flex flex-col items-center gap-4"
                  style={{
                    background: `
                      linear-gradient(22deg, rgba(19, 245, 132, 0) 58%, rgba(19, 245, 132, 0.2) 100%),
                      linear-gradient(208deg, rgba(19, 245, 132, 0) 90%, rgba(19, 245, 132, 0.2) 100%),
                      rgba(255, 255, 255, 0.03)
                    `,
                  }}
                >
                  {/* Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#13F584] bg-white/5">
                    <Icon3 className="text-white" size={32} />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-white">{steps[2].title}</h3>
                  
                  {/* One line text */}
                  <p className="text-sm font-medium text-white/90">{steps[2].text}</p>
                  
                  {/* One line description */}
                  <p className="text-sm text-white/70 text-center">
                    {steps[2].description}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/assistants"
            className="inline-flex items-center justify-center rounded-full bg-[#13F584] px-8 py-3 text-base font-semibold text-black transition-all hover:bg-[#11e077] hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
