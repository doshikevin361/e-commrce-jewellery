import { MOCK_DASHBOARD } from '@/lib/mock-data';

export async function GET() {
  try {
    return Response.json(MOCK_DASHBOARD);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
