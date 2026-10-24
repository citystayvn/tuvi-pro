"use client";
import { forwardRef, useEffect, useRef, useState } from "react";
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
  /** Thanh điều khiển và nội dung thay thế cho ô giữa (không xuất ra ảnh). */
  centerToolbar?: React.ReactNode;
  /** Nút cạnh tên ở giữa lá số (sửa thông tin). */
  centerNameAction?: React.ReactNode;
  centerBody?: React.ReactNode;
  /** Bố cục gọn cho màn hình điện thoại. */
  compact?: boolean;
}

export const TuViChart = forwardRef<HTMLDivElement, Props>(function TuViChart({ chart, display, selectedBranch, selectedStar, onSelectPalace, onSelectStar, centerToolbar, centerNameAction, centerBody, compact }, ref) {
  const focus = selectedBranch ?? selectedStar?.branch ?? null;
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
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
      ref={(el) => {
        innerRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      data-testid="tuvi-chart"
      className="print-area relative grid h-full w-full grid-cols-4 grid-rows-4 gap-px overflow-hidden border-2 border-ink bg-ink font-chart"
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
              compact={compact}
            />
          </div>
        );
      })}
      <div style={{ gridRow: "2 / span 2", gridColumn: "2 / span 2" }} className="min-h-0 min-w-0 overflow-hidden">
        <ChartCenter chart={chart} toolbar={centerToolbar} nameAction={centerNameAction} body={centerBody} compact={compact} />
      </div>
      <PalaceArrows from={focus ?? chart.menhBranch} width={size.w} height={size.h} />
    </div>
  );
});

/**
 * Mũi tên từ cung đang xem tới cung xung chiếu và hai cung tam hợp.
 * Điểm neo của mỗi cung nằm trên mép vùng trung tâm (cung giữa cạnh: giữa mép; cung góc: góc trong),
 * nên đường kẻ chỉ đi qua ô giữa, không đè lên chữ trong các cung.
 */
function PalaceArrows({ from, width, height }: { from: number; width: number; height: number }) {
  if (!width || !height) return null;
  const anchor = (b: number) => {
    const { row, col } = BRANCH_GRID[b];
    const cx = Math.min(Math.max((col - 0.5) / 4, 0.25), 0.75);
    const cy = Math.min(Math.max((row - 0.5) / 4, 0.25), 0.75);
    return { x: cx * width, y: cy * height };
  };
  const t = tamPhuongTuChinh(from);
  const src = anchor(from);
  const targets = [
    { b: t.opposite, cls: "text-el-hoa" },
    { b: t.trine[0], cls: "text-annual" },
    { b: t.trine[1], cls: "text-annual" },
  ];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" data-testid="palace-arrows">
      <defs>
        {["el-hoa", "annual"].map((c) => (
          <marker key={c} id={`arrow-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse" className={`text-${c}`}>
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        ))}
      </defs>
      <circle cx={src.x} cy={src.y} r={4} className="text-ink" fill="currentColor" opacity={0.7} />
      {targets.map(({ b, cls }) => {
        const dst = anchor(b);
        const dx = dst.x - src.x;
        const dy = dst.y - src.y;
        const len = Math.hypot(dx, dy) || 1;
        const end = { x: dst.x - (dx / len) * 6, y: dst.y - (dy / len) * 6 };
        return (
          <line
            key={b}
            x1={src.x}
            y1={src.y}
            x2={end.x}
            y2={end.y}
            className={cls}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeOpacity={0.6}
            markerEnd={`url(#arrow-${cls.replace("text-", "")})`}
          />
        );
      })}
    </svg>
  );
}
