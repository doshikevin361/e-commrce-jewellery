import { AdminLayout } from '@/components/layout/admin-layout';
import { KaratFormPage } from '@/components/karats/karat-form-page';

export const metadata = {
  title: 'Edit Karat | Admin',
  description: 'Edit karat',
};

export default async function EditKaratPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminLayout>
      <KaratFormPage karatId={id} />
    </AdminLayout>
  );
}

