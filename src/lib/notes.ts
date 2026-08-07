import { getCollection, type CollectionEntry } from 'astro:content';

export type ColKey = 'blog' | 'wiki';

export type BlogEntry = CollectionEntry<'blog'>;
export type WikiEntry = CollectionEntry<'wiki'>;
export type AnyEntry = BlogEntry | WikiEntry;

export function filterPublish<E extends { data: { publish?: boolean } }>(e: E): boolean {
  return e.data.publish !== false && (e.data as { draft?: boolean }).draft !== true;
}

export async function getPublishedCollection<K extends ColKey>(
  key: K,
): Promise<Array<CollectionEntry<K>>> {
  return (await getCollection(key, filterPublish as any)) as Array<CollectionEntry<K>>;
}

export function entryUrl<K extends ColKey>(key: K, entry: CollectionEntry<K>): string {
  const slug = entry.slug.replace(/\/index$/, '');
  return `/${key}${slug ? '/' + slug : ''}/`;
}

export function sortByDateDesc(a: AnyEntry, b: AnyEntry): number {
  const da = a.data.date instanceof Date ? a.data.date.getTime() : 0;
  const db = b.data.date instanceof Date ? b.data.date.getTime() : 0;
  return db - da;
}
