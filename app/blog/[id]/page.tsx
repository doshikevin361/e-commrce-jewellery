import { PageLayout } from '@/components/layout/page-layout';
import { BlogDetailPage } from '@/components/blog/blog-detail-page';

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <PageLayout>
      <BlogDetailPage blogId={id} />
    </PageLayout>
  );
}

