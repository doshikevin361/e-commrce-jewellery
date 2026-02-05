import { AdminLayout } from '@/components/layout/admin-layout';
import { NewsletterSubscriberList } from '@/components/newsletter/newsletter-subscriber-list';

export const metadata = {
  title: 'Newsletter Subscribers | Admin',
  description: 'Manage newsletter subscribers',
};

export default function NewsletterSubscribersPage() {
  return (
    <AdminLayout>
      <NewsletterSubscriberList />
    </AdminLayout>
  );
}
