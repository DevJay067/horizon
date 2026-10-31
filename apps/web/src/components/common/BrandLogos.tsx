import React from 'react';

const LOGO_ITEMS = [
  {
    name: 'Falcons',
    icon: (
      <svg className="w-4 h-4 fill-current text-[#0A0A0A]" viewBox="0 0 24 24">
        <path d="M12 2L2 9l3 2.5L12 6.5l7 5L22 9 12 2zm-8 9.5l8 4.5 8-4.5v3l-8 4.5-8-4.5v-3zm0 5l8 4.5 8-4.5v2l-8 4.5-8-4.5v-2z" />
      </svg>
    ),
  },
  {
    name: 'MST',
    icon: (
      <svg className="w-4 h-4 stroke-current fill-none text-[#0A0A0A]" viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4" />
      </svg>
    ),
  },
  {
    name: 'MST Academy',
    icon: (
      <svg className="w-4 h-4 stroke-current fill-none text-[#0A0A0A]" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

export const BrandLogos: React.FC<{ className?: string }> = ({ className = '' }) => {
  // Duplicate 4 times to create an infinite, seamless horizontal marquee loop
  const repeatedItems = [...LOGO_ITEMS, ...LOGO_ITEMS, ...LOGO_ITEMS, ...LOGO_ITEMS];

  return (
    <div className={`relative w-full max-w-5xl mx-auto overflow-hidden py-2 select-none group ${className}`}>
      {/* Edge gradient fades for seamless entry/exit */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-[#FAFAF9] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-[#FAFAF9] to-transparent z-10 pointer-events-none" />

      {/* Smooth Marquee Track */}
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] items-center gap-10 sm:gap-16">
        {repeatedItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center gap-3 font-sans font-medium text-xs tracking-tight text-[#0A0A0A] hover:text-black transition-colors cursor-default whitespace-nowrap"
          >
            <span className="flex-shrink-0 transition-transform group-hover:scale-105">{item.icon}</span>
            <span className="font-semibold text-sm tracking-tight text-[#0A0A0A]">{item.name}</span>
            {/* Subtle separator dot */}
            <span className="w-1 h-1 rounded-full bg-[#D4D4D4] ml-6 sm:ml-10" />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes hzMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: hzMarquee 24s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandLogos;
