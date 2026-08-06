import path from 'node:path';

function slugifySegment(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function slugifyPath(p) {
  const normalized = String(p ?? '')
    .replace(/\\/g, '/')
    .replace(/\.(md|mdx)$/i, '');
  return normalized
    .split('/')
    .map(slugifySegment)
    .filter(Boolean)
    .join('/');
}

function resolveCollectionFromFilePath(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  for (const part of parts) {
    if (part === 'blog') return 'blog';
    if (part === 'wiki') return 'wiki';
  }
  return null;
}

function walk(tree, visitor) {
  const stack = [tree];
  while (stack.length) {
    const node = stack.pop();
    visitor(node);
    if (Array.isArray(node.children)) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push(node.children[i]);
      }
    }
  }
}

export default function remarkMdLink() {
  return function (tree, file) {
    const filePath = file.path || file.history?.[0] || '';
    const currentCollection = resolveCollectionFromFilePath(filePath);
    const fileDir = filePath ? path.dirname(filePath.replace(/\\/g, '/')) : '';

    walk(tree, (node) => {
      if (node.type !== 'link') return;
      const url = String(node.url || '');

      if (!url) return;
      if (/^(https?:|mailto:|#|\/)/i.test(url)) return;
      if (!/\.(md|mdx)$/i.test(url)) return;

      const withoutAnchor = url.split('#')[0];
      const anchor = url.slice(withoutAnchor.length);

      let resolvedPath;
      if (withoutAnchor.startsWith('.')) {
        resolvedPath = path.posix.join(fileDir, withoutAnchor);
      } else {
        resolvedPath = withoutAnchor;
      }
      resolvedPath = resolvedPath.replace(/\\/g, '/');

      let collection = resolveCollectionFromFilePath(resolvedPath);
      let relative = resolvedPath;
      if (collection) {
        const idx = resolvedPath.indexOf('/' + collection + '/');
        if (idx !== -1) {
          relative = resolvedPath.slice(idx + collection.length + 2);
        } else {
          const parts = resolvedPath.split('/');
          const ci = parts.indexOf(collection);
          if (ci !== -1) relative = parts.slice(ci + 1).join('/');
        }
      } else {
        collection = currentCollection || 'wiki';
      }

      const slug = slugifyPath(relative);
      const newUrl = slug ? `/${collection}/${slug}/${anchor}` : `/${collection}/${anchor}`;
      node.url = newUrl;
    });
  };
}
