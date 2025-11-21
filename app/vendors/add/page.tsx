import { VendorForm } from '@/components/vendors/vendor-form';

export default function AddVendorPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Add New Vendor</h1>
          <p className="text-muted-foreground mt-1">Register a new vendor and configure their settings</p>
        </div>
        <VendorForm />
      </div>
    </div>
  );
}
