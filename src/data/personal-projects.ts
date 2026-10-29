import snapshot from './personal-projects.json';
import type { ProjectImage } from './site';

export interface PersonalProject {
  id: string;
  name: string;
  description: string;
  features: string[];
  stack: string[];
  images: ProjectImage[];
}

export const personalProjectSource = 'https://github.com/binbinku/bkprojectsite/blob/b0f5b2dd0d14c1b2a08e036702112a0d9639cd42/public/data/proj.json';

// Snapshot from bkprojectsite/public/data/proj.json, 2026-10-29.
// Keep the source names, descriptions, feature lists and image order intact.
const presentation = [
  { id: 'unity-multiplayer-shooter', stack: ['Unity', 'HDRP', 'Mirror'], labels: ['游戏画面（一）', '游戏画面（二）', '游戏画面（三）', '游戏画面（四）'] },
  { id: 'cpp-game-engine', stack: ['C++', 'DirectX 11', 'Win32', 'Lua'], labels: ['运行画面', '引擎编辑器', '材质编辑器', 'Shader 编辑器'] },
];

export const personalProjects: PersonalProject[] = snapshot.map((project, index) => ({
  id: presentation[index].id,
  name: project.name,
  description: project.desc,
  features: project.infos,
  stack: presentation[index].stack,
  images: project.images.map((src, imageIndex) => ({
    src: src.replace('./images/', 'images/personal-projects/'),
    alt: `${project.name} · ${presentation[index].labels[imageIndex]}`,
  })),
}));
