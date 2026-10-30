// First successful Pages workflow: 40831875231, 2026-10-29 (Asia/Shanghai).
export const siteLaunchedAt = '2026-10-29T00:00:00+08:00';

// Whole calendar days since launch, changing at midnight in Asia/Shanghai.
export function getUptimeDays(now = Date.now()): number {
  return Math.max(0, Math.floor((now - Date.parse(siteLaunchedAt)) / 86_400_000));
}
