'use client';

import Link from 'next/link';
import { BadgeCheck, CheckCircle2, Diamond, ShieldCheck, Sparkles, TrendingUp, UserCheck, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Footer from '@/components/home/footer';

const benefits = [
  {
    icon: TrendingUp,
    title: 'Reach High-Intent Buyers',
    description: 'Showcase your collections to a nationwide audience actively shopping for jewellery.',
  },
  {
    icon: Wallet,
    title: 'Transparent Payouts',
    description: 'Fast, reliable settlements with a clear breakdown of commissions and fees.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Security',
    description: 'Secure transactions, verified orders, and fraud protection built in.',
  },
  {
    icon: Sparkles,
    title: 'Marketing Boost',
    description: 'Promotions, merchandising, and campaigns tailored to increase visibility.',
  },
];

const steps = [
  {
    step: '01',
    title: 'Apply & Get Verified',
    description: 'Share your business details, GSTIN, and documentation for quick approval.',
  },
  {
    step: '02',
    title: 'List Your Jewellery',
    description: 'Upload catalogues, images, and pricing with our guided listing tools.',
  },
  {
    step: '03',
    title: 'Start Selling',
    description: 'Receive orders, manage fulfilment, and track payments from one dashboard.',
  },
];

const requirements = [
  'Valid GSTIN or business registration certificate',
  'Bank account details for payouts',
  'High-quality product images (JPG/PNG)',
  'Accurate product descriptions and pricing',
  'Ability to ship within 2-5 business days',
];

const faqs = [
  {
    question: 'How long does onboarding take?',
    answer: 'Most vendors are approved within 48 hours after submitting complete documents.',
  },
  {
    question: 'Do you provide logistics support?',
    answer: 'Yes. We offer shipping partnerships and discounted rates once you are approved.',
  },
  {
    question: 'How do payouts work?',
    answer: 'Payouts are processed on a fixed cycle with transparent statements for every order.',
  },
  {
    question: 'Can I sell custom jewellery?',
    answer: 'Yes, we support custom and made-to-order listings as long as production timelines are shared.',
  },
];

export default function BecomeVendorPage() {
  return (
    <div className='min-h-screen bg-white'>
      <header className='sticky top-0 z-30 border-b bg-white/90 backdrop-blur'>
        <div className='max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-full bg-[#001e38] text-white flex items-center justify-center'>
              <Diamond className='w-5 h-5' />
            </div>
            <div>
              <p className='text-xs uppercase tracking-[0.3em] text-gray-500'>Partner Program</p>
              <p className='text-lg font-semibold text-[#001e38]'>Become a Vendor</p>
            </div>
          </Link>
          <div className='flex items-center gap-3'>
            <Link href='/login'>
              <Button
                variant='outline'
                className='border-[#001e38] text-[#001e38] hover:text-white hover:bg-gradient-to-br hover:from-slate-700 hover:via-slate-800 hover:to-slate-900'
              >
                Vendor Login
              </Button>
            </Link>
            <Link href='/vendor-registration'>
              <Button className='bg-slate-gradient text-white hover:from-slate-800 hover:via-slate-900 hover:to-slate-950'>
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className='relative overflow-hidden bg-gradient-to-br from-[#001e38] via-[#00345a] to-[#001e38] text-white'>
        <div className='absolute inset-0 opacity-15'>
          <div className='absolute -top-10 -left-10 h-64 w-64 rounded-full bg-white blur-3xl'></div>
          <div className='absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-white blur-3xl'></div>
        </div>
        <div className='max-w-[1440px] mx-auto px-6 py-20 relative z-10 grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center'>
          <div>
            <p className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80'>
              Trusted Jewellery Marketplace
            </p>
            <h1 className='mt-6 text-4xl md:text-6xl font-semibold leading-tight'>
              Grow your jewellery brand with a premium online storefront.
            </h1>
            <p className='mt-5 text-lg text-white/90 max-w-2xl'>
              Reach high-intent customers, access marketing support, and scale with reliable fulfilment and payouts.
            </p>
            <div className='mt-8 flex flex-col sm:flex-row gap-4'>
              <Link href='/vendor-registration'>
                <Button
                  size='lg'
                  className='bg-slate-gradient text-white hover:from-slate-800 hover:via-slate-900 hover:to-slate-950 font-semibold'
                >
                  Apply Now <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </Link>
              <Link href='/contact'>
                <Button size='lg' variant='outline' className='border-white/40 !bg-white/10 text-white hover:bg-white/10'>
                  Talk to Partner Team
                </Button>
              </Link>
            </div>
            <div className='mt-8 grid grid-cols-2 gap-6 text-sm text-white/80'>
              <div className='flex items-center gap-2'>
                <BadgeCheck className='h-4 w-4 text-[#C8A15B]' />
                10K+ curated buyers
              </div>
              <div className='flex items-center gap-2'>
                <BadgeCheck className='h-4 w-4 text-[#C8A15B]' />
                Pan-India delivery
              </div>
              <div className='flex items-center gap-2'>
                <BadgeCheck className='h-4 w-4 text-[#C8A15B]' />
                Dedicated account support
              </div>
              <div className='flex items-center gap-2'>
                <BadgeCheck className='h-4 w-4 text-[#C8A15B]' />
                Seamless dashboard
              </div>
            </div>
          </div>
          <div className='bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur'>
            <h3 className='text-xl font-semibold'>Why top jewellers choose us</h3>
            <div className='mt-6 space-y-4'>
              {[
                'Fast onboarding and verification',
                'Dedicated merchandising support',
                'Reliable logistics partnerships',
                'High-quality brand positioning',
              ].map(item => (
                <div key={item} className='flex items-start gap-3 text-white/90'>
                  <CheckCircle2 className='h-5 w-5 text-[#C8A15B] mt-0.5' />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='py-16 bg-[#f8f7f5]'>
        <div className='max-w-[1440px] mx-auto px-6'>
          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {benefits.map(benefit => (
              <Card key={benefit.title} className='border border-gray-100 shadow-sm hover:shadow-lg transition-shadow'>
                <CardContent className='p-6'>
                  <benefit.icon className='h-10 w-10 text-[#001e38]' />
                  <h3 className='mt-4 text-lg font-semibold text-[#001e38]'>{benefit.title}</h3>
                  <p className='mt-2 text-sm text-gray-600'>{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className='py-16'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='text-center max-w-2xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-semibold text-[#001e38]'>A simple, guided process</h2>
            <p className='mt-3 text-gray-600'>Get onboarded quickly with clear milestones and a dedicated partner success manager.</p>
          </div>
          <div className='mt-12 grid gap-6 md:grid-cols-3'>
            {steps.map(step => (
              <Card key={step.step} className='border border-gray-100 shadow-sm hover:shadow-md transition-shadow'>
                <CardContent className='p-6'>
                  <p className='text-sm font-semibold text-[#C8A15B]'>{step.step}</p>
                  <h3 className='mt-3 text-xl font-semibold text-[#001e38]'>{step.title}</h3>
                  <p className='mt-2 text-sm text-gray-600'>{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className='py-16 bg-[#001e38] text-white'>
        <div className='max-w-[1200px] mx-auto px-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-center'>
          <div>
            <h2 className='text-3xl md:text-4xl font-semibold'>Vendor requirements</h2>
            <p className='mt-3 text-white/80'>Keep these ready to speed up verification and ensure a seamless go-live.</p>
            <div className='mt-6 flex items-center gap-3 text-white/80'>
              <UserCheck className='h-6 w-6 text-[#C8A15B]' />
              Dedicated onboarding support from day one.
            </div>
          </div>
          <Card className='border-0 bg-white/95'>
            <CardContent className='p-6'>
              <ul className='space-y-4 text-gray-700'>
                {requirements.map(item => (
                  <li key={item} className='flex items-start gap-3'>
                    <CheckCircle2 className='h-5 w-5 text-[#001e38] mt-0.5' />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='py-16 bg-[#f8f7f5]'>
        <div className='max-w-[1000px] mx-auto px-6'>
          <div className='text-center max-w-2xl mx-auto'>
            <h2 className='text-3xl md:text-4xl font-semibold text-[#001e38]'>Frequently asked questions</h2>
            <p className='mt-3 text-gray-600'>Everything you need to know before joining us.</p>
          </div>
          <div className='mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-2'>
            <Accordion type='single' collapsible className='w-full'>
              {faqs.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger className='px-4 text-[#001e38]'>{item.question}</AccordionTrigger>
                  <AccordionContent className='px-4 text-gray-600'>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section className='py-20'>
        <div className='max-w-[1200px] mx-auto px-6'>
          <div className='rounded-3xl bg-gradient-to-r from-[#001e38] to-[#00345a] text-white p-10 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-8'>
            <div>
              <h2 className='text-3xl md:text-4xl font-semibold'>Ready to grow with us?</h2>
              <p className='mt-3 text-white/80 max-w-xl'>
                Join a premium marketplace built for jewellery brands and scale with confidence.
              </p>
            </div>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Link href='/vendor-registration'>
                <Button
                  size='lg'
                  className='bg-slate-gradient text-white hover:from-slate-800 hover:via-slate-900 hover:to-slate-950 font-semibold'
                >
                  Start Selling
                </Button>
              </Link>
              <Link href='/contact'>
                <Button size='lg' variant='outline' className='border-white/40 text-white !bg-white/10 hover:bg-white/10'>
                  Schedule a Call
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
