import { describe, expect, it } from "vitest";
import {
  apparentSunLongitude,
  findSunLongitudeMoment,
  getLeapMonth,
  isValidLunarDate,
  jdFromDate,
  jdToDate,
  lunarMonthLength,
  lunarToSolar,
  resolveBirth,
  solarToLunar,
  CalendarInputError,
} from "@/core/calendar";
import { hourToBranch, ratHourStem, stemOfBranchInYear, yearBranch, yearStem } from "@/core/stems-branches";
import { SCHOOLS } from "@/config/schools";
import { KNOWN_DAY_PILLARS, SOLAR_TERM_MOMENTS_UTC, VN_LEAP_MONTHS, VN_NO_LEAP_YEARS, VN_TET_DATES } from "../fixtures/calendar-reference";

const VN = SCHOOLS["vn-traditional"].rules.calendar;

describe("[Calendar Engine] Âm lịch – dữ liệu tham chiếu", () => {
  it.each(VN_TET_DATES)("Tết $lunarYear", ({ lunarYear, solar }) => {
    expect(solarToLunar(solar[0], solar[1], solar[2], 7)).toEqual({ day: 1, month: 1, year: lunarYear, isLeapMonth: false });
    expect(lunarToSolar(1, 1, lunarYear, false, 7)).toEqual({ day: solar[0], month: solar[1], year: solar[2] });
  });

  it.each(VN_LEAP_MONTHS)("Năm %i nhuận tháng %i", (year, month) => {
    expect(getLeapMonth(year, 7)).toBe(month);
    const start = lunarToSolar(1, month, year, true, 7);
    expect(start).not.toBeNull();
    expect(solarToLunar(start!.day, start!.month, start!.year, 7)).toEqual({ day: 1, month, year, isLeapMonth: true });
  });

  it.each(VN_NO_LEAP_YEARS)("Năm %i không có tháng nhuận", (year) => {
    expect(getLeapMonth(year, 7)).toBe(0);
  });

  it("Tết 1985 tính theo UTC+8 rơi vào 20/2/1985 (khác Việt Nam)", () => {
    expect(lunarToSolar(1, 1, 1985, false, 8)).toEqual({ day: 20, month: 2, year: 1985 });
  });
});

describe("[Calendar Engine] Âm lịch – tính nhất quán", () => {
  it("Chuyển đổi khứ hồi dương → âm → dương cho mọi ngày 1900–2100", () => {
    const start = jdFromDate(1, 1, 1900);
    const end = jdFromDate(31, 12, 2100);
    for (let jd = start; jd <= end; jd++) {
      const s = jdToDate(jd);
      const l = solarToLunar(s.day, s.month, s.year, 7);
      expect(l.day).toBeGreaterThanOrEqual(1);
      expect(l.day).toBeLessThanOrEqual(30);
      const back = lunarToSolar(l.day, l.month, l.year, l.isLeapMonth, 7);
      if (!back || back.day !== s.day || back.month !== s.month || back.year !== s.year) {
        throw new Error(`Sai tại ${s.day}/${s.month}/${s.year}: ${JSON.stringify(l)} → ${JSON.stringify(back)}`);
      }
    }
  });

  it("Mỗi tháng âm lịch có 29 hoặc 30 ngày", () => {
    for (let y = 1950; y <= 2050; y++) {
      for (let m = 1; m <= 12; m++) expect([29, 30]).toContain(lunarMonthLength(m, y, false, 7));
    }
  });

  it("Kiểm tra ngày âm lịch không hợp lệ", () => {
    expect(isValidLunarDate(1, 4, 2021, true).valid).toBe(false); // 2021 không nhuận
    expect(isValidLunarDate(15, 4, 2020, true).valid).toBe(true);
    expect(isValidLunarDate(31, 1, 2024, false).valid).toBe(false);
    expect(isValidLunarDate(0, 1, 2024, false).valid).toBe(false);
    expect(lunarToSolar(1, 5, 2020, true, 7)).toBeNull(); // 2020 nhuận tháng 4, không phải 5
  });

  it("Ngày 29/02 năm nhuận", () => {
    expect(solarToLunar(29, 2, 2024, 7)).toEqual({ day: 20, month: 1, year: 2024, isLeapMonth: false });
    expect(() => resolveBirth({ calendar: "solar", day: 29, month: 2, year: 2023, hour: 8, minute: 0, timeZone: 7 }, VN)).toThrow(CalendarInputError);
    const r = resolveBirth({ calendar: "solar", day: 29, month: 2, year: 2000, hour: 8, minute: 0, timeZone: 7 }, VN);
    expect(r.lunar.year).toBe(2000);
  });
});

describe("[Calendar Engine] Can Chi", () => {
  it("Can Chi năm", () => {
    expect([yearStem(1984), yearBranch(1984)]).toEqual([0, 0]); // Giáp Tý
    expect([yearStem(1990), yearBranch(1990)]).toEqual([6, 6]); // Canh Ngọ
    expect([yearStem(2024), yearBranch(2024)]).toEqual([0, 4]); // Giáp Thìn
    expect([yearStem(1975), yearBranch(1975)]).toEqual([1, 3]); // Ất Mão
  });

  it.each(KNOWN_DAY_PILLARS)("Can Chi ngày $label", ({ date, stem, branch }) => {
    const r = resolveBirth({ calendar: "solar", day: date[0], month: date[1], year: date[2], hour: 12, minute: 0, timeZone: 7 }, VN);
    expect(r.pillars.day).toEqual({ stem, branch });
  });

  it("Can tháng theo Ngũ Hổ Độn", () => {
    expect(stemOfBranchInYear(0, 2)).toBe(2); // Giáp → Bính Dần
    expect(stemOfBranchInYear(6, 2)).toBe(4); // Canh → Mậu Dần
    expect(stemOfBranchInYear(3, 2)).toBe(8); // Đinh → Nhâm Dần
    expect(stemOfBranchInYear(9, 2)).toBe(0); // Quý → Giáp Dần
  });

  it("Can giờ theo Ngũ Thử Độn", () => {
    expect(ratHourStem(0)).toBe(0); // Giáp → Giáp Tý
    expect(ratHourStem(5)).toBe(0); // Kỷ → Giáp Tý
    expect(ratHourStem(1)).toBe(2); // Ất → Bính Tý
    expect(ratHourStem(4)).toBe(8); // Mậu → Nhâm Tý
  });

  it("Giờ địa chi", () => {
    expect(hourToBranch(23)).toBe(0);
    expect(hourToBranch(0)).toBe(0);
    expect(hourToBranch(1)).toBe(1);
    expect(hourToBranch(11)).toBe(6);
    expect(hourToBranch(12)).toBe(6);
    expect(hourToBranch(22)).toBe(11);
  });
});

describe("[Calendar Engine] Tiết khí", () => {
  it.each(SOLAR_TERM_MOMENTS_UTC)("$name trong sai số 20 phút", ({ longitude, utc }) => {
    const [y, m, d, hh, mm] = utc;
    const ref = jdFromDate(d, m, y) - 0.5 + (hh + mm / 60) / 24;
    const found = findSunLongitudeMoment(longitude, ref + 1);
    expect(Math.abs(found - ref) * 1440).toBeLessThan(20);
    expect(Math.abs(((apparentSunLongitude(ref) - longitude + 540) % 360) - 180)).toBeLessThan(0.02);
  });
});

describe("[Calendar Engine] Trường hợp biên", () => {
  it("Sinh gần Tết: 23:30 ngày 9/2/2024 – giờ Tý muộn", () => {
    const next = resolveBirth({ calendar: "solar", day: 9, month: 2, year: 2024, hour: 23, minute: 30, timeZone: 7 }, VN);
    expect(next.lunar).toEqual({ day: 1, month: 1, year: 2024, isLeapMonth: false });
    expect(next.pillars.year).toEqual({ stem: 0, branch: 4 });
    expect(next.hourBranch).toBe(0);
    const same = resolveBirth({ calendar: "solar", day: 9, month: 2, year: 2024, hour: 23, minute: 30, timeZone: 7 }, { ...VN, lateRatHour: "same-day" });
    expect(same.lunar).toEqual({ day: 30, month: 12, year: 2023, isLeapMonth: false });
    expect(same.pillars.year).toEqual({ stem: 9, branch: 3 }); // Quý Mão
  });

  it("Sinh 00:30 – giờ Tý sớm, không đổi ngày", () => {
    const r = resolveBirth({ calendar: "solar", day: 10, month: 2, year: 2024, hour: 0, minute: 30, timeZone: 7 }, VN);
    expect(r.lunar.day).toBe(1);
    expect(r.hourBranch).toBe(0);
    expect(r.pillars.hour).toEqual({ stem: 0, branch: 0 }); // ngày Giáp → giờ Giáp Tý
  });

  it("Sinh gần Lập Xuân: năm âm lịch khác năm tiết khí", () => {
    // Lập Xuân 2024 ≈ 15:27 giờ Việt Nam ngày 4/2/2024; Tết 10/2/2024.
    const before = resolveBirth({ calendar: "solar", day: 4, month: 2, year: 2024, hour: 13, minute: 0, timeZone: 7 }, VN);
    const after = resolveBirth({ calendar: "solar", day: 4, month: 2, year: 2024, hour: 17, minute: 0, timeZone: 7 }, VN);
    expect(before.reference.lapXuanYear).toBe(2023);
    expect(after.reference.lapXuanYear).toBe(2024);
    expect(after.reference.lunarYear).toBe(2023);
    expect(after.chartYear).toBe(2023); // mặc định dùng năm âm lịch
    const lx = resolveBirth({ calendar: "solar", day: 4, month: 2, year: 2024, hour: 17, minute: 0, timeZone: 7 }, { ...VN, yearBoundary: "lap-xuan" });
    expect(lx.chartYear).toBe(2024);
    expect(lx.pillars.year).toEqual({ stem: 0, branch: 4 });
    expect(after.warnings.some((w) => w.code === "YEAR_BOUNDARY_DIFFERS")).toBe(true);
  });

  it("Tháng theo tiết khí khác tháng âm lịch", () => {
    // 15/3/2024: âm lịch 6/2, sau Kinh Trập (5/3) → tháng tiết khí 2 (Mão)
    const r = resolveBirth({ calendar: "solar", day: 15, month: 3, year: 2024, hour: 9, minute: 0, timeZone: 7 }, { ...VN, monthSystem: "solar-term" });
    expect(r.reference.lunarMonth).toBe(2);
    expect(r.chartMonth).toBe(2);
    // 7/3/2024: âm lịch 27/1, nhưng đã qua Kinh Trập → tháng tiết khí 2
    const r2 = resolveBirth({ calendar: "solar", day: 7, month: 3, year: 2024, hour: 9, minute: 0, timeZone: 7 }, { ...VN, monthSystem: "solar-term" });
    expect(r2.reference.lunarMonth).toBe(1);
    expect(r2.chartMonth).toBe(2);
  });

  it("Sinh gần thời điểm giao tiết có cảnh báo", () => {
    const r = resolveBirth({ calendar: "solar", day: 4, month: 2, year: 2024, hour: 15, minute: 20, timeZone: 7 }, VN);
    expect(r.warnings.some((w) => w.code === "NEAR_SOLAR_TERM")).toBe(true);
  });

  it("Sinh tháng nhuận – các quy tắc xử lý", () => {
    // 20/6/2020 = 29/4 nhuận năm Canh Tý
    const base = { calendar: "solar" as const, day: 20, month: 6, year: 2020, hour: 9, minute: 0, timeZone: 7 };
    const asCurrent = resolveBirth(base, VN);
    expect(asCurrent.lunar).toEqual({ day: 29, month: 4, year: 2020, isLeapMonth: true });
    expect(asCurrent.chartMonth).toBe(4);
    expect(resolveBirth(base, { ...VN, leapMonth: "as-next" }).chartMonth).toBe(5);
    expect(resolveBirth(base, { ...VN, leapMonth: "split-15" }).chartMonth).toBe(5);
    const early = resolveBirth({ ...base, day: 30, month: 5 }, { ...VN, leapMonth: "split-15" }); // 8/4 nhuận
    expect(early.lunar.isLeapMonth).toBe(true);
    expect(early.chartMonth).toBe(4);
  });

  it("Nhập âm lịch tháng nhuận", () => {
    const r = resolveBirth({ calendar: "lunar", day: 15, month: 4, year: 2020, isLeapMonth: true, hour: 9, minute: 0, timeZone: 7 }, VN);
    expect(r.solar).toMatchObject({ day: 6, month: 6, year: 2020 });
    expect(() => resolveBirth({ calendar: "lunar", day: 15, month: 5, year: 2020, isLeapMonth: true, hour: 9, minute: 0, timeZone: 7 }, VN)).toThrow(CalendarInputError);
  });

  it("Múi giờ khác nhau", () => {
    // New York (UTC−5), 20:00 ngày 9/2/2024 = 08:00 ngày 10/2/2024 giờ Việt Nam
    const input = { calendar: "solar" as const, day: 9, month: 2, year: 2024, hour: 20, minute: 0, timeZone: -5 };
    const local = resolveBirth(input, VN);
    expect(local.lunar).toMatchObject({ day: 30, month: 12, year: 2023 });
    expect(local.hourBranch).toBe(10); // Tuất
    const converted = resolveBirth(input, { ...VN, timeMode: "convert-to-calendar-tz" });
    expect(converted.lunar).toMatchObject({ day: 1, month: 1, year: 2024 });
    expect(converted.hourBranch).toBe(4); // 08:00 → Thìn
    // Múi giờ lẻ (Ấn Độ +5:30): 23:45 → 01:15 hôm sau ở UTC+7
    const ist = resolveBirth({ calendar: "solar", day: 1, month: 3, year: 2024, hour: 23, minute: 45, timeZone: 5.5 }, { ...VN, timeMode: "convert-to-calendar-tz" });
    expect(ist.calendarSolar).toMatchObject({ day: 2, month: 3, hour: 1, minute: 15 });
    expect(ist.hourBranch).toBe(1);
  });

  it("Thời điểm UT độc lập với cách nhập múi giờ", () => {
    const a = resolveBirth({ calendar: "solar", day: 1, month: 1, year: 2000, hour: 7, minute: 0, timeZone: 7 }, VN);
    const b = resolveBirth({ calendar: "solar", day: 1, month: 1, year: 2000, hour: 0, minute: 0, timeZone: 0 }, VN);
    expect(a.jdUT).toBeCloseTo(b.jdUT, 9);
  });
});
