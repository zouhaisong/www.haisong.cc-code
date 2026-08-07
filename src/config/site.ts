import siteConfigData from './site.config.mjs';

export interface SiteLocale {
  lang: string;
  label: string;
}

export interface SiteLogo {
  src: string;
  alternate?: string;
  text?: string;
  textEn?: string;
}

export interface SiteSeoTwitter {
  creator?: string;
  card?: string;
}

export interface SiteSeo {
  defaultOGImage?: string;
  defaultTwitterImage?: string;
  siteName?: string;
  twitter?: SiteSeoTwitter;
  keywords?: string[];
}

export interface SiteNavItem {
  label: string;
  link: string;
}

export interface SiteNavigation {
  header: SiteNavItem[];
}

export interface SiteWorkItem {
  title: string;
  summary?: string;
  link?: string;
  tags?: string[];
}

export interface SiteWorks {
  title: string;
  titleEn?: string;
  lead?: string;
  items: SiteWorkItem[];
}

export type SiteContactIcon = 'email' | 'link';

export interface SiteContactChannel {
  label: string;
  value: string;
  link?: string;
  icon?: SiteContactIcon;
}

export interface SiteContact {
  title: string;
  titleEn?: string;
  lead?: string;
  channels: SiteContactChannel[];
}

export interface SiteConfig {
  title: string;
  titleEn?: string;
  description: string;
  locale: SiteLocale;
  url: string;
  logo: SiteLogo;
  favicon: string;
  seo: SiteSeo;
  navigation: SiteNavigation;
  works: SiteWorks;
  contact: SiteContact;
}

export const siteConfig: SiteConfig = siteConfigData as SiteConfig;

export default siteConfig;
