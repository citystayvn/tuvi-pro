"use client";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Search } from "lucide-react";
import { STAR_REGISTRY, getStarDef } from "@/config/stars/registry";
import { ELEMENT_NAMES } from "@/core/elements";
import { BRIGHTNESS_TABLES } from "@/core/brightness";
import { getStarInterpretation } from "@/core/interpretation";
import { PALACE_ORDER } from "@/core/interpretation/cycle-stars";
import { palaceNoteKey, traitNoteKey, useChartStore, type StarTraitField } from "@/store/useChartStore";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { EditableNote } from "./EditableNote";
import { cn } from "@/utils/cn";

const CATEGORY_LABEL: Record<string, string> = {
  main: "Chính tinh",
  "luc-cat": "Lục cát",
  "luc-sat": "Lục sát",
  transformation: "Tứ Hóa",
  "loc-ton": "Lộc Tồn / Mã",
  minor: "Phụ tinh",
  "thai-tue-cycle": "Vòng Thái Tuế",
  "trang-sinh-cycle": "Vòng Tràng Sinh",
  "bac-si-cycle": "Vòng Bác Sĩ",
  "tuan-triet": "Tuần Triệt",
};
const BRIGHT = BRIGHTNESS_TABLES["vn-ttl"];

/** Danh mục sao: xem và khai báo toàn bộ đặc điểm, ý nghĩa theo cung của từng sao. */
export function RegistryTable() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [selected, setSelected] = useState(STAR_REGISTRY[0].id);
  // Điện thoại: danh sách → chi tiết (một màn hình mỗi lúc).
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const notes = useChartStore((s) => s.starPalaceNotes);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const edited = useMemo(() => {
    const set = new Set<string>();
    if (mounted) for (const k of Object.keys(notes)) set.add(k.split(/[@#]/)[0]);
    return set;
  }, [notes, mounted]);
  const rows = useMemo(
    () => STAR_REGISTRY.filter((s) => (!q || s.name.toLowerCase().includes(q.toLowerCase())) && (!cat || s.category === cat)),
    [q, cat],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card className={cn("flex-col overflow-hidden lg:sticky lg:top-4 lg:flex lg:max-h-[calc(100vh-8rem)]", mobileView === "list" ? "flex" : "hidden")}>
        <div className="space-y-2 border-b p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Tìm sao…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm sao" />
          </div>
          <NativeSelect value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Lọc nhóm sao">
            <option value="">Tất cả nhóm ({STAR_REGISTRY.length} sao)</option>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </NativeSelect>
        </div>
        <ul className="p-1.5 lg:flex-1 lg:overflow-y-auto" aria-label="Danh sách sao">
          {rows.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => {
                  setSelected(s.id);
                  setMobileView("detail");
                  window.scrollTo({ top: 0 });
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 text-left text-[15px] hover:bg-muted lg:py-1.5 lg:text-sm",
                  selected === s.id && "bg-accent font-semibold text-accent-foreground",
                )}
              >
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.nature === "good" ? "bg-good" : s.nature === "bad" ? "bg-bad" : "bg-muted-foreground/40")} />
                <span className="flex-1">{s.name}</span>
                {edited.has(s.id) && <span className="text-[10px] text-primary">đã sửa</span>}
                <span className="text-[10px] text-muted-foreground">{CATEGORY_LABEL[s.category]}</span>
              </button>
            </li>
          ))}
          {!rows.length && <li className="p-3 text-sm text-muted-foreground">Không tìm thấy sao.</li>}
        </ul>
      </Card>
      <div className={cn("min-w-0 lg:block", mobileView === "detail" ? "block" : "hidden")}>
        <button
          type="button"
          onClick={() => setMobileView("list")}
          className="mb-2 inline-flex items-center gap-1 rounded-lg px-1 py-1.5 text-sm font-medium text-primary lg:hidden"
        >
          <ChevronLeft className="h-4 w-4" /> Danh sách sao
        </button>
        <StarEditor key={selected} id={selected} />
      </div>
    </div>
  );
}

function StarEditor({ id }: { id: string }) {
  const def = getStarDef(id);
  const data = getStarInterpretation(id)?.data;
  const hasBrightness = Boolean(BRIGHT.main[id] ?? BRIGHT.auxiliary[id]);
  const hasHam = Boolean((BRIGHT.main[id] ?? BRIGHT.auxiliary[id])?.includes("HAM"));
  const definedPalaces = data ? Object.keys(data.palaces) : [];
  // Sao chỉ đóng ở cung cố định (Thiên Sứ, Thiên Thương) chỉ khai báo cung đó.
  const palaces = definedPalaces.length > 0 && definedPalaces.length < 12 ? definedPalaces : [...PALACE_ORDER];
  const trait = (field: StarTraitField, label: string, defaultText: string | undefined, tone?: "good" | "bad") => (
    <EditableNote
      noteKey={traitNoteKey(id, field)}
      defaultText={defaultText}
      ariaLabel={`${label} của ${def.name}`}
      className={tone === "good" ? "border-good/30 bg-emerald-50/60 dark:bg-emerald-950/30" : tone === "bad" ? "border-bad/30 bg-rose-50/60 dark:bg-rose-950/30" : "bg-card"}
      header={<span className={cn("text-xs font-semibold", tone === "good" ? "text-good" : tone === "bad" ? "text-bad" : "text-muted-foreground")}>{label}</span>}
    />
  );

  return (
    <Card className="space-y-5 p-4 md:p-5" data-testid="star-editor">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{CATEGORY_LABEL[def.category]}</div>
        <h2 className="text-xl font-semibold">{def.name}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {def.element && <Badge variant="outline">Hành {ELEMENT_NAMES[def.element]}</Badge>}
          <Badge variant={def.nature === "good" ? "success" : def.nature === "bad" ? "danger" : "secondary"}>
            {def.nature === "good" ? "Cát tinh" : def.nature === "bad" ? "Hung / sát tinh" : "Trung tính"}
          </Badge>
          <Badge variant="outline">{hasBrightness ? "Có bảng Miếu / Hãm" : "Không có Miếu / Hãm"}</Badge>
        </div>
      </div>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Đặc điểm chung</h3>
        {trait("core", "Tính chất", data?.core)}
        <div className="grid gap-2 sm:grid-cols-2">
          {trait("positive", "Mặt tích cực", data?.positive, "good")}
          {trait("negative", "Mặt tiêu cực", data?.negative, "bad")}
        </div>
      </section>

      {hasBrightness && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Theo độ sáng</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {trait("favorable", "Miếu / Vượng / Đắc", data?.favorable, "good")}
            {hasHam && trait("unfavorable", "Hãm địa", data?.unfavorable, "bad")}
          </div>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ý nghĩa tại từng cung</h3>
        <div className="grid gap-2 md:grid-cols-2">
          {palaces.map((name) => (
            <EditableNote
              key={name}
              noteKey={palaceNoteKey(id, name)}
              defaultText={data?.palaces[name as keyof typeof data.palaces]}
              ariaLabel={`Ý nghĩa của ${def.name} tại cung ${name}`}
              placeholder={`Ví dụ: ${def.name} tại ${name} chủ về…`}
              className="bg-card"
              header={<span className="text-sm font-semibold">{name}</span>}
            />
          ))}
        </div>
      </section>

      <details className="rounded-lg bg-muted/50 p-3 text-xs">
        <summary className="cursor-pointer font-medium text-muted-foreground">Cách an sao</summary>
        <p className="mt-2">{def.rule}</p>
        <p className="mt-1 text-muted-foreground">Nguồn: {def.source}</p>
        {def.conflictNote && <p className="mt-1 text-amber-700 dark:text-amber-400">⚠ {def.conflictNote}</p>}
      </details>
    </Card>
  );
}
