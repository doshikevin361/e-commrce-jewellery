'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { sectionHeadingTitleClassName } from '@/components/home/common/section-header';
import { cn } from '@/lib/utils';

const FAQ_ITEMS = [
  {
    id: 'track',
    question: 'How do I track my order?',
    answer:
      'Once your order ships, you will receive an email or SMS with a tracking link and courier details. You can also check order status from your account under Orders, or contact support with your order number.',
  },
  {
    id: 'returns',
    question: 'What is your return policy?',
    answer:
      'We accept returns within the window stated at checkout for unused items in original packaging with tags intact. Initiate a return from your account or reach out to our team for assistance with the process.',
  },
  {
    id: 'shipping',
    question: 'Do you offer international shipping?',
    answer:
      'Shipping options and delivery areas are shown at checkout. International availability, timelines, and any duties or taxes depend on the destination and are displayed before you pay.',
  },
  {
    id: 'care',
    question: 'How should I care for my jewelry?',
    answer:
      'Store pieces separately to avoid scratches, keep away from moisture and harsh chemicals, and clean gently with a soft cloth. For delicate or stone-set items, follow any care card included with your purchase.',
  },
  {
    id: 'authenticity',
    question: 'How do I know the jewelry is authentic?',
    answer:
      'We source carefully and provide proper certification where applicable for gold and certified stones. Product pages list metal purity and stone details; invoices and certificates ship with eligible orders.',
  },
];

export function HomeFaqSection() {
  return (
    <section className='border-t border-neutral-200/80 bg-[#FAFAF8] py-12 sm:py-14 lg:py-20'>
      <div className='mx-auto max-w-3xl px-4 sm:px-6 lg:px-8'>
        <h2 className={cn(sectionHeadingTitleClassName, 'text-center')}>Frequently Asked Questions</h2>
        <p className='mx-auto mt-3 max-w-xl text-center text-sm text-[#4F3A2E] sm:text-base'>
          Quick answers about orders, shipping, returns, and caring for your pieces.
        </p>

        <Accordion type='single' collapsible className='mt-10 w-full rounded-xl border border-neutral-200/90 bg-white px-2 sm:px-4'>
          {FAQ_ITEMS.map(item => (
            <AccordionItem key={item.id} value={item.id} className='border-neutral-200/90 px-2'>
              <AccordionTrigger className='text-left text-[15px] font-medium text-[#1a1a1a] hover:no-underline sm:text-base'>
                {item.question}
              </AccordionTrigger>
              <AccordionContent className='text-neutral-600 leading-relaxed'>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
