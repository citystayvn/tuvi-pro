"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, ChevronDown, Clock, MapPin, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/cn";
import { resolveBirth, getLeapMonth, CalendarInputError } from "@/core/calendar";
import { canChiName, HOUR_RANGES } from "@/core/stems-branches";
import { SCHOOLS, resolveRules, type DeepPartial, type SchoolRuleSet } from "@/config/schools";
import type { ChartRequest } from "@/core/chart/buildChart";
import { requestToSearchParams } from "@/utils/chart-url";
import { formatTz, PLACE_PRESETS, TIMEZONE_OPTIONS } from "@/utils/places";
import { useChartStore } from "@/store/useChartStore";

function Segmented<T extends string>({ value, onChange, options, name }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; name: string }) {
  return (
    <div role="radiogroup" aria-label={name} className="grid auto-cols-fr grid-flow-col rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all", value === o.value && "bg-card text-foreground shadow-sm")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, className, htmlFor }: { label: string; children: React.ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

type RuleSelect = { key: string; group: keyof SchoolRuleSet; field: string; label: string; options: { value: string; label: string }[] };

const RULE_SELECTS: RuleSelect[] = [
  { key: "lateRatHour", group: "calendar", field: "lateRatHour", label: "Giờ Tý muộn (23h–24h)", options: [{ value: "next-day", label: "Tính sang ngày hôm sau" }, { value: "same-day", label: "Giữ ngày hiện tại" }] },
  { key: "leapMonth", group: "calendar", field: "leapMonth", label: "Tháng nhuận", options: [{ value: "as-current", label: "Tính như tháng chính" }, { value: "as-next", label: "Tính sang tháng sau" }, { value: "split-15", label: "Chia đôi tại ngày 15" }] },
  { key: "yearBoundary", group: "calendar", field: "yearBoundary", label: "Ranh giới năm", options: [{ value: "lunar-new-year", label: "Tết Nguyên Đán" }, { value: "lap-xuan", label: "Tiết Lập Xuân" }] },
  { key: "monthSystem", group: "calendar", field: "monthSystem", label: "Tháng an sao", options: [{ value: "lunar", label: "Tháng âm lịch" }, { value: "solar-term", label: "Tháng tiết khí" }] },
  { key: "timeMode", group: "calendar", field: "timeMode", label: "Giờ sinh ngoài UTC+7", options: [{ value: "local-clock", label: "Giờ đồng hồ nơi sinh" }, { value: "convert-to-calendar-tz", label: "Quy đổi sang UTC+7" }] },
  { key: "khoiViet", group: "starPlacement", field: "khoiViet", label: "Thiên Khôi – Việt", options: [{ value: "classic", label: "Khẩu quyết cổ điển" }, { value: "variant-a", label: "Biến thể A" }] },
  { key: "hoaLinhStart", group: "starPlacement", field: "hoaLinhStart", label: "Hỏa Linh – cung khởi", options: [{ value: "classic", label: "Cổ điển" }, { value: "variant-a", label: "Biến thể A (Tỵ Dậu Sửu)" }] },
  { key: "hoaLinhDirection", group: "starPlacement", field: "hoaLinhDirection", label: "Hỏa Linh – chiều an", options: [{ value: "by-yin-yang-gender", label: "Theo Âm Dương Nam Nữ" }, { value: "always-forward", label: "Luôn thuận" }] },
  { key: "thienGiai", group: "starPlacement", field: "thienGiai", label: "Thiên Giải", options: [{ value: "count-month", label: "Đếm liền" }, { value: "skip-palace", label: "Đếm nhảy cung" }] },
  { key: "luuHa", group: "starPlacement", field: "luuHa", label: "Lưu Hà", options: [{ value: "classic", label: "Đinh Thân, Canh Thìn" }, { value: "variant-a", label: "Đinh Thìn, Canh Thân" }] },
  { key: "phaToai", group: "starPlacement", field: "phaToai", label: "Phá Toái", options: [{ value: "classic", label: "Cổ điển" }, { value: "variant-a", label: "Biến thể A" }] },
  { key: "canh", group: "transformation", field: "canh", label: "Tứ Hóa năm Canh", options: [{ value: "nhat-vu-am-dong", label: "Dương Vũ Âm Đồng" }, { value: "nhat-vu-dong-am", label: "Dương Vũ Đồng Âm" }] },
  { key: "nham", group: "transformation", field: "nham", label: "Tứ Hóa năm Nhâm", options: [{ value: "luong-tu-phu-vu", label: "Lương Tử Phủ Vũ" }, { value: "luong-tu-ta-vu", label: "Lương Tử Tả Vũ" }] },
  { key: "trangSinhDirection", group: "annualCycle", field: "trangSinhDirection", label: "Chiều Tràng Sinh", options: [{ value: "by-yin-yang-gender", label: "Theo Âm Dương Nam Nữ" }, { value: "by-gender", label: "Nam thuận, Nữ nghịch" }] },
];

export function BirthForm({ initial }: { initial?: ChartRequest }) {
  const router = useRouter();
  const thisYear = new Date().getFullYear();
  const display = useChartStore((s) => s.display);
  const setDisplay = useChartStore((s) => s.setDisplay);

  const [name, setName] = useState(initial?.name ?? "");
  const [gender, setGender] = useState<"male" | "female">(initial?.gender ?? "male");
  const [calendar, setCalendar] = useState<"solar" | "lunar">(initial?.birth.calendar ?? "solar");
  const [day, setDay] = useState(String(initial?.birth.day ?? ""));
  const [month, setMonth] = useState(String(initial?.birth.month ?? ""));
  const [year, setYear] = useState(String(initial?.birth.year ?? ""));
  const [isLeap, setIsLeap] = useState(initial?.birth.isLeapMonth ?? false);
  const [hour, setHour] = useState(String(initial?.birth.hour ?? 12));
  const [minute, setMinute] = useState(String(initial?.birth.minute ?? 0));
  const [place, setPlace] = useState(initial?.birthPlace ?? "");
  const [tz, setTz] = useState(initial?.birth.timeZone ?? 7);
  const [schoolId, setSchoolId] = useState(initial?.schoolId ?? "vn-traditional");
  const [viewYear, setViewYear] = useState(String(initial?.viewYear ?? thisYear));
  const [overrides, setOverrides] = useState<DeepPartial<SchoolRuleSet>>(initial?.ruleOverrides ?? {});
  const [advanced, setAdvanced] = useState(false);
  const [touched, setTouched] = useState(false);

  const rules = useMemo(() => resolveRules(schoolId, overrides), [schoolId, overrides]);

  const request: ChartRequest | null = useMemo(() => {
    const d = Number(day), m = Number(month), y = Number(year), h = Number(hour), mi = Number(minute);
    if (!day || !month || !year) return null;
    return {
      name: name.trim(),
      gender,
      birth: { calendar, day: d, month: m, year: y, isLeapMonth: calendar === "lunar" ? isLeap : false, hour: h, minute: mi, timeZone: tz },
      birthPlace: place.trim(),
      schoolId,
      viewYear: Number(viewYear) || thisYear,
      ruleOverrides: Object.keys(overrides).length ? overrides : undefined,
    };
  }, [name, gender, calendar, day, month, year, isLeap, hour, minute, tz, place, schoolId, viewYear, overrides, thisYear]);

  const preview = useMemo(() => {
    if (!request) return null;
    try {
      return { ok: true as const, birth: resolveBirth(request.birth, rules.calendar) };
    } catch (e) {
      return { ok: false as const, error: e instanceof CalendarInputError ? e.message : "Dữ liệu không hợp lệ" };
    }
  }, [request, rules]);

  const leapMonthOfYear = useMemo(() => {
    const y = Number(year);
    return calendar === "lunar" && y >= 1800 && y <= 2199 ? getLeapMonth(y) : 0;
  }, [calendar, year]);

  const setOverride = (group: keyof SchoolRuleSet, field: string, value: string) => {
    setOverrides((o) => {
      const base = SCHOOLS[schoolId].rules[group] as unknown as Record<string, unknown>;
      const next = { ...o, [group]: { ...(o[group] as object), [field]: value } } as Record<string, Record<string, unknown>>;
      if (base[field] === value) delete next[group][field];
      if (next[group] && Object.keys(next[group]).length === 0) delete next[group];
      return next as DeepPartial<SchoolRuleSet>;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!request || !preview?.ok) return;
    router.push(`/laso?${requestToSearchParams(request).toString()}`);
  };

  const fillExample = () => {
    setName("Nguyễn Văn A");
    setGender("male");
    setCalendar("solar");
    setDay("15");
    setMonth("8");
    setYear("1990");
    setHour("10");
    setMinute("30");
    setPlace("Hà Nội");
    setTz(7);
  };

  return (
    <form onSubmit={submit} className="space-y-6" aria-label="Form nhập thông tin lá số">
      {/* Thông tin cá nhân */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Thông tin cá nhân</h2>
          <button type="button" onClick={fillExample} className="text-xs font-medium text-primary hover:underline">
            Điền ví dụ
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
          <Field label="Họ tên" htmlFor="name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ví dụ: Nguyễn Văn A" autoComplete="off" />
          </Field>
          <Field label="Giới tính">
            <Segmented name="Giới tính" value={gender} onChange={setGender} options={[{ value: "male", label: "Nam" }, { value: "female", label: "Nữ" }]} />
          </Field>
        </div>
      </section>

      {/* Ngày giờ sinh */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays className="h-4 w-4 text-muted-foreground" /> Ngày giờ sinh
          </h2>
          <div className="w-56">
            <Segmented name="Loại lịch" value={calendar} onChange={setCalendar} options={[{ value: "solar", label: "Dương lịch" }, { value: "lunar", label: "Âm lịch" }]} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Ngày" htmlFor="day">
            <Input id="day" inputMode="numeric" type="number" min={1} max={31} value={day} onChange={(e) => setDay(e.target.value)} placeholder="DD" />
          </Field>
          <Field label={calendar === "lunar" ? "Tháng (âm)" : "Tháng"} htmlFor="month">
            <NativeSelect id="month" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">Tháng</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Năm" htmlFor="year">
            <Input id="year" inputMode="numeric" type="number" min={1800} max={2199} value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" />
          </Field>
        </div>
        {calendar === "lunar" && (
          <label className="flex items-center gap-3 rounded-lg border border-dashed p-3 text-sm">
            <Switch checked={isLeap} onCheckedChange={setIsLeap} aria-label="Tháng nhuận" />
            <span>
              Tháng nhuận
              <span className="ml-2 text-xs text-muted-foreground">
                {leapMonthOfYear ? `Năm ${year} nhuận tháng ${leapMonthOfYear}` : year ? `Năm ${year} không có tháng nhuận` : ""}
              </span>
            </span>
          </label>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_2fr]">
          <Field label="Giờ" htmlFor="hour">
            <NativeSelect id="hour" value={hour} onChange={(e) => setHour(e.target.value)}>
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0")} giờ
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Phút" htmlFor="minute">
            <NativeSelect id="minute" value={minute} onChange={(e) => setMinute(e.target.value)}>
              {Array.from({ length: 60 }, (_, m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <div className="col-span-2 flex items-end sm:col-span-1">
            <div className="flex h-9 w-full items-center gap-2 rounded-lg bg-muted/60 px-3 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Giờ {HOUR_RANGES[Math.floor((Number(hour) + 1) / 2) % 12].name} ({HOUR_RANGES[Math.floor((Number(hour) + 1) / 2) % 12].label})
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
          <Field label="Nơi sinh" htmlFor="place">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="place"
                list="place-presets"
                className="pl-8"
                value={place}
                onChange={(e) => {
                  setPlace(e.target.value);
                  const preset = PLACE_PRESETS.find((p) => p.name === e.target.value);
                  if (preset) setTz(preset.tz);
                }}
                placeholder="Thành phố / tỉnh"
              />
              <datalist id="place-presets">
                {PLACE_PRESETS.map((p) => (
                  <option key={p.name} value={p.name} />
                ))}
              </datalist>
            </div>
          </Field>
          <Field label="Múi giờ" htmlFor="tz">
            <NativeSelect id="tz" value={tz} onChange={(e) => setTz(Number(e.target.value))}>
              {TIMEZONE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {formatTz(t)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>

        {/* Xem trước chuyển đổi lịch */}
        <div aria-live="polite" className="rounded-xl border bg-muted/30 p-4 text-sm">
          {!request && <p className="text-muted-foreground">Nhập ngày tháng năm sinh để xem chuyển đổi lịch và Can Chi.</p>}
          {preview && !preview.ok && (
            <p className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> {preview.error}
            </p>
          )}
          {preview?.ok && (
            <div className="space-y-2">
              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                <div>
                  <span className="text-muted-foreground">Dương lịch: </span>
                  <span className="font-medium">
                    {preview.birth.solar.day}/{preview.birth.solar.month}/{preview.birth.solar.year}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Âm lịch: </span>
                  <span className="font-medium">
                    {preview.birth.lunar.day}/{preview.birth.lunar.month}
                    {preview.birth.lunar.isLeapMonth ? " (nhuận)" : ""}/{preview.birth.lunar.year}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(["year", "month", "day", "hour"] as const).map((k) => (
                  <span key={k} className="rounded-md bg-card px-2 py-1 text-xs shadow-sm ring-1 ring-border">
                    <span className="text-muted-foreground">{{ year: "Năm", month: "Tháng", day: "Ngày", hour: "Giờ" }[k]} </span>
                    <span className="font-semibold">{canChiName(preview.birth.pillars[k].stem, preview.birth.pillars[k].branch)}</span>
                  </span>
                ))}
                <span className="rounded-md bg-card px-2 py-1 text-xs shadow-sm ring-1 ring-border">
                  <span className="text-muted-foreground">Tiết </span>
                  <span className="font-semibold">{preview.birth.reference.solarTerm.name}</span>
                </span>
              </div>
              {preview.birth.warnings.length > 0 && (
                <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300">
                  {preview.birth.warnings.map((w) => (
                    <li key={w.code} className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                      {w.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Cấu hình nâng cao */}
      <section className="rounded-xl border">
        <button type="button" onClick={() => setAdvanced((a) => !a)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold" aria-expanded={advanced}>
          <span className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" /> Cấu hình nâng cao
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", advanced && "rotate-180")} />
        </button>
        {advanced && (
          <div className="space-y-5 border-t px-4 py-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Trường phái" htmlFor="school">
                <NativeSelect id="school" value={schoolId} onChange={(e) => { setSchoolId(e.target.value); setOverrides({}); }}>
                  {Object.values(SCHOOLS).map((s) => (
                    <option key={s.config.schoolId} value={s.config.schoolId}>
                      {s.config.schoolName}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Năm xem hạn" htmlFor="viewYear">
                <Input id="viewYear" type="number" min={1800} max={2199} value={viewYear} onChange={(e) => setViewYear(e.target.value)} />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">{SCHOOLS[schoolId].description}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: "showAnnualStars" as const, label: "Hiển thị sao lưu" },
                { key: "showBrightness" as const, label: "Miếu / Vượng / Đắc / Hãm" },
                { key: "showTransformations" as const, label: "Hiển thị Tứ Hóa" },
              ].map((o) => (
                <label key={o.key} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  {o.label}
                  <Switch checked={display[o.key]} onCheckedChange={(v) => setDisplay({ [o.key]: v })} />
                </label>
              ))}
            </div>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quy tắc có khác biệt giữa các nguồn</div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {RULE_SELECTS.map((r) => {
                  const current = (rules[r.group] as unknown as Record<string, string>)[r.field];
                  return (
                    <Field key={r.key} label={r.label} htmlFor={`rule-${r.key}`}>
                      <NativeSelect id={`rule-${r.key}`} value={current} onChange={(e) => setOverride(r.group, r.field, e.target.value)}>
                        {r.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </NativeSelect>
                    </Field>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center justify-end gap-3">
        {touched && !request && <span className="text-sm text-destructive">Vui lòng nhập đủ ngày, tháng, năm sinh.</span>}
        <Button type="submit" size="lg" disabled={!!request && !preview?.ok}>
          <Sparkles /> Lập lá số
        </Button>
      </div>
    </form>
  );
}
