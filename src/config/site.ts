import { siteConfig as raw } from './site.config.mjs';

export interface FaviconConfig {
  path: string;
  image: string;
}

export interface SeoConfig {
  author: string;
  keywords: string[];
  robots: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialItem {
  label: string;
  href: string;
  icon?: string;
}

export interface LocaleConfig {
  root: { label: string; lang: string };
}

export interface SiteConfig {
  title: string;
  description: string;
  tagline: string;
  logo: string;
  logoAlternate: string;
  logoText: string;
  logoWidth: string;
  logoHeight: string;
  favicon: FaviconConfig;
  seo: SeoConfig;
  nav: NavItem[];
  social: SocialItem[];
  lang: string;
  locale: LocaleConfig;
}

export const siteConfig: SiteConfig = raw as SiteConfig;

export default siteConfig;
