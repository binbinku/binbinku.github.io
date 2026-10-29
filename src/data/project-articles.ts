import { postHref } from './paths';

const projectArticles: Record<string, string> = {
  'project-manager': 'project-manager-introduction',
  'device-monitor': 'device-monitor-introduction',
  'app-switch': 'app-switch-introduction',
  'clean-helper': 'clean-helper-introduction',
  'dx11-template': 'dx11-template-introduction',
  'eft-tools': 'eft-tools-introduction',
  'unity-multiplayer-shooter': 'unity-multiplayer-shooter-introduction',
  'cpp-game-engine': 'cpp-game-engine-introduction',
};

export const projectArticleHref = (id: string) => projectArticles[id] ? postHref(projectArticles[id]) : undefined;
