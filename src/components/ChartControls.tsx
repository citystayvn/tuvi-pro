"use client";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import type { DisplayOptions } from "@/store/useChartStore";
import { canChiName, yearBranch, yearStem } from "@/core/stems-branches";
import { cn } from "@/utils/cn";

interface Props {
  viewYear: number;
  onViewYear: (y: number) => void;
  display: DisplayOptions;
  onDisplay: (p: Partial<DisplayOptions>) => void;
  zoom: number;
  onZoom: (z: number) => void;
  onFit: () => void;
}

const TOGGLES: { key: keyof DisplayOptions; label: string }[] = [
  { key: "showAuxiliary", label: "Phụ tinh" },
  { key: "showMinorStars", label: "Sao nhỏ" },
  { key: "showCycles", label: "Vòng Thái Tuế / Bác Sĩ" },
  { key: "showTrangSinh", label: "Tràng Sinh" },
  { key: "showBrightness", label: "Miếu Hãm" },
  { key: "showTransformations", label: "Tứ Hóa" },
  { key: "showAnnualStars", label: "Sao lưu niên" },
  { key: "showDecadalStars", label: "Sao đại vận" },
];

export function ChartControls({ viewYear, onViewYear, display, onDisplay, zoom, onZoom, onFit }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="no-print relative">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-sm">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewYear(viewYear - 1)} aria-label="Năm trước">
            <ChevronLeft />
          </Button>
          <div className="flex items-center gap-1.5 px-1">
            <span className="text-xs text-muted-foreground">Xem hạn</span>
            <Input
              aria-label="Năm xem hạn"
              type="number"
              className="h-7 w-[72px] px-2 text-center text-sm font-semibold"
              value={viewYear}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 1800 && v <= 2199) onViewYear(v);
              }}
            />
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">{canChiName(yearStem(viewYear), yearBranch(viewYear))}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewYear(viewYear + 1)} aria-label="Năm sau">
            <ChevronRight />
          </Button>
        </div>

        <div className="flex items-center gap-1 rounded-lg border bg-card p-1 shadow-sm">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onZoom(Math.max(0.4, +(zoom - 0.1).toFixed(2)))} aria-label="Thu nhỏ">
            <Minus />
          </Button>
          <span className="w-12 text-center text-xs font-semibold tabular-nums">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onZoom(Math.min(2, +(zoom + 0.1).toFixed(2)))} aria-label="Phóng to">
            <Plus />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onFit} aria-label="Vừa khung">
            <Maximize2 />
          </Button>
        </div>

        <Button variant={open ? "secondary" : "outline"} size="sm" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <SlidersHorizontal /> Hiển thị
        </Button>
      </div>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 grid w-[min(640px,92vw)] gap-1 rounded-xl border bg-card p-2 shadow-lg sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <label key={t.key} className={cn("flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted/60")}>
              {t.label}
              <Switch checked={display[t.key] as boolean} onCheckedChange={(v) => onDisplay({ [t.key]: v })} aria-label={t.label} />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
