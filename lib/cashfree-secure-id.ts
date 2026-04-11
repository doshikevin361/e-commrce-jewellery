/**
 * Cashfree Secure ID API Integration
 * Documentation: https://www.cashfree.com/docs/api-reference/vrs/data-to-test-integration
 *
 * Bank (BAV sync), GSTIN, PAN, PAN–GST: every request uses `withCashfreeSignature()` → `x-cf-signature`
 * built with the public key in `cashfree-signature.ts` (env override or same default PEM as sibling e-commrce app).
 */

import { withCashfreeSignature } from '@/lib/cashfree-signature';

// Base URL: sandbox for TEST, api.cashfree.com for PROD
const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL || (process.env.CASHFREE_ENVIRONMENT === 'PROD' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com');
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID ?? '';
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET ?? '';
const CASHFREE_ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'TEST'; // TEST or PROD

function assertCashfreeAuth(): void {
  if (!CASHFREE_CLIENT_ID?.trim() || !CASHFREE_CLIENT_SECRET?.trim()) {
    throw new Error(
      'Cashfree is not configured: set CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET (e.g. in .env.local)'
    );
  }
}

/** Cashfree returns this when prod keys hit sandbox host (or the reverse). */
function hintCashfreeEnvMismatch(apiMessage: string): string {
  const m = String(apiMessage || '');
  if (/belongs to prod environment/i.test(m)) {
    return `${m} — Your keys are LIVE: set CASHFREE_ENVIRONMENT=PROD (or CASHFREE_BASE_URL=https://api.cashfree.com). Do not use sandbox.cashfree.com with production client credentials.`;
  }
  if (/belongs to (test|sandbox)|test environment keys/i.test(m)) {
    return `${m} — Your keys are SANDBOX: set CASHFREE_ENVIRONMENT=TEST and use sandbox client id/secret from the test dashboard, or use CASHFREE_BASE_URL=https://sandbox.cashfree.com.`;
  }
  return m;
}

interface CashfreeApiResponse {
  reference_id: string;
  status: string;
  message?: string;
  verification_id?: string;
  [key: string]: any;
}

interface BankVerificationRequest {
  account_number: string;
  ifsc: string;
  name: string;
}

interface PANVerificationRequest {
  pan: string;
}

interface GSTVerificationRequest {
  gstin: string;
  /** Optional — helps name match when supported by Cashfree GST API */
  businessName?: string;
}

interface PANGSTVerificationRequest {
  pan: string;
  gstin: string;
}

/**
 * Verify Bank Account — Secure ID Bank Account Verification Sync V2 (same product as dashboard manual check).
 * API: POST /verification/bank-account/sync
 * Documentation: https://www.cashfree.com/docs/api-reference/vrs/v2/bav-v2/bank-account-verification-sync-v2
 */
function normalizeBankVerificationPayload(req: BankVerificationRequest): BankVerificationRequest {
  const name = (req.name || '').trim().replace(/\s+/g, ' ');
  const ifsc = (req.ifsc || '').replace(/\s/g, '').toUpperCase();
  const rawAcct = String(req.account_number ?? '').trim();
  const digitsOnly = rawAcct.replace(/\D/g, '');
  const account_number = digitsOnly.length >= 6 ? digitsOnly : rawAcct.replace(/\s/g, '');
  return { name, ifsc, account_number };
}

export async function verifyBankAccount(request: BankVerificationRequest): Promise<CashfreeApiResponse> {
  try {
    assertCashfreeAuth();
    const req = normalizeBankVerificationPayload(request);
    if (!req.name || !req.account_number || !req.ifsc) {
      throw new Error('Account number, IFSC, and account holder name are required');
    }

    const path =
      process.env.CASHFREE_BAV_SYNC_PATH?.trim() || '/verification/bank-account/sync';
    const url = `${CASHFREE_BASE_URL}${path}`;

    const body: Record<string, string> = {
      bank_account: req.account_number,
      ifsc: req.ifsc,
      name: req.name,
    };

    console.log('[Cashfree] Bank Verification Request (BAV Sync V2):', {
      url,
      accountNumber: req.account_number?.substring(0, 4) + '****' + req.account_number?.substring(req.account_number.length - 4),
      ifsc: req.ifsc,
      name: req.name?.substring(0, 3) + '****',
      environment: CASHFREE_ENVIRONMENT,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: withCashfreeSignature(
        {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        },
        CASHFREE_CLIENT_ID,
        { requireSignature: true }
      ),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    console.log('[Cashfree] Bank Verification Response:', {
      status: response.status,
      statusText: response.statusText,
      data: JSON.stringify(data).substring(0, 600),
    });

    if (!response.ok) {
      let errorMessage = hintCashfreeEnvMismatch(
        data.message || data.error || `Bank verification failed: ${response.status}`
      );
      const errorCode = data.code || data.type || 'unknown_error';

      if (
        errorCode === 'ip_validation_failed' ||
        /IP not whitelisted/i.test(String(errorMessage))
      ) {
        errorMessage = `${errorMessage} Use Secure ID API keys + Public Key 2FA + CASHFREE_VERIFICATION_PUBLIC_KEY_* (same as GSTIN).`;
      }
      if (errorCode === 'invalid_request' && /service not enabled/i.test(String(data.message))) {
        errorMessage = `${errorMessage} Enable Bank Account verification under Secure ID → My Products in the Cashfree dashboard.`;
      }

      console.error('[Cashfree] Bank API Error:', {
        status: response.status,
        code: errorCode,
        message: errorMessage,
        fullResponse: data,
      });

      throw new Error(errorMessage);
    }

    const accountStatus = data.account_status as string | undefined;
    const accountStatusCode = data.account_status_code as string | undefined;
    const valid = accountStatus === 'VALID' && accountStatusCode === 'ACCOUNT_IS_VALID';

    const transformedResponse: CashfreeApiResponse = {
      reference_id: data.reference_id != null ? String(data.reference_id) : '',
      status: valid ? 'SUCCESS' : 'ERROR',
      message: data.message,
      accountStatus: accountStatus,
      accountStatusCode: accountStatusCode,
      nameAtBank: data.name_at_bank,
      bankName: data.bank_name,
      nameMatchResult: data.name_match_result,
      nameMatchScore: data.name_match_score,
      branch: data.branch,
      city: data.city,
      utr: data.utr,
      ifsc_details: data.ifsc_details,
    };

    return transformedResponse;
  } catch (error: any) {
    console.error('[Cashfree] Bank verification error:', {
      message: error.message,
      accountNumber: request.account_number?.replace(/\D/g, '').substring(0, 4) + '****',
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Verify PAN
 * API: POST /verification/pan (test) or /verification/v2/pan (prod)
 * Documentation: https://www.cashfree.com/docs/secure-id/kyc-stack/verify-pan
 */
export async function verifyPAN(request: PANVerificationRequest): Promise<CashfreeApiResponse> {
  try {
    assertCashfreeAuth();
    // Use /verification/pan for test, /verification/v2/pan for prod
    const endpoint = CASHFREE_ENVIRONMENT === 'TEST' 
      ? '/verification/pan' 
      : '/verification/v2/pan';
    
    const url = `${CASHFREE_BASE_URL}${endpoint}`;
    
    console.log('[Cashfree] PAN Verification Request:', {
      url,
      pan: request.pan?.substring(0, 3) + '****' + request.pan?.substring(8), // Mask for security
      environment: CASHFREE_ENVIRONMENT,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: withCashfreeSignature(
        {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        },
        CASHFREE_CLIENT_ID,
        { requireSignature: true }
      ),
      body: JSON.stringify({
        pan: request.pan.toUpperCase(), // PAN should be uppercase
      }),
    });

    const data = await response.json();
    
    console.log('[Cashfree] PAN Verification Response:', {
      status: response.status,
      statusText: response.statusText,
    });
    
    if (!response.ok) {
      const errorMessage = hintCashfreeEnvMismatch(
        data.message || data.error || `PAN verification failed: ${response.status}`
      );
      console.error('[Cashfree] PAN API Error:', {
        status: response.status,
        code: data.code || data.type,
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('[Cashfree] PAN verification error:', error);
    throw error;
  }
}

/**
 * Verify GSTIN
 * API: POST /verification/gstin (sandbox and live — live: https://api.cashfree.com/verification/gstin)
 * Optional override: CASHFREE_GSTIN_PATH (e.g. /verification/v2/gstin if Cashfree routes you there)
 * Documentation: https://www.cashfree.com/docs/api-reference/vrs/data-to-test-integration
 */
export async function verifyGSTIN(request: GSTVerificationRequest): Promise<CashfreeApiResponse> {
  try {
    assertCashfreeAuth();
    const endpoint =
      process.env.CASHFREE_GSTIN_PATH ||
      '/verification/gstin';
    
    const url = `${CASHFREE_BASE_URL}${endpoint}`;
    const requestBody: Record<string, string> = {
      GSTIN: request.gstin.toUpperCase(),
    };
    const bn = request.businessName?.trim();
    if (bn) {
      requestBody.business_name = bn;
    }

    console.log('[Cashfree] GST Verification Request:', {
      url,
      gstin: request.gstin.toUpperCase(),
      hasBusinessName: Boolean(bn),
      environment: CASHFREE_ENVIRONMENT,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: withCashfreeSignature(
        {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        },
        CASHFREE_CLIENT_ID,
        { requireSignature: true }
      ),
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    console.log('[Cashfree] GST Verification Response:', {
      status: response.status,
      statusText: response.statusText,
      data: JSON.stringify(data).substring(0, 500), // Log first 500 chars
    });
    
    if (!response.ok) {
      // Handle Cashfree API error responses
      let errorMessage = hintCashfreeEnvMismatch(
        data.message || data.error || `GST verification failed: ${response.status}`
      );
      const errorCode = data.code || data.type || 'unknown_error';

      if (
        errorCode === 'ip_validation_failed' ||
        /IP not whitelisted/i.test(String(errorMessage))
      ) {
        errorMessage = `${errorMessage} For serverless (e.g. Vercel): in Secure ID dashboard set 2FA to Public Key (not IP whitelist), and set env CASHFREE_VERIFICATION_PUBLIC_KEY_PEM or CASHFREE_VERIFICATION_PUBLIC_KEY_B64 to the exact public key file Cashfree gave you—must pair with this app’s x-client-id.`;
      }

      // Log detailed error information
      console.error('[Cashfree] API Error:', {
        status: response.status,
        code: errorCode,
        message: errorMessage,
        fullResponse: data,
      });

      throw new Error(errorMessage);
    }

    // Check if response indicates an error even with 200 status
    // Some APIs return 200 but with error in body
    if (data.type === 'internal_error' || data.code === 'api_error' || 
        (data.message && (
          data.message.toLowerCase().includes('something went wrong') ||
          data.message.toLowerCase().includes('try after some time') ||
          data.message.toLowerCase().includes('error')
        ))) {
      throw new Error(data.message || 'API returned an error');
    }

    // Cashfree often returns HTTP 200 with failure spelled out in `message` (e.g. "GSTIN Doesn't Exist").
    if (data.valid === true || data.status === 'VALID' || data.status === 'SUCCESS') {
      return data;
    }

    const gstMsg = typeof data.message === 'string' ? data.message.trim() : '';
    if (
      data.valid === false ||
      (gstMsg &&
        /\b(doesn'?t\s+exist|does\s+not\s+exist|gstin\s+doesn'?t|invalid\s+gstin|no\s+such\s+gst|gstin\s+not\s+found|not\s+found)\b/i.test(
          gstMsg
        ))
    ) {
      throw new Error(gstMsg || 'GSTIN could not be verified');
    }

    return data;
  } catch (error: any) {
    console.error('[Cashfree] GST verification error:', {
      message: error.message,
      gstin: request.gstin,
      stack: error.stack,
    });
    throw error;
  }
}

/**
 * Verify PAN & GST Combined
 * API: POST /verification/pan-gst (test) or /verification/v2/pan-gst (prod)
 * Documentation: https://www.cashfree.com/docs/secure-id/kyc-stack/verify-pan-gst
 */
export async function verifyPANGST(request: PANGSTVerificationRequest): Promise<CashfreeApiResponse> {
  try {
    assertCashfreeAuth();
    // Use /verification/pan-gst for test, /verification/v2/pan-gst for prod
    const endpoint = CASHFREE_ENVIRONMENT === 'TEST' 
      ? '/verification/pan-gst' 
      : '/verification/v2/pan-gst';
    
    const url = `${CASHFREE_BASE_URL}${endpoint}`;
    
    console.log('[Cashfree] PAN-GST Verification Request:', {
      url,
      pan: request.pan?.substring(0, 3) + '****' + request.pan?.substring(8),
      gstin: request.gstin?.substring(0, 3) + '****' + request.gstin?.substring(11),
      environment: CASHFREE_ENVIRONMENT,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: withCashfreeSignature(
        {
          'Content-Type': 'application/json',
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        },
        CASHFREE_CLIENT_ID,
        { requireSignature: true }
      ),
      body: JSON.stringify({
        pan: request.pan.toUpperCase(), // PAN should be uppercase
        gstin: request.gstin.toUpperCase(), // GSTIN should be uppercase
      }),
    });

    const data = await response.json();
    
    console.log('[Cashfree] PAN-GST Verification Response:', {
      status: response.status,
      statusText: response.statusText,
    });
    
    if (!response.ok) {
      const errorMessage = hintCashfreeEnvMismatch(
        data.message || data.error || `PAN-GST verification failed: ${response.status}`
      );
      console.error('[Cashfree] PAN-GST API Error:', {
        status: response.status,
        code: data.code || data.type,
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }

    return data;
  } catch (error: any) {
    console.error('[Cashfree] PAN-GST verification error:', error);
    throw error;
  }
}

/**
 * Verify vendor details (Bank, PAN, GST)
 * Returns verification results for all applicable verifications
 */
export async function verifyVendorDetails(vendorData: {
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  panNumber?: string;
  gstNumber?: string;
  gstBusinessName?: string;
}): Promise<{
  bank?: CashfreeApiResponse;
  pan?: CashfreeApiResponse;
  gst?: CashfreeApiResponse;
  panGst?: CashfreeApiResponse;
  errors?: Array<{ type: string; error: string }>;
}> {
  const results: any = {};
  const errors: Array<{ type: string; error: string }> = [];

  // Verify Bank Account (if provided)
  if (vendorData.accountNumber && vendorData.ifscCode && vendorData.accountHolderName) {
    try {
      results.bank = await verifyBankAccount({
        account_number: vendorData.accountNumber,
        ifsc: vendorData.ifscCode,
        name: vendorData.accountHolderName,
      });
    } catch (error: any) {
      errors.push({ type: 'bank', error: error.message });
    }
  }

  // Verify PAN (if provided)
  if (vendorData.panNumber) {
    try {
      results.pan = await verifyPAN({
        pan: vendorData.panNumber,
      });
    } catch (error: any) {
      errors.push({ type: 'pan', error: error.message });
    }
  }

  // Verify GST (if provided)
  if (vendorData.gstNumber) {
    try {
      results.gst = await verifyGSTIN({
        gstin: vendorData.gstNumber,
        businessName: vendorData.gstBusinessName,
      });
    } catch (error: any) {
      errors.push({ type: 'gst', error: error.message });
    }
  }

  // Verify PAN & GST Combined (if both provided)
  if (vendorData.panNumber && vendorData.gstNumber) {
    try {
      results.panGst = await verifyPANGST({
        pan: vendorData.panNumber,
        gstin: vendorData.gstNumber,
      });
    } catch (error: any) {
      errors.push({ type: 'panGst', error: error.message });
    }
  }

  if (errors.length > 0) {
    results.errors = errors;
  }

  return results;
}
