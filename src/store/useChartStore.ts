"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChartRequest } from "@/core/chart/buildChart";

export interface DisplayOptions {
  showAnnualStars: boolean;
  showDecadalStars: boolean;
  showAuxiliary: boolean;
  showMinorStars: boolean;
  showCycles: boolean;
  showBrightness: boolean;
  showTransformations: boolean;
  showTrangSinh: boolean;
  zoom: number;
}

export interface SavedChart {
  id: string;
  savedAt: string;
  request: ChartRequest;
  summary: string;
}

interface ChartState {
  display: DisplayOptions;
  setDisplay: (patch: Partial<DisplayOptions>) => void;
  saved: SavedChart[];
  saveChart: (c: SavedChart) => void;
  removeChart: (id: string) => void;
  /** Ý nghĩa riêng của sao tại một cung do người dùng tự viết. Khoá: "<id sao>@<tên cung>". */
  starPalaceNotes: Record<string, string>;
  setStarPalaceNote: (key: string, text: string) => void;
}

export const DEFAULT_DISPLAY: DisplayOptions = {
  showAnnualStars: true,
  showDecadalStars: false,
  showAuxiliary: true,
  showMinorStars: true,
  showCycles: true,
  showBrightness: true,
  showTransformations: true,
  showTrangSinh: true,
  zoom: 1,
};

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      display: DEFAULT_DISPLAY,
      setDisplay: (patch) => set((s) => ({ display: { ...s.display, ...patch } })),
      saved: [],
      saveChart: (c) => set((s) => ({ saved: [c, ...s.saved.filter((x) => x.id !== c.id)].slice(0, 50) })),
      removeChart: (id) => set((s) => ({ saved: s.saved.filter((x) => x.id !== id) })),
      starPalaceNotes: {},
      setStarPalaceNote: (key, text) =>
        set((s) => {
          const next = { ...s.starPalaceNotes };
          if (text.trim()) next[key] = text.trim();
          else delete next[key];
          return { starPalaceNotes: next };
        }),
    }),
    { name: "tuvi-pro-store", version: 1 },
  ),
);
