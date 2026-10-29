import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, mkdtemp, cp, symlink, writeFile, rm, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

import { createShowcaseFrames } from '../src/data/showcase.ts';
import { getProjectImages, projects } from '../src/data/site.ts';
import { prepareReadme } from './project-readme-plugin.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? filesIn(join(directory, entry.name)) : join(directory, entry.name)))).flat();
}

test('production pages have valid base paths, canonical URLs, local resources and heading anchors', async () => {
  const pages = (await filesIn(dist)).filter(file => file.endsWith('.html'));
  assert.ok(pages.length >= 5, 'core pages were built');
  for (const file of pages) {
    const html = await readFile(file, 'utf8');
    assert.match(html, /<html[^>]+lang="zh-CN"/);
    assert.match(html, /<html[^>]+data-theme="dark"/, 'every page defaults to the dark theme');
    assert.match(html, /rel="canonical" href="https:\/\/binbinku\.github\.io\//);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = match[1].replaceAll('&amp;', '&');
      if (/^(https?:|data:|mailto:|tel:)/.test(url)) continue;
      if (url.startsWith('#')) {
        const id = decodeURIComponent(url.slice(1));
        assert.ok(html.includes(`id="${id}"`), `${file}: missing anchor ${id}`);
        continue;
      }
      assert.ok(url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/BKSite/'), `${file}: resource must use the site root: ${url}`);
      const pathname = decodeURIComponent(url.split(/[?#]/)[0].slice('/'.length));
      const candidate = join(dist, pathname);
      const info = await stat(candidate).catch(() => null);
      assert.ok(info, `${file}: missing resource ${url}`);
      if (info.isDirectory()) await stat(join(candidate, 'index.html'));
    }
  }
  assert.ok(pages.includes(join(dist, '404.html')));
  const sitemap = await readFile(join(dist, 'sitemap-0.xml'), 'utf8');
  assert.ok(!sitemap.includes('/404'));
  assert.ok(!sitemap.includes('/BKSite/'), 'sitemap uses the root domain');
  assert.match(sitemap, /https:\/\/binbinku\.github\.io\//);
});

test('adding Markdown generates dated lists, encoded tag archives, adjacent links; drafts stay private', async () => {
  const temporary = await realpath(await mkdtemp(join(tmpdir(), 'bksite-content-test-')));
  try {
    for (const name of ['src', 'public', 'scripts', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
      await cp(join(root, name), join(temporary, name), { recursive: true });
    }
    await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');
    const articles = [
      ['fixture-old', '旧文章验收', '2024-01-01', false, '验收 标签'],
      ['fixture-new', '新文章验收', '2024-01-02', false, '验收 标签'],
      ['fixture-draft', '不可公开的草稿', '2024-01-03', true, '私密草稿标签'],
    ];
    for (const [slug, title, date, draft, tag] of articles) {
      const cover = slug === 'fixture-old' ? "cover: '../../assets/workspace.svg'\n" : '';
      await writeFile(join(temporary, 'src/content/blog', `${slug}.md`), `---\ntitle: '${title}'\ndescription: '内容集合验收文章'\npubDate: ${date}\ntags: ['${tag}']\ndraft: ${draft}\n${cover}---\n\n## 测试章节\n\n正文。\n`);
    }
    const astro = await realpath(join(root, 'node_modules/.bin/astro'));
    execFileSync(process.execPath, [astro, 'build', '--root', temporary], { cwd: temporary, stdio: 'pipe', timeout: 120000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
    const built = join(temporary, 'dist');
    const listing = await readFile(join(built, 'writing/index.html'), 'utf8');
    assert.ok(listing.indexOf('新文章验收') < listing.indexOf('旧文章验收'), 'newest first');
    assert.ok(!listing.includes('不可公开的草稿'));
    assert.match(listing, /src="\/_astro\/workspace[^\"]+\.svg"/, 'custom cover is generated with the deployment base');
    const older = await readFile(join(built, 'blog/fixture-old/index.html'), 'utf8');
    const newer = await readFile(join(built, 'blog/fixture-new/index.html'), 'utf8');
    assert.match(older, /href="\/blog\/fixture-new\/"/);
    assert.match(newer, /href="\/blog\/fixture-old\/"/);
    assert.ok(older.includes('文章目录') && older.includes('测试章节'));
    const tag = await readFile(join(built, 'tags/验收 标签/index.html'), 'utf8');
    assert.ok(tag.includes('新文章验收') && tag.includes('旧文章验收'));
    const draftPage = await stat(join(built, 'blog/fixture-draft/index.html')).catch(() => null);
    const draftTag = await stat(join(built, 'tags/私密草稿标签/index.html')).catch(() => null);
    assert.equal(draftPage, null);
    assert.equal(draftTag, null);
    const sitemap = await readFile(join(built, 'sitemap-0.xml'), 'utf8');
    assert.ok(!sitemap.includes('fixture-draft') && !sitemap.includes(encodeURIComponent('私密草稿标签')));
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('showcase finishes each project gallery, caps at three images and preserves fallback projects', () => {
  assert.deepEqual(createShowcaseFrames([3, 1, 0, 5]), [
    { projectIndex: 0, imageIndex: 0 }, { projectIndex: 0, imageIndex: 1 }, { projectIndex: 0, imageIndex: 2 },
    { projectIndex: 1, imageIndex: 0 }, { projectIndex: 2, imageIndex: 0 },
    { projectIndex: 3, imageIndex: 0 }, { projectIndex: 3, imageIndex: 1 }, { projectIndex: 3, imageIndex: 2 },
  ]);
  assert.deepEqual(createShowcaseFrames([]), []);
  const project = projects[0];
  const images = getProjectImages({ ...project, gallery: [
    { src: project.image, alt: 'duplicate' },
    { src: 'second.png', alt: 'second' }, { src: 'third.png', alt: 'third' }, { src: 'fourth.png', alt: 'fourth' },
  ] });
  assert.deepEqual(images.map(image => image.src), [project.image, 'second.png', 'third.png']);
  assert.deepEqual(projects.map(project => getProjectImages(project).length), [3, 2, 1, 1, 0, 3]);
});

test('README rendering preserves local pictures and anchors while removing executable HTML', () => {
  const element = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
  const text = value => ({ type: 'text', value });
  const tree = { type: 'root', children: [
    element('h2', {}, [text('Quick start')]),
    element('a', { href: '#quick-start' }, [text('Jump')]),
    element('a', { href: 'README.en.md' }, [text('English')]),
    element('img', { src: 'docs/picture.png', width: 80, onError: 'alert(1)' }),
    element('a', { href: 'javascript:alert(1)' }, [text('Unsafe')]),
    element('script', {}, [text('alert(1)')]),
    { type: 'raw', value: '<picture><source srcset="docs/picture.png" media="(prefers-color-scheme: dark)"><img src="docs/picture.png" onerror="alert(1)"></picture><details><summary>More</summary><p>Details</p></details>' },
    element('span', { style: 'color:#fff;background-image:url(javascript:alert(1))' }, [text('Code')]),
  ] };
  const clean = prepareReadme(tree, {
    sourceUrl: 'https://github.com/example/tool/blob/abc/README.md',
    assets: { 'docs/picture.png': '/images/readmes/tool/picture.png' },
  });
  assert.equal(clean.children[0].properties.id, 'readme-quick-start');
  assert.equal(clean.children[1].properties.href, '#readme-quick-start');
  assert.equal(clean.children[2].properties.href, 'https://github.com/example/tool/blob/abc/README.en.md');
  assert.equal(clean.children[3].properties.src, '/images/readmes/tool/picture.png');
  assert.equal(clean.children[3].properties.width, 80);
  const html = JSON.stringify(clean);
  assert.ok(!html.includes('onError') && !html.includes('javascript:') && !html.includes('"script"'));
  assert.ok(html.includes('picture') && html.includes('summary'), 'HTML pictures and collapsible content remain');
  assert.ok(!html.includes('docs/picture.png'), 'HTML image paths are rewritten');
  assert.ok(html.includes('color:#fff'), 'syntax token colors remain');
  assert.equal(tree.children[0].properties.id, undefined, 'source tree is unchanged');
});

test('every project card opens a README page and HTML screenshots survive rendering', async () => {
  const home = await readFile(join(dist, 'blog/index.html'), 'utf8');
  const metadata = JSON.parse(await readFile(join(root, 'src/data/project-readmes.json'), 'utf8'));
  for (const project of projects) {
    assert.ok(home.includes(`href="/projects/${project.id}/"`));
    const html = await readFile(join(dist, `projects/${project.id}/index.html`), 'utf8');
    assert.ok(html.includes('project-readme') && html.includes(project.url));
    if (Object.keys(metadata[project.id].assets).length) {
      assert.match(html, /src="\/images\/readmes\//, `${project.name}: README screenshots were preserved`);
    }
  }
});
