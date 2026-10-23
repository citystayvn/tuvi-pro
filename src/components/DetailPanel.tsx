"use client";
import { useEffect, useState } from "react";
import { Check, Info, Layers, PencilLine, Trash2 } from "lucide-react";
import { useChartStore } from "@/store/useChartStore";
import { Button } from "@/components/ui/button";
import type { ChartPalace, ChartStar, TuViChart } from "@/types/chart";
import { analyzePalace, analyzeStar, starReading, type StarGroupMatch } from "@/core/interpretation";
import { getStarDef } from "@/config/stars/registry";
import { tamPhuongTuChinh } from "@/core/palaces";
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

function Section({ title, icon, action, children }: { title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
        {action}
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

      <Section title="Sao bản cung & hội chiếu" icon={<Layers className="h-3.5 w-3.5" />}>
        <ConvergingGroups chart={chart} branch={branch} selfLabel="Bản cung" onSelectStar={onSelectStar} onSelectPalace={onSelectPalace} />
      </Section>

      <Section title="Bộ sao liên quan">
        {a.groups.length ? (
          <GroupList groups={a.groups} />
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

export function StarDetail({ chart, star, onSelectPalace }: { chart: TuViChart; star: ChartStar; onSelectStar: (s: ChartStar) => void; onSelectPalace: (b: number) => void }) {
  const a = analyzeStar(chart, star);
  // Bộ sao (tại tam phương tứ chính của cung) có chứa chính sao này.
  const starGroups = analyzePalace(chart, star.branch).groups.filter((g) => g.stars.includes(star.id));
  const cycle = starReading(chart, star);
  return (
    <div className="space-y-5" data-testid="star-detail">
      <div>
        {cycle && (
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {cycle.data.name} – {cycle.groupLabel}
          </div>
        )}
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
          <div className="font-semibold">
            {star.brightness && star.brightness !== "UNDEFINED" ? BRIGHTNESS_LABEL[star.brightness] : "Không có quy định trong hệ thống"}
          </div>
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

      {cycle ? (
        <>
          <Section title="Tính chất">
            <p className="text-sm">{cycle.data.core}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-emerald-50 p-2 text-sm dark:bg-emerald-950/40">
                <div className="text-[11px] font-semibold text-good">Mặt tích cực</div>
                {cycle.data.positive}
              </div>
              <div className="rounded-lg bg-rose-50 p-2 text-sm dark:bg-rose-950/40">
                <div className="text-[11px] font-semibold text-bad">Mặt tiêu cực</div>
                {cycle.data.negative}
              </div>
            </div>
          </Section>
          {cycle.positionText && (
            <p className={cn("rounded-lg border-l-2 bg-muted/40 p-2 text-sm", cycle.brightnessRule === "HAM" ? "border-bad" : "border-good")}>{cycle.positionText}</p>
          )}
          {star.layer !== "natal" && (
            <p className="rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground">
              Đây là sao {star.layer === "annual" ? `lưu niên của năm ${chart.period.viewYear}` : "đại vận"}: chỉ tác động trong thời gian vận hạn. Luận giải theo cung chỉ dành cho sao nguyên cục.
            </p>
          )}
        </>
      ) : (
        <Section title="Ý nghĩa truyền thống (tham khảo)">
          <p className="text-sm text-muted-foreground">{a.meaning ?? "Chưa có nội dung luận giải cho sao này."}</p>
        </Section>
      )}

      {star.layer === "natal" &&
        (() => {
          const tp = tamPhuongTuChinh(star.branch);
          const notes = [
            { kind: "self" as const, b: star.branch },
            { kind: "opposite" as const, b: tp.opposite },
            { kind: "trine" as const, b: tp.trine[0] },
            { kind: "trine" as const, b: tp.trine[1] },
          ];
          return (
            <Section title="Ý nghĩa theo cung">
              <div className="space-y-2">
                {notes.map(({ kind, b }) => {
                  const name = chart.palaces[b].name;
                  return (
                    <StarPalaceNote
                      key={b}
                      starId={star.id}
                      starName={star.name}
                      palaceName={name}
                      branch={b}
                      kind={kind}
                      defaultText={cycle?.data.palaces[name as keyof typeof cycle.data.palaces]}
                    />
                  );
                })}
              </div>
            </Section>
          );
        })()}

      {cycle && (cycle.combos.length > 0 || cycle.transformationNotes.length > 0) && (
        <Section title="Tác động của sao đồng cung, hội chiếu">
          <ul className="space-y-1.5">
            {cycle.combos.map((c, i) => (
              <li key={i} className={cn("rounded-lg border-l-2 bg-muted/40 p-2 text-sm", c.tone === "good" ? "border-good" : c.tone === "bad" ? "border-bad" : "border-amber-500")}>
                {c.text}
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {c.scope === "dong-cung" ? "Đồng cung" : "Tam phương tứ chính"}: {c.matched.map((id) => getStarDef(id).name).join(", ")}
                </div>
              </li>
            ))}
            {cycle.transformationNotes.map((t) => (
              <li key={t} className="rounded-lg bg-muted/40 p-2 text-sm text-muted-foreground">
                {t}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {starGroups.length > 0 && (
        <Section title="Bộ sao liên quan">
          <GroupList groups={starGroups} />
        </Section>
      )}
    </div>
  );
}

/** Sao bản cung (đồng cung) và sao hội chiếu chia theo tam hợp, xung chiếu, giáp cung; mỗi mục hàng Tốt / Xấu. */
function ConvergingGroups({
  chart,
  branch,
  selfLabel,
  excludeStar,
  onSelectStar,
  onSelectPalace,
}: {
  chart: TuViChart;
  branch: number;
  selfLabel?: string;
  excludeStar?: ChartStar;
  onSelectStar: (s: ChartStar) => void;
  onSelectPalace: (b: number) => void;
}) {
  const a = analyzePalace(chart, branch);
  const groups: { label: string; palaces: ChartPalace[]; self?: boolean }[] = [
    ...(selfLabel ? [{ label: selfLabel, palaces: [a.palace], self: true }] : []),
    { label: "Tam hợp", palaces: a.trine },
    { label: "Xung chiếu", palaces: [a.opposite] },
    { label: "Giáp cung", palaces: a.flanking },
  ];
  return (
    <div className="space-y-3">
      {groups.map((grp) => {
        const all = grp.palaces.flatMap((pl) => pl.stars).filter((st) => st !== excludeStar && st.category !== "trang-sinh-cycle");
        // Bản cung giữ cả sao vòng Thái Tuế / Bác Sĩ; các mục hội chiếu chỉ xét sao chính và phụ tinh.
        const natal = all.filter((st) => st.layer === "natal" && (grp.self || !st.category.endsWith("-cycle")));
        const bad = natal.filter((st) => st.nature === "bad" || st.id === "hoa-ky");
        const good = natal.filter((st) => !bad.includes(st));
        const rows: { label: string; cls: string; stars: ChartStar[] }[] = [
          { label: "Tốt", cls: "text-good", stars: good },
          { label: "Xấu", cls: "text-bad", stars: bad },
        ];
        if (grp.self) {
          const decadal = all.filter((st) => st.layer === "decadal");
          const annual = all.filter((st) => st.layer === "annual");
          if (decadal.length) rows.push({ label: "Đại vận", cls: "text-decadal", stars: decadal });
          if (annual.length) rows.push({ label: "Lưu niên", cls: "text-annual", stars: annual });
        }
        return (
          <div key={grp.label} className="rounded-lg border p-2">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold">{grp.label}</span>
              {grp.palaces.map((pl) => (
                <button key={pl.branch} onClick={() => onSelectPalace(pl.branch)} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-accent">
                  {pl.name} ({branchName(pl.branch)})
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {rows.slice(0, 2).map((r) => (
                <div key={r.label} className="min-w-0">
                  <div className={cn("mb-1 text-[11px] font-medium", r.cls)}>{r.label}</div>
                  <StarChips stars={r.stars} onSelectStar={onSelectStar} />
                </div>
              ))}
            </div>
            {rows.slice(2).map((r) => (
              <div key={r.label} className="mt-2">
                <div className={cn("mb-1 text-[11px] font-medium", r.cls)}>{r.label}</div>
                <StarChips stars={r.stars} onSelectStar={onSelectStar} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** Ý nghĩa của sao tại một cung: dữ liệu luận giải sẵn có (nếu có), người dùng sửa / bổ sung được. */
const NOTE_KIND = {
  self: { label: "Tại cung", tag: "bg-primary text-primary-foreground", card: "border-primary/40 bg-accent/50" },
  opposite: { label: "Xung chiếu", tag: "bg-el-hoa text-white", card: "border-el-hoa/30 bg-card" },
  trine: { label: "Tam hợp", tag: "bg-annual text-white", card: "border-annual/30 bg-card" },
} as const;

/** Thẻ ý nghĩa của sao tại một cung: dữ liệu sẵn có (nếu có), người dùng sửa / bổ sung được. */
function StarPalaceNote({
  starId,
  starName,
  palaceName,
  branch,
  kind,
  defaultText,
}: {
  starId: string;
  starName: string;
  palaceName: string;
  branch: number;
  kind: keyof typeof NOTE_KIND;
  defaultText?: string;
}) {
  const key = `${starId}@${palaceName}`;
  const note = useChartStore((s) => s.starPalaceNotes[key]);
  const setNote = useChartStore((s) => s.setStarPalaceNote);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setEditing(false), [key]);
  const custom = mounted ? note : undefined;
  const shown = custom ?? defaultText;
  const k = NOTE_KIND[kind];

  return (
    <div className={cn("rounded-lg border p-2.5", k.card)}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", k.tag)}>{k.label}</span>
        <span className="text-sm font-semibold">{palaceName}</span>
        <span className="text-xs text-muted-foreground">({branchName(branch)})</span>
        {custom && defaultText && <span className="text-[10px] text-muted-foreground">· đã sửa</span>}
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(shown ?? "");
              setEditing(true);
            }}
            aria-label="Sửa ý nghĩa"
            title={shown ? "Sửa ý nghĩa" : "Thêm ý nghĩa"}
            className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <PencilLine className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-2">
          <textarea
            id="star-palace-note"
            aria-label={`Ý nghĩa của ${starName} tại cung ${palaceName}`}
            className="min-h-[88px] w-full rounded-md border border-input bg-card p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Ví dụ: ${starName} tại ${palaceName} chủ về…`}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => { setNote(key, draft === defaultText ? "" : draft); setEditing(false); }}>
              <Check /> Lưu
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              Huỷ
            </Button>
            {custom && (
              <Button size="sm" variant="ghost" className="ml-auto text-destructive" onClick={() => { setNote(key, ""); setEditing(false); }}>
                <Trash2 /> {defaultText ? "Khôi phục mặc định" : "Xoá"}
              </Button>
            )}
          </div>
        </div>
      ) : shown ? (
        <p className={cn("whitespace-pre-wrap leading-snug", kind === "self" ? "text-[15px]" : "text-sm text-foreground/85")}>{shown}</p>
      ) : (
        <p className="text-sm italic text-muted-foreground">Chưa có – bấm bút để thêm.</p>
      )}
    </div>
  );
}

function GroupList({ groups }: { groups: StarGroupMatch[] }) {
  return (
    <ul className="space-y-1.5">
      {groups.map((g) => (
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
  );
}
