export type GalleryImage = {
  path: string;
  alt_en?: string;
  alt_bn?: string;
  width?: number;
  height?: number;
};

export type Category = {
  id: string;
  slug: string;
  name_en: string;
  name_bn: string;
  description_en: string | null;
  description_bn: string | null;
  seo_title_en: string | null;
  seo_title_bn?: string | null;
  seo_description_en: string | null;
  seo_description_bn?: string | null;
  image_path?: string | null;
  image_alt_en?: string | null;
  image_alt_bn?: string | null;
};

export type Product = {
  id: string;
  category_id: string;
  slug: string;
  name_en: string;
  name_bn: string;
  description_en: string | null;
  description_bn: string | null;
  seo_title_en: string | null;
  seo_description_en: string | null;
  is_available: boolean;
  is_featured: boolean;
  main_image_path: string | null;
  main_image_alt_en: string | null;
  main_image_alt_bn?: string | null;
  gallery_images: GalleryImage[];
  categories?: Pick<Category, "slug" | "name_en" | "name_bn"> | null;
};

export type ProductPage = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
