/* 每幕时长:有配音则跟着配音长度(+首尾留白),否则用 scene.dur 秒或默认。 */
export function sceneFrames(scene: any, voFrames: number | undefined, fps: number): number {
  if (voFrames && voFrames > 0) return 10 + voFrames + (scene.endPad ?? 26);
  if (scene.dur) return Math.round(scene.dur * fps);
  return scene.minFrames ?? 150;
}

export function allDurations(scenes: any[], manifest: Record<string, number>, fps: number): number[] {
  return scenes.map((s, i) => sceneFrames(s, manifest[String(i)], fps));
}
