import { createHash } from 'node:crypto';

// Standard public WBI request signing. No account cookies or private keys.
// Reference: https://github.com/pskdje/bilibili-API-collect/blob/main/docs/misc/sign/wbi.md
const permutation = [46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52];
export function signWbi(params, images, timestamp = Math.floor(Date.now() / 1000)) {
  const source = [images.img_url, images.sub_url].map(url => new URL(url).pathname.split('/').pop().split('.')[0]).join('');
  if (source.length !== 64) throw new Error('Bilibili did not return valid public WBI keys');
  const key = permutation.map(index => source[index]).join('').slice(0, 32);
  const values = { ...params, wts: timestamp };
  const encode = value => encodeURIComponent(String(value).replace(/[!'()*]/g, ''));
  const query = Object.keys(values).sort().map(name => `${encode(name)}=${encode(values[name])}`).join('&');
  return `${query}&w_rid=${createHash('md5').update(query + key).digest('hex')}`;
}

export function normalizeBilibiliVideos(items, uid, expectedCount) {
  const videos = new Map();
  for (const item of items) {
    if (String(item.mid) !== String(uid)) throw new Error('Video owner does not match the configured UID');
    if (!/^BV[a-zA-Z0-9]{10}$/.test(item.bvid)) throw new Error('Invalid Bilibili video ID');
    if (typeof item.title !== 'string' || !item.title.trim()) throw new Error('Missing video title');
    if (!Number.isSafeInteger(item.created) || item.created <= 0) throw new Error('Invalid publication date');
    if (!/^\d+:\d{2}(?::\d{2})?$/.test(item.length)) throw new Error('Invalid duration');
    const cover = new URL(item.pic.startsWith('//') ? `https:${item.pic}` : item.pic);
    if (!/(^|\.)(hdslb\.com|biliimg\.com)$/.test(cover.hostname) || !['http:', 'https:'].includes(cover.protocol)) throw new Error('Unexpected cover host');
    cover.protocol = 'https:';
    videos.set(item.bvid, {
      bvid: item.bvid,
      title: item.title.trim(),
      url: `https://www.bilibili.com/video/${item.bvid}/`,
      coverSource: cover.href,
      publishedAt: new Date(item.created * 1000).toISOString(),
      duration: item.length,
    });
  }
  if (videos.size !== expectedCount) throw new Error(`Incomplete video list: expected ${expectedCount}, got ${videos.size}; existing snapshot was kept`);
  return [...videos.values()].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.bvid.localeCompare(b.bvid));
}
