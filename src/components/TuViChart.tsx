"use client";
import { forwardRef } from "react";
import type { ChartStar, TuViChart as Chart } from "@/types/chart";
import { tamPhuongTuChinh } from "@/core/palaces";
import type { DisplayOptions } from "@/store/useChartStore";
import { BRANCH_GRID } from "./chart-style";
import { PalaceCell } from "./PalaceCell";
import { ChartCenter } from "./ChartCenter";

interface Props {
  chart: Chart;
  display: DisplayOptions;
  selectedBranch: number | null;
  selectedStar: ChartStar | null;
  onSelectPalace: (b: number) => void;
  onSelectStar: (s: ChartStar) => void;
}

export const TuViChart = forwardRef<HTMLDivElement, Props>(function TuViChart({ chart, display, selectedBranch, selectedStar, onSelectPalace, onSelectStar }, ref) {
  const focus = selectedBranch ?? selectedStar?.branch ?? null;
  const tp = focus !== null ? tamPhuongTuChinh(focus) : null;
  const highlightOf = (b: number) => {
    if (!tp) return null;
    if (b === tp.self) return "self" as const;
    if (b === tp.opposite) return "opposite" as const;
    if (tp.trine.includes(b)) return "trine" as const;
    return null;
  };
  return (
    <div
      ref={ref}
      data-testid="tuvi-chart"
      className="print-area grid h-full w-full grid-cols-4 grid-rows-4 gap-px overflow-hidden rounded-xl border-2 border-foreground/80 bg-foreground/25 shadow-sm"
    >
      {chart.palaces.map((p) => {
        const pos = BRANCH_GRID[p.branch];
        return (
          <div key={p.branch} style={{ gridRow: pos.row, gridColumn: pos.col }} className="flex min-h-0 min-w-0 flex-col">
            <PalaceCell
              palace={p}
              period={chart.period}
              display={display}
              selected={selectedBranch === p.branch}
              highlighted={highlightOf(p.branch)}
              selectedStarId={selectedStar?.branch === p.branch ? selectedStar.id : undefined}
              onSelectPalace={onSelectPalace}
              onSelectStar={onSelectStar}
            />
          </div>
        );
      })}
      <div style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }} className="min-h-0 min-w-0 overflow-hidden">
        <ChartCenter chart={chart} />
      </div>
    </div>
  );
});
