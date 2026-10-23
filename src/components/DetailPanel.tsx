"use client";
import { ArrowLeftRight, Info, Layers, Triangle } from "lucide-react";
import type { ChartStar, TuViChart } from "@/types/chart";
import { analyzePalace, analyzeStar } from "@/core/interpretation";
import { getStarDef } from "@/config/stars/registry";
import { BRIGHTNESS_LABEL } from "@/core/brightness";
import { ELEMENT_NAMES } from "@/core/elements";
import { branchName, canChiName } from "@/core/stems-branches";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { starTextClass, TRANSFORMATION_STYLE } from "./chart-style";

const CATEGORY_LABEL: Record<string, string> = {
  main: "Chính tinh",
  "luc-cat": "Lục cát tinh",
  "luc-sat": "Lục sát tinh",
  transformation: "Tứ Hóa",
  "loc-ton": "Lộc Tồn – Thiên Mã",
  minor: "Phụ tinh",
  "thai-tue-cycle": "Vòng Thái Tuế",
  "trang-sinh-cycle": "Vòng Tràng Sinh",
  "bac-si-cycle": "Vòng Bác Sĩ",
  "tuan-triet": "Tuần – Triệt",
};
const LAYER_LABEL = { natal: "Nguyên cục", decadal: "Đại vận", annual: "Lưu niên" } as const;

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}

function StarChips({ stars, onSelectStar }: { stars: ChartStar[]; onSelectStar: (s: ChartStar) => void }) {
  if (!stars.length) return <p className="text-sm text-muted-foreground">—</p>;
  return (
    <div className="flex flex-wrap gap-1">
      {stars.map((s, i) => (
        <button key={s.id + s.layer + i} onClick={() => onSelectStar(s)} className={cn("rounded-md border bg-card px-1.5 py-0.5 text-xs font-medium hover:bg-accent", starTextClass(s))}>
          {s.displayName}
        </button>
      ))}
    </div>
  );
}

export function PalaceDetail({ chart, branch, onSelectStar, onSelectPalace }: { chart: TuViChart; branch: number; onSelectStar: (s: ChartStar) => void; onSelectPalace: (b: number) => void }) {
  const a = analyzePalace(chart, branch);
  const p = a.palace;
  const PalaceLink = ({ b }: { b: number }) => (
    <button onClick={() => onSelectPalace(b)} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium hover:bg-accent">
      {chart.palaces[b].name} ({branchName(b)})
    </button>
  );
  const byLayer = (layer: ChartStar["layer"]) => p.stars.filter((s) => s.layer === layer && s.category !== "trang-sinh-cycle");
  return (
    <div className="space-y-5" data-testid="palace-detail">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">Cung {p.name}</h3>
          <Badge variant="secondary">{canChiName(p.stem, p.branch)}</Badge>
          {p.isMenh && <Badge variant="warning">Mệnh</Badge>}
          {p.isThan && <Badge>Thân</Badge>}
          {p.hasTuan && <Badge variant="outline">Tuần</Badge>}
          {p.hasTriet && <Badge variant="outline">Triệt</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{a.meaning}</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg bg-muted/60 p-2">
            <div className="text-muted-foreground">Đại hạn</div>
            <div className="font-semibold">
              {p.majorPeriod.startAge}–{p.majorPeriod.endAge} tuổi
            </div>
          </div>
          <div className="rounded-lg bg-muted/60 p-2">
            <div className="text-muted-foreground">Tiểu hạn</div>
            <div className="font-semibold">Năm {branchName(p.minorPeriodYearBranch)}</div>
          </div>
          <div className="rounded-lg bg-muted/60 p-2">
            <div className="text-muted-foreground">Tràng Sinh</div>
            <div className="font-semibold">{p.trangSinh}</div>
          </div>
        </div>
      </div>

      <Section title="Chính tinh thủ cung">
        {a.mainStars.length ? (
          <StarChips stars={a.mainStars} onSelectStar={onSelectStar} />
        ) : (
          <div className="space-y-1 text-sm">
            <p>Vô chính diệu – mượn chính tinh cung xung chiếu:</p>
            <StarChips stars={a.borrowedMainStars} onSelectStar={onSelectStar} />
          </div>
        )}
      </Section>

      <Section title="Danh sách sao" icon={<Layers className="h-3.5 w-3.5" />}>
        <div className="space-y-2">
          {(["natal", "decadal", "annual"] as const).map((layer) =>
            byLayer(layer).length ? (
              <div key={layer}>
                <div className="mb-1 text-[11px] font-medium text-muted-foreground">{LAYER_LABEL[layer]}</div>
                <StarChips stars={byLayer(layer)} onSelectStar={onSelectStar} />
              </div>
            ) : null,
          )}
        </div>
      </Section>

      <Section title="Tam phương tứ chính" icon={<Triangle className="h-3.5 w-3.5" />}>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Tam hợp:</span>
          <PalaceLink b={a.trine[0].branch} />
          <PalaceLink b={a.trine[1].branch} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Xung chiếu:</span>
          <PalaceLink b={a.opposite.branch} />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Giáp cung:</span>
          <PalaceLink b={a.flanking[0].branch} />
          <PalaceLink b={a.flanking[1].branch} />
        </div>
      </Section>

      <Section title="Sao hội chiếu" icon={<ArrowLeftRight className="h-3.5 w-3.5" />}>
        <StarChips stars={a.converging.filter((s) => s.category !== "trang-sinh-cycle" && !s.category.endsWith("-cycle"))} onSelectStar={onSelectStar} />
      </Section>

      <Section title="Bộ sao liên quan">
        {a.groups.length ? (
          <ul className="space-y-1.5">
            {a.groups.map((g) => (
              <li key={g.id} className="rounded-lg border p-2 text-sm">
                <div className="font-semibold">{g.name}</div>
                <div className="text-xs">
                  {g.stars.map((id) => getStarDef(id).name).join(", ")}
                  {g.scope === "giap" && <span className="text-muted-foreground"> · kẹp hai bên cung</span>}
                </div>
                <p className="text-xs text-muted-foreground">{g.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Không có bộ sao nổi bật trong danh mục đã hỗ trợ.</p>
        )}
      </Section>
      <p className="flex gap-1.5 rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground">
        <Info className="mt-0.5 h-3 w-3 shrink-0" /> Ý nghĩa và bộ sao là nội dung luận giải tham khảo, tách biệt với dữ liệu an sao.
      </p>
    </div>
  );
}

export function StarDetail({ chart, star, onSelectStar, onSelectPalace }: { chart: TuViChart; star: ChartStar; onSelectStar: (s: ChartStar) => void; onSelectPalace: (b: number) => void }) {
  const a = analyzeStar(chart, star);
  return (
    <div className="space-y-5" data-testid="star-detail">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={cn("text-lg font-semibold", starTextClass(star))}>{star.displayName}</h3>
          {star.transformation && <span className={cn("rounded px-1.5 text-xs font-bold", TRANSFORMATION_STYLE[star.transformation].className)}>{TRANSFORMATION_STYLE[star.transformation].label}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="secondary">{CATEGORY_LABEL[star.category] ?? star.category}</Badge>
          <Badge variant="outline">{LAYER_LABEL[star.layer]}</Badge>
          {star.element && <Badge variant="outline">Hành {ELEMENT_NAMES[star.element]}</Badge>}
          <Badge variant={star.nature === "good" ? "success" : star.nature === "bad" ? "danger" : "secondary"}>
            {star.nature === "good" ? "Cát tinh" : star.nature === "bad" ? "Hung / sát tinh" : "Trung tính"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button onClick={() => onSelectPalace(star.branch)} className="rounded-lg bg-muted/60 p-2 text-left hover:bg-accent">
          <div className="text-muted-foreground">Vị trí</div>
          <div className="font-semibold">
            Cung {a.palace.name} ({branchName(star.branch)})
          </div>
        </button>
        <div className="rounded-lg bg-muted/60 p-2">
          <div className="text-muted-foreground">Miếu / Vượng / Đắc / Hãm</div>
          <div className="font-semibold">{star.brightness ? BRIGHTNESS_LABEL[star.brightness] : "Không có quy tắc"}</div>
        </div>
      </div>

      {star.layerTransformations && star.layerTransformations.length > 0 && (
        <Section title="Tứ Hóa vận hạn">
          <div className="flex flex-wrap gap-1">
            {star.layerTransformations.map((t, i) => (
              <span key={i} className={cn("rounded px-1.5 py-0.5 text-xs font-semibold", TRANSFORMATION_STYLE[t.type].className)}>
                {t.layer === "annual" ? "L." : "ĐV."}
                {TRANSFORMATION_STYLE[t.type].label}
              </span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Ý nghĩa truyền thống (tham khảo)">
        <p className="text-sm text-muted-foreground">{a.meaning ?? "Chưa có nội dung luận giải cho sao này."}</p>
      </Section>

      <Section title="Đồng cung">
        <StarChips stars={a.together.filter((s) => !s.category.endsWith("-cycle"))} onSelectStar={onSelectStar} />
      </Section>
      <Section title="Sao hội chiếu (tam phương tứ chính)">
        <StarChips stars={a.converging.filter((s) => !s.category.endsWith("-cycle"))} onSelectStar={onSelectStar} />
      </Section>
    </div>
  );
}
