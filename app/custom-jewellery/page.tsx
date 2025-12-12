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
      <div className='w-full overflow-x-hidden'>
        {/* Hero Banner */}
        <section className='relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden'>
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
            <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30 z-10' />
          </div>
          <div className='relative z-20 h-full flex flex-col justify-center items-center text-center px-3 sm:px-4 md:px-6 text-white'>
            <div className='flex items-center justify-center gap-2 mb-4 sm:mb-5'>
              <div className='w-8 sm:w-10 h-px bg-white/50' />
              <Sparkles size={20} className='sm:w-[24px] sm:h-[24px] text-white' />
              <div className='w-8 sm:w-10 h-px bg-white/50' />
            </div>
            <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-5 drop-shadow-2xl'>
              CUSTOM JEWELLERY
            </h1>
            <p className='text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed drop-shadow-lg'>
              Create your dream piece with our bespoke jewellery service
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className='mx-auto w-full max-w-[1280px] py-8 sm:py-10 md:py-12 lg:py-16 px-3 sm:px-4 md:px-6 lg:px-0'>
          <div className='max-w-4xl mx-auto'>
            <div className='relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#F5EEE5] via-white to-[#F5EEE5]/30 z-0' />
              <div className='relative z-10 p-6 sm:p-8 md:p-10 lg:p-12'>
                <div className='flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8'>
                  <div className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#1F3B29] flex items-center justify-center'>
                    <Sparkles size={24} className='sm:w-7 sm:h-7 md:w-8 md:h-8 text-white' />
                  </div>
                  <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#1F3B29]'>
                    Request Custom Jewellery
                  </h2>
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
                    inputClassName='text-[#1F3B29] border-[#E6D3C2] focus:ring-[#C8A15B]'
                    labelClassName='text-[#1F3B29] font-semibold text-sm sm:text-base'
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
                    inputClassName='text-[#1F3B29] border-[#E6D3C2] focus:ring-[#C8A15B]'
                    labelClassName='text-[#1F3B29] font-semibold text-sm sm:text-base'
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
                    inputClassName='text-[#1F3B29] border-[#E6D3C2] focus:ring-[#C8A15B]'
                    labelClassName='text-[#1F3B29] font-semibold text-sm sm:text-base'
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
                    inputClassName='text-[#1F3B29] min-h-[150px] border-[#E6D3C2] focus:ring-[#C8A15B]'
                    labelClassName='text-[#1F3B29] font-semibold text-sm sm:text-base'
                  />

                  {/* Image Upload */}
                  <div>
                    <label className='block text-sm sm:text-base font-semibold text-[#1F3B29] mb-2'>
                      Upload Images (Inspiration/Reference)
                    </label>
                    <div className='border-2 border-dashed border-[#E6D3C2] rounded-lg p-6 sm:p-8 text-center hover:border-[#C8A15B] transition-all duration-300'>
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
                        <div className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1F3B29]/10 flex items-center justify-center'>
                          <Upload size={24} className='sm:w-7 sm:h-7 text-[#1F3B29]' />
                        </div>
                        <div>
                          <span className='text-sm sm:text-base font-semibold text-[#1F3B29]'>
                            Click to upload images
                          </span>
                          <p className='text-xs text-[#3F5C45] mt-1'>Maximum 5 images, 5MB each (JPG, PNG)</p>
                        </div>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4'>
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className='relative group'>
                            <div className='aspect-square rounded-lg overflow-hidden border-2 border-[#E6D3C2]'>
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
                              className='absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600'>
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
                    className='w-full flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 md:py-4 rounded-lg bg-[#1F3B29] text-white font-bold text-sm sm:text-base md:text-lg hover:bg-[#1F3B29]/90 transition-all duration-300 hover:scale-105 active:scale-95 tracking-wide uppercase shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'>
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

            {/* Bottom Separator */}
            <div className='flex items-center justify-center gap-2 mt-12 sm:mt-16'>
              <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
              <Diamond size={20} className='sm:w-[24px] sm:h-[24px] text-[#C8A15B]' />
              <div className='w-8 sm:w-10 h-px bg-[#E6D3C2]' />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

