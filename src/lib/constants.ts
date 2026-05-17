/** Scroll progress boundaries for each station (0→1) */
export const STATION_THRESHOLDS = [0, 0.18, 0.38, 0.60, 0.80] as const;

export type Station = 0 | 1 | 2 | 3 | 4;

/** Derive active station from 0→1 scroll progress */
export function getStation(progress: number): Station {
  if (progress < STATION_THRESHOLDS[1]) return 0;
  if (progress < STATION_THRESHOLDS[2]) return 1;
  if (progress < STATION_THRESHOLDS[3]) return 2;
  if (progress < STATION_THRESHOLDS[4]) return 3;
  return 4;
}

/** 0→1 progress within the current station */
export function getStationProgress(progress: number, station: Station): number {
  const start = STATION_THRESHOLDS[station];
  const end = station < 4 ? STATION_THRESHOLDS[station + 1] : 1;
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

/** Fog far-plane: station 0 = 18, station 4 = 60 */
export function getFogFar(progress: number): number {
  return 18 + progress * 42;
}

/** Bloom intensity: station 0 = 1.8, station 4 = 0.8 */
export function getBloomIntensity(progress: number): number {
  return 1.8 - progress * 1.0;
}

/** Particle density multiplier: 0 → 1 peaks at station 3 */
export function getParticleDensity(progress: number): number {
  // Ramp up through station 3, then slightly back
  if (progress < 0.6) return progress / 0.6;
  if (progress < 0.8) return 1.0;
  return 1.0 - (progress - 0.8) / 0.2 * 0.3;
}

/** Page total scroll height in vh — controls how many sections fit */
export const PAGE_HEIGHT_VH = 500;

/** Number of floating panels */
export const PANEL_COUNT = 8;

/** Lerp alpha for camera (frame-rate-independent) */
export const CAMERA_LERP_BASE = 0.04; // pow(0.04, delta) factor
