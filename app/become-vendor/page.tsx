'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Store, 
  Users, 
  MapPin, 
  Grid3x3, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Clock, 
  Truck, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Diamond,
  Award,
  Mail,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function BecomeVendorPage() {
  const [email, setEmail] = useState('');
  const [logo, setLogo] = useState<{ imageUrl: string; altText: string; width: number; height: number } | null>(null);

  // Fetch active logo
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch('/api/public/logo');
        if (response.ok) {
          const data = await response.json();
          if (data.logo) {
            setLogo(data.logo);
          }
        }
      } catch (error) {
        console.error('Failed to fetch logo:', error);
      }
    };

    fetchLogo();
  }, []);

  const stats = [
    { icon: Store, value: 'Thousands of', label: 'Vendors trust us to sell online' },
    { icon: Users, value: 'Lakhs of', label: 'Customers buying across India' },
    { icon: MapPin, value: 'All', label: 'Pincodes across India - we deliver everywhere' },
    { icon: Grid3x3, value: 'Hundreds of', label: 'Jewellery categories to sell' },
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: 'Low Commission Fee',
      description: 'Keep more of your profit with our competitive commission rates',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Get paid securely and on time with our reliable payment system',
    },
    {
      icon: TrendingUp,
      title: 'Growth for Every Vendor',
      description: 'From small to large businesses, we fuel growth for all jewellery sellers',
    },
    {
      icon: Truck,
      title: 'Affordable Shipping',
      description: 'Reliable shipping solutions to reach customers across India',
    },
    {
      icon: BarChart3,
      title: 'Business Insights',
      description: 'Track your sales, orders, and performance with detailed analytics',
    },
    {
      icon: Clock,
      title: 'Quick Payment Cycle',
      description: 'Receive payments directly to your bank account within 7-14 days',
    },
  ];

  const features = [
    'Easy Product Listing',
    'Dedicated Vendor Dashboard',
    'Order Management System',
    'Customer Support 24/7',
    'Marketing Tools & Ads',
    'Inventory Management',
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Account',
      description: 'Register with your business details, GSTIN, and bank account information',
    },
    {
      step: '2',
      title: 'List Products',
      description: 'Add your jewellery products with images, descriptions, and pricing',
    },
    {
      step: '3',
      title: 'Get Orders',
      description: 'Start receiving orders from customers across India',
    },
    {
      step: '4',
      title: 'Ship & Deliver',
      description: 'Pack and ship orders using our integrated logistics partners',
    },
    {
      step: '5',
      title: 'Receive Payments',
      description: 'Get paid directly to your bank account after successful delivery',
    },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      business: 'Golden Jewellers, Jaipur',
      quote: 'Our business has grown 5X since joining this platform. We now reach customers across India that we never could before.',
      rating: 5,
    },
    {
      name: 'Priya Shah',
      business: 'Diamond Palace, Mumbai',
      quote: 'The platform is so easy to use! I started with just 10 products and now manage over 500 listings with consistent orders.',
      rating: 5,
    },
    {
      name: 'Amit Patel',
      business: 'Silver Touch, Surat',
      quote: 'Excellent support team and transparent processes. The payment cycle is reliable and the commission rates are very reasonable.',
      rating: 5,
    },
  ];

  const categories = [
    'Gold Jewellery',
    'Diamond Jewellery',
    'Silver Jewellery',
    'Platinum Jewellery',
    'Gemstone Jewellery',
    'Bridal Jewellery',
    'Fashion Jewellery',
    'Imitation Jewellery',
  ];

  return (
    <div className='min-h-screen bg-white'>
      {/* Header */}
      <header className='bg-white border-b sticky top-0 z-50 shadow-sm'>
        <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
          <Link href='/' className='flex items-center gap-2'>
            {logo ? (
              <img
                src={logo.imageUrl}
                alt={logo.altText}
                className='object-contain'
                style={{
                  width: `${logo.width}px`,
                  height: `${logo.height}px`,
                  maxWidth: '180px',
                  maxHeight: '50px',
                }}
              />
            ) : (
              <>
                <Diamond className='w-8 h-8 text-[#1F3B29]' />
                <span className='text-2xl font-bold text-[#1F3B29]'>Jewellery Store</span>
              </>
            )}
          </Link>
          <div className='flex items-center gap-4'>
            <Link href='/login'>
              <Button variant='outline'>Vendor Login</Button>
            </Link>
            <Button className='bg-[#1F3B29] hover:bg-[#2d5a3f]'>Start Selling</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='relative bg-gradient-to-br from-[#1F3B29] via-[#2d5a3f] to-[#1F3B29] text-white py-20 overflow-hidden'>
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl'></div>
          <div className='absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl'></div>
        </div>
        
        <div className='container mx-auto px-4 relative z-10'>
          <div className='max-w-4xl mx-auto text-center'>
            <h1 className='text-4xl md:text-6xl font-bold mb-6'>
              Sell Your Jewellery to Lakhs of Customers
            </h1>
            <p className='text-xl md:text-2xl mb-8 text-white/90'>
              Join India's fastest-growing jewellery marketplace and grow your business online
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center mb-8'>
              <Input
                type='email'
                placeholder='Enter your email to get started'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='max-w-md text-gray-900'
              />
              <Button size='lg' className='bg-white text-[#1F3B29] hover:bg-gray-100 font-semibold'>
                Start Selling Now <ArrowRight className='ml-2 w-5 h-5' />
              </Button>
            </div>
            <p className='text-sm text-white/80'>
              <Award className='inline w-4 h-4 mr-1' />
              Don't have GSTIN? You can still sell with us!
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {stats.map((stat, index) => (
              <div key={index} className='text-center'>
                <stat.icon className='w-12 h-12 mx-auto mb-4 text-[#1F3B29]' />
                <h3 className='text-3xl font-bold text-[#1F3B29] mb-2'>{stat.value}</h3>
                <p className='text-gray-600'>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 text-[#1F3B29]'>
            Why Vendors Love Our Platform
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {benefits.map((benefit, index) => (
              <Card key={index} className='border-2 hover:border-[#1F3B29] transition-all hover:shadow-lg'>
                <CardContent className='p-6'>
                  <benefit.icon className='w-12 h-12 text-[#1F3B29] mb-4' />
                  <h3 className='text-xl font-semibold mb-3 text-[#1F3B29]'>{benefit.title}</h3>
                  <p className='text-gray-600'>{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className='py-16 bg-[#1F3B29] text-white'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12'>
            Everything You Need to Succeed
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto'>
            {features.map((feature, index) => (
              <div key={index} className='flex items-center gap-3'>
                <CheckCircle2 className='w-6 h-6 text-green-400 flex-shrink-0' />
                <span className='text-lg'>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 text-[#1F3B29]'>
            How It Works
          </h2>
          <div className='max-w-5xl mx-auto'>
            {howItWorks.map((item, index) => (
              <div key={index} className='flex gap-6 mb-12 last:mb-0'>
                <div className='flex-shrink-0'>
                  <div className='w-16 h-16 rounded-full bg-[#1F3B29] text-white flex items-center justify-center text-2xl font-bold'>
                    {item.step}
                  </div>
                </div>
                <div className='flex-1 pt-2'>
                  <h3 className='text-2xl font-semibold mb-3 text-[#1F3B29]'>{item.title}</h3>
                  <p className='text-gray-600 text-lg'>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 text-[#1F3B29]'>
            Success Stories from Our Vendors
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className='hover:shadow-xl transition-shadow'>
                <CardContent className='p-6'>
                  <div className='flex gap-1 mb-4'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className='w-5 h-5 fill-yellow-400 text-yellow-400' />
                    ))}
                  </div>
                  <p className='text-gray-700 mb-4 italic'>"{testimonial.quote}"</p>
                  <div className='border-t pt-4'>
                    <p className='font-semibold text-[#1F3B29]'>{testimonial.name}</p>
                    <p className='text-sm text-gray-600'>{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className='py-16'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12 text-[#1F3B29]'>
            Popular Categories to Sell
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto'>
            {categories.map((category, index) => (
              <Link
                key={index}
                href='#'
                className='p-4 text-center border-2 rounded-lg hover:border-[#1F3B29] hover:bg-[#1F3B29] hover:text-white transition-all font-medium'>
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-gradient-to-r from-[#1F3B29] to-[#2d5a3f] text-white'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-5xl font-bold mb-6'>
            Ready to Start Your Jewellery Business Online?
          </h2>
          <p className='text-xl mb-8 text-white/90'>
            Join thousands of successful vendors already selling on our platform
          </p>
          <Button size='lg' className='bg-white text-[#1F3B29] hover:bg-gray-100 font-semibold text-lg px-8'>
            Start Selling Today <ArrowRight className='ml-2 w-6 h-6' />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
            <div>
              <h3 className='font-bold text-lg mb-4'>Sell With Us</h3>
              <ul className='space-y-2 text-gray-400'>
                <li><Link href='#' className='hover:text-white'>How It Works</Link></li>
                <li><Link href='#' className='hover:text-white'>Pricing & Commission</Link></li>
                <li><Link href='#' className='hover:text-white'>Shipping & Returns</Link></li>
                <li><Link href='#' className='hover:text-white'>Vendor Guidelines</Link></li>
              </ul>
            </div>
            <div>
              <h3 className='font-bold text-lg mb-4'>Resources</h3>
              <ul className='space-y-2 text-gray-400'>
                <li><Link href='#' className='hover:text-white'>Learning Hub</Link></li>
                <li><Link href='#' className='hover:text-white'>FAQs</Link></li>
                <li><Link href='#' className='hover:text-white'>Blog</Link></li>
                <li><Link href='#' className='hover:text-white'>Success Stories</Link></li>
              </ul>
            </div>
            <div>
              <h3 className='font-bold text-lg mb-4'>Support</h3>
              <ul className='space-y-2 text-gray-400'>
                <li><Link href='#' className='hover:text-white'>Help Center</Link></li>
                <li><Link href='#' className='hover:text-white'>Contact Support</Link></li>
                <li><Link href='#' className='hover:text-white'>Report an Issue</Link></li>
                <li><Link href='#' className='hover:text-white'>Terms & Conditions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className='font-bold text-lg mb-4'>Contact Us</h3>
              <div className='space-y-3 text-gray-400'>
                <div className='flex items-center gap-2'>
                  <Mail className='w-5 h-5' />
                  <span>vendors@jewellery.com</span>
                </div>
                <div className='flex gap-4 mt-4'>
                  <Link href='#' className='hover:text-white'><Facebook className='w-6 h-6' /></Link>
                  <Link href='#' className='hover:text-white'><Instagram className='w-6 h-6' /></Link>
                  <Link href='#' className='hover:text-white'><Youtube className='w-6 h-6' /></Link>
                </div>
              </div>
            </div>
          </div>
          <div className='border-t border-gray-800 pt-8 text-center text-gray-400'>
            <p>&copy; 2026 Jewellery Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
