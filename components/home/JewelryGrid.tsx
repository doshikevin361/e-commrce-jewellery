import Image from 'next/image';

const JewelryGrid = () => {
  return (
    <section className='bg-white p-6 md:py-10'>
      <div className='max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 md:h-[600px]'>
        {/* --- LEFT COLUMN --- */}
        <div className='grid grid-rows-2 gap-6 h-full'>
          <div className='relative group overflow-hidden rounded-2xl h-full'>
            <Image
              src='/uploads/je1.avif'
              alt='Jewelry 1'
              fill
              className='object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </div>

          <div className='relative group overflow-hidden rounded-2xl h-full'>
            <Image
              src='/uploads/je2.avif'
              alt='Jewelry 2'
              fill
              className='object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </div>
        </div>

        {/* --- CENTER VIDEO --- */}
        <div className='md:col-span-2 overflow-hidden rounded-2xl relative h-full'>
          <video className='w-full h-full object-cover' autoPlay loop muted playsInline>
            <source src='/uploads/vid.mp4' type='video/mp4' />
          </video>
        </div>

        {/* --- RIGHT COLUMN --- */}
        <div className='grid grid-rows-2 gap-6 h-full'>
          <div className='relative group overflow-hidden rounded-2xl h-full'>
            <Image
              src='/uploads/je3.avif'
              alt='Jewelry 3'
              fill
              className='object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </div>

          <div className='relative group overflow-hidden rounded-2xl h-full'>
            <Image
              src='/uploads/je4.avif'
              alt='Jewelry 4'
              fill
              className='object-cover transition-transform duration-500 group-hover:scale-105'
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default JewelryGrid;
