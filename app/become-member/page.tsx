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
 <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#ffffff,_#f8f6f2_60%,_#ffffff)] text-slate-800">

  {/* ========= LUXURY BACKGROUND GLOW ========= */}
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
    <div className="absolute bottom-[-100px] right-[-80px] h-[350px] w-[350px] rounded-full bg-amber-400/10 blur-[120px]" />
  </div>

  {/* ================= HEADER ================= */}
  <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-[#ece7df]">
    <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">

      <Link href="/" className="flex items-center gap-3 group">
        {logo ? (
          <img src={logo} alt={siteName} className="h-10 w-10 object-contain" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-white font-semibold shadow-md">
            {siteName.charAt(0)}
          </div>
        )}

        <span className="text-lg font-semibold tracking-wide text-slate-900 group-hover:text-primary transition">
          {siteName}
        </span>
      </Link>

      <Link
        href="/"
        className="text-sm font-medium text-slate-500 hover:text-primary transition"
      >
        Back to home
      </Link>
    </div>
  </header>

  {/* ================= HERO ================= */}
  <section className="relative">
    <div className="max-w-5xl mx-auto px-5 py-14 sm:py-20 text-center">

      {/* premium badge */}
      <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 to-primary/10 text-primary text-xs font-semibold mb-6 shadow-sm backdrop-blur">
        ✨ Exclusive Marketplace Access
      </div>

      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
        Become a Member
      </h1>

      <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
        Join as a vendor to sell your jewellery or as a B2B retailer to source
        premium collections from trusted partners.
      </p>
    </div>
  </section>

  {/* ================= INFO CARDS ================= */}
  <section className="max-w-5xl mx-auto px-5">
    <div className="grid md:grid-cols-2 gap-7 mb-14">

      {/* Vendor */}
      <div className="group relative rounded-2xl border border-[#ece7df] bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 p-7">

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-amber-400/10 to-transparent rounded-2xl transition" />

        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400/15 to-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
            <Store className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 tracking-wide">Vendor</h2>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Sell your jewellery on our platform. List products, manage orders,
          and grow your reach with a trusted marketplace. Get verified and
          start selling with confidence.
        </p>
      </div>

      {/* B2B */}
      <div className="group relative rounded-2xl border border-[#ece7df] bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-[0_15px_45px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 p-7">

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-amber-400/10 to-transparent rounded-2xl transition" />

        <div className="relative z-10 flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400/15 to-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 tracking-wide">
            B2B Retailer
          </h2>
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
  <section className="max-w-5xl mx-auto px-5 pb-16">
    <div className="grid sm:grid-cols-2 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.href}
            href={card.href}
            className="group relative overflow-hidden rounded-2xl border border-[#ece7df] bg-white shadow-sm hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* premium hover glow */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-amber-400/10 via-primary/10 to-transparent transition duration-300" />

            <div className="relative z-10 flex flex-col items-center p-8 text-center">

              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-primary group-hover:text-white transition mb-4 shadow-sm">
                <Icon className="w-6 h-6" />
              </div>

              <h2 className="text-lg font-semibold text-slate-900 mb-1 tracking-wide group-hover:text-primary transition">
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

    {/* Footer */}
    <p className="mt-14 text-center text-sm text-slate-500">
      <Link href="/" className="hover:text-primary transition">
        ← Back to home
      </Link>
    </p>
  </section>
</div>
  );
}
