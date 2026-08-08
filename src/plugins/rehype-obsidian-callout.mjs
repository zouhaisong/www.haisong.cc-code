const CALLOUT_TYPES = {
  note: { title: 'NOTE', icon: 'ℹ' },
  info: { title: 'INFO', icon: 'ℹ' },
  tip: { title: 'TIP', icon: '💡' },
  hint: { title: 'HINT', icon: '💡' },
  important: { title: 'IMPORTANT', icon: '🔔' },
  success: { title: 'SUCCESS', icon: '✅' },
  check: { title: 'CHECK', icon: '✅' },
  done: { title: 'DONE', icon: '✅' },
  question: { title: 'QUESTION', icon: '❓' },
  help: { title: 'HELP', icon: '❓' },
  faq: { title: 'FAQ', icon: '❓' },
  warning: { title: 'WARNING', icon: '⚠' },
  caution: { title: 'CAUTION', icon: '⚠' },
  attention: { title: 'ATTENTION', icon: '⚠' },
  failure: { title: 'FAILURE', icon: '❌' },
  fail: { title: 'FAIL', icon: '❌' },
  missing: { title: 'MISSING', icon: '❌' },
  danger: { title: 'DANGER', icon: '🔥' },
  error: { title: 'ERROR', icon: '🔥' },
  bug: { title: 'BUG', icon: '🐛' },
  example: { title: 'EXAMPLE', icon: '📝' },
  quote: { title: 'QUOTE', icon: '❝' },
  cite: { title: 'CITE', icon: '❝' },
  abstract: { title: 'ABSTRACT', icon: '📋' },
  summary: { title: 'SUMMARY', icon: '📋' },
  tldr: { title: 'TL;DR', icon: '📋' },
  todo: { title: 'TODO', icon: '☐' },
};

function getCalloutMeta(typeRaw) {
  const lower = typeRaw.toLowerCase();
  if (CALLOUT_TYPES[lower]) {
    return { type: lower, ...CALLOUT_TYPES[lower] };
  }
  return { type: 'note', title: typeRaw.toUpperCase(), icon: 'ℹ' };
}

function extractText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractText).join('');
  }
  return '';
}

function isWhitespaceOnly(node) {
  return node && node.type === 'text' && /^\s*$/.test(node.value);
}

function firstElementChild(children) {
  if (!children || !Array.isArray(children)) return null;
  for (const child of children) {
    if (isWhitespaceOnly(child)) continue;
    if (child.type === 'element') return child;
    return null;
  }
  return null;
}

function firstChildOrText(children) {
  if (!children || !Array.isArray(children)) return null;
  for (const child of children) {
    if (isWhitespaceOnly(child)) continue;
    return child;
  }
  return null;
}

export default function rehypeObsidianCallout() {
  return (tree) => {
    visit(tree, 'element', (node, idx, parent) => {
      if (!parent || node.tagName !== 'blockquote') return;

      const firstChild = firstElementChild(node.children);
      if (!firstChild || firstChild.tagName !== 'p') return;

      const firstEl = firstChildOrText(firstChild.children);
      if (!firstEl) return;

      const text = extractText(firstEl);
      const match = text.match(/^\[!([A-Za-z]+)\]([+-]?)(.*)$/);
      if (!match) return;

      const [, typeRaw, foldFlag, restRaw] = match;
      const meta = getCalloutMeta(typeRaw);
      const customTitle = restRaw.trim();
      const displayTitle = customTitle || meta.title;
      const collapsible = foldFlag === '+' || foldFlag === '-';
      const defaultOpen = foldFlag !== '-';

      if (firstEl.type === 'text') {
        const beforeMatch = text.match(/^(\[!([A-Za-z]+)\][+-]?)/);
        const consumed = beforeMatch ? beforeMatch[0].length : 0;
        const remainder = firstEl.value.slice(consumed);
        if (remainder.length > 0) {
          firstEl.value = remainder.replace(/^\s*/, '');
          if (firstEl.value.length === 0) {
            const idxInParent = firstChild.children.indexOf(firstEl);
            if (idxInParent >= 0) firstChild.children.splice(idxInParent, 1);
          }
        } else {
          const idxInParent = firstChild.children.indexOf(firstEl);
          if (idxInParent >= 0) firstChild.children.splice(idxInParent, 1);
        }
      }

      const headText = extractText(firstChild);
      const firstChildIsEmpty = firstChild.children.length === 0 || headText.trim().length === 0;
      if (firstChildIsEmpty) {
        const idxInBlockquote = node.children.indexOf(firstChild);
        if (idxInBlockquote >= 0) node.children.splice(idxInBlockquote, 1);
      } else {
        while (firstChild.children.length > 0) {
          const lead = firstChild.children[0];
          if (lead.type === 'element' && lead.tagName === 'br') {
            firstChild.children.shift();
            continue;
          }
          if (lead.type === 'text') {
            const trimmed = lead.value.replace(/^\s+/, '');
            if (trimmed.length === 0) {
              firstChild.children.shift();
              continue;
            }
            lead.value = trimmed;
          }
          break;
        }
      }

      const titleNode = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['callout-title'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['callout-icon'], 'aria-hidden': 'true' },
            children: [{ type: 'text', value: meta.icon }],
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['callout-title-text'] },
            children: [{ type: 'text', value: displayTitle }],
          },
        ],
      };

      const bodyNode = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['callout-body'] },
        children: [...node.children],
      };

      let replacement;
      if (collapsible) {
        replacement = {
          type: 'element',
          tagName: 'details',
          properties: {
            className: ['callout', `callout-${meta.type}`, 'callout-collapsible'],
            ...(defaultOpen ? { open: true } : {}),
          },
          children: [
            {
              type: 'element',
              tagName: 'summary',
              properties: { className: ['callout-summary'] },
              children: [titleNode],
            },
            bodyNode,
          ],
        };
      } else {
        replacement = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['callout', `callout-${meta.type}`] },
          children: [titleNode, bodyNode],
        };
      }

      parent.children[idx] = replacement;
    });
  };
}

function visit(tree, type, visitor) {
  function one(node, idx, parent) {
    if (node.type === type) {
      visitor(node, idx, parent);
    }
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach((child, i) => one(child, i, node));
    }
  }
  one(tree, null, null);
}
