import { readFileSync } from 'node:fs';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import GithubSlugger from 'github-slugger';
import rehypeRaw from 'rehype-raw';

const snapshots = JSON.parse(readFileSync(new URL('../src/data/project-readmes.json', import.meta.url), 'utf8'));
const parseHtml = rehypeRaw();
const sanitize = rehypeSanitize({
  ...defaultSchema,
  clobberPrefix: 'readme-',
  tagNames: [...defaultSchema.tagNames, 'picture', 'source', 'details', 'summary', 'kbd', 'sub'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...defaultSchema.attributes['*'], 'className'],
    pre: ['className', 'style', 'tabIndex'],
    code: ['className'],
    span: ['className', 'style'],
    source: ['srcSet', 'media', 'type'],
    img: [...defaultSchema.attributes.img, 'width', 'height', 'loading', 'decoding'],
    details: ['open'],
  },
});
function walk(node, visit) {
  visit(node);
  for (const child of node.children || []) walk(child, visit);
}
function textContent(node) {
  return node.type === 'text' ? node.value : (node.children || []).map(textContent).join('');
}
export function prepareReadme(tree, snapshot) {
  const copy = parseHtml(JSON.parse(JSON.stringify(tree)));
  const ids = new Set();
  const slugger = new GithubSlugger();
  walk(copy, node => {
    if (node.type !== 'element') return;
    const props = node.properties ||= {};
    if (/^h[1-6]$/.test(node.tagName) && !props.id) props.id = slugger.slug(textContent(node));
    if (props.id) ids.add(String(props.id));
    if (props.name) ids.add(String(props.name));
  });
  const relativeUrl = value => {
    if (typeof value !== 'string') return value;
    if (snapshot.assets[value]) return snapshot.assets[value];
    if (value.startsWith('#')) {
      let id;
      try { id = decodeURIComponent(value.slice(1)); } catch { id = value.slice(1); }
      return ids.has(id) ? `#readme-${id}` : snapshot.sourceUrl + value;
    }
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return value;
    return new URL(value, snapshot.sourceUrl).href;
  };
  walk(copy, node => {
    if (node.type !== 'element') return;
    const props = node.properties ||= {};
    if (props.href) props.href = relativeUrl(props.href);
    if (props.src) props.src = relativeUrl(props.src);
    if (props.srcSet) props.srcSet = relativeUrl(props.srcSet);
    // Keep only simple token colors produced by syntax highlighting.
    if (typeof props.style === 'string') {
      props.style = props.style.split(';').filter(part => /^\s*(?:color|background-color|--shiki-[\w-]+)\s*:\s*(?:#[\da-f]{3,8}|[a-z]+)\s*$/i.test(part)).join(';');
    }
  });
  const clean = sanitize(copy);
  walk(clean, node => {
    if (node.type !== 'element') return;
    const props = node.properties ||= {};
    if (node.tagName === 'img') {
      props.loading = 'lazy';
      props.decoding = 'async';
      if (/^\d+$/.test(String(props.width))) props.style = `width:min(100%,${Number(props.width)}px);height:auto`;
    }
    if (node.tagName === 'a' && /^https?:/.test(String(props.href))) {
      props.target = '_blank';
      props.rel = ['noopener', 'noreferrer'];
    }
  });
  return clean;
}
export function readmeImages(context) {
  const snapshot = snapshots[context.data.astro?.frontmatter?.projectId];
  if (!snapshot) return false;
  return { name: 'project-readme-images', image(node) {
    return { ...node, url: snapshot.assets[node.url] || node.url };
  } };
}
export function readmeHtml(context) {
  const snapshot = snapshots[context.data.astro?.frontmatter?.projectId];
  if (!snapshot) return false;
  return { name: 'project-readme-html', before(tree, ctx) {
    ctx.replaceNode(tree, prepareReadme(tree, snapshot));
  } };
}
