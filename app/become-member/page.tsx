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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt={siteName} className="h-10 w-10 object-contain" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                {siteName.charAt(0)}
              </div>
            )}
            <span className="text-lg font-semibold text-slate-900">
              {siteName}
            </span>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Back to home
          </Link>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14 text-center">
          <div className="inline-flex px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            Join Our Marketplace
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Become a Member
          </h1>

          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Join as a vendor to sell your jewellery or as a B2B retailer to
            source premium products from trusted partners.
          </p>
        </div>
      </section>

      {/* ================= INFO CARDS ================= */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Vendor */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Store className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-slate-900">Vendor</h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Sell your jewellery on our platform. List products, manage orders,
              and grow your reach with a trusted marketplace. Get verified and
              start selling with confidence.
            </p>
          </div>

          {/* B2B */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-slate-900">B2B Retailer</h2>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Buy in bulk from verified vendors. Unlock wholesale pricing, build
              long-term supplier relationships, and streamline your inventory
              sourcing.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid sm:grid-cols-2 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* subtle gradient hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/5 to-transparent transition" />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-primary group-hover:text-white transition mb-4">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h2 className="text-lg font-semibold text-slate-900 mb-1">
                    {card.title}
                  </h2>

                  <p className="text-sm text-slate-600">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer back link */}
        <p className="mt-10 text-center text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-800 transition">
            ← Back to home
          </Link>
        </p>
      </section>
    </div>
  );
}
