import React from 'react';
import { UtensilsCrossed, Heart, DollarSign, ShoppingBag, GraduationCap, Hotel, Home, Car } from 'lucide-react';
import Link from 'next/link';

const industries = [
  { 
    title: 'Restaurants', 
    subtitle: 'Orders & Reservations',
    icon: UtensilsCrossed,
  },
  { 
    title: 'Healthcare', 
    subtitle: 'Appointments & FAQs',
    icon: Heart,
  },
  { 
    title: 'Finance', 
    subtitle: 'Account Queries',
    icon: DollarSign,
  },
  { 
    title: 'Retail', 
    subtitle: 'Product Support',
    icon: ShoppingBag,
  },
  { 
    title: 'Education', 
    subtitle: 'Student Services',
    icon: GraduationCap,
  },
  { 
    title: 'Hospitality', 
    subtitle: 'Booking & Info',
    icon: Hotel,
  },
  { 
    title: 'Real Estate', 
    subtitle: 'Property Inquiries',
    icon: Home,
  },
  { 
    title: 'Automotive', 
    subtitle: 'Service Scheduling',
    icon: Car,
  },
];

// Grid Background Wrapper Component - applies grid ONLY to this container
const GridBackgroundWrapper = ({ children }) => {
  return (
    <div
      className="max-w-6xl mx-auto rounded-xl p-8 md:p-12"
      style={{
        backgroundImage: `
          linear-gradient(rgba(19, 245, 132, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(19, 245, 132, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    >
      {children}
    </div>
  );
};

// Industry Card Component
const IndustryCard = ({ industry }) => {
  return (
    <div className="group relative rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#13F584]/40 hover:shadow-[0_0_20px_rgba(19,245,132,0.2)]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#13F584]/20 to-[#13F584]/5 text-[#13F584] transition-transform duration-300 group-hover:scale-110">
          <industry.icon size={24} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-white">{industry.title}</h3>
          <p className="text-xs text-white/60">{industry.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// Industries Grid Component - simple 4x2 grid
const IndustriesGrid = () => {
  return (
    <div className="grid grid-cols-4 gap-6">
      {industries.map((industry) => (
        <IndustryCard key={industry.title} industry={industry} />
      ))}
    </div>
  );
};

// Main Component
const BuiltForIndustries = () => {
  return (
    <section className="w-full bg-[#000B06] py-20">
      <GridBackgroundWrapper>
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4">
          <h2 
            className="text-5xl font-semibold text-center"
            style={{
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 8%, rgba(188, 188, 188, 1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Built for Every Industry
          </h2>
          <p className="max-w-[544px] text-center text-base text-white/70">
            Customize AI agents for your specific business needs
          </p>
        </div>

        {/* Industries Grid */}
        <IndustriesGrid />

        {/* CTA Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/assistants"
            className="inline-flex items-center justify-center rounded-full bg-[#13F584] px-8 py-3 text-base font-semibold text-black transition-all hover:bg-[#11e077] hover:scale-105"
          >
            Get Start
          </Link>
        </div>
      </GridBackgroundWrapper>
    </section>
  );
};

export default BuiltForIndustries;
