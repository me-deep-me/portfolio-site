import { create } from 'zustand';
import {
  Station,
  getStation,
  getStationProgress,
  getFogFar,
  getBloomIntensity,
  getParticleDensity,
  PANEL_COUNT,
} from '@/lib/constants';

export interface PanelState {
  id: number;
  isActive: boolean;
  glowIntensity: number;
}

interface SceneStore {
  scrollProgress: number;
  activeStation: Station;
  stationProgress: number;
  fogFar: number;
  particleDensity: number;
  bloomIntensity: number;
  panels: PanelState[];
  openProjectId: string | null;

  setScrollProgress: (p: number) => void;
  setOpenProjectId: (id: string | null) => void;
}

const initialPanels: PanelState[] = Array.from({ length: PANEL_COUNT }, (_, i) => ({
  id: i,
  isActive: false,
  glowIntensity: 0,
}));

export const useSceneStore = create<SceneStore>((set) => ({
  scrollProgress:  0,
  activeStation:   0,
  stationProgress: 0,
  fogFar:          18,
  particleDensity: 0,
  bloomIntensity:  1.8,
  panels:          initialPanels,
  openProjectId:   null,

  setScrollProgress: (p) => {
    const station   = getStation(p);
    const stProg    = getStationProgress(p, station);
    const fogFar    = getFogFar(p);
    const bloom     = getBloomIntensity(p);
    const density   = getParticleDensity(p);

    // Activate panels sequentially when entering station 2
    const panels: PanelState[] = initialPanels.map((panel) => {
      if (station < 2) return { ...panel, isActive: false, glowIntensity: 0 };
      // Each panel lights up at a staggered threshold within station 2
      const panelThreshold = panel.id / PANEL_COUNT;
      const isActive = station >= 2;
      const glowIntensity = isActive
        ? Math.min(1, Math.max(0, (stProg - panelThreshold) * 3))
        : 0;
      return { ...panel, isActive, glowIntensity };
    });

    set({
      scrollProgress:  p,
      activeStation:   station,
      stationProgress: stProg,
      fogFar,
      bloomIntensity:  bloom,
      particleDensity: density,
      panels,
    });
  },

  setOpenProjectId: (id) => set({ openProjectId: id }),
}));
