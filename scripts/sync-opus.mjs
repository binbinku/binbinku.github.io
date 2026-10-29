import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { normalizeBilibiliOpus, opusPublicationDate } from './bilibili.mjs';

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const uid = '172571118';
const profileUrl = `https://space.bilibili.com/${uid}/upload/opus`;
const options = ['--fail', '--silent', '--show-error', '--location', '--connect-timeout', '10', '--max-time', '30', '--user-agent', 'Mozilla/5.0', '--referer', profileUrl];

async function readPublicList() {
  const args = process.argv.slice(2);
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--from') throw new Error('Usage: npm run sync:opus [-- --from /path/to/public-opus.json]');
    const source = JSON.parse(await readFile(resolve(args[1]), 'utf8'));
    if (String(source.uid) !== uid || source.complete !== true || !Array.isArray(source.items)) throw new Error('A complete public opus export for the configured UID is required');
    return source.items;
  }
  const items = [];
  const offsets = new Set();
  let offset = '';
  for (;;) {
    const query = new URLSearchParams({ host_mid: uid, ...(offset ? { offset } : {}) });
    const { stdout } = await exec('curl', [...options, `https://api.bilibili.com/x/polymer/web-dynamic/v1/opus/feed/space?${query}`], { maxBuffer: 8 * 1024 * 1024 });
    const response = JSON.parse(stdout);
    if (response.code !== 0 || !Array.isArray(response.data?.items) || typeof response.data.has_more !== 'boolean') throw new Error(`Opus list unavailable: ${response.code}; previous snapshot was kept`);
    items.push(...response.data.items);
    if (!response.data.has_more) return items;
    offset = response.data.offset;
    if (!offset || offsets.has(offset)) throw new Error('Missing or repeated opus offset; previous snapshot was kept');
    offsets.add(offset);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

const posts = normalizeBilibiliOpus(await readPublicList(), uid);
await mkdir(resolve(root, 'public/images/bilibili-opus'), { recursive: true });
const destination = resolve(root, 'src/data/bilibili-opus.json');
const previous = await readFile(destination, 'utf8').then(JSON.parse).catch(() => ({ posts: [] }));
// Publication timestamps come from public detail records; never infer them from IDs.
for (const [index, post] of posts.entries()) {
  const old = previous.posts.find(item => item.id === post.id);
  if (!post.publishedAt && old?.publishedAt) post.publishedAt = old.publishedAt;
  if (!post.publishedAt) {
    if (index) await new Promise(resolve => setTimeout(resolve, 750));
    const { stdout } = await exec('curl', [...options, `https://api.bilibili.com/x/polymer/web-dynamic/v1/detail?id=${post.id}`], { maxBuffer: 8 * 1024 * 1024 });
    const detail = JSON.parse(stdout);
    if (detail.code !== 0) throw new Error(`Opus date unavailable: ${detail.code}; previous snapshot was kept`);
    post.publishedAt = opusPublicationDate(detail.data?.item, post.id, uid);
  }
  if ((index + 1) % 8 === 0) console.log(`Publication dates: ${index + 1}/${posts.length}`);
}
for (let index = 0; index < posts.length; index += 3) {
  await Promise.all(posts.slice(index, index + 3).map(async post => {
    if (!post.coverSource) return;
    post.cover = `images/bilibili-opus/${post.id}.webp`;
    const file = resolve(root, 'public', post.cover);
    const old = previous.posts.find(item => item.id === post.id);
    if (old?.coverSource === post.coverSource && old.cover === post.cover && (await stat(file).catch(() => null))?.size > 0) return;
    const temporary = `${file}.download`;
    await exec('curl', [...options, '--output', temporary, `${post.coverSource}@640w_360h_1c.webp`]);
    const bytes = await readFile(temporary);
    if (bytes.subarray(0, 4).toString() !== 'RIFF' || bytes.subarray(8, 12).toString() !== 'WEBP') throw new Error(`Invalid opus cover: ${post.id}; previous snapshot was kept`);
    await rename(temporary, file);
  }));
}
await writeFile(`${destination}.tmp`, JSON.stringify({ uid, profileUrl, syncedAt: new Date().toISOString(), complete: true, total: posts.length, posts }, null, 2) + '\n');
await rename(`${destination}.tmp`, destination);
console.log(`Saved ${posts.length} public opus posts and their local covers.`);
