import { DiamondTypeFormPage } from '@/components/diamond-types/diamond-type-form-page';

export default async function EditDiamondTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DiamondTypeFormPage diamondTypeId={id} />;
}


