import { NextRequest, NextResponse } from 'next/server';
import { checkShiprocketServiceability, isShiprocketEnabled } from '@/lib/shiprocket';

// POST - Check pincode serviceability through Shiprocket
export async function POST(request: NextRequest) {
  try {
    const { pincode, weight, codAmount } = await request.json();
    if (!pincode) {
      return NextResponse.json({ error: 'Pincode is required' }, { status: 400 });
    }

    const clean = String(pincode).replace(/\s/g, '').trim();
    if (!/^\d{6}$/.test(clean)) {
      return NextResponse.json({ error: 'Invalid pincode format', isServiceable: false }, { status: 400 });
    }

    if (!isShiprocketEnabled()) {
      return NextResponse.json(
        { error: 'Shiprocket integration disabled', isServiceable: false },
        { status: 503 }
      );
    }

    const result = await checkShiprocketServiceability(clean, undefined, weight || 0.5, codAmount);
    const fastest = result.couriers.length
      ? result.couriers.reduce((a, b) =>
          b.estimatedDays < a.estimatedDays || (b.estimatedDays === a.estimatedDays && b.rate < a.rate) ? b : a
        )
      : null;

    return NextResponse.json({
      success: true,
      serviceability: {
        pincode: clean,
        isServiceable: result.isServiceable,
        deliveryDays: fastest?.estimatedDays || 0,
        deliveryCharges: fastest?.rate || 0,
        codAvailable: result.couriers.some((c) => c.codAvailable),
        couriers: result.couriers,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to check pincode serviceability' },
      { status: 500 }
    );
  }
}
