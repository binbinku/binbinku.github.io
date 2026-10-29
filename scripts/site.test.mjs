import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, mkdtemp, cp, symlink, writeFile, rm, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

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
    assert.match(html, /rel="canonical" href="https:\/\/binbinku\.github\.io\/BKSite\//);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const url = match[1].replaceAll('&amp;', '&');
      if (/^(https?:|data:|mailto:|tel:)/.test(url)) continue;
      if (url.startsWith('#')) {
        const id = decodeURIComponent(url.slice(1));
        assert.ok(html.includes(`id="${id}"`), `${file}: missing anchor ${id}`);
        continue;
      }
      assert.ok(url.startsWith('/BKSite/'), `${file}: resource missing base: ${url}`);
      const pathname = decodeURIComponent(url.split(/[?#]/)[0].slice('/BKSite/'.length));
      const candidate = join(dist, pathname);
      const info = await stat(candidate).catch(() => null);
      assert.ok(info, `${file}: missing resource ${url}`);
      if (info.isDirectory()) await stat(join(candidate, 'index.html'));
    }
  }
  assert.ok(pages.includes(join(dist, '404.html')));
  const sitemap = await readFile(join(dist, 'sitemap-0.xml'), 'utf8');
  assert.ok(!sitemap.includes('/404'));
  assert.match(sitemap, /https:\/\/binbinku\.github\.io\/BKSite\//);
});

test('adding Markdown generates dated lists, encoded tag archives, adjacent links; drafts stay private', async () => {
  const temporary = await realpath(await mkdtemp(join(tmpdir(), 'bksite-content-test-')));
  try {
    for (const name of ['src', 'public', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
      await cp(join(root, name), join(temporary, name), { recursive: true });
    }
    await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');
    const articles = [
      ['fixture-old', '旧文章验收', '2024-01-01', false, '验收 标签'],
      ['fixture-new', '新文章验收', '2024-01-02', false, '验收 标签'],
      ['fixture-draft', '不可公开的草稿', '2024-01-03', true, '私密草稿标签'],
    ];
    for (const [slug, title, date, draft, tag] of articles) {
      await writeFile(join(temporary, 'src/content/blog', `${slug}.md`), `---\ntitle: '${title}'\ndescription: '内容集合验收文章'\npubDate: ${date}\ntags: ['${tag}']\ndraft: ${draft}\n---\n\n## 测试章节\n\n正文。\n`);
    }
    const astro = await realpath(join(root, 'node_modules/.bin/astro'));
    execFileSync(process.execPath, [astro, 'build', '--root', temporary], { cwd: temporary, stdio: 'pipe', timeout: 120000, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' } });
    const built = join(temporary, 'dist');
    const listing = await readFile(join(built, 'blog/index.html'), 'utf8');
    assert.ok(listing.indexOf('新文章验收') < listing.indexOf('旧文章验收'), 'newest first');
    assert.ok(!listing.includes('不可公开的草稿'));
    const older = await readFile(join(built, 'blog/fixture-old/index.html'), 'utf8');
    const newer = await readFile(join(built, 'blog/fixture-new/index.html'), 'utf8');
    assert.match(older, /href="\/BKSite\/blog\/fixture-new\/"/);
    assert.match(newer, /href="\/BKSite\/blog\/fixture-old\/"/);
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
