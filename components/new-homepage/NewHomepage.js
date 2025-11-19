import React from 'react';
import GlowField from './GlowField';
import NeonNav from './NeonNav';
import Hero from './Hero';
import CapabilitiesGrid from './CapabilitiesGrid';
import VisualFlowShowcase from './VisualFlowShowcase';
import HowItWorks from './HowItWorks';
import BuiltForIndustries from './BuiltForIndustries';
import NeonFooter from './NeonFooter';

const NewHomepage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#000B06]">
      <GlowField />
      <div className="relative z-10 pb-20">
        <NeonNav />
        <Hero />
        <CapabilitiesGrid />
        <VisualFlowShowcase />
        <BuiltForIndustries />
        <HowItWorks />
        <NeonFooter />
      </div>
    </div>
  );
};

export default NewHomepage;

