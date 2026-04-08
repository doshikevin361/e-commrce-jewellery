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
  ArrowLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/** GST state code → name (Cashfree / GST address fields may return codes) */
const STATE_CODE_MAP: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
};

function getStateName(stateCode: string): string | null {
  if (!stateCode) return null;
  if (stateCode.length > 2) return stateCode;
  return STATE_CODE_MAP[stateCode] || null;
}

interface FormData {
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
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
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
  const [gstVerified, setGstVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
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
  const TOTAL_STEPS = 4;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^\d{10}$/;
  const PINCODE_REGEX = /^\d{6}$/;
  const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/;
  const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  const validateField = (field: keyof FormData, value: string, data: FormData) => {
    const trimmed = value?.trim?.() ?? '';
    switch (field) {
      case 'gstin':
        if (!data.hasGST) return '';
        if (!trimmed) return 'GSTIN is required';
        if (!GSTIN_REGEX.test(trimmed)) return 'Enter a valid GSTIN';
        return '';
      case 'businessName':
        return trimmed ? '' : 'Business name is required';
      case 'businessEmail':
        if (!trimmed) return 'Business email is required';
        return EMAIL_REGEX.test(trimmed) ? '' : 'Enter a valid email';
      case 'businessPhone':
        if (!trimmed) return 'Business phone is required';
        return PHONE_REGEX.test(trimmed) ? '' : 'Enter a valid 10-digit phone number';
      case 'addressLine1':
        return trimmed ? '' : 'Address line 1 is required';
      case 'city':
        return trimmed ? '' : 'City is required';
      case 'state':
        return trimmed ? '' : 'State is required';
      case 'pincode':
        if (!trimmed) return 'Pincode is required';
        return PINCODE_REGEX.test(trimmed) ? '' : 'Enter a valid 6-digit pincode';
      case 'accountHolderName':
        return trimmed ? '' : 'Account holder name is required';
      case 'accountNumber':
        if (!trimmed) return 'Account number is required';
        return ACCOUNT_NUMBER_REGEX.test(trimmed) ? '' : 'Enter a valid account number';
      case 'ifscCode':
        if (!trimmed) return 'IFSC code is required';
        return IFSC_REGEX.test(trimmed) ? '' : 'Enter a valid IFSC code';
      case 'bankName':
        return trimmed ? '' : 'Bank name is required';
      case 'supplierName':
        return trimmed ? '' : 'Contact person name is required';
      case 'supplierEmail':
        if (!trimmed) return 'Contact email is required';
        return EMAIL_REGEX.test(trimmed) ? '' : 'Enter a valid email';
      case 'supplierPhone':
        if (!trimmed) return 'Contact phone is required';
        return PHONE_REGEX.test(trimmed) ? '' : 'Enter a valid 10-digit phone number';
      case 'password':
        if (!trimmed) return 'Password is required';
        return PASSWORD_REGEX.test(trimmed)
          ? ''
          : 'Use 8+ chars with upper, lower, number & special';
      case 'confirmPassword':
        if (!trimmed) return 'Confirm password is required';
        return trimmed === data.password ? '' : 'Passwords do not match';
      default:
        return '';
    }
  };

  const normalizeValue = (field: keyof FormData, value: string) => {
    if (field === 'businessPhone' || field === 'supplierPhone') {
      return value.replace(/\D/g, '').slice(0, 10);
    }
    if (field === 'pincode') {
      return value.replace(/\D/g, '').slice(0, 6);
    }
    if (field === 'accountNumber') {
      return value.replace(/\D/g, '').slice(0, 18);
    }
    if (field === 'gstin' || field === 'ifscCode') {
      return value.replace(/\s+/g, '').toUpperCase();
    }
    return value;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    const normalized = typeof value === 'string' ? normalizeValue(field, value) : value;
    if (field === 'gstin' || field === 'hasGST') {
      setGstVerified(false);
    }
    setFormData(prev => {
      const next = { ...prev, [field]: normalized };
      setErrors(prevErrors => {
        const nextErrors = { ...prevErrors };
        const fieldError = validateField(field, String(normalized ?? ''), next);
        if (fieldError) {
          nextErrors[field] = fieldError;
        } else {
          delete nextErrors[field];
        }
        if (field === 'password' || field === 'confirmPassword') {
          const confirmError = validateField('confirmPassword', next.confirmPassword, next);
          if (confirmError) {
            nextErrors.confirmPassword = confirmError;
          } else {
            delete nextErrors.confirmPassword;
          }
        }
        if (field === 'hasGST') {
          const gstError = validateField('gstin', next.gstin, next);
          if (gstError) {
            nextErrors.gstin = gstError;
          } else {
            delete nextErrors.gstin;
          }
        }
        return nextErrors;
      });
      return next;
    });
  };

  const getStepFields = (step: number) => {
    switch (step) {
      case 1:
        return (formData.hasGST ? ['gstin'] : []).concat(['businessName', 'businessEmail', 'businessPhone']) as (keyof FormData)[];
      case 2:
        return ['addressLine1', 'city', 'state', 'pincode'];
      case 3:
        return ['accountHolderName', 'accountNumber', 'ifscCode', 'bankName'];
      case 4:
        return ['supplierName', 'supplierEmail', 'supplierPhone', 'password', 'confirmPassword'];
      default:
        return [];
    }
  };

  const validateFields = (fields: (keyof FormData)[], data: FormData) => {
    const nextErrors: Partial<Record<keyof FormData, string>> = {};
    fields.forEach(field => {
      const error = validateField(field, data[field], data);
      if (error) {
        nextErrors[field] = error;
      }
    });
    return nextErrors;
  };

  const renderError = (field: keyof FormData) => {
    if (!errors[field]) return null;
    return <p className='text-xs text-red-600'>{errors[field]}</p>;
  };

  const allFields = ([
    ...(formData.hasGST ? ['gstin'] : []),
    'businessName',
    'businessEmail',
    'businessPhone',
    'addressLine1',
    'city',
    'state',
    'pincode',
    'accountHolderName',
    'accountNumber',
    'ifscCode',
    'bankName',
    'supplierName',
    'supplierEmail',
    'supplierPhone',
    'password',
    'confirmPassword',
  ] as (keyof FormData)[]);

  const stepFieldsValid =
    Object.keys(validateFields(getStepFields(currentStep), formData)).length === 0;
  const isCurrentStepValid =
    currentStep === 1 && formData.hasGST ? stepFieldsValid && gstVerified : stepFieldsValid;
  const isFormValid = Object.keys(validateFields(allFields, formData)).length === 0;

  const handleVerifyGSTIN = async () => {
    const gstErr = validateField('gstin', formData.gstin, formData);
    if (gstErr) {
      setErrors(prev => ({ ...prev, gstin: gstErr }));
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstNumber: formData.gstin.trim(),
          gstBusinessName: formData.businessName.trim() || undefined,
        }),
      });
      const data = await response.json();

      if (
        !data.success ||
        (data.verification?.errors && data.verification.errors.length > 0)
      ) {
        const err = data.verification?.errors?.find((e: { type: string }) => e.type === 'gst');
        toast({
          title: 'GST Verification Error',
          description:
            err?.error ||
            data.message ||
            'GST verification failed. Check your GSTIN or Cashfree configuration.',
          variant: 'destructive',
        });
        return;
      }

      const gstData = data.verification?.gst;
      if (!gstData) {
        toast({
          title: 'GST Verification Error',
          description: data.message || 'No verification data returned.',
          variant: 'destructive',
        });
        return;
      }

      const isValid =
        gstData.valid === true ||
        gstData.status === 'VALID' ||
        gstData.status === 'SUCCESS' ||
        (typeof gstData.message === 'string' &&
          gstData.message.toLowerCase().includes('exists'));

      if (!isValid) {
        toast({
          title: 'GST Verification Failed',
          description:
            (typeof gstData.message === 'string' && gstData.message) ||
            'GSTIN could not be verified.',
          variant: 'destructive',
        });
        return;
      }

      const gstDetails = (gstData as { data?: Record<string, unknown> }).data || gstData;

      const tradeName =
        (gstDetails.trade_name_of_business as string) ||
        (gstDetails.tradeNam as string) ||
        (gstDetails.lgnm as string) ||
        (gstDetails.trade_name as string);
      const legalName = gstDetails.legal_name_of_business as string | undefined;

      setFormData(prev => ({
        ...prev,
        businessName: prev.businessName || tradeName || legalName || prev.businessName,
      }));

      const split = gstDetails.principal_place_split_address as
        | {
            flat_number?: string;
            building_number?: string;
            building_name?: string;
            street?: string;
            location?: string;
            city?: string;
            state?: string;
            pincode?: string;
          }
        | undefined;

      if (split) {
        const buildingParts = [
          split.flat_number,
          split.building_number,
          split.building_name,
        ].filter(Boolean);
        setFormData(prev => ({
          ...prev,
          addressLine1:
            prev.addressLine1 ||
            (buildingParts.length ? buildingParts.join(', ') : prev.addressLine1),
          addressLine2:
            prev.addressLine2 ||
            [split.street, split.location].filter(Boolean).join(', ') ||
            prev.addressLine2,
          city: prev.city || split.city || prev.city,
          state:
            prev.state ||
            getStateName(split.state || '') ||
            split.state ||
            prev.state,
          pincode: prev.pincode || split.pincode || prev.pincode,
        }));
      } else if (gstDetails.principal_place_address) {
        const address = String(gstDetails.principal_place_address);
        const parts = address.split(',');
        setFormData(prev => ({
          ...prev,
          addressLine1: prev.addressLine1 || parts[0]?.trim() || prev.addressLine1,
          addressLine2:
            prev.addressLine2 ||
            (parts.length > 1 ? parts.slice(1, -2).join(', ').trim() : '') ||
            prev.addressLine2,
        }));
      }

      const pradr = gstDetails.pradr as
        | { dst?: string; stcd?: string; pncd?: string }
        | undefined;
      if (pradr) {
        setFormData(prev => ({
          ...prev,
          city: prev.city || (pradr.dst as string) || prev.city,
          state:
            prev.state || getStateName(String(pradr.stcd || '')) || prev.state,
          pincode: prev.pincode || (pradr.pncd as string) || prev.pincode,
        }));
      }

      setGstVerified(true);
      toast({
        title: 'GST Verified',
        description: 'GSTIN verified. Review auto-filled fields.',
      });
    } catch (error) {
      console.error('GST verification error:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify GSTIN. Try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const validateStep = () => {
    const fields = getStepFields(currentStep);
    setErrors(prevErrors => {
      const nextErrors = { ...prevErrors };
      fields.forEach(field => {
        const error = validateField(field, formData[field], formData);
        if (error) {
          nextErrors[field] = error;
        } else {
          delete nextErrors[field];
        }
      });
      return nextErrors;
    });
    return Object.keys(validateFields(fields, formData)).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) {
      return;
    }

    if (currentStep === 1 && formData.hasGST && !gstVerified) {
      toast({
        title: 'Verify GSTIN',
        description: 'Click Verify to confirm your GSTIN before continuing.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep === 3) {
      setIsVerifying(true);
      try {
        const response = await fetch('/api/verify/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountNumber: formData.accountNumber.trim(),
            ifscCode: formData.ifscCode.trim(),
            accountHolderName: formData.accountHolderName.trim(),
          }),
        });
        const data = await response.json();

        if (
          !data.success ||
          (data.verification?.errors && data.verification.errors.length > 0)
        ) {
          const bankError = data.verification?.errors?.find(
            (e: { type: string }) => e.type === 'bank'
          );
          toast({
            title: 'Bank Verification Error',
            description:
              bankError?.error ||
              data.message ||
              'Bank verification failed. Check details or Cashfree configuration.',
            variant: 'destructive',
          });
          return;
        }

        const bankData = data.verification?.bank;
        if (!bankData) {
          toast({
            title: 'Bank Verification Error',
            description: data.message || 'No bank verification data returned.',
            variant: 'destructive',
          });
          return;
        }

        const bankPayload = bankData as Record<string, unknown>;
        const isError =
          bankPayload.status === 'ERROR' ||
          bankPayload.accountStatus === 'UNABLE_TO_VALIDATE' ||
          bankPayload.accountStatusCode === 'INVALID_IFSC' ||
          bankPayload.accountStatusCode === 'INVALID_ACCOUNT' ||
          bankPayload.accountStatusCode === 'FAILED_AT_BANK' ||
          (typeof bankPayload.message === 'string' &&
            /invalid|failed|error/i.test(bankPayload.message));

        const isValid =
          !isError &&
          (bankPayload.status === 'VALID' ||
            bankPayload.status === 'SUCCESS' ||
            bankPayload.accountStatus === 'VALID' ||
            bankPayload.accountStatusCode === 'ACCOUNT_IS_VALID' ||
            bankPayload.valid === true);

        if (isError) {
          let msg =
            (typeof bankPayload.message === 'string' && bankPayload.message) ||
            'Bank account verification failed.';
          if (bankPayload.accountStatusCode === 'FAILED_AT_BANK') {
            msg =
              'Bank verification failed. Check account number, IFSC, and name match bank records.';
          } else if (bankPayload.accountStatusCode === 'INVALID_IFSC') {
            msg = 'Invalid IFSC code.';
          } else if (bankPayload.accountStatusCode === 'INVALID_ACCOUNT') {
            msg = 'Invalid account number.';
          }
          toast({ title: 'Bank Verification Failed', description: msg, variant: 'destructive' });
          return;
        }

        if (!isValid) {
          toast({
            title: 'Bank Verification Failed',
            description: 'Could not validate bank account.',
            variant: 'destructive',
          });
          return;
        }

        const bankNameFromApi = bankPayload.bankName as string | undefined;
        if (bankNameFromApi) {
          setFormData(prev => ({
            ...prev,
            bankName: prev.bankName || bankNameFromApi,
          }));
        }

        toast({
          title: 'Bank verified',
          description: 'Bank details validated successfully.',
        });
        setCurrentStep(4);
      } catch (e) {
        console.error('Bank verification error:', e);
        toast({
          title: 'Error',
          description: 'Bank verification failed. Try again.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    const allErrors = validateFields(allFields, formData);
    if (Object.keys(allErrors).length > 0) {
      setErrors(prevErrors => ({ ...prevErrors, ...allErrors }));
      return;
    }

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
                        placeholder='Sandbox test e.g. 29AAICP2912R1ZR'
                        className={`flex-1 ${errors.gstin ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        maxLength={15}
                      />
                      <Button 
                        onClick={handleVerifyGSTIN} 
                        disabled={isVerifying}
                        className='bg-[#1F3B29] hover:bg-[#2d5a3f]'>
                        {isVerifying ? 'Verifying...' : 'Verify'}
                      </Button>
                    </div>
                    {renderError('gstin')}
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
                      className={errors.businessName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('businessName')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='businessEmail'>Business Email *</Label>
                    <Input
                      id='businessEmail'
                      type='email'
                      value={formData.businessEmail}
                      onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                      placeholder='business@example.com'
                      className={errors.businessEmail ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('businessEmail')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='businessPhone'>Business Phone *</Label>
                    <Input
                      id='businessPhone'
                      type='tel'
                      value={formData.businessPhone}
                      onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                      placeholder='Enter phone number'
                      className={errors.businessPhone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('businessPhone')}
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
                      className={errors.addressLine1 ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('addressLine1')}
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
                        className={errors.city ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {renderError('city')}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='state'>State *</Label>
                      <Input
                        id='state'
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder='Enter state'
                        className={errors.state ? 'border-red-500 focus-visible:ring-red-500' : ''}
                      />
                      {renderError('state')}
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
                      className={errors.pincode ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('pincode')}
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
                      className={errors.accountHolderName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('accountHolderName')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='accountNumber'>Account Number *</Label>
                    <Input
                      id='accountNumber'
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder='Enter account number'
                      className={errors.accountNumber ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('accountNumber')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='ifscCode'>IFSC Code *</Label>
                    <Input
                      id='ifscCode'
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                      placeholder='Enter IFSC code'
                      className={errors.ifscCode ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('ifscCode')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='bankName'>Bank Name *</Label>
                    <Input
                      id='bankName'
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder='Enter bank name'
                      className={errors.bankName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('bankName')}
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
                      className={errors.supplierName ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('supplierName')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='supplierEmail'>Contact Email *</Label>
                    <Input
                      id='supplierEmail'
                      type='email'
                      value={formData.supplierEmail}
                      onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                      placeholder='contact@example.com'
                      className={errors.supplierEmail ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('supplierEmail')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='supplierPhone'>Contact Phone *</Label>
                    <Input
                      id='supplierPhone'
                      type='tel'
                      value={formData.supplierPhone}
                      onChange={(e) => handleInputChange('supplierPhone', e.target.value)}
                      placeholder='Enter contact phone number'
                      className={errors.supplierPhone ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('supplierPhone')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='password'>Password *</Label>
                    <Input
                      id='password'
                      type='password'
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder='Enter password (min 8 characters)'
                      className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('password')}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm Password *</Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder='Confirm your password'
                      className={errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {renderError('confirmPassword')}
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
              
              {currentStep < TOTAL_STEPS ? (
                <Button
                  onClick={() => void handleNext()}
                  disabled={!isCurrentStepValid || isVerifying}
                  className='flex-1 bg-[#1F3B29] hover:bg-[#2d5a3f]'>
                  {currentStep === 3 && isVerifying ? 'Verifying…' : 'Next'}
                  <ArrowRight className='w-4 h-4 ml-2' />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormValid}
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
