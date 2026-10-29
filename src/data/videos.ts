import snapshot from './videos.json';

export interface PersonalVideo {
  bvid: string;
  title: string;
  url: string;
  cover: string;
  coverSource: string;
  publishedAt: string;
  duration: string;
}

export const videoProfile = {
  uid: snapshot.uid,
  name: snapshot.ownerName,
  url: snapshot.profileUrl,
  syncedAt: snapshot.syncedAt,
  total: snapshot.total,
  complete: snapshot.complete,
};
export const videos: PersonalVideo[] = [...snapshot.videos].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.bvid.localeCompare(b.bvid));
