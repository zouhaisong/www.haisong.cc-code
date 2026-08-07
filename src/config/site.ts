import siteConfigData from './site.config.mjs';

export interface SiteLocale {
  lang: string;
  label: string;
}

export interface SiteLogo {
  src: string;
  alternate?: string;
  text?: string;
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

export interface SiteConfig {
  title: string;
  description: string;
  locale: SiteLocale;
  url: string;
  logo: SiteLogo;
  favicon: string;
  seo: SiteSeo;
  navigation: SiteNavigation;
}

export const siteConfig: SiteConfig = siteConfigData as SiteConfig;

export default siteConfig;
