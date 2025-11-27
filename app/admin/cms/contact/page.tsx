import { AdminLayout } from '@/components/layout/admin-layout';
import { ContactFormPage } from '@/components/cms/contact-form-page';

export const metadata = {
  title: 'Contact Page | CMS',
  description: 'Manage contact page content',
};

export default function ContactPage() {
  return (
    <AdminLayout>
      <ContactFormPage />
    </AdminLayout>
  );
}
