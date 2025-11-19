import React from 'react';
import Link from 'next/link';

const footerLinks = [
  {
    heading: 'Product',
    links: ['Voice', 'Chat', 'Knowledge', 'Automation'],
  },
  {
    heading: 'Company',
    links: ['About', 'Careers', 'Security', 'Contact'],
  },
  {
    heading: 'Resources',
    links: ['Docs', 'Status', 'Guides', 'API'],
  },
];

const NeonFooter = () => {
  return (
    <footer className="relative mt-40 border-t border-white/10 bg-[#000B06] px-4 py-12 text-white/70">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Logo and Description */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center font-semibold text-black">
                EA
              </div>
              <div className="text-sm uppercase tracking-[0.3em] text-white/70">esap.ai</div>
            </div>
            <p className="max-w-sm text-sm text-white/60">
              AI voice and chat agents for operations teams who need reliability, compliance, and speed.
            </p>
            <p className="text-xs text-white/40">© {new Date().getFullYear()} esap.ai. All rights reserved.</p>
          </div>

          {/* Footer Links */}
          <div className="grid flex-1 gap-8 sm:grid-cols-3 md:max-w-2xl">
            {footerLinks.map((section) => (
              <div key={section.heading}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90 mb-4">{section.heading}</p>
                <ul className="space-y-3 text-sm">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-white/60 hover:text-[#13F584] transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NeonFooter;

