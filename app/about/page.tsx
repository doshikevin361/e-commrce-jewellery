'use client';

import { HomeHeader } from '@/components/home/header';
import { HomeFooter } from '@/components/home/footer';
import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, Award, Users, Heart, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className='min-h-screen w-full overflow-x-hidden bg-white'>
      <HomeHeader />
      <CategoriesSidebar />
      <main className='w-full overflow-x-hidden'>
        {/* Hero Banner */}
        <section className='relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden'>
          <div className='absolute inset-0 w-full h-full z-0'>
            <Image
              src='https://images.unsplash.com/photo-1611955167811-4711904bb9f1?auto=format&fit=crop&w=1600&q=80'
              alt='About Us'
              fill
              sizes='100vw'
              className='object-cover'
              priority
              unoptimized
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10' />
          </div>
          <div className='relative z-20 h-full flex flex-col justify-center items-center text-center px-3 sm:px-4 md:px-6 text-white'>
            <div className='flex items-center justify-center gap-2 mb-4 sm:mb-5'>
              <div className='w-8 sm:w-10 h-px bg-white/50' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              ABOUT US
            </h1>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed drop-shadow-lg'>
              Discover the story behind LuxeLoom and our commitment to exquisite jewelry.
            </p>
          </div>
        </section>

        <section className='mx-auto w-full max-w-[1280px] py-8 sm:py-10 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-0'>

          {/* Content */}
          <div className='max-w-6xl mx-auto space-y-12 sm:space-y-14 md:space-y-16 lg:space-y-20'>
            {/* Our Story - With Image */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center'>
              <div className='order-2 lg:order-1'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1F3B29] mb-4 sm:mb-6'>
                  Our Story
                </h2>
                <p className='text-sm sm:text-base md:text-lg text-[#3F5C45] leading-relaxed mb-4'>
                  LuxeLoom was born from a passion for creating timeless jewelry pieces that celebrate elegance and individuality. Founded with the vision to make luxury accessible, we specialize in handcrafted jewelry that combines traditional craftsmanship with modern design sensibilities.
                </p>
                <p className='text-sm sm:text-base md:text-lg text-[#3F5C45] leading-relaxed mb-4'>
                  Every piece in our collection is carefully curated, designed, and crafted to perfection. We believe that jewelry is more than an accessory—it's a statement of personal style and a reflection of cherished moments.
                </p>
                <p className='text-sm sm:text-base md:text-lg text-[#3F5C45] leading-relaxed'>
                  With years of expertise in jewelry design and a commitment to quality, LuxeLoom has become a trusted name for those who appreciate fine craftsmanship and exceptional beauty.
                </p>
              </div>
              <div className='order-1 lg:order-2 relative h-[300px] sm:h-[400px] md:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl'>
                <Image
                  src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
                  alt='Our Story'
                  fill
                  sizes='(max-width: 1024px) 100vw, 50vw'
                  className='object-cover'
                  unoptimized
                />
              </div>
            </div>

            {/* Mission - With Background */}
            <div className='relative rounded-xl sm:rounded-2xl overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#F5EEE5] via-[#FFF8F0] to-[#F5EEE5]/50 z-0' />
              <div className='relative z-10 p-6 sm:p-8 md:p-10 lg:p-12'>
                <div className='flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6'>
                  <Award size={32} className='sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#C8A15B]' />
                  <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1F3B29]'>
                    Our Mission
                  </h2>
                </div>
                <p className='text-sm sm:text-base md:text-lg lg:text-xl text-[#3F5C45] leading-relaxed max-w-4xl'>
                  To provide exquisite, handcrafted jewelry that celebrates elegance and individuality while maintaining the highest standards of quality and craftsmanship. We are committed to making luxury accessible to everyone without compromising on excellence.
                </p>
              </div>
            </div>

            {/* Values */}
            <div>
              <div className='text-center mb-8 sm:mb-10 md:mb-12'>
                <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1F3B29] mb-4 sm:mb-5'>
                  Our Values
                </h2>
                <p className='text-sm sm:text-base md:text-lg text-[#3F5C45] max-w-2xl mx-auto'>
                  The principles that guide everything we do
                </p>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8'>
                {[
                  { icon: Award, title: 'Quality First', desc: 'We use only the finest materials and employ skilled artisans to create pieces that stand the test of time.', color: 'text-[#C8A15B]' },
                  { icon: Sparkles, title: 'Authenticity', desc: 'Every design is original, reflecting our commitment to creativity and innovation in jewelry making.', color: 'text-[#C8A15B]' },
                  { icon: Heart, title: 'Customer Focus', desc: 'Your satisfaction is our priority. We strive to exceed expectations in every interaction.', color: 'text-[#C8A15B]' },
                  { icon: Users, title: 'Sustainability', desc: 'We are committed to ethical sourcing and sustainable practices in all our operations.', color: 'text-[#C8A15B]' },
                ].map((value, index) => {
                  const IconComponent = value.icon;
                  return (
                    <div key={index} className='group relative p-6 sm:p-7 md:p-8 rounded-xl sm:rounded-2xl border-2 border-[#E6D3C2]/50 bg-white hover:border-[#C8A15B] transition-all duration-300 hover:shadow-xl hover:-translate-y-2'>
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#F5EEE5] flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-[#C8A15B] transition-all duration-300`}>
                        <IconComponent size={24} className={`sm:w-7 sm:h-7 md:w-8 md:h-8 ${value.color} group-hover:text-white transition-colors duration-300`} />
                      </div>
                      <h3 className='text-lg sm:text-xl md:text-2xl font-bold text-[#1F3B29] mb-2 sm:mb-3'>{value.title}</h3>
                      <p className='text-sm sm:text-base md:text-lg text-[#3F5C45] leading-relaxed'>{value.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team/Stats Section */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8'>
              {[
                { number: '10K+', label: 'Happy Customers' },
                { number: '500+', label: 'Unique Designs' },
                { number: '15+', label: 'Years Experience' },
                { number: '98%', label: 'Satisfaction Rate' },
              ].map((stat, index) => (
                <div key={index} className='text-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#F5EEE5] to-white border border-[#E6D3C2]/30'>
                  <div className='text-3xl sm:text-4xl md:text-5xl font-bold text-[#1F3B29] mb-2 sm:mb-3'>{stat.number}</div>
                  <div className='text-xs sm:text-sm md:text-base font-semibold text-[#3F5C45]'>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Bottom Separator */}
            <div className='flex items-center justify-center gap-2 pt-8 sm:pt-10'>
              <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-[#C8A15B]' />
              <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
            </div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}

