import type { GetStaticPaths } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';

type ColKey = 'blog' | 'wiki';

const routeMap: Record<ColKey, string> = {
  blog: '/blog',
  wiki: '/wiki',
};

function slugify(id: string) {
  return id
    .replace(/\.mdx?$/, '')
    .replace(/[\\/]+/g, '/')
    .split('/')
    .map((s) => s.toLowerCase().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean)
    .join('/');
}

function filterPublish(e: { data: { publish?: boolean } }): boolean {
  return e.data.publish !== false;
}

export function noteUrl(collection: string, id: string): string {
  const base = (routeMap as Record<string, string>)[collection] ?? '/blog';
  const s = slugify(id);
  return s ? `${base}/${s}/` : `${base}/`;
}

export async function getAllNoteEntries() {
  const entries: { entry: CollectionEntry<any>; url: string; collection: ColKey }[] = [];
  for (const k of Object.keys(routeMap) as ColKey[]) {
    const list = (await getCollection(k as any, filterPublish as any)) as CollectionEntry<any>[];
    for (const e of list) entries.push({ entry: e, url: noteUrl(k, e.id), collection: k });
  }
  return entries;
}

export const noteStaticPaths: GetStaticPaths = async () => {
  const entries = await getAllNoteEntries();
  return entries.map(({ entry, url }) => ({
    params: { note: url.replace(/^\//, '').replace(/\/$/, '') },
    props: { entry },
  }));
};

export { routeMap, slugify, filterPublish };
export type { ColKey };
