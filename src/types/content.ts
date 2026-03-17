export type ContentStatus = 'draft' | 'published';

export interface ContentMeta {
  schemaVersion: 2;
  updatedAt: string;
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  role: string;
  year: string;
  image: string;
  link: string;
  excerpt: string;
  tags: string[];
  status: ContentStatus;
  locale: 'zh' | 'en' | 'bi';
  seoTitle?: string;
  seoDescription?: string;
}

export interface Writing {
  id: number;
  slug: string;
  title: string;
  category: string;
  date: string;
  image?: string;
  excerpt: string;
  content?: string;
  tags: string[];
  status: ContentStatus;
  locale: 'zh' | 'en' | 'bi';
  seoTitle?: string;
  seoDescription?: string;
}

export interface CurationItem {
  id: number;
  slug: string;
  type: 'Book' | 'Movie' | 'Music';
  title: string;
  image: string;
  description: string;
  tags: string[];
  status: ContentStatus;
  locale: 'zh' | 'en' | 'bi';
  seoTitle?: string;
  seoDescription?: string;
}

export interface FooterInfo {
  id: number;
  email: string;
  twitter_link: string;
  github_link: string;
  linkedin_link: string;
  location: string;
  credibility: string;
}

export interface ContentV2 {
  meta: ContentMeta;
  projects: Project[];
  writings: Writing[];
  curations: CurationItem[];
  footer: FooterInfo[];
}

export type LegacyContent = {
  projectsData?: Project[];
  writingsData?: Writing[];
  curationsData?: CurationItem[];
  footerData?: FooterInfo[];
};
