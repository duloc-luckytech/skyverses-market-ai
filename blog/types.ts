export type Language = 'en' | 'vi' | 'ko' | 'ja';

export interface LocalizedString {
  en: string;
  vi?: string;
  ko?: string;
  ja?: string;
}

export interface BlogPost {
  _id: string;
  slug: string;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedString;
  coverImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  seo: {
    metaTitle: LocalizedString;
    metaDescription: LocalizedString;
    ogImage: string;
    keywords: string[];
  };
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string;
  readTime: number;
  viewCount: number;
  order: number;
  relatedSlugs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogDetailResponse {
  success: boolean;
  data: BlogPost;
}

export interface CategoryCount {
  category: string;
  count: number;
}
