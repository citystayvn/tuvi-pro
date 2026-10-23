"use client";
import type { ChartPalace, ChartStar, PeriodState } from "@/types/chart";
import { BRANCH_ELEMENTS, branchName, mod, STEMS } from "@/core/stems-branches";
import { ELEMENT_NAMES } from "@/core/elements";
import type { DisplayOptions } from "@/store/useChartStore";
import { cn } from "@/utils/cn";
import { StarItem } from "./StarItem";
import { ELEMENT_TEXT, PALACE_SHORT } from "./chart-style";

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
        "relative flex h-full min-h-0 flex-1 cursor-pointer flex-col overflow-hidden bg-paper p-1.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        highlighted && highlighted !== "self" && "bg-paper-center",
        selected && "ring-2 ring-inset ring-primary",
      )}
    >
      {/* Header: Can.Chi – tên cung (màu ngũ hành của cung) – tuổi đại hạn */}
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-1 leading-none">
        <span className="text-[length:calc(10.5px*var(--k,1))] font-semibold text-ink">
          {STEMS[palace.stem][0]}.{branchName(palace.branch)}
        </span>
        <span className="flex min-w-0 items-center justify-center gap-1">
          <span className={cn("truncate text-[length:calc(12.5px*var(--k,1))] font-bold uppercase", ELEMENT_TEXT[BRANCH_ELEMENTS[palace.branch]])}>{palace.name}</span>
          {palace.isThan && <span className="rounded-sm bg-ink px-1 text-[length:calc(9px*var(--k,1))] font-bold leading-[calc(14px*var(--k,1))] text-paper" title="Cung Thân">THÂN</span>}
        </span>
        <span className="text-[length:calc(11px*var(--k,1))] font-bold tabular-nums text-ink">{palace.majorPeriod.startAge}</span>
      </div>
      <div className="mt-0.5 grid grid-cols-[auto_1fr_auto] items-center gap-1 text-[length:calc(10px*var(--k,1))] leading-none">
        <span className="font-medium text-ink/80">
          {palace.branch % 2 === 0 ? "+" : "−"}
          {ELEMENT_NAMES[BRANCH_ELEMENTS[palace.branch]]}
        </span>
        <span className="flex flex-wrap justify-center gap-0.5">
          {isMajor && <span className="rounded-sm bg-decadal/15 px-1 font-bold leading-[calc(13px*var(--k,1))] text-decadal">Đại hạn</span>}
          {isMinor && <span className="rounded-sm bg-emerald-600/15 px-1 font-bold leading-[calc(13px*var(--k,1))] text-emerald-700 dark:text-emerald-400">Tiểu hạn</span>}
          {isAnnual && <span className="rounded-sm bg-annual/15 px-1 font-bold leading-[calc(13px*var(--k,1))] text-annual">Lưu niên</span>}
          {palace.hasTuan && <span className="rounded-sm bg-ink px-1 font-semibold leading-[calc(13px*var(--k,1))] text-paper">Tuần</span>}
          {palace.hasTriet && <span className="rounded-sm bg-ink px-1 font-semibold leading-[calc(13px*var(--k,1))] text-paper">Triệt</span>}
        </span>
        <span className="text-ink/60" title="Tiểu hạn: năm có địa chi này">
          {branchName(palace.minorPeriodYearBranch)}
        </span>
      </div>

      {/* Chính tinh */}
      <div className="mt-0.5 flex min-h-[16px] flex-col items-center">
        {main.length === 0 ? (
          <span className="text-[length:calc(10px*var(--k,1))] italic text-ink/50">Vô chính diệu</span>
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

      {showCycles && (bacSi || thaiTue) && (
        <div className="flex items-center justify-between gap-1">
          {bacSi ? <StarItem star={bacSi} selected={selectedStarId === bacSi.id} {...starProps} /> : <span />}
          {thaiTue ? <StarItem star={thaiTue} selected={selectedStarId === thaiTue.id} {...starProps} /> : <span />}
        </div>
      )}

      {/* Vùng vận hạn: sao lưu / đại vận và chân ô, nền riêng */}
      <div className="-mx-1.5 -mb-1.5 mt-0.5 border-t border-ink/15 bg-ink/[0.05] px-1.5 pb-1.5 pt-0.5">
      {layered.length > 0 && (
        <div className="flex flex-wrap gap-x-1">
          {layered.map((s) => (
            <StarItem key={s.layer + s.id + s.displayName} star={s} {...starProps} />
          ))}
        </div>
      )}

      {/* Footer: cung tính theo đại vận – Tràng Sinh – cung tính theo lưu niên */}
      <div className="mt-0.5 grid grid-cols-[1fr_auto_1fr] items-end gap-1 text-[length:calc(10.5px*var(--k,1))] font-medium leading-none text-ink">
        <span title="Tên cung tính theo đại vận hiện tại">{period.majorPeriod ? `ĐV.${PALACE_SHORT[mod(period.majorPeriod.branch - palace.branch, 12)]}` : ""}</span>
        <span className="font-semibold">{display.showTrangSinh ? palace.trangSinh : ""}</span>
        <span className="text-right" title="Tên cung tính theo năm xem hạn">LN.{PALACE_SHORT[mod(period.annualBranch - palace.branch, 12)]}</span>
      </div>
      </div>

    </div>
  );
}
