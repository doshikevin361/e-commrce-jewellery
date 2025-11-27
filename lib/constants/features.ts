export type HomepageFeatureConfig = {
  id: string;
  icon: 'Truck' | 'Shield' | 'Headphones' | 'Award' | 'Heart' | 'Sparkles';
  title: string;
  description: string;
  status: 'active' | 'inactive';
  order: number;
};

const homepageFeatureConfig: HomepageFeatureConfig[] = [
  {
    id: 'feature-1',
    icon: 'Truck',
    title: 'Free Shipping',
    description: 'Free shipping on orders over ₹2,000',
    status: 'active',
    order: 1,
  },
  {
    id: 'feature-2',
    icon: 'Shield',
    title: 'Secure Payment',
    description: '100% secure payment processing',
    status: 'active',
    order: 2,
  },
  {
    id: 'feature-3',
    icon: 'Headphones',
    title: '24/7 Support',
    description: 'Round-the-clock customer service',
    status: 'active',
    order: 3,
  },
  {
    id: 'feature-4',
    icon: 'Award',
    title: 'Quality Guarantee',
    description: 'Certified authentic jewelry only',
    status: 'active',
    order: 4,
  },
  {
    id: 'feature-5',
    icon: 'Heart',
    title: 'Easy Returns',
    description: '30-day hassle-free returns',
    status: 'active',
    order: 5,
  },
  {
    id: 'feature-6',
    icon: 'Sparkles',
    title: 'Authentic Pieces',
    description: 'Handcrafted by master artisans',
    status: 'active',
    order: 6,
  },
];

export const getActiveHomepageFeatures = () =>
  homepageFeatureConfig.filter(feature => feature.status === 'active').sort((a, b) => a.order - b.order);

export { homepageFeatureConfig };

