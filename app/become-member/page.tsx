'use client';

import Link from 'next/link';
import { LogIn, UserPlus, Store, Users } from 'lucide-react';
import { useSettings } from '@/components/settings/settings-provider';

const cards = [
  {
    title: 'Vendor Login',
    description: 'Sign in to your vendor account',
    href: '/login',
    icon: LogIn,
  },
  {
    title: 'Become Vendor',
    description: 'Register to sell on our platform',
    href: '/vendor-registration',
    icon: UserPlus,
  },
  {
    title: 'B2B Retailer Login',
    description: 'Sign in to your B2B retailer account',
    href: '/retailer/login',
    icon: LogIn,
  },
  {
    title: 'Become Retailer',
    description: 'Register as B2B retailer from trusted vendors',
    href: '/retailer/register',
    icon: UserPlus,
  },
];

export default function BecomeMemberPage() {
  const { settings } = useSettings();
  const siteName = settings?.siteName || 'Jewel Manas';
  const logo = settings?.logo;

  return (
    <div className="min-h-screen bg-white">
      {/* Simple header with logo */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={siteName} className="h-10 w-10 object-contain" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#001e38] flex items-center justify-center text-white font-bold text-lg">
                {siteName.charAt(0)}
              </div>
            )}
            <span className="text-xl font-semibold text-slate-900">{siteName}</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Become a Member
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Join as a vendor to sell, or as a B2B retailer to buy from trusted vendors.
          </p>
        </div>

        {/* Info about Vendor & B2B */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-slate-700" />
              <h2 className="font-semibold text-slate-900">Vendor</h2>
            </div>
            <p className="text-sm text-slate-600">
              Sell your jewellery on our platform. List products, manage orders, and reach customers. Register once and start selling after approval.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-slate-700" />
              <h2 className="font-semibold text-slate-900">B2B Retailer</h2>
            </div>
            <p className="text-sm text-slate-600">
              Buy in bulk from trusted vendors. Create a B2B account, choose your preferred vendors, and access wholesale pricing. Ideal for shops and resellers.
            </p>
          </div>
        </div>

        {/* CTA cards - simple professional style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border border-slate-200 bg-white text-center hover:border-slate-300 hover:bg-slate-50/50 transition-all duration-200 group"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-slate-200 mb-4">
                  <Icon className="w-6 h-6" />
                </span>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">{card.title}</h2>
                <p className="text-sm text-slate-600">{card.description}</p>
              </Link>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/" className="hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
