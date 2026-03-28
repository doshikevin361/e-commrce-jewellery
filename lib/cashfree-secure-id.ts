/**
 * Cashfree Secure ID + Payout validation APIs
 * Docs: https://www.cashfree.com/docs/api-reference/vrs/data-to-test-integration
 *
 * Required env: CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET
 * Optional: CASHFREE_ENVIRONMENT (TEST | PROD), CASHFREE_BASE_URL, CASHFREE_PAYOUT_BASE_URL
 */

const CASHFREE_BASE_URL =
  process.env.CASHFREE_BASE_URL ||
  (process.env.CASHFREE_ENVIRONMENT === 'PROD'
    ? 'https://api.cashfree.com'
    : 'https://sandbox.cashfree.com');

const CASHFREE_PAYOUT_BASE_URL =
  process.env.CASHFREE_PAYOUT_BASE_URL ||
  (process.env.CASHFREE_ENVIRONMENT === 'PROD'
    ? 'https://payout-api.cashfree.com'
    : 'https://payout-gamma.cashfree.com');

const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'TEST';

function assertCredentials(): void {
  if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
    throw new Error('Cashfree credentials not configured (CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET)');
  }
}

interface CashfreeApiResponse {
  reference_id: string;
  status: string;
  message?: string;
  verification_id?: string;
  accountStatus?: string;
  accountStatusCode?: string;
  nameAtBank?: string;
  bankName?: string;
  nameMatchResult?: string;
  nameMatchScore?: number;
  [key: string]: unknown;
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
}

interface PANGSTVerificationRequest {
  pan: string;
  gstin: string;
}

async function getCashfreePayoutToken(): Promise<string> {
  assertCredentials();
  const tokenUrl = `${CASHFREE_PAYOUT_BASE_URL}/payout/v1/authorize`;

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': CASHFREE_CLIENT_ID!,
      'X-Client-Secret': CASHFREE_CLIENT_SECRET!,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.data?.token) {
    throw new Error(data.message || 'Failed to get Payout API token');
  }

  return data.data.token;
}

/**
 * GET /payout/v1.2/validation/bankDetails
 */
export async function verifyBankAccount(
  request: BankVerificationRequest
): Promise<CashfreeApiResponse> {
  assertCredentials();
  const token = await getCashfreePayoutToken();

  const endpoint = '/payout/v1.2/validation/bankDetails';
  const params = new URLSearchParams({
    name: request.name || '',
    phone: '',
    bankAccount: request.account_number,
    ifsc: request.ifsc.toUpperCase(),
  });

  const url = `${CASHFREE_PAYOUT_BASE_URL}${endpoint}?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data.message || data.error || `Bank verification failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  const transformedResponse: CashfreeApiResponse = {
    reference_id: data.data?.refId?.toString() || '',
    status: data.status === 'SUCCESSS' ? 'SUCCESS' : data.status,
    message: data.message,
    accountStatus: data.accountStatus,
    accountStatusCode: data.accountStatusCode,
    nameAtBank: data.data?.nameAtBank,
    bankName: data.data?.bankName,
    nameMatchResult: data.data?.nameMatchResult,
    nameMatchScore: data.data?.nameMatchScore,
    ...data.data,
  };

  return transformedResponse;
}

/**
 * POST /verification/pan (test) or /verification/v2/pan (prod)
 */
export async function verifyPAN(request: PANVerificationRequest): Promise<CashfreeApiResponse> {
  assertCredentials();
  const endpoint =
    CASHFREE_ENVIRONMENT === 'TEST' ? '/verification/pan' : '/verification/v2/pan';

  const url = `${CASHFREE_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CLIENT_ID!,
      'x-client-secret': CASHFREE_CLIENT_SECRET!,
    },
    body: JSON.stringify({
      pan: request.pan.toUpperCase(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data.message || data.error || `PAN verification failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * POST /verification/gstin (test) or /verification/v2/gstin (prod)
 */
export async function verifyGSTIN(request: GSTVerificationRequest): Promise<CashfreeApiResponse> {
  assertCredentials();
  const endpoint =
    CASHFREE_ENVIRONMENT === 'TEST' ? '/verification/gstin' : '/verification/v2/gstin';

  const url = `${CASHFREE_BASE_URL}${endpoint}`;
  const requestBody = {
    GSTIN: request.gstin.toUpperCase(),
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CLIENT_ID!,
      'x-client-secret': CASHFREE_CLIENT_SECRET!,
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data.message || data.error || `GST verification failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  if (
    data.type === 'internal_error' ||
    data.code === 'api_error' ||
    (data.message &&
      (String(data.message).toLowerCase().includes('something went wrong') ||
        String(data.message).toLowerCase().includes('try after some time')))
  ) {
    throw new Error(data.message || 'API returned an error');
  }

  return data;
}

/**
 * POST /verification/pan-gst (test) or /verification/v2/pan-gst (prod)
 */
export async function verifyPANGST(
  request: PANGSTVerificationRequest
): Promise<CashfreeApiResponse> {
  assertCredentials();
  const endpoint =
    CASHFREE_ENVIRONMENT === 'TEST' ? '/verification/pan-gst' : '/verification/v2/pan-gst';

  const url = `${CASHFREE_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': CASHFREE_CLIENT_ID!,
      'x-client-secret': CASHFREE_CLIENT_SECRET!,
    },
    body: JSON.stringify({
      pan: request.pan.toUpperCase(),
      gstin: request.gstin.toUpperCase(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage =
      data.message || data.error || `PAN-GST verification failed: ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export async function verifyVendorDetails(vendorData: {
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  panNumber?: string;
  gstNumber?: string;
}): Promise<{
  bank?: CashfreeApiResponse;
  pan?: CashfreeApiResponse;
  gst?: CashfreeApiResponse;
  panGst?: CashfreeApiResponse;
  errors?: Array<{ type: string; error: string }>;
}> {
  assertCredentials();
  const results: Record<string, unknown> = {};
  const errors: Array<{ type: string; error: string }> = [];

  if (vendorData.accountNumber && vendorData.ifscCode && vendorData.accountHolderName) {
    try {
      results.bank = await verifyBankAccount({
        account_number: vendorData.accountNumber,
        ifsc: vendorData.ifscCode,
        name: vendorData.accountHolderName,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Bank verification failed';
      errors.push({ type: 'bank', error: message });
    }
  }

  if (vendorData.panNumber) {
    try {
      results.pan = await verifyPAN({
        pan: vendorData.panNumber,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'PAN verification failed';
      errors.push({ type: 'pan', error: message });
    }
  }

  if (vendorData.gstNumber) {
    try {
      results.gst = await verifyGSTIN({
        gstin: vendorData.gstNumber,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'GST verification failed';
      errors.push({ type: 'gst', error: message });
    }
  }

  if (vendorData.panNumber && vendorData.gstNumber) {
    try {
      results.panGst = await verifyPANGST({
        pan: vendorData.panNumber,
        gstin: vendorData.gstNumber,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'PAN-GST verification failed';
      errors.push({ type: 'panGst', error: message });
    }
  }

  if (errors.length > 0) {
    results.errors = errors;
  }

  return results as {
    bank?: CashfreeApiResponse;
    pan?: CashfreeApiResponse;
    gst?: CashfreeApiResponse;
    panGst?: CashfreeApiResponse;
    errors?: Array<{ type: string; error: string }>;
  };
}
