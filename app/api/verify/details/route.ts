import { NextRequest, NextResponse } from 'next/server';
import { verifyVendorDetails } from '@/lib/cashfree-secure-id';

/**
 * POST /api/verify/details
 * Verify vendor bank / PAN / GST via Cashfree (same contract as e-commrce project)
 */
export async function POST(request: NextRequest) {
  let accountNumber: string | undefined;
  let ifscCode: string | undefined;
  let accountHolderName: string | undefined;
  let panNumber: string | undefined;
  let gstNumber: string | undefined;
  let gstBusinessName: string | undefined;

  try {
    const body = await request.json();
    ({
      accountNumber,
      ifscCode,
      accountHolderName,
      panNumber,
      gstNumber,
      gstBusinessName,
    } = body);
    if (!gstBusinessName && typeof body.businessName === 'string') {
      gstBusinessName = body.businessName;
    }

    if (!accountNumber && !panNumber && !gstNumber) {
      return NextResponse.json({
        success: true,
        message: 'No verification data provided',
        verification: {},
      });
    }

    const verificationResults = await verifyVendorDetails({
      accountNumber,
      ifscCode,
      accountHolderName,
      panNumber,
      gstNumber,
      gstBusinessName: gstBusinessName?.trim() || undefined,
    });

    const errs = verificationResults.errors ?? [];
    const wantedGst = Boolean(gstNumber?.trim());
    const wantedBank = Boolean(
      accountNumber?.trim() && ifscCode?.trim() && accountHolderName?.trim()
    );
    const wantedPan = Boolean(panNumber?.trim());

    const gstFailed = wantedGst && errs.some(e => e.type === 'gst');
    const bankFailed = wantedBank && errs.some(e => e.type === 'bank');
    const panFailed = wantedPan && errs.some(e => e.type === 'pan');
    const failed = gstFailed || bankFailed || panFailed;

    return NextResponse.json({
      success: !failed,
      message: failed
        ? errs.map(e => e.error).filter(Boolean).join(' ') || 'Verification failed'
        : 'Verification completed',
      verification: verificationResults,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('[Verify Details] Error:', {
      message: err.message,
      stack: err.stack,
    });

    const errorMessage = err.message || 'Verification failed';

    if (
      errorMessage.includes('not configured') ||
      errorMessage.includes('Cashfree credentials')
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cashfree is not configured. Add CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET to your environment.',
          verification: {
            errors: [
              {
                type: gstNumber ? 'gst' : accountNumber ? 'bank' : 'pan',
                error: errorMessage,
              },
            ],
          },
        },
        { status: 200 }
      );
    }

    if (
      errorMessage.includes('test environment') ||
      errorMessage.includes('404') ||
      errorMessage.includes('endpoint not available') ||
      errorMessage.includes('not configured')
    ) {
      return NextResponse.json({
        success: true,
        message:
          'Cashfree API is in test mode. Verification will work once API access is fully enabled.',
        verification: {
          errors: [
            {
              type: gstNumber ? 'gst' : 'general',
              error:
                'API access pending configuration. Please contact Cashfree support to enable API access.',
            },
          ],
        },
      });
    }

    if (
      errorMessage.toLowerCase().includes('something went wrong') ||
      errorMessage.toLowerCase().includes('try after some time') ||
      errorMessage.toLowerCase().includes('rate limit') ||
      errorMessage.toLowerCase().includes('temporarily unavailable') ||
      errorMessage.toLowerCase().includes('internal server error') ||
      errorMessage.toLowerCase().includes('service unavailable')
    ) {
      return NextResponse.json({
        success: false,
        message:
          'Cashfree API is temporarily unavailable. Please try again after a few minutes.',
        verification: {
          errors: [
            {
              type: gstNumber ? 'gst' : accountNumber ? 'bank' : 'pan',
              error:
                'Cashfree API is experiencing issues. Please try again later or contact support.',
            },
          ],
        },
      }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: false,
        message:
          'Verification attempted but failed. You can still continue where optional.',
        verification: {
          errors: [
            {
              type: gstNumber ? 'gst' : accountNumber ? 'bank' : 'pan',
              error: errorMessage || 'Verification failed',
            },
          ],
        },
      },
      { status: 200 }
    );
  }
}
