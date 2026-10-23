"use client";
import type { ChartStar } from "@/types/chart";
import { BRIGHTNESS_SHORT } from "@/core/brightness";
import { cn } from "@/utils/cn";
import { starTextClass, TRANSFORMATION_STYLE } from "./chart-style";

interface Props {
  star: ChartStar;
  size?: "main" | "aux";
  showBrightness: boolean;
  showTransformations: boolean;
  selected?: boolean;
  onSelect?: (s: ChartStar) => void;
}

export function StarItem({ star, size = "aux", showBrightness, showTransformations, selected, onSelect }: Props) {
  const bright = showBrightness && star.brightness && star.brightness !== "UNDEFINED" ? BRIGHTNESS_SHORT[star.brightness] : "";
  return (
    <button
      type="button"
      data-star={star.id}
      data-layer={star.layer}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(star);
      }}
      title={`${star.displayName}${star.brightness && star.brightness !== "UNDEFINED" ? ` (${star.brightness})` : ""}`}
      className={cn(
        "group inline-flex max-w-full items-center gap-0.5 truncate rounded px-0.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        size === "main" ? "text-[13px] font-bold uppercase leading-[16px] tracking-wide" : "text-[11px] font-medium leading-[12.5px]",
        starTextClass(star),
        selected && "bg-accent ring-1 ring-primary",
      )}
    >
      <span className="truncate">{star.displayName}</span>
      {bright && <span className="text-[10px] font-semibold opacity-80">({bright})</span>}
      {showTransformations && star.transformation && (
        <span className={cn("ml-0.5 rounded px-1 text-[9px] font-bold normal-case leading-[14px]", TRANSFORMATION_STYLE[star.transformation].className)}>
          {TRANSFORMATION_STYLE[star.transformation].short}
        </span>
      )}
    </button>
  );
}
