"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import type { ChartRequest } from "@/core/chart/buildChart";
import { CalendarInputError, resolveBirth } from "@/core/calendar";
import type { CalendarRuleSet } from "@/config/schools/types";
import { formatTz, TIMEZONE_OPTIONS } from "@/utils/places";
import { cn } from "@/utils/cn";

/** Form sửa nhanh thông tin ngày giờ sinh ngay trong ô giữa lá số. */
export function CenterEditForm({
  request,
  calendarRules,
  onSubmit,
  onCancel,
}: {
  request: ChartRequest;
  calendarRules: CalendarRuleSet;
  onSubmit: (r: ChartRequest) => void;
  onCancel: () => void;
}) {
  const b = request.birth;
  const [name, setName] = useState(request.name ?? "");
  const [gender, setGender] = useState(request.gender);
  const [calendar, setCalendar] = useState(b.calendar);
  const [day, setDay] = useState(String(b.day));
  const [month, setMonth] = useState(String(b.month));
  const [year, setYear] = useState(String(b.year));
  const [isLeap, setIsLeap] = useState(!!b.isLeapMonth);
  const [hour, setHour] = useState(String(b.hour));
  const [minute, setMinute] = useState(String(b.minute));
  const [tz, setTz] = useState(b.timeZone);

  const next: ChartRequest | null = useMemo(() => {
    if ([day, month, year, hour, minute].some((v) => v === "")) return null;
    return {
      ...request,
      name: name.trim(),
      gender,
      birth: { calendar, day: +day, month: +month, year: +year, isLeapMonth: calendar === "lunar" && isLeap, hour: +hour, minute: +minute, timeZone: tz },
    };
  }, [request, name, gender, calendar, day, month, year, isLeap, hour, minute, tz]);

  const error = useMemo(() => {
    if (!next) return "Nhập đủ ngày, tháng, năm, giờ, phút.";
    try {
      resolveBirth(next.birth, calendarRules);
      return null;
    } catch (e) {
      return e instanceof CalendarInputError ? e.message : "Dữ liệu không hợp lệ";
    }
  }, [next, calendarRules]);

  const num = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);
  const input = "h-7 w-full rounded-md border border-input bg-card px-2 text-[12px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";
  const seg = (active: boolean) => cn("flex-1 rounded px-2 py-0.5 text-[11.5px] font-medium", active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground");
  const label = "mb-0.5 block text-[10.5px] text-muted-foreground";

  return (
    <form
      className="space-y-2 text-[12px]"
      onSubmit={(e) => {
        e.preventDefault();
        if (next && !error) onSubmit(next);
      }}
      aria-label="Sửa thông tin lá số"
    >
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <div>
          <label htmlFor="ce-name" className={label}>Họ tên</label>
          <input id="ce-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        </div>
        <div>
          <span className={label}>Giới tính</span>
          <div className="flex h-7 rounded-md bg-muted p-0.5">
            <button type="button" className={seg(gender === "male")} onClick={() => setGender("male")}>Nam</button>
            <button type="button" className={seg(gender === "female")} onClick={() => setGender("female")}>Nữ</button>
          </div>
        </div>
      </div>
      <div className="flex items-end gap-2">
        <div className="flex h-7 w-40 rounded-md bg-muted p-0.5">
          <button type="button" className={seg(calendar === "solar")} onClick={() => setCalendar("solar")}>Dương lịch</button>
          <button type="button" className={seg(calendar === "lunar")} onClick={() => setCalendar("lunar")}>Âm lịch</button>
        </div>
        {calendar === "lunar" && (
          <label className="flex items-center gap-1.5 text-[11.5px]">
            <input type="checkbox" checked={isLeap} onChange={(e) => setIsLeap(e.target.checked)} /> Tháng nhuận
          </label>
        )}
      </div>
      <div className="grid grid-cols-6 gap-2">
        <div>
          <label htmlFor="ce-day" className={label}>Ngày</label>
          <input id="ce-day" inputMode="numeric" className={input} value={day} onChange={(e) => setDay(num(e.target.value, 2))} />
        </div>
        <div>
          <label htmlFor="ce-month" className={label}>Tháng</label>
          <input id="ce-month" inputMode="numeric" className={input} value={month} onChange={(e) => setMonth(num(e.target.value, 2))} />
        </div>
        <div className="col-span-2">
          <label htmlFor="ce-year" className={label}>Năm</label>
          <input id="ce-year" inputMode="numeric" className={input} value={year} onChange={(e) => setYear(num(e.target.value, 4))} />
        </div>
        <div>
          <label htmlFor="ce-hour" className={label}>Giờ</label>
          <input id="ce-hour" inputMode="numeric" className={input} value={hour} onChange={(e) => setHour(num(e.target.value, 2))} />
        </div>
        <div>
          <label htmlFor="ce-minute" className={label}>Phút</label>
          <input id="ce-minute" inputMode="numeric" className={input} value={minute} onChange={(e) => setMinute(num(e.target.value, 2))} />
        </div>
      </div>
      <div>
        <label htmlFor="ce-tz" className={label}>Múi giờ</label>
        <select id="ce-tz" className={input} value={tz} onChange={(e) => setTz(Number(e.target.value))}>
          {TIMEZONE_OPTIONS.map((t) => (
            <option key={t} value={t}>{formatTz(t)}</option>
          ))}
        </select>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertTriangle className="h-3 w-3" /> {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="h-7 rounded-md border px-3 text-[12px] font-medium hover:bg-muted">Huỷ</button>
        <button type="submit" disabled={!!error} className="flex h-7 items-center gap-1 rounded-md bg-primary px-3 text-[12px] font-medium text-primary-foreground disabled:opacity-50">
          <RotateCw className="h-3.5 w-3.5" /> Lập lại lá số
        </button>
      </div>
    </form>
  );
}
