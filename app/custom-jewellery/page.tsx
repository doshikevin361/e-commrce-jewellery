'use client';

import { CategoriesSidebar } from '@/components/home/CategoriesSidebar';
import { Diamond, Upload, X, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import FormField from '@/components/formField/formField';
import Dropdown from '@/components/customDropdown/customDropdown';

export default function CustomJewelleryPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    jewelleryType: '',
    metalType: '',
    budgetRange: '',
    description: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const jewelleryTypes = [
    { label: 'Ring', value: 'Ring' },
    { label: 'Necklace', value: 'Necklace' },
    { label: 'Bracelet', value: 'Bracelet' },
    { label: 'Pendant', value: 'Pendant' },
    { label: 'Earrings', value: 'Earrings' },
    { label: 'Bangle', value: 'Bangle' },
    { label: 'Chain', value: 'Chain' },
    { label: 'Other', value: 'Other' },
  ];

  const metalTypes = [
    { label: 'Gold', value: 'Gold' },
    { label: 'Silver', value: 'Silver' },
    { label: 'Platinum', value: 'Platinum' },
  ];

  const budgetRanges = [
    { label: 'Under ₹10,000', value: 'Under ₹10,000' },
    { label: '₹10,000 - ₹25,000', value: '₹10,000 - ₹25,000' },
    { label: '₹25,000 - ₹50,000', value: '₹25,000 - ₹50,000' },
    { label: '₹50,000 - ₹1,00,000', value: '₹50,000 - ₹1,00,000' },
    { label: '₹1,00,000 - ₹2,50,000', value: '₹1,00,000 - ₹2,50,000' },
    { label: 'Above ₹2,50,000', value: 'Above ₹2,50,000' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDropdownChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user selects
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (images.length + files.length > maxFiles) {
      toast.error(`You can upload maximum ${maxFiles} images`);
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    files.forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onload = e => {
        if (e.target?.result) {
          validPreviews.push(e.target.result as string);
          if (validPreviews.length === validFiles.length) {
            setImagePreviews(prev => [...prev, ...validPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.jewelleryType) newErrors.jewelleryType = 'Jewellery type is required';
    if (!formData.metalType) newErrors.metalType = 'Metal type is required';
    if (!formData.budgetRange) newErrors.budgetRange = 'Budget range is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    else if (formData.description.trim().length < 20) {
      newErrors.description = 'Please provide a more detailed description (at least 20 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images first
      const uploadedImageUrls: string[] = [];
      
      for (const image of images) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', image);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        uploadedImageUrls.push(uploadData.url);
      }

      // Submit the form data
      const response = await fetch('/api/custom-jewellery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          images: uploadedImageUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to submit request');
        throw new Error(errorMsg);
      }

      toast.success('Your custom jewellery request has been submitted successfully! We will contact you soon.');
      
      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        jewelleryType: '',
        metalType: '',
        budgetRange: '',
        description: '',
      });
      setImages([]);
      setImagePreviews([]);
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CategoriesSidebar />
      <div className='w-full overflow-x-hidden bg-[#f8f7f5] text-[#111827]'>
        {/* Hero Banner */}
        <section className='relative w-full h-[320px] sm:h-[420px] md:h-[520px] lg:h-[580px] overflow-hidden'>
          <div className='absolute inset-0 w-full h-full z-0'>
            <Image
              src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=80'
              alt='Custom Jewellery'
              fill
              sizes='100vw'
              className='object-cover'
              priority
              unoptimized
            />
            <div className='absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/30 z-10' />
          </div>
          <div className='relative z-20 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-8 text-white'>
            <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] sm:text-xs uppercase tracking-[0.35em] text-white/90'>
              Bespoke Atelier
            </div>
            <div className='flex items-center justify-center gap-2 mt-5 sm:mt-6 mb-4 sm:mb-6'>
              <div className='w-10 sm:w-12 h-px bg-white/50' />
              <Sparkles size={22} className='sm:w-[26px] sm:h-[26px] text-white' />
              <div className='w-10 sm:w-12 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              Custom Jewellery
            </h1>
            <p className='text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed text-white/90 drop-shadow-lg'>
              Collaborate with our artisans to craft a one-of-a-kind piece that reflects your story.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className='mx-auto w-full max-w-[1280px] py-10 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start'>
            <div className='space-y-6'>
              <div className='rounded-2xl border border-white/60 bg-white/70 p-6 sm:p-8 shadow-lg backdrop-blur'>
                <p className='text-xs uppercase tracking-[0.3em] text-[#6B7280]'>Crafted For You</p>
                <h2 className='mt-3 text-2xl sm:text-3xl font-semibold text-[#111827]'>A premium, guided design journey</h2>
                <p className='mt-3 text-sm sm:text-base text-[#4B5563] leading-relaxed'>
                  From concept to final polish, our design team partners with you to create a piece that feels timeless and personal.
                </p>
                <div className='mt-6 grid gap-4'>
                  {[
                    'Share inspiration and budget details',
                    'Review curated design concepts',
                    'Finalize materials, stones, and sizing',
                    'Handcrafted by expert artisans',
                  ].map(item => (
                    <div key={item} className='flex items-start gap-3'>
                      <span className='mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#111827] text-xs font-semibold text-white'>✓</span>
                      <p className='text-sm sm:text-base text-[#374151]'>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className='rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-md'>
                <div className='flex items-center gap-3'>
                  <div className='h-12 w-12 rounded-full bg-[#111827] text-white flex items-center justify-center'>
                    <Diamond size={22} />
                  </div>
                  <div>
                    <p className='text-sm uppercase tracking-[0.3em] text-[#6B7280]'>Assurance</p>
                    <h3 className='text-lg sm:text-xl font-semibold text-[#111827]'>Designed for lasting brilliance</h3>
                  </div>
                </div>
                <div className='mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[#4B5563]'>
                  <div className='rounded-xl border border-[#E5E7EB] px-4 py-3'>Certified stones & metals</div>
                  <div className='rounded-xl border border-[#E5E7EB] px-4 py-3'>Transparent pricing</div>
                  <div className='rounded-xl border border-[#E5E7EB] px-4 py-3'>Dedicated design advisor</div>
                  <div className='rounded-xl border border-[#E5E7EB] px-4 py-3'>Secure delivery</div>
                </div>
              </div>
            </div>

            <div className='relative rounded-2xl overflow-hidden shadow-2xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-white via-[#f8f7f5] to-white z-0' />
              <div className='relative z-10 p-6 sm:p-8 md:p-10 lg:p-12'>
                <div className='flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8'>
                  <div className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#111827] flex items-center justify-center'>
                    <Sparkles size={24} className='sm:w-7 sm:h-7 md:w-8 md:h-8 text-white' />
                  </div>
                  <div>
                    <p className='text-xs uppercase tracking-[0.3em] text-[#6B7280]'>Request Form</p>
                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-semibold text-[#111827]'>Request Custom Jewellery</h2>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-5 md:space-y-6'>
                  {/* Full Name */}
                  <FormField
                    label='Full Name'
                    name='fullName'
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder='Enter your full name'
                    required
                    error={errors.fullName}
                    inputClassName='text-[#111827] border-[#E5E7EB] focus:ring-[#111827]'
                    labelClassName='text-[#111827] font-semibold text-sm sm:text-base'
                  />

                  {/* Phone Number */}
                  <FormField
                    label='Phone Number'
                    name='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder='Enter your phone number'
                    required
                    error={errors.phone}
                    inputClassName='text-[#111827] border-[#E5E7EB] focus:ring-[#111827]'
                    labelClassName='text-[#111827] font-semibold text-sm sm:text-base'
                  />

                  {/* Email */}
                  <FormField
                    label='Email'
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder='Enter your email address'
                    required
                    error={errors.email}
                    inputClassName='text-[#111827] border-[#E5E7EB] focus:ring-[#111827]'
                    labelClassName='text-[#111827] font-semibold text-sm sm:text-base'
                  />

                  {/* Jewellery Type and Metal Type - Side by Side */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6'>
                    <Dropdown
                      labelMain='Jewellery Type *'
                      options={jewelleryTypes}
                      placeholder='Select jewellery type'
                      value={formData.jewelleryType}
                      onChange={option => handleDropdownChange('jewelleryType', option.value)}
                      error={errors.jewelleryType}
                    />

                    <Dropdown
                      labelMain='Metal Type *'
                      options={metalTypes}
                      placeholder='Select metal type'
                      value={formData.metalType}
                      onChange={option => handleDropdownChange('metalType', option.value)}
                      error={errors.metalType}
                    />
                  </div>

                  {/* Budget Range */}
                  <Dropdown
                    labelMain='Budget Range *'
                    options={budgetRanges}
                    placeholder='Select budget range'
                    value={formData.budgetRange}
                    onChange={option => handleDropdownChange('budgetRange', option.value)}
                    error={errors.budgetRange}
                  />

                  {/* Description */}
                  <FormField
                    label='Description / Requirements'
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder='Describe your custom jewellery requirements, design preferences, size, stones, etc.'
                    required
                    textarea
                    error={errors.description}
                    helperText='Minimum 20 characters required'
                    inputClassName='text-[#111827] min-h-[150px] border-[#E5E7EB] focus:ring-[#111827]'
                    labelClassName='text-[#111827] font-semibold text-sm sm:text-base'
                  />

                  {/* Image Upload */}
                  <div>
                    <label className='block text-sm sm:text-base font-semibold text-[#111827] mb-2'>
                      Upload Images (Inspiration/Reference)
                    </label>
                    <div className='border-2 border-dashed border-[#E5E7EB] rounded-xl p-6 sm:p-8 text-center hover:border-[#111827] transition-all duration-300 bg-white'>
                      <input
                        type='file'
                        id='images'
                        name='images'
                        accept='image/*'
                        multiple
                        onChange={handleImageUpload}
                        className='hidden'
                      />
                      <label
                        htmlFor='images'
                        className='cursor-pointer flex flex-col items-center justify-center gap-3'>
                        <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#111827]/10 flex items-center justify-center'>
                          <Upload size={24} className='sm:w-7 sm:h-7 text-[#111827]' />
                        </div>
                        <div>
                          <span className='text-sm sm:text-base font-semibold text-[#111827]'>
                            Click to upload images
                          </span>
                          <p className='text-xs text-[#6B7280] mt-1'>Maximum 5 images, 5MB each (JPG, PNG)</p>
                        </div>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4'>
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className='relative group'>
                            <div className='aspect-square rounded-lg overflow-hidden border border-[#E5E7EB] shadow-sm'>
                              <Image
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                fill
                                className='object-cover'
                                sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw'
                              />
                            </div>
                            <button
                              type='button'
                              onClick={() => removeImage(index)}
                              className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black'>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl bg-slate-gradient text-white font-semibold text-sm sm:text-base md:text-lg hover:from-slate-800 hover:via-slate-900 hover:to-slate-950 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 tracking-wide uppercase shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0'>
                    {isSubmitting ? (
                      <>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Submit Request
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

           
          </div>
        </section>
      </div>
    </>
  );
}

