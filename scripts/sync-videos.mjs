import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile, rename, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { signWbi, normalizeBilibiliVideos } from './bilibili.mjs';

const exec = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const uid = '172571118';
const profileUrl = `https://space.bilibili.com/${uid}/upload/video`;
const options = ['--fail', '--silent', '--show-error', '--location', '--retry', '2', '--retry-all-errors', '--connect-timeout', '10', '--max-time', '30', '--user-agent', 'Mozilla/5.0', '--referer', profileUrl];
async function getJson(url) {
  const { stdout } = await exec('curl', [...options, url], { maxBuffer: 8 * 1024 * 1024 });
  try { return JSON.parse(stdout); }
  catch { throw new Error('Bilibili returned a verification page; existing snapshot was kept. Complete verification manually before retrying.'); }
}

async function readPublicList() {
  const args = process.argv.slice(2);
  if (args.length) {
    if (args.length !== 2 || args[0] !== '--from') throw new Error('Usage: npm run sync:videos [-- --from /path/to/public-videos.json]');
    const source = JSON.parse(await readFile(resolve(args[1]), 'utf8'));
    if (String(source.uid) !== uid || !Number.isSafeInteger(source.total) || source.total < 0 || !Array.isArray(source.items)) throw new Error('Invalid public-video export');
    return source;
  }
  const nav = await getJson('https://api.bilibili.com/x/web-interface/nav');
  if (!nav.data?.wbi_img) throw new Error('Bilibili public signing parameters are unavailable; existing snapshot was kept');
  async function page(pn) {
    const query = signWbi({ mid: uid, pn, ps: 30, order: 'pubdate' }, nav.data.wbi_img);
    const response = await getJson(`https://api.bilibili.com/x/space/wbi/arc/search?${query}`);
    if (response.code !== 0) throw new Error(`Bilibili ${response.code}: ${response.message}; existing snapshot was kept`);
    if (!Number.isSafeInteger(response.data?.page?.count) || !Array.isArray(response.data?.list?.vlist)) throw new Error('Unexpected Bilibili response');
    return response.data;
  }
  const first = await page(1);
  const total = first.page.count;
  const items = [...first.list.vlist];
  for (let pn = 2; pn <= Math.ceil(total / 30); pn++) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const next = await page(pn);
    if (next.page.count !== total || next.page.pn !== pn) throw new Error('Video list changed during sync; existing snapshot was kept. Retry later.');
    items.push(...next.list.vlist);
  }
  return { total, items };
}
const { total, items } = await readPublicList();
const videos = normalizeBilibiliVideos(items, uid, total);
const coverFolder = resolve(root, 'public/images/videos');
await mkdir(coverFolder, { recursive: true });
const destination = resolve(root, 'src/data/videos.json');
const previous = await readFile(destination, 'utf8').then(JSON.parse).catch(() => ({ videos: [] }));

// Download in small batches; replace the manifest only after every cover succeeds.
for (let index = 0; index < videos.length; index += 3) {
  await Promise.all(videos.slice(index, index + 3).map(async video => {
    const extension = new URL(video.coverSource).pathname.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase();
    if (!extension) throw new Error(`Unsupported cover format: ${video.bvid}`);
    video.cover = `images/videos/${video.bvid}.${extension}`;
    const file = resolve(root, 'public', video.cover);
    const old = previous.videos.find(item => item.bvid === video.bvid);
    if (old?.coverSource === video.coverSource && old.cover === video.cover && (await stat(file).catch(() => null))?.size > 0) return;
    const temporary = `${file}.download`;
    await exec('curl', [...options, '--output', temporary, video.coverSource]);
    const bytes = await readFile(temporary);
    const isImage = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255])) || bytes.subarray(1, 4).toString() === 'PNG' || (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP');
    if (!isImage) throw new Error(`Invalid cover image: ${video.bvid}`);
    await rename(temporary, file);
  }));
}
const snapshot = {
  uid, ownerName: items[0]?.author || previous.ownerName || '', profileUrl,
  syncedAt: new Date().toISOString(), total, complete: true, videos,
};
await writeFile(`${destination}.tmp`, JSON.stringify(snapshot, null, 2) + '\n');
await rename(`${destination}.tmp`, destination);
console.log(`Saved ${videos.length} public videos and their covers for UID ${uid}.`);
