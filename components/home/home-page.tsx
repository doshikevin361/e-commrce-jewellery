'use client';

import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Grid2x2CheckIcon, ShoppingCart, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { blogCards, categories, images, navLinks } from '@/app/utils/dummyData';
import { Navigation } from 'swiper/modules';
import { Diamond, Gem, Link2, CircleDot, Sparkles } from 'lucide-react';
import { useState } from 'react';

const sidebarCategories = [
  'Rings',
  'Necklace',
  'Earring',
  'Bracelet',
  'Brooch',
  'Gold Jewellery',
  'Cufflink',
  'Pearls',
  'Piercing',
  'Platinum',
  'Navratna',
  'Chain',
];

const categoryIcons: Record<string, JSX.Element> = {
  Rings: <Diamond size={18} />,
  Necklace: <Gem size={18} />,
  Earring: <CircleDot size={18} />,
  Bracelet: <Link2 size={18} />,
  Brooch: <Sparkles size={18} />,
  'Gold Jewellery': <Diamond size={18} />,
  Cufflink: <Link2 size={18} />,
  Pearls: <Gem size={18} />,
  Piercing: <CircleDot size={18} />,
  Platinum: <Diamond size={18} />,
  Navratna: <Gem size={18} />,
  Chain: <Link2 size={18} />,
};

const featuredProducts = [
  {
    id: 1,
    title: 'Carat Solitaire Diamond',
    category: 'Brooch',
    price: '$165.00',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    badge: 'Sale',
  },
  {
    id: 2,
    title: 'Pear-Shaped Black Ring',
    category: 'Ring',
    price: '$182.00',
    rating: 5,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    title: "Women's Bijou Ear Drops",
    category: 'Earrings',
    price: '$156.00',
    rating: 4.8,
    reviews: 77,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    title: 'Luxe Gold Necklace',
    category: 'Necklace',
    price: '$215.00',
    rating: 4.9,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    title: 'Vintage Citrine Bracelet',
    category: 'Bracelet',
    price: '$205.00',
    rating: 4.7,
    reviews: 81,
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
  },
];

type Product = (typeof featuredProducts)[number];

export const HomePage = () => (
  <div className='mx-auto flex flex-col gap-10 px-4 md:px-6 lg:px-0'>
    <Hero />
    <CategoryStrip />
    <FeaturedSlider />
    <PromoShowcase />
    <TrendingProducts />
    <Collections />
    <Updates />
    <Gallery />
    <Subscribe />
  </div>
);

const Hero = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <nav className='w-full bg-[#1F3B29] text-white'>
        <div className='mx-auto flex w-full max-w-full items-center justify-between px-4 py-5 md:px-6 lg:max-w-7xl lg:px-0'>
          <div className='flex items-center gap-8'>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className='flex w-[270px] items-center gap-2' aria-label='Categories'>
              <Grid2x2CheckIcon size={18} />
              Categories
            </button>

            <ul className='hidden items-center gap-8 text-sm md:flex'>
              {navLinks.map(link => (
                <li key={link} className='cursor-pointer hover:text-gray-200'>
                  {link}
                </li>
              ))}
            </ul>
          </div>

          <button className='text-sm hover:text-gray-200'>Contact Us</button>
        </div>
      </nav>

      <section
        className={`mx-auto grid max-w-[1280px] gap-6 transition-all duration-500 ${
          sidebarOpen ? 'lg:grid-cols-[260px_minmax(0,1fr)]' : 'lg:grid-cols-[0px_minmax(0,1fr)]'
        }`}>
        <aside
          className={`overflow-hidden rounded-2xl border border-[#E6D3C2]/50 bg-white px-5 py-6 shadow-lg transition-all duration-500 ${
            sidebarOpen ? 'w-[260px] opacity-100' : 'w-0 px-0 py-0 opacity-0'
          }`}>
          {sidebarOpen && (
            <>
              <p className='mb-4 text-sm font-semibold tracking-[0.2em] text-[#1F3B29]'>Categories</p>
              <ul className='space-y-3 text-sm font-semibold text-[#1C1F1A]'>
                {sidebarCategories.map(category => (
                  <li key={category} className='flex items-center justify-between rounded-2xl px-1 py-2 hover:bg-[#F5EEE5]/60'>
                    <div className='flex items-center gap-2 text-[#3F5C45]'>
                      {categoryIcons[category]}
                      <span>{category}</span>
                    </div>
                    <ChevronRight size={16} className='text-[#3F5C45]' />
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        <div className='grid w-full gap-6 md:grid-cols-[1.65fr_0.9fr]'>
          <div className='relative flex flex-col justify-center overflow-hidden rounded-2xl px-10 py-12 text-white shadow-lg'>
            <Image
              src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
              alt='hero bg'
              fill
              className='object-cover'
            />
            <div className='absolute inset-0 bg-black/40' />
            <div className='relative grid gap-10 lg:grid-cols-[1fr_360px] lg:items-center'>
              <div className='space-y-6'>
                <p className='text-sm uppercase tracking-[0.3em] text-white/70'>Where Luxury</p>
                <h1 className='text-4xl font-semibold leading-tight md:text-5xl'>Meets Affordability</h1>
                <p className='max-w-md text-white/80'>Exquisite, handcrafted jewelry that celebrates elegance and individuality.</p>
                <button className='inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 font-semibold text-[#1F3B29] shadow'>
                  Shop Now
                  <ShoppingCart size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className='relative flex flex-col justify-end overflow-hidden rounded-2xl px-8 py-10 shadow-md'>
            <Image
              src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80'
              alt='flash sale'
              fill
              className='object-cover'
            />
            <div className='absolute inset-0 bg-black/40' />
            <div className='relative z-10'>
              <p className='text-xs uppercase tracking-[0.25em] text-white/80'>Gold Pricing</p>
              <h2 className='mt-2 text-3xl font-semibold text-white'>Flash Sale</h2>
              <p className='mt-2 text-sm text-white/80'>2 March – 15 March</p>
              <button className='mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white'>
                See more products
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const CategoryStrip = () => (
  <section className='mx-auto w-full max-w-[1280px] py-10'>
    <Swiper
      spaceBetween={20}
      slidesPerView={3}
      breakpoints={{
        640: { slidesPerView: 3 },
        768: { slidesPerView: 3 },
        1024: { slidesPerView: 5 },
      }}>
      {categories.map(item => (
        <SwiperSlide key={item.name}>
          <div className='flex flex-col items-center text-center'>
            <div className='flex h-24 w-52 items-center justify-center overflow-hidden rounded-full bg-white'>
              <img src={item.img} alt={item.name} className='object-contain' />
            </div>
            <p className='mt-3 text-[16px] font-medium text-[#1C1F1A]'>{item.name}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

const FeaturedSlider = () => (
  <section className='mx-auto max-w-[1280px] space-y-6 bg-white'>
    <div className='flex flex-wrap items-end justify-between gap-6 border-b border-[#E6D3C2] pb-3'>
      <p className='text-2xl font-semibold text-[#1F3B29]'>New Products</p>
      <div className='flex items-center gap-4 text-[#1F3B29]'>
        <div className='flex gap-3'>
          <button className='prev-btn flex h-8 w-8 items-center justify-center rounded-full border border-[#E6D3C2] bg-white shadow-sm hover:bg-[#FDFBF7]'>
            <ChevronLeft size={20} />
          </button>
          <button className='next-btn flex h-8 w-8 items-center justify-center rounded-full border border-[#E6D3C2] bg-white shadow-sm hover:bg-[#FDFBF7]'>
            <ChevronRight size={20} />
          </button>
        </div>
        <button className='flex items-center gap-2 text-sm font-semibold text-[#1F3B29]'>
          View all
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
    <Swiper
      modules={[Navigation]}
      navigation={{
        nextEl: '.next-btn',
        prevEl: '.prev-btn',
      }}
      spaceBetween={20}
      slidesPerView='auto'
      grabCursor
      className='pb-4'>
      {featuredProducts.map(product => (
        <SwiperSlide key={product.id} style={{ width: 'auto' }}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

const TrendingProducts = () => (
  <section className='mx-auto max-w-[1280px] space-y-6'>
    <div className='flex flex-wrap items-end justify-between gap-4 border-b border-[#E6D3C2] pb-3'>
      <p className='text-2xl font-semibold text-[#1F3B29]'>Trending Products</p>
      <button className='flex items-center gap-2 text-sm font-semibold text-[#1F3B29]'>
        View all
        <ChevronRight size={18} />
      </button>
    </div>
    <Swiper spaceBetween={20} slidesPerView='auto' grabCursor className='pb-4'>
      {featuredProducts.map(product => (
        <SwiperSlide key={product.id} style={{ width: 'auto' }}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

const ProductCard = ({ product }: { product: Product }) => (
  <article className='flex min-w-[260px] max-w-[400px] snap-start flex-col rounded-2xl border border-[#E6D3C2]/70 bg-white p-4'>
    <div className='relative h-52 w-full overflow-hidden rounded-3xl'>
      {product.badge && (
        <span className='absolute left-4 top-4 rounded-full bg-[#C8A15B] px-3 py-1 text-xs font-semibold text-white'>{product.badge}</span>
      )}
      <Image src={product.image} alt={product.title} fill sizes='(max-width: 768px) 90vw, 280px' className='object-cover' />
    </div>
    <div className='mt-4 space-y-2'>
      <p className='text-xs uppercase tracking-[0.3em] text-[#3F5C45]'>{product.category}</p>
      <h3 className='text-[18px] font-bold text-[#1F3B29]'>{product.title}</h3>
      <div className='flex items-center gap-2 text-sm text-[#E6D3C2]'>
        <Star className='fill-[#C8A15B] text-[#C8A15B]' size={16} />
        <span className='font-semibold text-[#1C1F1A]'>{product.rating.toFixed(1)}</span>
        <span className='text-[#1C1F1A]/60'>({product.reviews})</span>
      </div>
      <div className='flex items-center justify-between'>
        <p className='text-lg font-semibold text-[#1F3B29]'>{product.price}</p>
        <button className='rounded-full border border-[#1F3B29]/30 px-4 py-2 text-sm font-semibold text-[#1F3B29] transition hover:bg-[#1F3B29] hover:text-white'>
          Add to cart
        </button>
      </div>
    </div>
  </article>
);

const PromoShowcase = () => (
  <section className='mx-auto mt-5 w-full max-w-[1280px] rounded-xl bg-[#F3F5F7] p-6 md:p-10'>
    <div className='grid items-center gap-10 md:grid-cols-2'>
      <div className='flex gap-5'>
        <img
          src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
          alt='Model 1'
          className='h-64 w-1/2 rounded-2xl object-cover md:h-[420px]'
        />
        <img
          src='https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80'
          alt='Model 2'
          className='mt-[72px] h-64 w-1/2 rounded-2xl object-cover md:h-[350px]'
        />
      </div>

      <div>
        <h2 className='text-3xl font-semibold leading-snug text-[#1F3B29] md:text-4xl'>
          Collection inspired <br /> by LuxeLoom
        </h2>

        <p className='mt-4 text-sm leading-relaxed text-[#4F3A2E] md:text-base'>
          These adornments are worn around the neck and come in various lengths. These adornments are worn around the neck and come in
          various lengths.
        </p>

        <button className='mt-6 rounded-full bg-[#1F3B29] px-6 py-2 text-sm text-white transition hover:bg-[#16301F]'>Explore More</button>
      </div>
    </div>
  </section>
);

const Collections = () => (
  <section className='mx-auto w-full max-w-[1280px] py-10'>
    <div className='mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#E6D3C2] pb-3'>
      <p className='text-2xl font-semibold text-[#1F3B29]'>Curated Collections</p>
      <button className='flex items-center gap-2 text-sm font-semibold text-[#1F3B29]'>
        View all
        <ChevronRight size={18} />
      </button>
    </div>

    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
      <div className='flex flex-col items-center gap-6 rounded-2xl bg-[#F3F5F7] p-6 md:flex-row'>
        <img
          src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80'
          className='h-full w-full rounded-xl object-cover md:w-1/2'
          alt='Earrings'
        />

        <div className='flex flex-col justify-center'>
          <h3 className='text-3xl font-semibold text-[#1C1F1A]'>
            Ancient jewelry <br /> collection
          </h3>
          <p className='mt-3 text-[#4F3A2E]'>Beautiful long earrings with opal and carnelian stones—lightweight and radiant.</p>

          <button className='mt-5 flex w-fit items-center gap-2 rounded-full bg-[#1F3B29] px-5 py-2 text-white'>Explore more </button>
        </div>
      </div>

      <div className='flex flex-col gap-6 rounded-2xl bg-[#F3F5F7] p-6'>
        <div>
          <h3 className='text-2xl font-semibold text-[#1C1F1A]'>Ancient jewelry collection</h3>
          <p className='mt-2 text-[#4F3A2E]'>Beautiful long earrings with opal and carnelian stones—lightweight and radiant.</p>

          <button className='mt-4 flex w-fit items-center gap-2 rounded-full bg-[#1F3B29] px-5 py-2 text-white'>Shop Now</button>
        </div>

        <img
          src='https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80'
          className='h-64 w-full rounded-xl object-cover'
          alt='Woman with earring'
        />
      </div>
    </div>
  </section>
);

const Updates = () => (
  <section className='mx-auto max-w-[1280px]'>
    <div className='flex flex-wrap items-end justify-between gap-4 border-b border-[#E6D3C2] pb-3'>
      <p className='text-2xl font-semibold text-[#1F3B29]'>Updates</p>
      <button className='flex items-center gap-2 text-sm font-semibold text-[#1F3B29]'>
        View all
        <ChevronRight size={18} />
      </button>
    </div>
    <div className='grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3'>
      {blogCards.map(card => (
        <div key={card.id} className='rounded-3xl border border-[#E6D3C2]/60 bg-[#F3F5F7] p-4 shadow-sm'>
          <img src={card.img} alt={card.title} className='h-60 w-full rounded-2xl object-cover' />

          <div className='mt-4 text-[#1C1F1A]'>
            <p className='text-sm text-[#4F3A2E]'>
              {card.category} &nbsp; | &nbsp; {card.date}
            </p>

            <h3 className='mt-2 text-lg font-semibold'>{card.title}</h3>

            <p className='mt-2 text-sm text-[#4F3A2E]'>{card.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Gallery = () => (
  <section className='mx-auto w-full max-w-[1280px] px-4 py-12 sm:px-6 lg:px-0'>
    <h2 className='mb-10 text-center text-3xl font-semibold text-[#1F3B29]'>Gallery</h2>

    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      {images.map((src, index) => (
        <div key={src} className={`overflow-hidden rounded-xl shadow-sm ${index === 3 ? 'md:row-span-2' : ''}`}>
          <img src={src} className='h-64 w-full object-cover' alt='' />
        </div>
      ))}
    </div>
  </section>
);

const Subscribe = () => (
  <section
    className='relative bg-cover bg-center bg-no-repeat py-36'
    style={{
      backgroundImage: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80')",
    }}>
    <div className='absolute inset-0 bg-black/20' />

    <div className='relative mx-auto max-w-4xl px-4 text-center text-white sm:px-6 lg:px-8'>
      <h3 className='mb-6 text-3xl'>Stay Informed with Our</h3>

      <p className='mb-10 text-4xl font-light'>Latest News and Updates</p>

      <div className='flex w-full items-center rounded-full border border-white/50 bg-white/90 px-4 py-2 text-left shadow-sm'>
        <input
          type='text'
          placeholder='Enter Your Email'
          className='flex-1 bg-transparent p-2 text-sm text-[#1F3B29] placeholder:text-[#4F3A2E] focus:outline-none'
        />

        <button className='ml-3 flex h-[50px] w-[150px] items-center justify-center rounded-full bg-[#1F3B29] font-semibold text-white'>
          Subscribe
        </button>
      </div>
    </div>
  </section>
);

export default HomePage;


