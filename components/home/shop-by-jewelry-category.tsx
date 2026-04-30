'use client';

import Image from 'next/image';
import Link from 'next/link';
import { sectionHeadingTitleClassName } from '@/components/home/common/section-header';
import { motion, useReducedMotion } from 'framer-motion';

/** Shared with homepage “products by category” section — keep slugs aligned with `/products?category=`. */
export const JEWELRY_CATEGORIES = [
  {
    name: 'Rings',
    slug: 'rings',
    image: '/uploads/cat1.webp',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    image: '/uploads/cat2.webp',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    image: '/uploads/cat5.webp',
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    image: '/uploads/cat6.webp',
  },
  {
    name: 'Pendants',
    slug: 'pendants',
    image: '/uploads/cat3.webp',
  },
  {
   name: 'Mangalsutras',
   slug: 'mangalsutras',
     image: '/uploads/cat7.webp',
   },
] as const;

export function ShopByJewelryCategory() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion
    ? undefined
    : {
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05,
          },
        },
      };

  const itemVariants = shouldReduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 16, scale: 0.985 },
        visible: { opacity: 1, y: 0, scale: 1 },
      };

  return (
    <section className='w-full py-12 sm:py-14 lg:py-16'>
      <div className='mx-auto max-w-[1440px] px-4 sm:px-6'>
        <header className='mb-10 text-center sm:mb-12'>
          <h2 className={sectionHeadingTitleClassName}>Shop by Jewelry Category</h2>
          <p className='mt-3 font-serif text-base italic text-neutral-500 sm:text-lg'>Jewelry for Every Moment</p>
        </header>

        <motion.div
          className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-5'
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView={shouldReduceMotion ? undefined : 'visible'}
          viewport={{ once: true, amount: 0.25 }}
          variants={containerVariants}
        >
          {JEWELRY_CATEGORIES.map(item => (
            <motion.div
              key={item.slug}
              variants={itemVariants}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/products?category=${encodeURIComponent(item.slug)}`}
                className='group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7F2]'>
                <article className='flex h-full min-h-[220px] flex-col overflow-hidden bg-[#fbf3ec] shadow-sm transition-[border-radius,box-shadow,transform] duration-500 ease-in-out sm:min-h-[60px] lg:min-h-[300px] rounded-xl sm:rounded-2xl group-hover:rounded-[50%] group-hover:shadow-lg group-hover:-translate-y-0.5'>
                  <div className='relative min-h-0 flex-1'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes='(max-width: 640px) 50vw, (max-width: 1024px) 80vw, 36vw'
                      className='object-contain object-center p-3 transition-transform duration-500 group-hover:scale-105 rounded-2xl sm:p-4'
                    />
                  </div>
                  <p className='shrink-0 px-2 pb-4 pt-1 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-neutral-800 sm:text-xs'>
                    {item.name}
                  </p>
                </article>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
