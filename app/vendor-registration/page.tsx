'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  CheckCircle2, 
  MapPin, 
  Building2, 
  User,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  // Business Details
  hasGST: boolean;
  gstin: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  
  // Bank Details
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  
  // Supplier Details
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  password: string;
  confirmPassword: string;
}

export default function VendorRegistrationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    hasGST: true,
    gstin: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    password: '',
    confirmPassword: '',
  });

  const steps = [
    { id: 1, name: 'Business Details', icon: Building2 },
    { id: 2, name: 'Pickup Address', icon: MapPin },
    { id: 3, name: 'Bank Details', icon: Building2 },
    { id: 4, name: 'Supplier Details', icon: User },
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVerifyGSTIN = async () => {
    if (!formData.gstin) {
      toast({
        title: 'Error',
        description: 'Please enter GSTIN',
        variant: 'destructive',
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate GSTIN verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Success',
        description: 'GSTIN verified successfully',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify GSTIN',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (formData.hasGST && !formData.gstin) {
          toast({
            title: 'Error',
            description: 'Please enter GSTIN',
            variant: 'destructive',
          });
          return false;
        }
        if (!formData.businessName || !formData.businessEmail || !formData.businessPhone) {
          toast({
            title: 'Error',
            description: 'Please fill all business details',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      
      case 2:
        if (!formData.addressLine1 || !formData.city || !formData.state || !formData.pincode) {
          toast({
            title: 'Error',
            description: 'Please fill all address details',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      
      case 3:
        if (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName) {
          toast({
            title: 'Error',
            description: 'Please fill all bank details',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      
      case 4:
        if (!formData.supplierName || !formData.supplierEmail || !formData.supplierPhone) {
          toast({
            title: 'Error',
            description: 'Please fill all supplier details',
            variant: 'destructive',
          });
          return false;
        }
        if (!formData.password || formData.password.length < 6) {
          toast({
            title: 'Error',
            description: 'Password must be at least 6 characters long',
            variant: 'destructive',
          });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: 'Error',
            description: 'Passwords do not match',
            variant: 'destructive',
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/vendor-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit registration');
      }

      // Show success dialog
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit registration',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Progress Steps */}
      <div className='bg-white border-b sticky top-0 z-50 shadow-sm'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex items-center justify-between max-w-3xl mx-auto'>
            {steps.map((step, index) => (
              <div key={step.id} className='flex items-center flex-1'>
                <div className='flex flex-col items-center flex-1'>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                    currentStep > step.id 
                      ? 'bg-green-500 text-white' 
                      : currentStep === step.id 
                      ? 'bg-[#1F3B29] text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle2 className='w-6 h-6' />
                    ) : (
                      <step.icon className='w-5 h-5' />
                    )}
                  </div>
                  <span className={`text-xs md:text-sm text-center font-medium ${
                    currentStep >= step.id ? 'text-[#1F3B29]' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-all ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className='container mx-auto px-4 py-8'>
        <Card className='max-w-2xl mx-auto'>
          <CardContent className='p-6 md:p-8'>
            {/* Step 1: Business Details */}
            {currentStep === 1 && (
              <div className='space-y-6'>
                <h2 className='text-2xl font-bold text-[#1F3B29] mb-6'>Do you have a GST number?</h2>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <button
                    onClick={() => handleInputChange('hasGST', true)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.hasGST 
                        ? 'border-[#1F3B29] bg-[#1F3B29]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className='flex items-start gap-3'>
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        formData.hasGST ? 'border-[#1F3B29] bg-[#1F3B29]' : 'border-gray-300'
                      }`}>
                        {formData.hasGST && <div className='w-2.5 h-2.5 bg-white rounded-full' />}
                      </div>
                      <div>
                        <p className='font-semibold text-gray-900'>Yes</p>
                        <p className='text-sm text-gray-600'>Enter your GSTIN and sell anywhere easily</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleInputChange('hasGST', false)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      !formData.hasGST 
                        ? 'border-[#1F3B29] bg-[#1F3B29]/5' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className='flex items-start gap-3'>
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        !formData.hasGST ? 'border-[#1F3B29] bg-[#1F3B29]' : 'border-gray-300'
                      }`}>
                        {!formData.hasGST && <div className='w-2.5 h-2.5 bg-white rounded-full' />}
                      </div>
                      <div>
                        <p className='font-semibold text-gray-900'>No</p>
                        <p className='text-sm text-gray-600'>Worry not, you can sell without GST</p>
                        <p className='text-sm text-green-600 font-medium mt-1'>Get EID in mins ⚡</p>
                      </div>
                    </div>
                  </button>
                </div>

                {formData.hasGST && (
                  <div className='space-y-2'>
                    <Label htmlFor='gstin'>Enter GSTIN</Label>
                    <div className='flex gap-2'>
                      <Input
                        id='gstin'
                        value={formData.gstin}
                        onChange={(e) => handleInputChange('gstin', e.target.value.toUpperCase())}
                        placeholder='27AACPP9212H1ZO'
                        className='flex-1'
                        maxLength={15}
                      />
                      <Button 
                        onClick={handleVerifyGSTIN} 
                        disabled={isVerifying}
                        className='bg-[#1F3B29] hover:bg-[#2d5a3f]'>
                        {isVerifying ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                  </div>
                )}

                <div className='space-y-4 pt-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='businessName'>Business Name *</Label>
                    <Input
                      id='businessName'
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      placeholder='Enter business name'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='businessEmail'>Business Email *</Label>
                    <Input
                      id='businessEmail'
                      type='email'
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      placeholder='business@example.com'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='businessPhone'>Business Phone *</Label>
                    <Input
                      id='businessPhone'
                      type='tel'
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      placeholder='Enter phone number'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pickup Address */}
            {currentStep === 2 && (
              <div className='space-y-6'>
                <h2 className='text-2xl font-bold text-[#1F3B29] mb-6'>Pickup Address</h2>
                
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='addressLine1'>Address Line 1 *</Label>
                    <Input
                      id='addressLine1'
                      value={formData.addressLine1}
                      onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                      placeholder='House No., Building Name'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='addressLine2'>Address Line 2</Label>
                    <Input
                      id='addressLine2'
                      value={formData.addressLine2}
                      onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                      placeholder='Road Name, Area, Colony (Optional)'
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='city'>City *</Label>
                      <Input
                        id='city'
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder='Enter city'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='state'>State *</Label>
                      <Input
                        id='state'
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder='Enter state'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='pincode'>Pincode *</Label>
                    <Input
                      id='pincode'
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      placeholder='Enter pincode'
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <div className='space-y-6'>
                <h2 className='text-2xl font-bold text-[#1F3B29] mb-6'>Bank Details</h2>
                
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='accountHolderName'>Account Holder Name *</Label>
                    <Input
                      id='accountHolderName'
                      value={formData.accountHolderName}
                      onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                      placeholder='Enter account holder name'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='accountNumber'>Account Number *</Label>
                    <Input
                      id='accountNumber'
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder='Enter account number'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='ifscCode'>IFSC Code *</Label>
                    <Input
                      id='ifscCode'
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                      placeholder='Enter IFSC code'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='bankName'>Bank Name *</Label>
                    <Input
                      id='bankName'
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder='Enter bank name'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Supplier Details */}
            {currentStep === 4 && (
              <div className='space-y-6'>
                <h2 className='text-2xl font-bold text-[#1F3B29] mb-6'>Supplier Details</h2>
                
                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='supplierName'>Contact Person Name *</Label>
                    <Input
                      id='supplierName'
                      value={formData.supplierName}
                      onChange={(e) => handleInputChange('supplierName', e.target.value)}
                      placeholder='Enter contact person name'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='supplierEmail'>Contact Email *</Label>
                    <Input
                      id='supplierEmail'
                      type='email'
                      value={formData.supplierEmail}
                      onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                      placeholder='contact@example.com'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='supplierPhone'>Contact Phone *</Label>
                    <Input
                      id='supplierPhone'
                      type='tel'
                      value={formData.supplierPhone}
                      onChange={(e) => handleInputChange('supplierPhone', e.target.value)}
                      placeholder='Enter contact phone number'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='password'>Password *</Label>
                    <Input
                      id='password'
                      type='password'
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder='Enter password (min 6 characters)'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm Password *</Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder='Confirm your password'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className='flex gap-4 mt-8 pt-6 border-t'>
              {currentStep > 1 && (
                <Button
                  onClick={handleBack}
                  variant='outline'
                  className='flex-1'>
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Back
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className='flex-1 bg-[#1F3B29] hover:bg-[#2d5a3f]'>
                  Next
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className='flex-1 bg-[#1F3B29] hover:bg-[#2d5a3f]'>
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              )}
            </div>

            <Button
              onClick={() => router.push('/become-vendor')}
              variant='outline'
              className='w-full mt-4'>
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='flex justify-center mb-4'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                <CheckCircle2 className='w-10 h-10 text-green-600' />
              </div>
            </div>
            <DialogTitle className='text-center text-2xl'>Registration Successful!</DialogTitle>
            <DialogDescription className='text-center text-base pt-2'>
              Thank you for registering as a vendor. Your application has been submitted successfully.
              <br /><br />
              Please wait for admin approval. You will receive an email notification once your account is approved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='sm:justify-center'>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push('/become-vendor');
              }}
              className='bg-[#1F3B29] hover:bg-[#2d5a3f]'>
              Back to Home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
