"use client";
import { useEffect, useState } from "react";
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
  /**
   * Nội dung luận giải do người dùng tự viết, ghi đè dữ liệu mặc định.
   * Khoá: "<id sao>@<tên cung>" (ý nghĩa tại cung) hoặc "<id sao>#<trường>" (core, positive, negative, favorable, unfavorable).
   */
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

export type StarTraitField = "core" | "positive" | "negative" | "favorable" | "unfavorable";
export const palaceNoteKey = (starId: string, palace: string) => `${starId}@${palace}`;
export const traitNoteKey = (starId: string, field: StarTraitField) => `${starId}#${field}`;

/** Nội dung người dùng đã sửa (chỉ đọc sau khi client mount để tránh lệch hydration). */
export function useStarNote(key: string): string | undefined {
  const note = useChartStore((s) => s.starPalaceNotes[key]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? note : undefined;
}
