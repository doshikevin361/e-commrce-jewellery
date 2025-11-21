export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  banner: string;
  canonicalUrl: string;
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  displayOnHomepage: boolean;
  displayOrder: number;
  featured: boolean;
  focusKeywords: string[];
  image: string;
  metaDescription: string;
  metaTitle: string;
  ogImage: string;
  parentId: string | null;
  position: number;
  showProductCount: boolean;
  status: "active" | "inactive";
}
