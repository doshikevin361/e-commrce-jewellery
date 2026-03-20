// ProductShowcase.jsx

const products = [
  {
    id: 1,
    modelImage: '/uploads/dl-3.webp', // Replace with your images
    productImage: '/uploads/dl-p1.webp',
    alt: 'Earrings',
  },
  {
    id: 2,
    modelImage: '/uploads/dl-1.webp',
    productImage: '/uploads/dl-p2.webp',
    alt: 'Watch',
  },
  {
    id: 3,
    modelImage: '/uploads/dl-2.webp',
    productImage: '/uploads//dl-p3.webp',
    alt: 'Necklace',
  },
];

const ProductShowcase = () => {
  return (
    <div className='w-full bg-white py-10 sm:py-12'>
      <h2 className='mb-8 text-center text-2xl font-serif text-[#001e38] sm:mb-12 sm:text-3xl'>Design Led Jewellery</h2>
      <div className='mx-auto grid max-w-[1400px] grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:gap-6 sm:px-6 lg:grid-cols-3 lg:px-8'>
        {products.map(product => (
          <div key={product.id} className='flex flex-col items-center'>
            <div className='w-full overflow-hidden rounded-lg'>
              <img src={product.modelImage} alt={product.alt} className='h-[280px] w-full rounded-lg object-cover sm:h-[320px] lg:h-[350px]' />
            </div>
            <div className='mt-4 flex h-28 w-36 -translate-y-10 items-center justify-center rounded-xl bg-white shadow-lg sm:h-32 sm:w-44 sm:-translate-y-12'>
              <img src={product.productImage} alt={product.alt} className='w-full h-full rounded-lg object-cover' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductShowcase;
