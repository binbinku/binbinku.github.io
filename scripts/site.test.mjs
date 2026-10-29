import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat, mkdtemp, cp, symlink, writeFile, rm, realpath } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

import { createShowcaseFrames } from '../src/data/showcase.ts';
import { getProjectImages, projects } from '../src/data/site.ts';
import { prepareReadme } from './project-readme-plugin.mjs';
import { normalizeBilibiliVideos, normalizeBilibiliOpus, opusPublicationDate } from './bilibili.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');

test('video import rejects incomplete lists, wrong owners and unexpected cover hosts', () => {
  const video = { mid: 172571118, bvid: 'BV19remzbEBu', title: '测试视频', created: 1756308156, length: '02:38', pic: 'http://i1.hdslb.com/bfs/archive/cover.jpg' };
  const older = { ...video, bvid: 'BV1FXY9zpE4U', created: 1756308155 };
  const list = normalizeBilibiliVideos([older, video, video], '172571118', 2);
  assert.equal(list[0].bvid, video.bvid);
  assert.equal(list[0].coverSource, 'https://i1.hdslb.com/bfs/archive/cover.jpg');
  assert.equal(list[0].url, 'https://www.bilibili.com/video/BV19remzbEBu/');
  assert.throws(() => normalizeBilibiliVideos([video], '172571118', 2), /Incomplete/);
  assert.throws(() => normalizeBilibiliVideos([{ ...video, mid: 1 }], '172571118', 1), /owner/);
  assert.throws(() => normalizeBilibiliVideos([{ ...video, pic: 'https://example.com/cover.jpg' }], '172571118', 1), /cover host/);
});

test('opus imports retain exact IDs and public text without inventing dates', () => {
  const item = { opus_id: '1111756734208147472', content: '信息量增加', jump_url: '//www.bilibili.com/opus/1111756734208147472', cover: { url: 'http://i0.hdslb.com/bfs/new_dyn/cover.png' }, author: null };
  const posts = normalizeBilibiliOpus([item, item], '172571118');
  assert.equal(posts.length, 1);
  assert.equal(posts[0].id, '1111756734208147472');
  assert.equal(posts[0].url, 'https://www.bilibili.com/opus/1111756734208147472');
  assert.equal(posts[0].coverSource, 'https://i0.hdslb.com/bfs/new_dyn/cover.png');
  assert.equal(posts[0].publishedAt, undefined);
  assert.equal(normalizeBilibiliOpus([{ ...item, cover: null }], '172571118')[0].coverSource, undefined);
  assert.throws(() => normalizeBilibiliOpus([{ ...item, opus_id: Number(item.opus_id) }], '172571118'), /precision loss/);
  assert.throws(() => normalizeBilibiliOpus([{ ...item, jump_url: 'https://example.com/opus/1111756734208147472' }], '172571118'), /opus link/);
  assert.throws(() => normalizeBilibiliOpus([{ ...item, author: { mid: 1 } }], '172571118'), /owner/);
  const detail = { id_str: item.opus_id, modules: { module_author: { mid: 172571118, pub_ts: 1757689436 } } };
  assert.equal(opusPublicationDate(detail, item.opus_id, '172571118'), '2025-09-12T15:03:56.000Z');
  assert.throws(() => opusPublicationDate(detail, '1', '172571118'), /ID/);
  assert.throws(() => opusPublicationDate(detail, item.opus_id, '1'), /owner/);
  assert.throws(() => opusPublicationDate({ ...detail, modules: {} }, item.opus_id, '172571118'), /owner/);
});

test('opus pages share complete content, local covers and independent pagination', async () => {
  const snapshot = JSON.parse(await readFile(join(root, 'src/data/bilibili-opus.json'), 'utf8'));
  assert.equal(snapshot.complete, true);
  assert.equal(snapshot.posts.length, snapshot.total);
  assert.equal(new Set(snapshot.posts.map(post => post.id)).size, snapshot.total);
  for (const path of ['blog/index.html', 'videos/index.html', 'opus/index.html']) {
    const html = await readFile(join(dist, path), 'utf8');
    if (path !== 'opus/index.html') {
      assert.ok(html.indexOf('id="bilibili-opus"') > html.indexOf('id="personal-videos"'));
      assert.ok(html.includes('data-video-more'));
    } else {
      assert.match(html, /<h1[^>]*id="bilibili-opus-title"[^>]*>B站图文<\/h1>/);
      assert.match(html, /<a href="\/opus\/"[^>]*aria-current="page"[^>]*>图文<\/a>/);
    }
    assert.match(html, /<a href="\/opus\/"[^>]*>图文<\/a>/);
    assert.equal([...html.matchAll(/data-opus-card(?:\s|>)/g)].length, snapshot.total);
    assert.ok(html.includes('data-opus-more'));
    assert.ok(html.includes('theme-opus'));
    for (const post of snapshot.posts) {
      assert.ok(html.includes(`href="${post.url}"`));
      assert.ok(post.publishedAt && Number.isFinite(Date.parse(post.publishedAt)), 'every opus has a verified publication date');
      assert.ok(html.includes(`datetime="${post.publishedAt}"`));
      if (post.cover) {
        assert.ok(html.includes(`src="/${post.cover}"`));
        await stat(join(root, 'public', post.cover));
      }
    }
  }
  const standalone = await readFile(join(dist, 'opus/index.html'), 'utf8');
  assert.equal([...standalone.matchAll(/发布于\s*<time\b/g)].length, snapshot.total);
});

test('video coverage is accurately disclosed and all collected videos render with local covers below the projects', async () => {
  const snapshot = JSON.parse(await readFile(join(root, 'src/data/videos.json'), 'utf8'));
  assert.equal(snapshot.complete, snapshot.videos.length === snapshot.total, 'completeness must match actual coverage');
  assert.ok(snapshot.videos.length <= snapshot.total);
  assert.equal(new Set(snapshot.videos.map(video => video.bvid)).size, snapshot.videos.length);
  const home = await readFile(join(dist, 'blog/index.html'), 'utf8');
  if (!snapshot.complete) {
    assert.ok(home.includes(`已收录 ${snapshot.videos.length} / ${snapshot.total} 个公开视频`), 'partial coverage must be visible to visitors');
    assert.ok(home.includes(`href="${snapshot.profileUrl}"`), 'provide the original Bilibili profile');
    assert.ok(home.includes('data-video-complete="false"'));
  }
  assert.ok(home.indexOf('id="personal-videos"') > home.indexOf('id="personal-projects"'));
  for (const [index, video] of snapshot.videos.entries()) {
    if (index) assert.ok(video.publishedAt <= snapshot.videos[index - 1].publishedAt);
    assert.ok(home.includes(`href="${video.url}"`));
    assert.ok(home.includes(`src="/${video.cover}"`));
    await stat(join(root, 'public', video.cover));
  }
  assert.equal([...home.matchAll(/data-video-card(?:\s|>)/g)].length, snapshot.videos.length);
  assert.ok(home.includes('data-video-more'), 'all videos are in HTML; JavaScript enhances the list with load more');
  const archive = await readFile(join(dist, 'videos/index.html'), 'utf8');
  assert.match(home, /<a href="\/videos\/"[^>]*>视频<\/a>/, 'home navigation links to the video page');
  assert.match(archive, /<a href="\/videos\/"[^>]*aria-current="page"[^>]*>视频<\/a>/, 'video navigation marks the current page');
  assert.match(archive, /<h1[^>]*id="personal-videos-title"[^>]*>B站视频<\/h1>/);
  assert.equal([...archive.matchAll(/data-video-card(?:\s|>)/g)].length, snapshot.videos.length);
  assert.equal([...archive.matchAll(/发布于\s*<time\b/g)].length, snapshot.videos.length + JSON.parse(await readFile(join(root, 'src/data/bilibili-opus.json'), 'utf8')).total);
});
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
