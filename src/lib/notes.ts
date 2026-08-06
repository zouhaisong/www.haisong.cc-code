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
  const entries: { entry: CollectionEntry<any>; url: string; collection: ColKey; slug: string; titleNormalized: string; basenameNormalized: string }[] = [];
  for (const k of Object.keys(routeMap) as ColKey[]) {
    const list = (await getCollection(k as any, filterPublish as any)) as CollectionEntry<any>[];
    for (const e of list) {
      const s = slugify(e.id);
      const basename = s.split('/').pop() ?? s;
      const title = e.data?.title as string | undefined ?? '';
      entries.push({
        entry: e,
        url: noteUrl(k, e.id),
        collection: k,
        slug: s,
        titleNormalized: slugify(title),
        basenameNormalized: basename,
      });
    }
  }
  return entries;
}

export type NoteEntry = Awaited<ReturnType<typeof getAllNoteEntries>>[number];

let _noteIndexCache: NoteEntry[] | null = null;

export async function getAllNoteIndex(): Promise<NoteEntry[]> {
  if (_noteIndexCache) return _noteIndexCache;
  _noteIndexCache = await getAllNoteEntries();
  return _noteIndexCache;
}

export async function resolveNoteByShortName(name: string): Promise<NoteEntry | null> {
  const key = slugify(name);
  if (!key) return null;
  const index = await getAllNoteIndex();
  const exact = index.find((n) => n.basenameNormalized === key || n.slug === key || n.titleNormalized === key);
  if (exact) return exact;
  const ends = index.find((n) => n.slug.endsWith('/' + key));
  if (ends) return ends;
  const partialTitle = index.find((n) => n.titleNormalized && (n.titleNormalized === key || n.titleNormalized.includes(key) || key.includes(n.titleNormalized)));
  if (partialTitle) return partialTitle;
  return null;
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
