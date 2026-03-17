import raw from './content.json';
import type { ContentV2, LegacyContent, Project, Writing, CurationItem, FooterInfo } from '../types/content';

const nowIso = () => new Date().toISOString();

const ensureProject = (project: Partial<Project>, index: number): Project => ({
  id: Number(project.id ?? Date.now() + index),
  slug: project.slug ?? `project-${index + 1}`,
  title: project.title ?? 'Untitled Project',
  role: project.role ?? '',
  year: project.year ?? '',
  image: project.image ?? '',
  link: project.link ?? '',
  excerpt: project.excerpt ?? '',
  tags: Array.isArray(project.tags) ? project.tags : [],
  status: project.status ?? 'published',
  locale: project.locale ?? 'bi',
  seoTitle: project.seoTitle,
  seoDescription: project.seoDescription,
});

const ensureWriting = (writing: Partial<Writing>, index: number): Writing => ({
  id: Number(writing.id ?? Date.now() + index),
  slug: writing.slug ?? `writing-${index + 1}`,
  title: writing.title ?? 'Untitled Writing',
  category: writing.category ?? 'General',
  date: writing.date ?? '',
  image: writing.image,
  excerpt: writing.excerpt ?? '',
  content: writing.content ?? '',
  tags: Array.isArray(writing.tags) ? writing.tags : [],
  status: writing.status ?? 'published',
  locale: writing.locale ?? 'bi',
  seoTitle: writing.seoTitle,
  seoDescription: writing.seoDescription,
});

const ensureCuration = (curation: Partial<CurationItem>, index: number): CurationItem => ({
  id: Number(curation.id ?? Date.now() + index),
  slug: curation.slug ?? `curation-${index + 1}`,
  type: curation.type ?? 'Book',
  title: curation.title ?? 'Untitled Curation',
  image: curation.image ?? '',
  description: curation.description ?? '',
  tags: Array.isArray(curation.tags) ? curation.tags : [],
  status: curation.status ?? 'published',
  locale: curation.locale ?? 'bi',
  seoTitle: curation.seoTitle,
  seoDescription: curation.seoDescription,
});

const ensureFooter = (footer: Partial<FooterInfo>, index: number): FooterInfo => ({
  id: Number(footer.id ?? index + 1),
  email: footer.email ?? '',
  twitter_link: footer.twitter_link ?? '',
  github_link: footer.github_link ?? '',
  linkedin_link: footer.linkedin_link ?? '',
  location: footer.location ?? '',
  credibility: footer.credibility ?? '',
});

export const normalizeContent = (source: ContentV2 | LegacyContent): ContentV2 => {
  const maybeV2 = source as ContentV2;
  if (maybeV2.meta && Array.isArray(maybeV2.projects)) {
    return {
      meta: {
        schemaVersion: 2,
        updatedAt: maybeV2.meta.updatedAt ?? nowIso(),
      },
      projects: maybeV2.projects.map(ensureProject),
      writings: maybeV2.writings.map(ensureWriting),
      curations: maybeV2.curations.map(ensureCuration),
      footer: maybeV2.footer.map(ensureFooter),
    };
  }

  const legacy = source as LegacyContent;
  return {
    meta: {
      schemaVersion: 2,
      updatedAt: nowIso(),
    },
    projects: (legacy.projectsData ?? []).map(ensureProject),
    writings: (legacy.writingsData ?? []).map(ensureWriting),
    curations: (legacy.curationsData ?? []).map(ensureCuration),
    footer: (legacy.footerData ?? []).map(ensureFooter),
  };
};

export const content = normalizeContent(raw as ContentV2 | LegacyContent);
export const projectsData = content.projects;
export const writingsData = content.writings;
export const curationsData = content.curations;
export const footerData = content.footer;
