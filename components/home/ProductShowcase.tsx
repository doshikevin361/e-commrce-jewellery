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
    <div className='w-full py-12 bg-white'>
      <h2 className='text-center text-3xl font-serif text-[#001e38] mb-12'>Design Led Jewellery</h2>
      <div className='max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {products.map(product => (
          <div key={product.id} className='flex flex-col items-center'>
            <div className='w-full overflow-hidden rounded-lg'>
              <img src={product.modelImage} alt={product.alt} className='w-full h-[350px] object-cover rounded-lg' />
            </div>
            <div className='mt-4 w-44 h-32 bg-white rounded-xl shadow-lg flex items-center justify-center -translate-y-12'>
              <img src={product.productImage} alt={product.alt} className='w-full h-full rounded-lg object-cover' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductShowcase;
