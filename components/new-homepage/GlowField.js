import React from 'react';

const GlowField = () => {
  return (
    <div className="pointer-events-none absolute right-0 top-0 h-screen w-[60%] overflow-hidden">
      <div className="absolute right-[-220px] top-[-260px] h-[900px] w-[640px]">
        <div className="absolute inset-0 rounded-full bg-[rgba(19,245,132,0.22)] blur-[200px]" />

        <div
          className="absolute inset-0 opacity-65"
          style={{
            maskImage: 'radial-gradient(circle at 85% 15%, rgba(0,0,0,0.95) 25%, transparent 60%)',
            WebkitMaskImage: 'radial-gradient(circle at 85% 15%, rgba(0,0,0,0.95) 25%, transparent 60%)',
            backgroundImage:
              'conic-gradient(from -28deg at 75% 0%, rgba(19,245,132,0.65) 0deg, rgba(19,245,132,0.4) 18deg, transparent 55deg, transparent 360deg)',
          }}
        />

        <div
          className="absolute left-[-40px] top-[40px] h-[720px] w-[480px] opacity-55"
          style={{
            backgroundImage:
              'conic-gradient(from -60deg at 92% 12%, rgba(19,245,132,0.4) 0deg, rgba(19,245,132,0.15) 20deg, transparent 70deg)',
            filter: 'blur(25px)',
          }}
        />

        <div
          className="absolute left-[-10px] top-[120px] h-[640px] w-[420px] opacity-45"
          style={{
            backgroundImage:
              'conic-gradient(from -75deg at 90% 8%, rgba(19,245,132,0.38) 0deg, rgba(19,245,132,0.08) 30deg, transparent 80deg)',
            filter: 'blur(45px)',
          }}
        />

        <div
          className="absolute left-[-80px] top-[220px] h-[600px] w-[420px] opacity-35"
          style={{
            backgroundImage:
              'conic-gradient(from -88deg at 88% 5%, rgba(19,245,132,0.28) 0deg, rgba(19,245,132,0.03) 40deg, transparent 100deg)',
            filter: 'blur(60px)',
          }}
        />

        <div
          className="absolute left-[-50px] top-[200px] h-[540px] w-[380px] opacity-35"
          style={{
            mixBlendMode: 'screen',
            backgroundImage:
              'repeating-linear-gradient(120deg, rgba(19,245,132,0.45) 0px, rgba(19,245,132,0.45) 14px, transparent 14px, transparent 42px)',
            transform: 'skewX(-6deg)',
            filter: 'blur(22px)',
            maskImage: 'linear-gradient(115deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.3) 70%, transparent)',
            WebkitMaskImage:
              'linear-gradient(115deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.3) 70%, transparent)',
          }}
        />

        <div
          className="absolute left-[-10px] top-[80px] h-[480px] w-[320px] opacity-25"
          style={{
            mixBlendMode: 'screen',
            backgroundImage:
              'repeating-conic-gradient(from -30deg, rgba(19,245,132,0.55) 0deg 6deg, transparent 6deg 16deg)',
            filter: 'blur(35px)',
            maskImage: 'radial-gradient(circle at 75% 0%, rgba(0,0,0,1) 35%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at 75% 0%, rgba(0,0,0,1) 35%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
};

export default GlowField;

