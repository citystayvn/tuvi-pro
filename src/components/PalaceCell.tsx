"use client";
import type { ChartPalace, ChartStar, PeriodState } from "@/types/chart";
import { branchName, canChiName } from "@/core/stems-branches";
import type { DisplayOptions } from "@/store/useChartStore";
import { cn } from "@/utils/cn";
import { StarItem } from "./StarItem";

const MINOR_CATEGORIES = new Set(["minor", "tuan-triet"]);
const CYCLE_CATEGORIES = new Set(["thai-tue-cycle", "bac-si-cycle"]);

interface Props {
  palace: ChartPalace;
  period: PeriodState;
  display: DisplayOptions;
  selected: boolean;
  highlighted: "self" | "opposite" | "trine" | null;
  selectedStarId?: string;
  onSelectPalace: (b: number) => void;
  onSelectStar: (s: ChartStar) => void;
}

export function PalaceCell({ palace, period, display, selected, highlighted, selectedStarId, onSelectPalace, onSelectStar }: Props) {
  const natal = palace.stars.filter((s) => s.layer === "natal");
  const main = natal.filter((s) => s.category === "main");
  const aux = natal.filter((s) => {
    if (s.category === "main" || s.category === "trang-sinh-cycle") return false;
    if (s.category === "transformation") return display.showTransformations;
    if (CYCLE_CATEGORIES.has(s.category)) return false;
    if (MINOR_CATEGORIES.has(s.category)) return display.showMinorStars && display.showAuxiliary;
    return display.showAuxiliary;
  });
  const good = aux.filter((s) => s.nature === "good" || (s.category === "transformation" && s.id !== "hoa-ky"));
  const bad = aux.filter((s) => !good.includes(s));
  // Sao vòng Bác Sĩ (trái) và vòng Thái Tuế (phải) hiển thị trên một dòng riêng ở chân ô để tiết kiệm chiều cao.
  const showCycles = display.showCycles && display.showAuxiliary;
  const bacSi = natal.find((s) => s.category === "bac-si-cycle");
  const thaiTue = natal.find((s) => s.category === "thai-tue-cycle");
  const layered = palace.stars.filter(
    (s) => (s.layer === "annual" && display.showAnnualStars) || (s.layer === "decadal" && display.showDecadalStars),
  ).filter((s) => display.showTransformations || s.category !== "transformation");

  const isMajor = period.majorPeriod?.branch === palace.branch;
  const isMinor = period.minorPeriodBranch === palace.branch;
  const isAnnual = period.annualBranch === palace.branch;

  const starProps = { showBrightness: display.showBrightness, showTransformations: display.showTransformations, onSelect: onSelectStar };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Cung ${palace.name} tại ${branchName(palace.branch)}`}
      data-palace={palace.palaceId}
      onClick={() => onSelectPalace(palace.branch)}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSelectPalace(palace.branch))}
      className={cn(
        "relative flex h-full min-h-0 flex-1 cursor-pointer flex-col overflow-hidden bg-card p-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        palace.isMenh && "bg-amber-50/80 dark:bg-amber-950/30",
        highlighted === "opposite" && "bg-sky-50 dark:bg-sky-950/30",
        highlighted === "trine" && "bg-violet-50 dark:bg-violet-950/30",
        selected && "ring-2 ring-inset ring-primary",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1 text-[10px] leading-none">
        <span className="font-medium text-muted-foreground">{canChiName(palace.stem, palace.branch)}</span>
        <span className="tabular-nums font-semibold text-muted-foreground">{palace.majorPeriod.startAge}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-center gap-1">
        <span className={cn("truncate text-[12px] font-bold uppercase tracking-wider", palace.isMenh ? "text-amber-700 dark:text-amber-400" : "text-foreground")}>
          {palace.name}
        </span>
        {palace.isThan && <span className="rounded bg-primary px-1 text-[9px] font-bold leading-[14px] text-primary-foreground" title="Cung Thân">THÂN</span>}
      </div>

      {(isMajor || isMinor || isAnnual) && (
        <div className="mt-0.5 flex justify-center gap-0.5">
          {isMajor && <span className="rounded bg-decadal/15 px-1 text-[9px] font-bold leading-[13px] text-decadal">Đại hạn</span>}
          {isMinor && <span className="rounded bg-emerald-600/15 px-1 text-[9px] font-bold leading-[13px] text-emerald-700 dark:text-emerald-400">Tiểu hạn</span>}
          {isAnnual && <span className="rounded bg-annual/15 px-1 text-[9px] font-bold leading-[13px] text-annual">Lưu niên</span>}
        </div>
      )}

      {/* Chính tinh */}
      <div className="mt-0.5 flex min-h-[16px] flex-col items-center">
        {main.length === 0 ? (
          <span className="text-[10px] italic text-muted-foreground/70">Vô chính diệu</span>
        ) : (
          main.map((s) => <StarItem key={s.id} star={s} size="main" selected={selectedStarId === s.id} {...starProps} />)
        )}
      </div>

      {/* Phụ tinh: cát (trái) – sát/hung (phải) */}
      <div className="mt-0.5 grid min-h-0 flex-1 grid-cols-2 gap-x-1 overflow-hidden">
        <div className="flex min-w-0 flex-col">
          {good.map((s) => (
            <StarItem key={s.id + s.layer} star={s} selected={selectedStarId === s.id} {...starProps} />
          ))}
        </div>
        <div className="flex min-w-0 flex-col items-end text-right">
          {bad.map((s) => (
            <StarItem key={s.id + s.layer} star={s} selected={selectedStarId === s.id} {...starProps} />
          ))}
        </div>
      </div>

      {/* Sao lưu / đại vận */}
      {layered.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-x-1 border-t border-dashed pt-0.5">
          {layered.map((s) => (
            <StarItem key={s.layer + s.id + s.displayName} star={s} {...starProps} />
          ))}
        </div>
      )}

      {showCycles && (bacSi || thaiTue) && (
        <div className="flex items-center justify-between gap-1">
          {bacSi ? <StarItem star={bacSi} selected={selectedStarId === bacSi.id} {...starProps} /> : <span />}
          {thaiTue ? <StarItem star={thaiTue} selected={selectedStarId === thaiTue.id} {...starProps} /> : <span />}
        </div>
      )}

      {/* Footer */}
      <div className="mt-0.5 flex items-end justify-between gap-1 text-[10px] leading-none">
        <span className="text-muted-foreground">{display.showTrangSinh ? palace.trangSinh : ""}</span>
        <span className="flex items-center gap-0.5">
          {palace.hasTuan && <span className="rounded bg-zinc-200 px-1 font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">Tuần</span>}
          {palace.hasTriet && <span className="rounded bg-zinc-800 px-1 font-semibold text-white dark:bg-zinc-300 dark:text-zinc-900">Triệt</span>}
        </span>
        <span className="text-muted-foreground" title="Tiểu hạn: năm có địa chi này">
          {branchName(palace.minorPeriodYearBranch)}
        </span>
      </div>

    </div>
  );
}
