'use client';

import type { ReactNode } from 'react';
import { Truck, Repeat2, BadgeCheck, Handshake, Undo2 } from 'lucide-react';

/** Deep burgundy / maroon — matches premium jewellery reference strip */
const WINE = 'text-[#5D2E2E]';
const BORDER = 'border-[#E8DDD4]';

type TrustItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
};

const ITEMS: TrustItem[] = [
  {
    id: 'shipping',
    title: 'Free Shipping',
    subtitle: 'Get 100% Free Shipping',
    icon: <Truck className={`h-8 w-8 ${WINE}`} strokeWidth={1.25} aria-hidden />,
  },
  {
    id: 'exchange',
    title: 'Easy Exchange',
    subtitle: 'Exchange your old designs anytime',
    icon: <Repeat2 className={`h-8 w-8 ${WINE}`} strokeWidth={1.25} aria-hidden />,
  },
  {
    id: 'certified',
    title: 'Certified Jewellery',
    subtitle: '100% Certified Jewellery',
    icon: <BadgeCheck className={`h-8 w-8 ${WINE}`} strokeWidth={1.25} aria-hidden />,
  },
  {
    id: 'service',
    title: 'Lifetime Product Service',
    subtitle: 'Keep your jewellery in top shape',
    icon: <Handshake className={`h-8 w-8 ${WINE}`} strokeWidth={1.25} aria-hidden />,
  },
  {
    id: 'return',
    title: '14 Days Return',
    subtitle: '14 Days Hassle-Free Returns',
    icon: <Undo2 className={`h-8 w-8 ${WINE}`} strokeWidth={1.25} aria-hidden />,
  },
];

/**
 * Five-column trust strip: burgundy typography, vertical dividers, serif titles (reference layout).
 */
export function TrustBadgesStrip() {
  return (
    <section
      className={`w-full border-b ${BORDER} bg-white py-10 md:py-12`}
      aria-label='Trust and service guarantees'>
      <div className='mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8'>
        <div
          className={`flex flex-col divide-y ${BORDER} md:flex-row md:divide-x md:divide-y-0 ${BORDER}`}>
          {ITEMS.map((item) => (
            <div
              key={item.id}
              className='flex flex-1 flex-col items-center justify-center px-4 py-8 text-center md:px-6 md:py-6 lg:px-8'>
              <div className='mb-4 flex items-center justify-center'>{item.icon}</div>
              <h3 className={`font-serif text-lg font-medium tracking-tight sm:text-xl ${WINE}`}>
                {item.title}
              </h3>
              <p className={`mt-2 max-w-[220px] text-sm leading-snug text-neutral-600`}>
                {item.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
