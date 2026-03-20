const TestimonialCard = ({ item }: any) => {
  return (
    <div className={`relative mt-14 w-[220px] rounded-2xl bg-[#fdebed] p-4 shadow-lg sm:mt-16 sm:w-[240px] md:w-[260px] ${item.rotate}`}>
      {/* Clip */}
      <div className='absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center'>
        <span className='text-gray-400 text-xl'>📎</span>

        {/* String from clip to card */}
        <span className='w-[1px] h-6 bg-gray-300 block' />
      </div>

      {/* Image */}
      <div className='overflow-hidden rounded-xl mb-3'>
        <img src={item.image} alt={item.name} className='w-full h-[170px] object-cover' />
      </div>

      <h3 className='text-[#001e38] font-semibold text-sm'>
        {item.name}, {item.age}
      </h3>

      <p className='text-xs text-gray-600 mt-2 leading-relaxed'>{item.text}</p>
    </div>
  );
};

export default TestimonialCard;
