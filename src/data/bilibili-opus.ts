import snapshot from './bilibili-opus.json';
import type { BilibiliEntry } from './bilibili';

export const opusProfile = {
  uid: snapshot.uid,
  url: snapshot.profileUrl,
  syncedAt: snapshot.syncedAt,
  complete: snapshot.complete,
  total: snapshot.total,
};
// Preserve the public feed order; publication dates are verified via public details.
export const opusPosts: BilibiliEntry[] = snapshot.posts;
