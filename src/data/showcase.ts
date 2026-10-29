export interface ShowcaseFrame { projectIndex: number; imageIndex: number }

// Keep a project's images consecutive; a project without images gets one illustration frame.
export function createShowcaseFrames(imageCounts: number[]): ShowcaseFrame[] {
  return imageCounts.flatMap((count, projectIndex) =>
    Array.from({ length: Math.max(1, Math.min(3, count)) }, (_, imageIndex) => ({ projectIndex, imageIndex })),
  );
}
