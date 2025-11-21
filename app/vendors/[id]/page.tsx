import { VendorForm } from '@/components/vendors/vendor-form';

export default function EditVendorPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Vendor</h1>
          <p className="text-muted-foreground mt-1">Update vendor information and settings</p>
        </div>
        <VendorForm vendorId={params.id} />
      </div>
    </div>
  );
}
