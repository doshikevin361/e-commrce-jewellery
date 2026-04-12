'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Dropdown from '@/components/customDropdown/customDropdown';
import { Loader2, MapPin } from 'lucide-react';
import { reverseGeocodeToIndianPincode } from '@/lib/reverse-geocode-nominatim';
import { INDIAN_STATES, COUNTRY_OPTIONS, matchApiStateToIndianState } from '@/lib/indian-address';
import { Input } from '@/components/ui/input';
import { OTPInput } from '@/components/ui/otp-input';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettings } from '@/components/settings/settings-provider';

// State code to state name mapping for GST
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

const getStateName = (stateCode: string): string | null => {
  if (!stateCode) return null;
  // If it's already a state name (longer than 2 chars), return as is
  if (stateCode.length > 2) return stateCode;
  // Map state code to state name
  return STATE_CODE_MAP[stateCode] || null;
};

/** Selected bank name (dropdown) should match Razorpay IFSC directory bank label */
function bankLabelsMatchForIfsc(selectedFromDropdown: string, bankFromIfscApi: string): boolean {
  const a = selectedFromDropdown.trim().toLowerCase();
  const b = bankFromIfscApi.trim().toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  const norm = (s: string) =>
    s
      .replace(/\b(limited|ltd\.?|co\.?-operative|cooperative)\b/gi, '')
      .replace(/[^a-z0-9]/g, '');
  const na = norm(a);
  const nb = norm(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

/**
 * Cashfree may return HTTP 200 with `message: "GSTIN Doesn't Exist"` — treat as failure.
 * Do not use substring checks like `includes('exists')` (matches "exist" inside "doesn't exist").
 */
function gstPayloadLooksSuccessful(gstData: Record<string, unknown>): boolean {
  const msg = String(gstData.message ?? '').toLowerCase();
  if (gstData.valid === false) return false;
  if (gstData.status === 'INVALID' || gstData.status === 'ERROR') return false;
  if (
    /\b(doesn'?t\s+exist|does\s+not\s+exist|invalid\s+gstin|gstin.*invalid|no\s+such\s+gst|not\s+found)\b/i.test(
      msg
    )
  ) {
    return false;
  }
  if (gstData.valid === true || gstData.status === 'VALID' || gstData.status === 'SUCCESS') {
    return true;
  }
  const details = (gstData.data as Record<string, unknown>) || gstData;
  const split = details.principal_place_split_address as Record<string, string> | undefined;
  const hasPlace =
    split &&
    [split.city, split.state, split.pincode].some(x => String(x || '').trim());
  const hasName = [details.trade_name_of_business, details.legal_name_of_business, details.lgnm].some(
    x => String(x || '').trim()
  );
  return Boolean(hasPlace || hasName);
}

export default function VendorRegistrationPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const siteName = settings.siteName || 'E-commerce';
  const primaryColor = settings.primaryColor || '#2874f0';
  /** Start on email + OTP flow (same as e-commrce after “Start Selling”). */
  const [showSignupForm, setShowSignupForm] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState('Create Account');
  const [formData, setFormData] = useState({
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showRegistrationSteps, setShowRegistrationSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [businessDetails, setBusinessDetails] = useState({
    gstinNumber: '',
  });
  const [pickupAddress, setPickupAddress] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India',
  });
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });
  const [supplierDetails, setSupplierDetails] = useState({
    storeName: '',
    ownerName: '',
    phone: '',
    alternatePhone: '',
    whatsappNumber: '',
    businessType: 'individual' as 'individual' | 'company' | 'partnership',
    password: '',
    confirmPassword: '',
  });
  // Track verification status for each step
  const [verificationStatus, setVerificationStatus] = useState({
    businessDetails: { verified: false, gstVerified: false },
    bankDetails: { verified: false },
  });

  const [postalOffices, setPostalOffices] = useState<
    Array<{ name: string; district: string; state: string }>
  >([]);
  const [pincodeLookupLoading, setPincodeLookupLoading] = useState(false);
  const [pincodeLookupError, setPincodeLookupError] = useState<string | null>(null);
  /** Shown under GST field when Cashfree says invalid / API returns errors */
  const [gstVerificationError, setGstVerificationError] = useState<string | null>(null);
  /** Shown under email when /api/verify/check-vendor-email reports already registered */
  const [vendorEmailCheckError, setVendorEmailCheckError] = useState<string | null>(null);
  const [geoDetecting, setGeoDetecting] = useState(false);

  const [indianBanks, setIndianBanks] = useState<string[]>([]);
  const [indianBanksLoading, setIndianBanksLoading] = useState(true);
  const indianBanksRef = useRef<string[]>([]);
  const [ifscResolved, setIfscResolved] = useState<{
    bank: string;
    branch: string;
    ifsc: string;
  } | null>(null);
  const [ifscDirectoryLoading, setIfscDirectoryLoading] = useState(false);

  const bankNameOptions = useMemo(() => {
    const opts = indianBanks.map(name => ({ value: name, label: name }));
    const cur = bankDetails.bankName.trim();
    if (cur && !opts.some(o => o.value.toLowerCase() === cur.toLowerCase())) {
      opts.unshift({ value: cur, label: `${cur} (custom)` });
    }
    return opts;
  }, [indianBanks, bankDetails.bankName]);

  useEffect(() => {
    indianBanksRef.current = indianBanks;
  }, [indianBanks]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch('/api/reference/indian-banks');
        const j = await r.json();
        if (!cancelled && r.ok && Array.isArray(j.banks)) setIndianBanks(j.banks);
      } catch {
        /* list optional; user can still type via custom */
      } finally {
        if (!cancelled) setIndianBanksLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const ifsc = bankDetails.ifscCode.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
      setIfscResolved(null);
      setIfscDirectoryLoading(false);
      return;
    }

    setIfscDirectoryLoading(true);
    const ac = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const r = await fetch(`/api/reference/ifsc-lookup?ifsc=${encodeURIComponent(ifsc)}`, {
          signal: ac.signal,
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'IFSC not found');
        setIfscResolved({
          bank: j.bank,
          branch: j.branch || '',
          ifsc: j.ifsc,
        });
        const list = indianBanksRef.current;
        const matchName = list.find((b: string) => b.toLowerCase() === String(j.bank).toLowerCase());
        if (matchName) {
          setBankDetails(prev =>
            prev.bankName.toLowerCase() === matchName.toLowerCase()
              ? prev
              : { ...prev, bankName: matchName }
          );
        } else if (j.bank) {
          setBankDetails(prev =>
            prev.bankName.trim().toLowerCase() === String(j.bank).toLowerCase()
              ? prev
              : { ...prev, bankName: j.bank }
          );
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setIfscResolved(null);
      } finally {
        if (!ac.signal.aborted) setIfscDirectoryLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [bankDetails.ifscCode]);

  const cityDropdownOptions = useMemo(() => {
    const fromPostal = [
      ...new Set(
        postalOffices.map(o => o.district?.trim()).filter((d): d is string => Boolean(d))
      ),
    ].sort((a, b) => a.localeCompare(b, 'en-IN'));
    const opts = fromPostal.map(d => ({ value: d, label: d }));
    const current = pickupAddress.city.trim();
    if (current && !fromPostal.some(d => d.toLowerCase() === current.toLowerCase())) {
      opts.unshift({ value: current, label: `${current} (saved)` });
    }
    return opts;
  }, [postalOffices, pickupAddress.city]);

  useEffect(() => {
    const pin = pickupAddress.pinCode.replace(/\D/g, '').slice(0, 6);
    if (pin.length !== 6) {
      setPincodeLookupLoading(false);
      setPincodeLookupError(null);
      setPostalOffices([]);
      return;
    }

    setPincodeLookupLoading(true);
    setPincodeLookupError(null);
    const ac = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const r = await fetch(`/api/reference/postal-pincode?pincode=${encodeURIComponent(pin)}`, {
          signal: ac.signal,
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Could not verify this PIN code');
        const offices = data.postOffices as Array<{ name: string; district: string; state: string }>;
        if (!offices?.length) throw new Error('No data for this PIN code');
        setPostalOffices(offices);
        const first = offices[0];
        const stateVal = matchApiStateToIndianState(first.state);
        setPickupAddress(prev => ({
          ...prev,
          pinCode: pin,
          city: first.district || prev.city,
          state: stateVal || prev.state,
          country: 'India',
          address2:
            offices.length > 1
              ? first.name
              : prev.address2.trim()
                ? prev.address2
                : first.name,
        }));
        setPincodeLookupError(null);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setPostalOffices([]);
        setPincodeLookupError(e instanceof Error ? e.message : 'PIN lookup failed');
      } finally {
        if (!ac.signal.aborted) setPincodeLookupLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [pickupAddress.pinCode]);

  const handleUseCurrentLocation = () => {
    if (!navigator?.geolocation) {
      toast({
        title: 'Not supported',
        description: 'Your browser does not support location access.',
        variant: 'destructive',
      });
      return;
    }

    setGeoDetecting(true);
    setPincodeLookupError(null);
    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          const { pincode } = await reverseGeocodeToIndianPincode(latitude, longitude);
          if (!pincode || !/^\d{6}$/.test(pincode)) {
            throw new Error('Could not detect a valid 6-digit PIN. Enter it manually.');
          }
          setPickupAddress(prev => ({ ...prev, pinCode: pincode }));
          toast({
            description: `PIN ${pincode} detected — filling city and state from India Post.`,
            variant: 'success',
          });
        } catch (e) {
          toast({
            variant: 'destructive',
            title: 'Location',
            description: e instanceof Error ? e.message : 'Unable to detect your location.',
          });
        } finally {
          setGeoDetecting(false);
        }
      },
      geoError => {
        setGeoDetecting(false);
        const description =
          geoError.code === geoError.PERMISSION_DENIED
            ? 'Location permission denied. Allow access or enter PIN manually.'
            : 'Unable to fetch your location. Try again.';
        toast({ variant: 'destructive', title: 'Location', description });
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 }
    );
  };

  const handleSendOTP = async () => {
    setVendorEmailCheckError(null);
    if (!formData.email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    // Check if email is already registered as vendor (early validation)
    setLoading(true);
    try {
      const checkRes = await fetch(
        `/api/verify/check-vendor-email?email=${encodeURIComponent(formData.email)}`
      );
      const checkJson = await checkRes.json();
      if (!checkRes.ok) {
        const msg =
          typeof checkJson.error === 'string'
            ? checkJson.error
            : 'Could not verify this email. Please try again.';
        setVendorEmailCheckError(msg);
        toast({
          title: 'Error',
          description: msg,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      const exists = Boolean(checkJson.exists);
      if (exists) {
        const msg =
          'A vendor with this email is already registered. Use a different email or sign in.';
        setVendorEmailCheckError(msg);
        toast({
          title: 'Email already registered',
          description: msg,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error('Vendor email check error:', e);
      const msg = 'Could not verify this email. Please try again.';
      setVendorEmailCheckError(msg);
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }
    setLoading(false);

    // Clear any existing cooldown interval
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }

    // Immediately show success message and update UI (optimistic update)
    setOtpSent(true);
    setOtpCode('');
    setOtpError(false);
    
    toast({
      title: 'OTP Sent',
      description: 'Please check your email for the OTP code',
      variant: 'success',
    });

    // Start cooldown timer immediately
    setResendCooldown(60);
    cooldownIntervalRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Process OTP sending in background
    (async () => {
    try {
      const response = await fetch('/api/auth/customer/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
          // If OTP sending failed, revert the UI state
          setOtpSent(false);
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current);
            cooldownIntervalRef.current = null;
          }
          setResendCooldown(0);
          
        if (response.status === 429) {
          toast({
            title: 'Please Wait',
            description: data.error || 'Please wait before requesting a new OTP',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
              description: data.error || 'Failed to send OTP. Please try again.',
            variant: 'destructive',
          });
        }
        }
    } catch (error) {
      console.error('Send OTP error:', error);
        // Revert UI state on error
        setOtpSent(false);
        if (cooldownIntervalRef.current) {
          clearInterval(cooldownIntervalRef.current);
          cooldownIntervalRef.current = null;
        }
        setResendCooldown(0);
      toast({
        title: 'Error',
          description: 'Failed to send OTP. Please try again.',
        variant: 'destructive',
      });
    }
    })();
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpSent) {
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      setOtpError(true);
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive',
      });
      setTimeout(() => setOtpError(false), 3000);
      return;
    }

    setLoading(true);
    setOtpError(false);
    try {
      const response = await fetch('/api/auth/customer/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: formData.email, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpError(true);
        toast({
          title: 'Verification Failed',
          description: data.error || 'Invalid or expired OTP',
          variant: 'destructive',
        });
        setTimeout(() => setOtpError(false), 3000);
        return;
      }

      if (data.token && data.customer) {
        // Store token temporarily for completing registration
        sessionStorage.setItem('pendingCustomerToken', data.token);
        sessionStorage.setItem('pendingCustomer', JSON.stringify(data.customer));

        toast({
          title: 'Success',
          description: 'OTP verified! Please complete your business details.',
          variant: 'success',
        });

        // Show registration steps instead of closing
        setShowRegistrationSteps(true);
        setOtpSent(false);
        setOtpCode('');
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If already verified and data hasn't changed, skip verification
    if (verificationStatus.businessDetails.verified && verificationStatus.businessDetails.gstVerified) {
      toast({
        title: 'Success',
        description: 'Business details already saved!',
        variant: 'success',
      });
      setCurrentStep(2);
      return;
    }
    
    // Verify GST if provided
    if (businessDetails.gstinNumber && businessDetails.gstinNumber.trim()) {
      setLoading(true);
      setGstVerificationError(null);
      try {
        const response = await fetch('/api/verify/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gstNumber: businessDetails.gstinNumber.trim(),
          }),
        });

        const data = await response.json();

        // Check for errors first (whether success is true or false)
        if (!data.success || (data.verification?.errors && data.verification.errors.length > 0)) {
          const gstError = data.verification?.errors?.find((e: any) => e.type === 'gst');
          const errText =
            gstError?.error ||
            (!data.success ? data.message : undefined) ||
            data.verification?.errors?.[0]?.error ||
            'GST verification failed. Please check your GST number and try again.';
          setGstVerificationError(errText);
          toast({
            title: 'GST Verification Error',
            description: errText,
            variant: 'destructive',
          });
          return;
        }

        if (data.success && data.verification?.gst) {
          const gstData = data.verification.gst as Record<string, unknown>;
          const isValid = gstPayloadLooksSuccessful(gstData);

          if (isValid) {
            // Auto-fill business details from GST verification response
            // Cashfree API returns data directly (not nested in 'data' field)
            const gstDetails = gstData.data || gstData;
            
            // Extract business name/trade name
            if (gstDetails.trade_name_of_business || gstDetails.tradeNam || gstDetails.lgnm || gstDetails.trade_name) {
              const businessName = gstDetails.trade_name_of_business || 
                                  gstDetails.tradeNam || 
                                  gstDetails.lgnm || 
                                  gstDetails.trade_name;
              setSupplierDetails(prev => ({
                ...prev,
                storeName: prev.storeName || businessName,
                ownerName: prev.ownerName || businessName,
              }));
            }
            
            // Extract legal name if trade name not available
            if (!supplierDetails.storeName && gstDetails.legal_name_of_business) {
              setSupplierDetails(prev => ({
                ...prev,
                storeName: prev.storeName || gstDetails.legal_name_of_business,
                ownerName: prev.ownerName || gstDetails.legal_name_of_business,
              }));
            }
            
            // Extract address from principal_place_split_address (Cashfree response structure)
            if (gstDetails.principal_place_split_address) {
              const splitAddress = gstDetails.principal_place_split_address;
              
              // Building address line 1
              const buildingParts = [
                splitAddress.flat_number,
                splitAddress.building_number,
                splitAddress.building_name,
              ].filter(Boolean);
              
              if (buildingParts.length > 0) {
                setPickupAddress(prev => ({
                  ...prev,
                  address1: prev.address1 || buildingParts.join(', '),
                }));
              }
              
              // Street and location as address line 2
              if (splitAddress.street || splitAddress.location) {
                setPickupAddress(prev => ({
                  ...prev,
                  address2: prev.address2 || [splitAddress.street, splitAddress.location].filter(Boolean).join(', '),
                }));
              }
              
              // City
              if (splitAddress.city) {
                setPickupAddress(prev => ({
                  ...prev,
                  city: prev.city || splitAddress.city,
                }));
              }
              
              // State
              if (splitAddress.state) {
                setPickupAddress(prev => ({
                  ...prev,
                  state: prev.state || splitAddress.state,
                }));
              }
              
              // PIN code
              if (splitAddress.pincode) {
                setPickupAddress(prev => ({
                  ...prev,
                  pinCode: prev.pinCode || splitAddress.pincode,
                }));
              }
            } else if (gstDetails.principal_place_address) {
              // Fallback to full address string if split_address not available
              const address = gstDetails.principal_place_address;
              const addressParts = address.split(',');
              if (addressParts.length > 0) {
                setPickupAddress(prev => ({
                  ...prev,
                  address1: prev.address1 || addressParts[0].trim(),
                  address2: prev.address2 || (addressParts.length > 1 ? addressParts.slice(1, -2).join(', ').trim() : ''),
                }));
              }
            }
            
            // Fallback to old structure if new structure not available
            if (!pickupAddress.city) {
              if (gstDetails.pradr?.dst || gstDetails.city || gstDetails.district) {
                const city = gstDetails.pradr?.dst || gstDetails.city || gstDetails.district;
                setPickupAddress(prev => ({
                  ...prev,
                  city: prev.city || city,
                }));
              }
            }
            
            if (!pickupAddress.state) {
              if (gstDetails.pradr?.stcd || gstDetails.state || gstDetails.state_code) {
                const state = gstDetails.pradr?.stcd || gstDetails.state || gstDetails.state_code;
                const stateName = getStateName(state) || state;
                setPickupAddress(prev => ({
                  ...prev,
                  state: prev.state || stateName,
                }));
              }
            }
            
            if (!pickupAddress.pinCode) {
              if (gstDetails.pradr?.pncd || gstDetails.pincode || gstDetails.pin) {
                const pincode = gstDetails.pradr?.pncd || gstDetails.pincode || gstDetails.pin;
                setPickupAddress(prev => ({
                  ...prev,
                  pinCode: prev.pinCode || pincode,
                }));
              }
            }
            
            setGstVerificationError(null);
            toast({
              title: 'GST Verified',
              description: 'GSTIN verified and details auto-filled!',
              variant: 'success',
            });
            
            // Mark as verified
            setVerificationStatus(prev => ({
              ...prev,
              businessDetails: { verified: true, gstVerified: true },
            }));
            
            // Move to next step after successful verification
            setCurrentStep(2);
            return;
          } else {
            const failMsg =
              (typeof gstData.message === 'string' && gstData.message) ||
              'GSTIN verification failed. Please check your GST number and try again.';
            setGstVerificationError(failMsg);
            toast({
              title: 'GST Verification Failed',
              description: failMsg,
              variant: 'destructive',
            });
            // Don't proceed to next step if verification failed
            return;
          }
        } else if (data.verification?.errors) {
          const gstError = data.verification.errors.find((e: any) => e.type === 'gst');
          if (gstError) {
            setGstVerificationError(gstError.error || 'GST verification failed.');
            toast({
              title: 'GST Verification Error',
              description: gstError.error || 'GST verification failed. Please check your GST number and try again.',
              variant: 'destructive',
            });
          }
          // Don't proceed to next step if verification error
          return;
        }
      } catch (error) {
        console.error('GST verification error:', error);
        setGstVerificationError('GST verification failed. Please check your GST number and try again.');
        toast({
          title: 'Verification Error',
          description: 'GST verification failed. Please check your GST number and try again.',
          variant: 'destructive',
        });
        // Don't proceed to next step if verification error
        return;
      } finally {
        setLoading(false);
      }
    }
    
    // If no GST provided, move to next step directly
    // Mark as verified (no GST verification needed)
    setVerificationStatus(prev => ({
      ...prev,
      businessDetails: { verified: true, gstVerified: false },
    }));
    
    toast({
      title: 'Success',
      description: 'Business details saved!',
      variant: 'success',
    });
    
    setCurrentStep(2); // Move to next step (Pickup Address)
  };

  const handlePickupAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!pickupAddress.address1 || !pickupAddress.city || !pickupAddress.state || !pickupAddress.pinCode) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!/^\d{6}$/.test(pickupAddress.pinCode.trim())) {
      toast({
        title: 'Error',
        description: 'Enter a valid 6-digit PIN code',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Pickup address saved!',
      variant: 'success',
    });
    
    setCurrentStep(3); // Move to Bank Details
  };

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !bankDetails.bankName?.trim() ||
      !bankDetails.accountNumber ||
      !bankDetails.confirmAccountNumber ||
      !bankDetails.ifscCode ||
      !bankDetails.accountHolderName
    ) {
      toast({
        title: 'Error',
        description:
          'Please fill all required bank details (Bank name, IFSC, account number, confirm account number, account holder name).',
        variant: 'destructive',
      });
      return;
    }

    if (ifscResolved && !bankLabelsMatchForIfsc(bankDetails.bankName, ifscResolved.bank)) {
      toast({
        title: 'Bank does not match IFSC',
        description: `This IFSC belongs to "${ifscResolved.bank}". Select that bank in the dropdown or fix the IFSC.`,
        variant: 'destructive',
      });
      return;
    }
    
    // Validate that both account numbers match
    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      toast({
        title: 'Error',
        description: 'Account numbers do not match. Please enter the same account number in both fields.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate IFSC format (11 characters: 4 letters + 0 + 6 digits)
    const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscPattern.test(bankDetails.ifscCode)) {
      toast({
        title: 'Error',
        description: 'Invalid IFSC code format. IFSC should be 11 characters: 4 letters + 0 + 6 alphanumeric characters (e.g., CBIN0000028)',
        variant: 'destructive',
      });
      return;
    }
    
    // If already verified and data hasn't changed, skip verification
    if (verificationStatus.bankDetails.verified) {
      toast({
        title: 'Success',
        description: 'Bank details already verified!',
        variant: 'success',
      });
      setCurrentStep(4);
      return;
    }
    
    // Verify Bank Account (mandatory)
    // Use accountHolderName from bankDetails (user entered), not business name
    setLoading(true);
    try {
      const response = await fetch('/api/verify/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: bankDetails.bankName.trim(),
          accountNumber: bankDetails.accountNumber.trim(),
          ifscCode: bankDetails.ifscCode.trim(),
          accountHolderName: bankDetails.accountHolderName.trim(),
        }),
      });

      const data = await response.json();

      // Check for errors first
      if (!data.success || (data.verification?.errors && data.verification.errors.length > 0)) {
        const bankError = data.verification?.errors?.find((e: any) => e.type === 'bank');
        if (bankError) {
          toast({
            title: 'Bank Verification Error',
            description: bankError.error || data.message || 'Bank verification failed. Please check your bank details and try again.',
            variant: 'destructive',
          });
        } else if (!data.success && data.message) {
          toast({
            title: 'Bank Verification Error',
            description: data.message || 'Bank verification failed. Please check your bank details and try again.',
            variant: 'destructive',
          });
        }
        // Don't proceed to next step if verification failed
        return;
      }

      if (data.success && data.verification?.bank) {
        const bankData = data.verification.bank;
        
        // Check for error status first
        const isError = bankData.status === 'ERROR' || 
                       bankData.accountStatus === 'UNABLE_TO_VALIDATE' ||
                       bankData.accountStatusCode === 'INVALID_IFSC' ||
                       bankData.accountStatusCode === 'INVALID_ACCOUNT' ||
                       bankData.accountStatusCode === 'FAILED_AT_BANK' ||
                       (bankData.message && (
                         bankData.message.toLowerCase().includes('invalid') ||
                         bankData.message.toLowerCase().includes('failed') ||
                         bankData.message.toLowerCase().includes('error')
                       ));
        
        // Check for valid status
        const isValid = !isError && (
                       bankData.status === 'VALID' || 
                       bankData.status === 'SUCCESS' ||
                       bankData.accountStatus === 'VALID' ||
                       bankData.accountStatusCode === 'ACCOUNT_IS_VALID' ||
                       bankData.valid === true ||
                       (bankData.message && bankData.message.toLowerCase().includes('verified') && !bankData.message.toLowerCase().includes('invalid'))
        );
        
        if (isError) {
          // Provide specific error messages based on error type
          let errorMessage = bankData.message || 'Bank account verification failed.';
          
          if (bankData.accountStatusCode === 'FAILED_AT_BANK') {
            errorMessage = 'Bank verification failed. Please verify: 1) Account number is correct, 2) IFSC code is correct (11 characters: 4 letters + 0 + 6 digits), 3) Account holder name matches bank records exactly. If all details are correct, the bank server may be temporarily unavailable.';
          } else if (bankData.accountStatusCode === 'INVALID_IFSC') {
            errorMessage = 'Invalid IFSC code. Please enter a valid 11-character IFSC code (format: 4 letters + 0 + 6 digits, e.g., CBIN0000028).';
          } else if (bankData.accountStatusCode === 'INVALID_ACCOUNT') {
            errorMessage = 'Invalid account number. Please check your account number and try again.';
          } else if (bankData.accountStatusCode === 'INVALID_FIELD') {
            errorMessage =
              'Bank could not validate these details. Recheck IFSC, account number, and name as on bank records. Ensure Secure ID → Bank Account product is enabled and server env uses the same CASHFREE_CLIENT_ID / SECRET as the dashboard, with Public Key 2FA and verification public key configured.';
          }
          
          toast({
            title: 'Bank Verification Failed',
            description: errorMessage,
            variant: 'destructive',
          });
          // Don't proceed to next step if verification failed
          return;
        } else if (isValid) {
          toast({
            title: 'Bank Account Verified',
            description: 'Bank account verification successful!',
            variant: 'success',
          });
          
          // Mark as verified
          setVerificationStatus(prev => ({
            ...prev,
            bankDetails: { verified: true },
          }));
          
          // Move to next step after successful verification
          setCurrentStep(4);
          return;
        } else {
          toast({
            title: 'Bank Verification Failed',
            description: bankData.message || bankData.accountStatusCode || 'Bank account verification failed. Please check your bank details and try again.',
            variant: 'destructive',
          });
          // Don't proceed to next step if verification failed
          return;
        }
      } else if (data.verification?.errors) {
        const bankError = data.verification.errors.find((e: any) => e.type === 'bank');
        if (bankError) {
          toast({
            title: 'Bank Verification Error',
            description: bankError.error || 'Bank verification failed. Please check your bank details and try again.',
            variant: 'destructive',
          });
        }
        // Don't proceed to next step if verification error
        return;
      }
    } catch (error) {
      console.error('Bank verification error:', error);
      toast({
        title: 'Verification Error',
        description: 'Bank verification failed. Please check your bank details and try again.',
        variant: 'destructive',
      });
      // Don't proceed to next step if verification error
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!supplierDetails.storeName || !supplierDetails.ownerName || !supplierDetails.phone) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Password validation
    if (!supplierDetails.password || supplierDetails.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (supplierDetails.password !== supplierDetails.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        hasGST: Boolean(businessDetails.gstinNumber?.trim()),
        gstin: (businessDetails.gstinNumber || '').trim(),
        businessName: supplierDetails.storeName.trim(),
        businessEmail: formData.email.trim(),
        businessPhone: supplierDetails.phone.trim(),
        addressLine1: pickupAddress.address1.trim(),
        addressLine2: (pickupAddress.address2 || '').trim(),
        city: pickupAddress.city.trim(),
        state: pickupAddress.state.trim(),
        pincode: pickupAddress.pinCode.trim(),
        accountHolderName: bankDetails.accountHolderName.trim(),
        accountNumber: bankDetails.accountNumber.trim(),
        ifscCode: bankDetails.ifscCode.replace(/\s/g, '').toUpperCase(),
        bankName: bankDetails.bankName.trim(),
        supplierName: supplierDetails.ownerName.trim(),
        supplierEmail: formData.email.trim(),
        supplierPhone: (supplierDetails.alternatePhone || supplierDetails.phone).trim(),
        password: supplierDetails.password,
        businessType: supplierDetails.businessType,
        otpVerified: true,
      };

      const response = await fetch('/api/vendor-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create vendor account');
      }

      toast({
        title: 'Success',
        description:
          data.message ||
          'Registration submitted! Your vendor account is pending admin approval.',
        variant: 'success',
      });

      sessionStorage.removeItem('pendingCustomerToken');
      sessionStorage.removeItem('pendingCustomer');

      router.push('/');
    } catch (error: any) {
      console.error('Vendor registration error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Section refs for scroll detection (only for sections below hero)
  const sectionRefs = {
    'Create Account': useRef<HTMLDivElement>(null),
    'List Products': useRef<HTMLDivElement>(null),
    'Storage & Shipping': useRef<HTMLDivElement>(null),
    'Receive Payments': useRef<HTMLDivElement>(null),
    'Grow Faster': useRef<HTMLDivElement>(null),
    'Seller App': useRef<HTMLDivElement>(null),
    'Help & Support': useRef<HTMLDivElement>(null),
  };

  const heroSectionRef = useRef<HTMLDivElement>(null);

  // Scroll to section
  const scrollToSection = (section: string) => {
    const ref = sectionRefs[section as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Auto-detect active section on scroll (only after hero section)
  useEffect(() => {
    const handleScroll = () => {
      // Check if we've scrolled past hero section
      if (heroSectionRef.current) {
        const heroBottom = heroSectionRef.current.offsetTop + heroSectionRef.current.offsetHeight;
        const scrollPosition = window.scrollY + 250; // Offset for better detection

        // Only detect sections if we've scrolled past hero
        if (scrollPosition < heroBottom) {
          setActiveMenuItem('Create Account');
          return;
        }
      }

      const scrollPosition = window.scrollY + 250; // Offset for better detection
      const sections = Object.keys(sectionRefs) as Array<keyof typeof sectionRefs>;
      
      // Start from bottom section and go up
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const ref = sectionRefs[section];
        if (ref?.current) {
          const offsetTop = ref.current.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveMenuItem(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If signup form is not shown, display landing page
  if (!showSignupForm) {
    return (
      <div className='min-h-screen bg-white'>
        {/* Header - Flipkart Exact Style with Navigation */}
        <header className='bg-white border-b border-gray-200 sticky top-0 z-50'>
          <div className='max-w-full mx-auto'>
            <div className='flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8'>
              <div className='flex items-center gap-8'>
                <Link href='/' className='flex items-center gap-2'>
                  {settings.logo ? (
                    <img src={settings.logo} alt={siteName} className='h-9 object-contain' />
                  ) : (
                    <span className='text-2xl font-bold' style={{ color: primaryColor }}>
                      {siteName}
                    </span>
                  )}
                </Link>
              </div>
              
              {/* Header Buttons */}
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => router.push('/login')}
                  className='px-6 py-2 bg-white text-[#212121] text-sm font-medium border border-gray-300 rounded-sm hover:bg-gray-50 transition'>
                  Login
                </button>
                <button
                  onClick={() => setShowSignupForm(true)}
                  className='px-6 py-2 bg-[#fbc02d] text-[#212121] text-sm font-medium rounded-sm hover:bg-[#f9a825] transition'>
                  Start Selling
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Not part of sidebar navigation */}
        <div ref={heroSectionRef} className='py-8 px-8 bg-white border-b border-gray-200'>
          <div className='max-w-7xl mx-auto'>
            {/* Breadcrumb */}
            <div className='text-sm text-[#878787] mb-4'>
              <Link href='/' className='hover:text-[#2874f0]'>Home</Link>
              <span className='mx-2'>&gt;</span>
              <span>Sell Online</span>
            </div>
            
            {/* Hero Content */}
            <div className='flex flex-col md:flex-row items-start gap-8 mb-12'>
              <div className='flex-1'>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-[#212121] mb-6 leading-tight'>
                  Sell Online with {siteName}
                </h1>
              </div>
              <div className='w-full md:w-96 h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden'>
                <span className='text-gray-400 text-sm'>Hero Image</span>
              </div>
            </div>

            {/* Benefits Cards */}
            <div className='bg-gray-50 rounded-lg p-6 mb-12'>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                    <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                    </svg>
                  </div>
                  <p className='text-sm text-[#212121] font-medium'>1M+ {siteName} customers</p>
                </div>
                
                <div className='text-center border-l border-gray-300 pl-4'>
                  <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                    <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                  <p className='text-sm text-[#212121] font-medium'>7+ days secure & regular payments</p>
                </div>
                
                <div className='text-center border-l border-gray-300 pl-4'>
                  <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                    <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                    </svg>
                  </div>
                  <p className='text-sm text-[#212121] font-medium'>Low cost of doing business</p>
                </div>
                
                <div className='text-center border-l border-gray-300 pl-4'>
                  <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                    <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' />
                    </svg>
                  </div>
                  <p className='text-sm text-[#212121] font-medium'>One click Seller Support</p>
                </div>
                
                <div className='text-center border-l border-gray-300 pl-4'>
                  <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                    <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' />
                    </svg>
                  </div>
                  <p className='text-sm text-[#212121] font-medium'>Access to Big Sales Events & more</p>
                </div>
              </div>
            </div>

            {/* Seller Success Stories */}
            <div className='mb-12'>
              <h2 className='text-2xl md:text-3xl font-bold mb-6'>
                <span className='text-[#2874f0]'>Seller</span>{' '}
                <span className='text-[#212121]'>Success Stories</span>
              </h2>
              
              <div className='bg-[#f5f5f5] rounded-lg p-8 relative'>
                <div className='flex flex-col md:flex-row items-start gap-6'>
                  <div className='w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0'>
                    <span className='text-2xl font-bold text-[#212121]'>RL</span>
                  </div>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-[#212121] mb-2'>
                      Raju Lunawath, Amazestore
                    </h3>
                    <p className='text-[#212121] text-[15px] leading-relaxed'>
                      Starting with just one category, their unwavering support and innovative platform empowered me to grow exponentially, expanding to six diverse categories and achieving an astounding 5x growth year on year.
                    </p>
                  </div>
                </div>
                
                {/* Carousel Controls */}
                <button className='absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition'>
                  <svg className='w-4 h-4 text-[#212121]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                  </svg>
                </button>
                <button className='absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition'>
                  <svg className='w-4 h-4 text-[#212121]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                  </svg>
                </button>
                
                {/* Dots */}
                <div className='flex gap-2 justify-center mt-6'>
                  <div className='w-2 h-2 rounded-full bg-[#2874f0]'></div>
                  <div className='w-2 h-2 rounded-full bg-gray-300'></div>
                  <div className='w-2 h-2 rounded-full bg-gray-300'></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout with Sidebar - Starts after Hero */}
        <div className='flex'>
          {/* Left Sidebar */}
          <aside className='w-64 bg-white border-r border-gray-200 sticky top-16 self-start'>
            <nav className='p-4 space-y-1'>
              {[
                'Create Account',
                'List Products',
                'Storage & Shipping',
                'Receive Payments',
                'Grow Faster',
                'Seller App',
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium rounded transition ${
                    activeMenuItem === item
                      ? 'bg-[#e3f2fd] text-[#2874f0] border-l-4 border-[#2874f0]'
                      : 'text-[#212121] hover:bg-gray-50'
                  }`}>
                  {item}
                </button>
              ))}
              
              {/* Help & Support Button */}
              <button
                onClick={() => scrollToSection('Help & Support')}
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded transition mt-4 border-2 ${
                  activeMenuItem === 'Help & Support'
                    ? 'bg-[#e3f2fd] text-[#2874f0] border-[#2874f0]'
                    : 'text-[#212121] border-[#2874f0] hover:bg-gray-50'
                }`}>
                <div className='flex items-center gap-2'>
                  <span className='w-6 h-6 rounded-full bg-[#2874f0] text-white text-xs font-bold flex items-center justify-center'>f</span>
                  Help & Support
                </div>
              </button>
            </nav>
          </aside>

          {/* Main Content Area - All Sections on One Page */}
          <main className='flex-1 bg-white'>
            {/* Hero Section - Not part of sidebar navigation */}
            <div ref={heroSectionRef} className='py-8 px-8 bg-white border-b border-gray-200'>
              <div className='max-w-7xl mx-auto'>
                {/* Breadcrumb */}
                <div className='text-sm text-[#878787] mb-4'>
                  <Link href='/' className='hover:text-[#2874f0]'>Home</Link>
                  <span className='mx-2'>&gt;</span>
                  <span>Sell Online</span>
                </div>
                
                {/* Hero Content */}
                <div className='flex flex-col md:flex-row items-start gap-8 mb-12'>
                  <div className='flex-1'>
                    <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-[#212121] mb-6 leading-tight'>
                      Sell Online with {siteName}
                    </h1>
                  </div>
                  <div className='w-full md:w-96 h-64 md:h-80 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden'>
                    <span className='text-gray-400 text-sm'>Hero Image</span>
                  </div>
                </div>

                {/* Benefits Cards */}
                <div className='bg-gray-50 rounded-lg p-6 mb-12'>
                  <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
                    <div className='text-center'>
                      <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                        <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
                        </svg>
                      </div>
                      <p className='text-sm text-[#212121] font-medium'>1M+ {siteName} customers</p>
                    </div>
                    
                    <div className='text-center border-l border-gray-300 pl-4'>
                      <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                        <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                      </div>
                      <p className='text-sm text-[#212121] font-medium'>7+ days secure & regular payments</p>
                    </div>
                    
                    <div className='text-center border-l border-gray-300 pl-4'>
                      <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                        <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' />
                        </svg>
                      </div>
                      <p className='text-sm text-[#212121] font-medium'>Low cost of doing business</p>
                    </div>
                    
                    <div className='text-center border-l border-gray-300 pl-4'>
                      <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                        <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' />
                        </svg>
                      </div>
                      <p className='text-sm text-[#212121] font-medium'>One click Seller Support</p>
                    </div>
                    
                    <div className='text-center border-l border-gray-300 pl-4'>
                      <div className='w-12 h-12 bg-[#e3f2fd] rounded-full flex items-center justify-center mx-auto mb-3'>
                        <svg className='w-6 h-6 text-[#2874f0]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' />
                        </svg>
                      </div>
                      <p className='text-sm text-[#212121] font-medium'>Access to Big Sales Events & more</p>
                    </div>
                  </div>
                </div>

                {/* Seller Success Stories */}
                <div className='mb-12'>
                  <h2 className='text-2xl md:text-3xl font-bold mb-6'>
                    <span className='text-[#2874f0]'>Seller</span>{' '}
                    <span className='text-[#212121]'>Success Stories</span>
                  </h2>
                  
                  <div className='bg-[#f5f5f5] rounded-lg p-8 relative'>
                    <div className='flex flex-col md:flex-row items-start gap-6'>
                      <div className='w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0'>
                        <span className='text-2xl font-bold text-[#212121]'>RL</span>
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-lg font-semibold text-[#212121] mb-2'>
                          Raju Lunawath, Amazestore
                        </h3>
                        <p className='text-[#212121] text-[15px] leading-relaxed'>
                          Starting with just one category, their unwavering support and innovative platform empowered me to grow exponentially, expanding to six diverse categories and achieving an astounding 5x growth year on year.
                        </p>
                      </div>
                    </div>
                    
                    {/* Carousel Controls */}
                    <button className='absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition'>
                      <svg className='w-4 h-4 text-[#212121]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                      </svg>
                    </button>
                    <button className='absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition'>
                      <svg className='w-4 h-4 text-[#212121]' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
                      </svg>
                    </button>
                    
                    {/* Dots */}
                    <div className='flex gap-2 justify-center mt-6'>
                      <div className='w-2 h-2 rounded-full bg-[#2874f0]'></div>
                      <div className='w-2 h-2 rounded-full bg-gray-300'></div>
                      <div className='w-2 h-2 rounded-full bg-gray-300'></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Account Section */}
            <div ref={sectionRefs['Create Account']} className='py-12 px-8 scroll-mt-20'>
              <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#212121] mb-6 pb-4 border-b-4 border-[#2874f0] inline-block'>
                  Create Account
                </h1>
                <div className='bg-white mt-8'>
                  <p className='text-[#878787] mb-6 leading-relaxed text-[15px]'>
                    Get started by creating your seller account. It only takes a few minutes to register and start selling on {siteName}. Creating your {siteName} seller account is a quick process, taking less than 10 minutes, and requires only 2 documents.
                  </p>
                  <button
                    onClick={() => setShowSignupForm(true)}
                    className='px-8 py-3 bg-[#2874f0] text-white font-medium rounded-sm hover:opacity-95 transition'>
                    Create Your Account
                  </button>
                </div>
              </div>
            </div>

            {/* List Products Section */}
            <div ref={sectionRefs['List Products']} className='py-12 px-8 bg-gray-50 scroll-mt-20'>
              <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#212121] mb-6 pb-4 border-b-4 border-[#2874f0] inline-block'>
                  List Products
                </h1>
                <div className='bg-white border border-gray-200 rounded-lg p-8 mt-8'>
                  <p className='text-[#212121] text-[15px] leading-relaxed mb-6'>
                    What is a listing? A listing refers to the process of registering your product on the {siteName} platform, making it visible to customers, and enabling them to view and purchase your product. It involves creating a detailed product page that includes essential information such as product title, description, images, pricing, and other relevant details.
                  </p>
                  <div className='bg-[#e3f2fd] p-4 rounded-lg mb-6'>
                    <div className='flex items-start gap-3'>
                      <svg className='w-5 h-5 text-[#2874f0] flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' />
                      </svg>
                      <p className='text-[#212121] text-sm'>
                        Did you know that providing precise and comprehensive information about your product, along with clear and captivating images, can increase visibility on our platform by up to 15%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage & Shipping Section */}
            <div ref={sectionRefs['Storage & Shipping']} className='py-12 px-8 scroll-mt-20'>
              <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#212121] mb-6 pb-4 border-b-4 border-[#2874f0] inline-block'>
                  Storage & Shipping
                </h1>
                <div className='bg-white mt-8'>
                  <p className='text-[#212121] text-[15px] leading-relaxed mb-6'>
                    We provide two fulfillment options for you to choose from:
                  </p>
                  <div className='space-y-6'>
                    <div className='border border-gray-200 rounded-lg p-6'>
                      <h3 className='text-xl font-semibold text-[#212121] mb-4'>Fulfillment by {siteName} (FBF)</h3>
                      <p className='text-[#878787] text-[15px] leading-relaxed mb-4'>
                        {siteName} takes care of the logistics. Store your products in our warehouses, and we handle packing, shipping, and delivery.
                      </p>
                      <ul className='space-y-2'>
                        {['Pick-up from seller location to warehouse', 'Assured badge', 'Faster delivery to customer', 'Seamless order processing', 'Customer returns handled end to end'].map((item, idx) => (
                          <li key={idx} className='flex items-start gap-2 text-[#212121] text-sm'>
                            <svg className='w-5 h-5 text-[#2874f0] flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className='border border-gray-200 rounded-lg p-6'>
                      <h3 className='text-xl font-semibold text-[#212121] mb-4'>Non Fulfillment by {siteName} (NFBF)</h3>
                      <p className='text-[#878787] text-[15px] leading-relaxed mb-4'>
                        You manage packaging and dispatch while we handle shipping and delivery.
                      </p>
                      <ul className='space-y-2'>
                        {['Delivery to 19000+ pin codes across India', 'Tracking of your product', 'Customer returns support', 'Logistics support from community warehouse available'].map((item, idx) => (
                          <li key={idx} className='flex items-start gap-2 text-[#212121] text-sm'>
                            <svg className='w-5 h-5 text-[#2874f0] flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                            </svg>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Receive Payments Section */}
            <div ref={sectionRefs['Receive Payments']} className='py-12 px-8 bg-gray-50 scroll-mt-20'>
              <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#212121] mb-6 pb-4 border-b-4 border-[#2874f0] inline-block'>
                  Receive Payments
                </h1>
                <div className='bg-white border border-gray-200 rounded-lg p-8 mt-8'>
                  <div className='flex flex-col md:flex-row items-center gap-6'>
                    <div className='flex-1'>
                      <p className='text-[#212121] text-[15px] leading-relaxed mb-4'>
                        Get paid securely and on time. We offer multiple payment options and ensure timely settlements for your sales. Payments as fast as 7 days from dispatch directly into your registered bank account.
                      </p>
                    </div>
                    <div className='w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center'>
                      <span className='text-gray-400 text-xs'>Payment Icon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grow Faster Section */}
            <div ref={sectionRefs['Grow Faster']} className='py-12 px-8 scroll-mt-20'>
              <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#212121] mb-6 pb-4 border-b-4 border-[#2874f0] inline-block'>
                  Grow Faster
                </h1>
                <div className='bg-white mt-8'>
                  <p className='text-[#878787] text-[15px] leading-relaxed mb-6'>
                    Leverage our marketing tools and insights to grow your business faster. Access analytics, promotional tools, and growth strategies to reach more customers and increase sales.
                  </p>
                </div>
              </div>
            </div>

            {/* Seller App Section */}
            <div ref={sectionRefs['Seller App']} className='py-12 px-8 bg-[#e3f2fd] scroll-mt-20'>
              <div className='max-w-7xl mx-auto'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#212121] mb-6 pb-4 border-b-4 border-[#2874f0] inline-block'>
                  Seller App
                </h1>
                <div className='flex flex-col md:flex-row items-center justify-between gap-6 mt-8'>
                  <div className='flex-1'>
                    <p className='text-[#212121] text-[15px] leading-relaxed mb-6'>
                      Stay connected and in control of your {siteName} business with the Seller Hub App. Your trusted companion for managing your business on the go.
                    </p>
                    <ul className='space-y-3 mb-6'>
                      {['Create and manage listing', 'Manage orders and fulfillment', 'Track inventory', 'Payments', 'Advertising', 'Business Insights', 'Seller Support and more'].map((item, idx) => (
                        <li key={idx} className='flex items-center gap-3 text-[#212121] text-sm'>
                          <svg className='w-5 h-5 text-[#2874f0] flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                          </svg>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className='flex gap-4'>
                      <a href='#' className='text-[#2874f0] text-sm font-medium hover:underline'>Google Play</a>
                      <a href='#' className='text-[#2874f0] text-sm font-medium hover:underline'>Apple Store</a>
                    </div>
                  </div>
                  <div className='w-48 h-96 bg-white rounded-lg shadow-lg flex items-center justify-center border border-gray-200'>
                    <span className='text-gray-400 text-sm'>Phone Mockup</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Support Section */}
            <div ref={sectionRefs['Help & Support']} className='py-12 px-8 scroll-mt-20'>
              <div className='max-w-4xl mx-auto'>
                <h1 className='text-3xl md:text-4xl font-bold text-[#212121] mb-6 pb-4 border-b-4 border-[#2874f0] inline-block'>
                  Help & Support
                </h1>
                <div className='mt-8 relative'>
                  <p className='text-[#212121] text-[15px] leading-relaxed mb-6 max-w-2xl'>
                    What sets us apart is our exceptional {siteName} seller support assistance. We prioritise your needs and are committed to providing you with prompt assistance, whether you have questions, doubts, or require any kind of support for your business. Our dedicated team is here to help you every step of the way, ensuring that you have a smooth and successful selling experience on {siteName}. Feel free to reach out to us whenever you need assistance - we're always here to support you.
                  </p>
                  <div className='absolute bottom-0 right-0 w-64 h-64 opacity-20 pointer-events-none'>
                    <div className='w-full h-full bg-gray-300 rounded-lg flex items-center justify-center'>
                      <span className='text-gray-500 text-xs'>Support Image</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show signup form when user clicks "Start Selling"
  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={() => router.push('/')}
              className='flex items-center gap-2 hover:opacity-80 transition'>
              <svg className='w-8 h-8 text-web' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M10 19l-7-7 7-7' />
              </svg>
              <span className='text-lg font-semibold text-gray-800'>Back</span>
            </button>
            <Link href='/login' className='text-web font-medium hover:underline'>
              Already a user? Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {!showRegistrationSteps ? (
          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='text-center mb-8'>
              <h1 className='text-3xl font-bold text-web mb-2'>Vendor registration</h1>
              <p className='text-gray-600'>Verify your email with OTP to continue</p>
            </div>

            <form onSubmit={handleVerifyOTP} className='max-w-md mx-auto space-y-6'>
              <div>
                <label htmlFor='member-email' className='block text-sm font-semibold text-gray-700 mb-2'>
                  Email Address <span className='text-red-500'>*</span>
                </label>
                <Input
                  id='member-email'
                  type='email'
                  value={formData.email}
                  onChange={e => {
                    setVendorEmailCheckError(null);
                    setFormData(prev => ({ ...prev, email: e.target.value }));
                    // Reset OTP state when email changes
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  placeholder='Enter your email address'
                  required
                  className='w-full'
                  disabled={loading || otpSent}
                />
                {vendorEmailCheckError ? (
                  <p className='text-sm text-red-600 mt-2' role='alert'>
                    {vendorEmailCheckError}
                  </p>
                ) : null}
              </div>

              {!otpSent ? (
                <button
                  type='button'
                  onClick={(event) => {
                    event.preventDefault();
                    handleSendOTP();
                  }}
                  disabled={!formData.email.trim() || loading}
                  className='w-full bg-web text-white rounded-full px-6 py-3 font-semibold hover:bg-web/90 transition disabled:opacity-50 disabled:cursor-not-allowed'>
                  {loading ? 'Checking...' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-4 text-center'>
                      Enter OTP
                    </label>
                    <OTPInput
                      length={6}
                      value={otpCode}
                      onChange={(value) => {
                        setOtpCode(value);
                        if (otpError) setOtpError(false);
                      }}
                      disabled={loading || otpLoading}
                      error={otpError}
                      className='mb-4'
                    />
                    <p className='text-xs text-gray-500 mt-4 text-center'>
                      Check your email for the OTP code
                    </p>
                  </div>
                  
                  <div className='flex items-center justify-center gap-2'>
                    <button
                      type='button'
                      onClick={handleSendOTP}
                      disabled={resendCooldown > 0}
                      className='text-sm text-web hover:underline disabled:opacity-50 disabled:cursor-not-allowed'>
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button
                    type='submit'
                    disabled={loading || otpCode.length !== 6}
                    className='w-full bg-web text-white rounded-full px-6 py-3 font-semibold hover:bg-web/90 transition disabled:opacity-50 disabled:cursor-not-allowed'>
                    {loading ? 'Verifying...' : 'Create Account'}
                  </button>
                </>
              )}
            </form>
          </div>
        ) : (
          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='text-center mb-8'>
              <h1 className='text-3xl font-bold text-web mb-2'>Complete Your Profile</h1>
              <p className='text-gray-600'>Help us know you better</p>
            </div>

            {/* Step Tabs */}
            <div className='flex items-center justify-between border-b pb-4 mb-8'>
              <div className='flex flex-col items-center flex-1'>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === 1 ? 'bg-web text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${currentStep === 1 ? 'text-web' : 'text-gray-500'}`}>
                  Business Details
                </span>
              </div>

              <div className='flex flex-col items-center flex-1'>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === 2 ? 'bg-web text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${currentStep === 2 ? 'text-web' : 'text-gray-500'}`}>
                  Pickup Address
                </span>
              </div>

              <div className='flex flex-col items-center flex-1'>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === 3 ? 'bg-web text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${currentStep === 3 ? 'text-web' : 'text-gray-500'}`}>
                  Bank Details
                </span>
              </div>

              <div className='flex flex-col items-center flex-1'>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  currentStep === 4 ? 'bg-web text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                  </svg>
                </div>
                <span className={`text-sm font-medium ${currentStep === 4 ? 'text-web' : 'text-gray-500'}`}>
                  Supplier Details
                </span>
              </div>
            </div>

            {/* Step 1: Business Details */}
            {currentStep === 1 && (
              <form onSubmit={handleBusinessDetailsSubmit} className='max-w-2xl mx-auto space-y-6'>
                <div>
                  <label htmlFor='gstin' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Enter your GSTIN Number
                  </label>
                  <Input
                    id='gstin'
                    type='text'
                    value={businessDetails.gstinNumber}
                    onChange={e => {
                      const newValue = e.target.value.toUpperCase();
                      setGstVerificationError(null);
                      setBusinessDetails(prev => ({ ...prev, gstinNumber: newValue }));
                      // Reset verification status if GST number changes
                      if (newValue !== businessDetails.gstinNumber) {
                        setVerificationStatus(prev => ({
                          ...prev,
                          businessDetails: { verified: false, gstVerified: false },
                        }));
                      }
                    }}
                    placeholder='Enter your GSTIN number'
                    className='w-full'
                    maxLength={15}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Optional - You can sell without GST
                  </p>
                  {gstVerificationError ? (
                    <p className='text-sm text-red-600 mt-2' role='alert'>
                      {gstVerificationError}
                    </p>
                  ) : null}
                </div>

                <div className='flex gap-3'>
                  <button
                    type='submit'
                    className='flex-1 bg-web text-white rounded-full px-6 py-3 font-semibold hover:bg-web/90 transition'>
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Pickup Address */}
            {currentStep === 2 && (
              <form onSubmit={handlePickupAddressSubmit} className='max-w-2xl mx-auto space-y-6'>
                <p className='text-sm text-gray-600'>
                  Enter PIN or use your current location — city and state fill from India Post. Then add your street
                  address.
                </p>

                <div className='max-w-xs space-y-2'>
                  <label htmlFor='pinCode' className='block text-sm font-semibold text-gray-700 mb-2'>
                    PIN Code <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='pinCode'
                    type='text'
                    inputMode='numeric'
                    value={pickupAddress.pinCode}
                    onChange={e => {
                      setPincodeLookupError(null);
                      setPickupAddress(prev => ({
                        ...prev,
                        pinCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                      }));
                    }}
                    placeholder='6-digit PIN'
                    className='w-full'
                    maxLength={6}
                    required
                  />
                  {pincodeLookupError && <p className='text-xs text-red-600'>{pincodeLookupError}</p>}
                  {pincodeLookupLoading && <p className='text-xs text-gray-500'>Looking up PIN code…</p>}
                  <button
                    type='button'
                    onClick={handleUseCurrentLocation}
                    disabled={geoDetecting || pincodeLookupLoading}
                    className='mt-1 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'>
                    {geoDetecting ? (
                      <Loader2 className='h-4 w-4 animate-spin' aria-hidden />
                    ) : (
                      <MapPin className='h-4 w-4' aria-hidden />
                    )}
                    Use current location
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <Dropdown
                    labelMain='Country *'
                    options={COUNTRY_OPTIONS}
                    value={pickupAddress.country || 'India'}
                    onChange={option => setPickupAddress(prev => ({ ...prev, country: option.value }))}
                    placeholder='Select country'
                  />
                  <Dropdown
                    labelMain='State *'
                    options={INDIAN_STATES.map(s => ({ label: s, value: s }))}
                    value={pickupAddress.state}
                    onChange={option => setPickupAddress(prev => ({ ...prev, state: option.value }))}
                    placeholder='Select state'
                    withSearch
                  />
                  <Dropdown
                    labelMain='City / District *'
                    options={cityDropdownOptions}
                    value={pickupAddress.city}
                    onChange={option => setPickupAddress(prev => ({ ...prev, city: option.value }))}
                    placeholder={
                      cityDropdownOptions.length === 0 ? 'Enter PIN code first' : 'Select city / district'
                    }
                    withSearch
                    disabled={cityDropdownOptions.length === 0}
                  />
                </div>
                {cityDropdownOptions.length === 0 &&
                  pickupAddress.pinCode.replace(/\D/g, '').length === 6 &&
                  !pincodeLookupLoading && (
                    <p className='text-xs text-gray-500 -mt-2'>
                      City list loads after India Post returns data for this PIN. Check the PIN if this stays empty.
                    </p>
                  )}

                {postalOffices.length > 1 && (
                  <Dropdown
                    labelMain='Locality / Post office'
                    options={postalOffices.map(o => ({ value: o.name, label: o.name }))}
                    placeholder='Select locality'
                    withSearch
                    value={pickupAddress.address2}
                    onChange={option => {
                      const office = postalOffices.find(o => o.name === option.value);
                      if (office) {
                        setPickupAddress(prev => ({
                          ...prev,
                          address2: option.value,
                          city: office.district || prev.city,
                          state: matchApiStateToIndianState(office.state) || prev.state,
                        }));
                      } else {
                        setPickupAddress(prev => ({ ...prev, address2: option.value }));
                      }
                    }}
                  />
                )}

                <div>
                  <label htmlFor='address1' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Address Line 1 <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='address1'
                    type='text'
                    value={pickupAddress.address1}
                    onChange={e => setPickupAddress(prev => ({ ...prev, address1: e.target.value }))}
                    placeholder='Building name, street name'
                    className='w-full'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='address2' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Address Line 2
                  </label>
                  <Input
                    id='address2'
                    type='text'
                    value={pickupAddress.address2}
                    onChange={e => setPickupAddress(prev => ({ ...prev, address2: e.target.value }))}
                    placeholder={
                      postalOffices.length > 1
                        ? 'Choose locality from the list above'
                        : 'Locality, area (optional)'
                    }
                    className='w-full'
                    disabled={postalOffices.length > 1}
                  />
                </div>

                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => setCurrentStep(1)}
                    className='flex-1 border border-gray-300 text-gray-700 rounded-full px-6 py-3 font-semibold hover:bg-gray-50 transition'>
                    Back
                  </button>
                  <button
                    type='submit'
                    className='flex-1 bg-web text-white rounded-full px-6 py-3 font-semibold hover:bg-web/90 transition'>
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Bank Details */}
            {currentStep === 3 && (
              <form onSubmit={handleBankDetailsSubmit} className='max-w-2xl mx-auto space-y-6'>
                <p className='text-sm text-gray-600'>
                  Choose your bank and enter IFSC. We check that they match the public IFSC directory, then Cashfree
                  verifies your account.
                </p>

                {indianBanksLoading ? (
                  <p className='text-sm text-gray-500'>Loading bank list…</p>
                ) : indianBanks.length > 0 ? (
                  <Dropdown
                    labelMain='Bank name *'
                    options={bankNameOptions}
                    placeholder='Search and select your bank'
                    withSearch
                    value={bankDetails.bankName}
                    onChange={option => {
                      setBankDetails(prev => ({ ...prev, bankName: option.value }));
                      setVerificationStatus(prev => ({
                        ...prev,
                        bankDetails: { verified: false },
                      }));
                    }}
                  />
                ) : (
                  <div>
                    <label htmlFor='bankNameFallback' className='block text-sm font-semibold text-gray-700 mb-2'>
                      Bank name <span className='text-red-500'>*</span>
                    </label>
                    <Input
                      id='bankNameFallback'
                      type='text'
                      value={bankDetails.bankName}
                      onChange={e => {
                        setBankDetails(prev => ({ ...prev, bankName: e.target.value }));
                        setVerificationStatus(prev => ({
                          ...prev,
                          bankDetails: { verified: false },
                        }));
                      }}
                      placeholder='Enter bank name as on cheque'
                      className='w-full'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Bank list could not be loaded — type the name manually.</p>
                  </div>
                )}

                <div>
                  <label htmlFor='ifscCode' className='block text-sm font-semibold text-gray-700 mb-2'>
                    IFSC Code <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='ifscCode'
                    type='text'
                    value={bankDetails.ifscCode}
                    onChange={e => {
                      const newValue = e.target.value.toUpperCase();
                      setBankDetails(prev => ({ ...prev, ifscCode: newValue }));
                      if (newValue !== bankDetails.ifscCode) {
                        setVerificationStatus(prev => ({
                          ...prev,
                          bankDetails: { verified: false },
                        }));
                      }
                    }}
                    placeholder='Enter IFSC code (e.g., INDB0000330)'
                    className='w-full'
                    maxLength={11}
                    required
                  />
                  {ifscDirectoryLoading && (
                    <p className='text-xs text-gray-500 mt-1'>Checking IFSC in directory…</p>
                  )}
                  {!ifscDirectoryLoading && ifscResolved && (
                    <p className='text-xs text-emerald-700 mt-1 font-medium'>
                      Matched: {ifscResolved.bank}
                      {ifscResolved.branch ? ` — ${ifscResolved.branch}` : ''}
                    </p>
                  )}
                  {!ifscDirectoryLoading &&
                    bankDetails.ifscCode.replace(/\s/g, '').length === 11 &&
                    !ifscResolved && (
                      <p className='text-xs text-amber-700 mt-1'>
                        IFSC not found in directory — double-check the code. You can still try verification if it is
                        correct.
                      </p>
                    )}
                  <p className='text-xs text-gray-500 mt-1'>
                    11 characters: 4 bank letters + 0 + 6 branch characters (any scheduled bank).
                  </p>
                </div>

                <div>
                  <label htmlFor='accountNumber' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Account Number <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='accountNumber'
                    type='text'
                    value={bankDetails.accountNumber}
                    onChange={e => {
                      const newValue = e.target.value.replace(/\D/g, '');
                      setBankDetails(prev => ({ ...prev, accountNumber: newValue }));
                      if (newValue !== bankDetails.accountNumber) {
                        setVerificationStatus(prev => ({
                          ...prev,
                          bankDetails: { verified: false },
                        }));
                      }
                    }}
                    placeholder='Enter account number'
                    className='w-full'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='confirmAccountNumber' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Confirm Account Number <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='confirmAccountNumber'
                    type='text'
                    value={bankDetails.confirmAccountNumber}
                    onChange={e => {
                      const newValue = e.target.value.replace(/\D/g, '');
                      setBankDetails(prev => ({ ...prev, confirmAccountNumber: newValue }));
                      if (newValue !== bankDetails.confirmAccountNumber) {
                        setVerificationStatus(prev => ({
                          ...prev,
                          bankDetails: { verified: false },
                        }));
                      }
                    }}
                    placeholder='Re-enter account number'
                    className='w-full'
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>Both account numbers must match</p>
                </div>

                <div>
                  <label htmlFor='accountHolderName' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Account Holder Name <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='accountHolderName'
                    type='text'
                    value={bankDetails.accountHolderName}
                    onChange={e => {
                      const newValue = e.target.value;
                      setBankDetails(prev => ({ ...prev, accountHolderName: newValue }));
                      if (newValue !== bankDetails.accountHolderName) {
                        setVerificationStatus(prev => ({
                          ...prev,
                          bankDetails: { verified: false },
                        }));
                      }
                    }}
                    placeholder='Enter account holder name (as per bank records)'
                    className='w-full'
                    maxLength={100}
                    required
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Enter the name exactly as it appears in your bank account
                  </p>
                </div>

                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => setCurrentStep(2)}
                    className='flex-1 border border-gray-300 text-gray-700 rounded-full px-6 py-3 font-semibold hover:bg-gray-50 transition'>
                    Back
                  </button>
                  <button
                    type='submit'
                    className='flex-1 bg-web text-white rounded-full px-6 py-3 font-semibold hover:bg-web/90 transition'>
                    Continue
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Supplier Details */}
            {currentStep === 4 && (
              <form onSubmit={handleSupplierDetailsSubmit} className='max-w-2xl mx-auto space-y-6'>
                <div>
                  <label htmlFor='storeName' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Store Name <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='storeName'
                    type='text'
                    value={supplierDetails.storeName}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, storeName: e.target.value }))}
                    placeholder='Enter your store name'
                    className='w-full'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='ownerName' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Owner Name <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='ownerName'
                    type='text'
                    value={supplierDetails.ownerName}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder='Enter owner name'
                    className='w-full'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='businessType' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Business Type <span className='text-red-500'>*</span>
                  </label>
                  <select
                    id='businessType'
                    value={supplierDetails.businessType}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, businessType: e.target.value as 'individual' | 'company' | 'partnership' }))}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-web'
                    required>
                    <option value='individual'>Individual</option>
                    <option value='company'>Company</option>
                    <option value='partnership'>Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor='phone' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Phone Number <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='phone'
                    type='tel'
                    value={supplierDetails.phone}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder='Enter phone number'
                    className='w-full'
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <label htmlFor='alternatePhone' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Alternate Phone Number
                  </label>
                  <Input
                    id='alternatePhone'
                    type='tel'
                    value={supplierDetails.alternatePhone}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, alternatePhone: e.target.value.replace(/\D/g, '') }))}
                    placeholder='Enter alternate phone number'
                    className='w-full'
                    maxLength={10}
                  />
                </div>

                <div>
                  <label htmlFor='whatsappNumber' className='block text-sm font-semibold text-gray-700 mb-2'>
                    WhatsApp Number
                  </label>
                  <Input
                    id='whatsappNumber'
                    type='tel'
                    value={supplierDetails.whatsappNumber}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, whatsappNumber: e.target.value.replace(/\D/g, '') }))}
                    placeholder='Enter WhatsApp number'
                    className='w-full'
                    maxLength={10}
                  />
                </div>

                <div>
                  <label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Password <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='password'
                    type='password'
                    value={supplierDetails.password}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, password: e.target.value }))}
                    placeholder='Enter password (min 6 characters)'
                    className='w-full'
                    required
                    minLength={6}
                  />
                  <p className='text-xs text-gray-500 mt-1'>
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor='confirmPassword' className='block text-sm font-semibold text-gray-700 mb-2'>
                    Confirm Password <span className='text-red-500'>*</span>
                  </label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={supplierDetails.confirmPassword}
                    onChange={e => setSupplierDetails(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder='Confirm your password'
                    className='w-full'
                    required
                    minLength={6}
                  />
                </div>

                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => setCurrentStep(3)}
                    className='flex-1 border border-gray-300 text-gray-700 rounded-full px-6 py-3 font-semibold hover:bg-gray-50 transition'>
                    Back
                  </button>
                  <button
                    type='submit'
                    disabled={loading}
                    className='flex-1 bg-web text-white rounded-full px-6 py-3 font-semibold hover:bg-web/90 transition disabled:opacity-50 disabled:cursor-not-allowed'>
                    {loading ? 'Submitting...' : 'Complete Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
