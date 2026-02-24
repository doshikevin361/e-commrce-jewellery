import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    let query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (search && search.trim()) {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { companyName: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    const retailers = await db
      .collection('retailers')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    const list = retailers.map((r: any) => {
      const { password, ...rest } = r;
      return { ...rest, _id: r._id?.toString() };
    });
    return NextResponse.json({ retailers: list, total: list.length });
  } catch (error) {
    console.error('[Admin] GET retailers error:', error);
    return NextResponse.json({ error: 'Failed to fetch retailers' }, { status: 500 });
  }
}
