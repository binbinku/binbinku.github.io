export const aiUsageLabels = {
  none: '没有使用',
  light: '轻度使用',
  heavy: '重度使用',
  unconfirmed: '待确认',
} as const;

export type AiUsageLevel = keyof typeof aiUsageLabels;

// Set levels from the author's own assessment; do not infer them from code or tools mentioned in README.
export const projectAiUsage: Record<string, AiUsageLevel> = {
  'project-manager': 'heavy',
  'device-monitor': 'heavy',
  'app-switch': 'heavy',
  'clean-helper': 'heavy',
  'dx11-template': 'light',
  'eft-tools': 'none',
  'unity-multiplayer-shooter': 'none',
  'cpp-game-engine': 'light',
};

export function getAiUsage(projectId: string) {
  const level = projectAiUsage[projectId] || 'unconfirmed';
  return { level, label: aiUsageLabels[level] };
}
