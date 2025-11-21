import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VendorsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
            <p className="text-muted-foreground mt-1">Manage your vendor partners and their commission rates</p>
          </div>
          <Link href="/vendors/add">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              + Add New Vendor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
