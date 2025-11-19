import React from 'react';
import { Plus, Workflow, Settings } from 'lucide-react';

const nodes = [
  {
    title: 'Create',
    icon: Plus,
  },
  {
    title: 'Design Flows',
    icon: Workflow,
  },
  {
    title: 'Deploy and Test',
    icon: Settings,
  },
];

const VisualFlowShowcase = () => {
  return (
    <section className="relative mx-auto mt-32 w-full overflow-hidden bg-[#000B06] px-4 py-20">
      {/* Glowing gradient from left fading in middle - only reaches first box */}
      <div 
        className="absolute left-0 top-0 h-full opacity-40"
        style={{
          width: '25%',
          background: 'linear-gradient(90deg, rgba(19, 245, 132, 0.2) 0%, rgba(19, 245, 132, 0) 100%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Background Effects */}
      <div className="absolute inset-0 opacity-50">
        {/* Polygon blur effect */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: '1070px',
            height: '1059px',
            background: 'radial-gradient(circle, rgba(19, 245, 132, 0.5) 0%, transparent 70%)',
            filter: 'blur(304px)',
          }}
        />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 322px, rgba(19, 245, 132, 0.05) 322px, rgba(19, 245, 132, 0.05) 323px),
              repeating-linear-gradient(90deg, transparent, transparent 385px, rgba(19, 245, 132, 0.05) 385px, rgba(19, 245, 132, 0.05) 386px)
            `,
            backgroundPosition: '396px 277px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl">
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
            Visual Flow Editor
          </h2>
          <p className="max-w-[544px] text-center text-base text-white/70">
            Design sophisticated conversation flows without writing code
          </p>
        </div>

        {/* Nodes with connectors */}
        <div className="relative flex items-center justify-center gap-12">
          {nodes.map((node, index) => (
            <React.Fragment key={node.title}>
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-[#13F584] shadow-[0_0_20px_rgba(19,245,132,0.3)]">
                  <node.icon className="text-white" size={40} />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <h3 className="text-sm font-semibold text-white">{node.title}</h3>
                </div>
              </div>
              {index < nodes.length - 1 && (
                <div className="h-px w-40 bg-white/30" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VisualFlowShowcase;

