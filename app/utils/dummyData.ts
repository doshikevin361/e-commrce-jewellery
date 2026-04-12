import { ProductCardData } from '@/components/home/common/product-card';

export const categories = [
  {
    name: 'Jewellery Sets',
    images: [
      'https://images.unsplash.com/photo-1603561596112-1d0c62c80203?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1611955167811-4711904bb9f1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    name: 'Pendants',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    name: 'Rings',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1603561596112-1d0c62c80203?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    name: 'Earrings',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1611955167811-4711904bb9f1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    name: 'Bangles',
    images: [
      'https://images.unsplash.com/photo-1603561596112-1d0c62c80203?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=600&q=80',
    ],
  },
  {
    name: 'Mangalsutra',
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    ],
  },
];

export const images = [
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=85',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=85',
  'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200&q=85',
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1200&q=85',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=85',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=85',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=85',
  'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1200&q=85',
  'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1200&q=85',
  'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=1200&q=85',
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200&q=85',
  'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=1200&q=85',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=85',
  'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=1200&q=85',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=85',
];

export const navLinks = ['Home', 'Shop', 'Collections', 'Stories', 'About', 'Contact'];

/** Full editorial posts — see `lib/blog-posts.ts` */
export { blogCards } from '@/lib/blog-posts';
export const categoriess = [
  {
    name: 'Earrings',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
  },
  {
    name: 'Chain',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
  },
  {
    name: 'Finger Ring',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
  },
  {
    name: 'Bangles',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
  },
  {
    name: 'Necklace',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
  },
  {
    name: 'Rings',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
  },
];

export const featuredProducts: ProductCardData[] = [
  {
    id: 1,
    title: 'Carat Solitaire Diamond Ring',
    category: 'Rings',
    price: '165.00',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80',
    badge: 'Sale',
  },
  {
    id: 2,
    title: 'Pear-Shaped Emerald Ring',
    category: 'Rings',
    price: '182.00',
    rating: 5,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200&q=80',
  },
  {
    id: 3,
    title: "Women's Bijou Ear Drops",
    category: 'Earrings',
    price: '156.00',
    rating: 4.8,
    reviews: 77,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80',
  },
  {
    id: 4,
    title: 'Luxe Gold Necklace',
    category: 'Necklace',
    price: '215.00',
    rating: 4.9,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80',
  },
  {
    id: 5,
    title: 'Vintage Gold Bracelet',
    category: 'Bracelet',
    price: '205.00',
    rating: 4.7,
    reviews: 81,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1200&q=80',
  },
  {
    id: 6,
    title: 'Diamond Stud Earrings',
    category: 'Earrings',
    price: '189.00',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1200&q=80',
  },
  {
    id: 7,
    title: 'Elegant Pearl Necklace',
    category: 'Necklace',
    price: '198.00',
    rating: 4.8,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=1200&q=80',
  },
  {
    id: 8,
    title: 'Rose Gold Wedding Band',
    category: 'Rings',
    price: '225.00',
    rating: 5,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
  },
];

export const trendingPro: ProductCardData[] = [
  {
    id: 1,
    title: 'Carat Solitaire Diamond Ring',
    category: 'Rings',
    price: '165.00',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1200&q=80',
    badge: 'Sale',
  },
  {
    id: 2,
    title: 'Pear-Shaped Emerald Ring',
    category: 'Rings',
    price: '182.00',
    rating: 5,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1200&q=80',
  },
  {
    id: 3,
    title: "Women's Bijou Ear Drops",
    category: 'Earrings',
    price: '156.00',
    rating: 4.8,
    reviews: 77,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&q=80',
  },
  {
    id: 4,
    title: 'Luxe Gold Necklace',
    category: 'Necklace',
    price: '215.00',
    rating: 4.9,
    reviews: 143,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80',
  },
  {
    id: 5,
    title: 'Vintage Gold Bracelet',
    category: 'Bracelet',
    price: '205.00',
    rating: 4.7,
    reviews: 81,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1200&q=80',
  },
  {
    id: 6,
    title: 'Diamond Stud Earrings',
    category: 'Earrings',
    price: '189.00',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=1200&q=80',
  },
  {
    id: 7,
    title: 'Elegant Pearl Necklace',
    category: 'Necklace',
    price: '198.00',
    rating: 4.8,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=1200&q=80',
  },
  {
    id: 8,
    title: 'Rose Gold Wedding Band',
    category: 'Rings',
    price: '225.00',
    rating: 5,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
  },
];
