'use client';

import { AdminLayout } from '@/components/layout/admin-layout';
import { PolicyFormPage } from '@/components/cms/policy-form-page';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Users } from 'lucide-react';

export default function VendorRetailerTermsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor & Retailer Terms</h1>
          <p className="text-muted-foreground mt-1">
            Manage separate Terms & Conditions for Vendors and B2B Retailers. These are shown in the respective panels and on the Become Member page.
          </p>
        </div>

        <Tabs defaultValue="vendor" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="vendor" className="gap-2">
              <Store className="h-4 w-4" />
              Vendor Terms
            </TabsTrigger>
            <TabsTrigger value="retailer" className="gap-2">
              <Users className="h-4 w-4" />
              Retailer Terms
            </TabsTrigger>
          </TabsList>
          <TabsContent value="vendor" className="mt-6">
            <PolicyFormPage policyType="vendor_terms" />
          </TabsContent>
          <TabsContent value="retailer" className="mt-6">
            <PolicyFormPage policyType="retailer_terms" />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
