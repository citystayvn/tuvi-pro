/**
 * Calendar Engine – điểm vào duy nhất: chuyển dữ liệu ngày giờ sinh thành
 * các đại lượng lịch pháp cần cho việc lập lá số.
 * Hoàn toàn độc lập với React.
 */
import type { BranchIndex, StemIndex } from "@/types/astrology";
import type { CalendarRuleSet } from "@/config/schools/types";
import {
  hourToBranch,
  mod,
  ratHourStem,
  stemOfBranchInYear,
  yearBranch,
  yearStem,
} from "@/core/stems-branches";
import { addDays, isValidSolarDate, jdFromDate, type SimpleDate } from "./julian";
import { getLeapMonth, isValidLunarDate, lunarToSolar, solarToLunar, type LunarDate } from "./lunar";
import {
  lapXuanMoment,
  minutesToNearestTermBoundary,
  solarTermAt,
  solarTermMonth,
  SOLAR_TERM_UNCERTAINTY_MINUTES,
} from "./solar-terms";

export * from "./julian";
export * from "./lunar";
export * from "./solar-terms";

export interface BirthInput {
  calendar: "solar" | "lunar";
  day: number;
  month: number;
  year: number;
  /** Chỉ dùng khi calendar = "lunar". */
  isLeapMonth?: boolean;
  hour: number; // 0..23
  minute: number; // 0..59
  /** Giờ lệch UTC của nơi sinh (ví dụ Việt Nam = 7). */
  timeZone: number;
}

export interface Pillar {
  stem: StemIndex;
  branch: BranchIndex;
}

export interface CalendarWarning {
  code: string;
  message: string;
}

export interface ResolvedBirth {
  /** Ngày dương lịch theo giờ đồng hồ nơi sinh (như người dùng nhập/quy đổi). */
  solar: SimpleDate & { hour: number; minute: number; timeZone: number };
  /** Ngày dương lịch dùng để lập lịch (sau quy đổi múi giờ, trước khi xét giờ Tý muộn). */
  calendarSolar: SimpleDate & { hour: number; minute: number };
  /** Ngày dương lịch sau khi xét giờ Tý muộn – dùng cho ngày âm và Can Chi ngày. */
  effectiveSolar: SimpleDate;
  /** Âm lịch của ngày hiệu lực. */
  lunar: LunarDate;
  calendarTimeZone: number;
  /** Thời điểm sinh, Julian Day giờ UT. */
  jdUT: number;
  hourBranch: BranchIndex;
  /** Năm dùng cho lá số (theo quy tắc ranh giới năm). */
  chartYear: number;
  /** Tháng dùng để an sao (1..12, 1 = tháng Giêng/Dần). */
  chartMonth: number;
  /** Ngày âm lịch dùng để an sao. */
  chartDay: number;
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar };
  /** Tham chiếu song song – không thay thế nhau. */
  reference: {
    lunarYear: number;
    lapXuanYear: number;
    lunarMonth: number;
    solarTermMonth: number;
    solarTerm: { name: string; longitude: number };
    minutesToTermBoundary: { minutes: number; termName: string };
    leapMonthOfYear: number;
  };
  warnings: CalendarWarning[];
}

export class CalendarInputError extends Error {}

function calendarTzFor(rules: CalendarRuleSet, year: number): number {
  return rules.historicalTimeZoneBefore1968 && year < 1968 ? 8 : rules.calendarTimeZone;
}

export function resolveBirth(input: BirthInput, rules: CalendarRuleSet): ResolvedBirth {
  const warnings: CalendarWarning[] = [];
  const { hour, minute, timeZone } = input;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new CalendarInputError("Giờ sinh phải từ 0 đến 23");
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) throw new CalendarInputError("Phút sinh phải từ 0 đến 59");
  if (!Number.isFinite(timeZone) || timeZone < -12 || timeZone > 14) throw new CalendarInputError("Múi giờ không hợp lệ");
  if (input.year < 1800 || input.year > 2199) throw new CalendarInputError("Hỗ trợ năm sinh từ 1800 đến 2199");

  // 1. Xác định ngày dương lịch theo giờ nơi sinh.
  let solarDate: SimpleDate;
  if (input.calendar === "lunar") {
    const tz = calendarTzFor(rules, input.year);
    const check = isValidLunarDate(input.day, input.month, input.year, !!input.isLeapMonth, tz);
    if (!check.valid) throw new CalendarInputError(check.reason ?? "Ngày âm lịch không hợp lệ");
    const s = lunarToSolar(input.day, input.month, input.year, !!input.isLeapMonth, tz);
    if (!s) throw new CalendarInputError("Không chuyển đổi được ngày âm lịch");
    solarDate = s;
    // Nhập âm lịch nghĩa là người dùng đã xác định ngày âm theo lịch. Với giờ Tý muộn, ngày âm
    // nhập vào được coi là ngày trước khi chuyển ngày.
  } else {
    if (!isValidSolarDate(input.day, input.month, input.year)) throw new CalendarInputError("Ngày dương lịch không hợp lệ");
    solarDate = { day: input.day, month: input.month, year: input.year };
  }

  const jdUT = jdFromDate(solarDate.day, solarDate.month, solarDate.year) - 0.5 + (hour + minute / 60 - timeZone) / 24;

  // 2. Quy đổi sang múi giờ lập lịch nếu được cấu hình.
  const calTz = calendarTzFor(rules, solarDate.year);
  let calDate = solarDate;
  let calHour = hour;
  let calMinute = minute;
  if (rules.timeMode === "convert-to-calendar-tz" && timeZone !== calTz) {
    const totalMinutes = hour * 60 + minute + (calTz - timeZone) * 60;
    const dayShift = Math.floor(totalMinutes / 1440);
    const minutesOfDay = mod(totalMinutes, 1440);
    calDate = addDays(solarDate, dayShift);
    calHour = Math.floor(minutesOfDay / 60);
    calMinute = minutesOfDay % 60;
    warnings.push({ code: "TZ_CONVERTED", message: `Đã quy đổi giờ sinh từ UTC${fmtTz(timeZone)} sang UTC${fmtTz(calTz)}.` });
  } else if (timeZone !== calTz) {
    warnings.push({
      code: "TZ_LOCAL_CLOCK",
      message: `Sinh ở múi giờ UTC${fmtTz(timeZone)}: dùng giờ đồng hồ nơi sinh, âm lịch lập theo UTC${fmtTz(calTz)}.`,
    });
  }

  // 3. Giờ địa chi và giờ Tý muộn.
  const hourBranch = hourToBranch(calHour);
  let effective = calDate;
  if (calHour === 23) {
    if (rules.lateRatHour === "next-day") {
      effective = input.calendar === "lunar" ? calDate : addDays(calDate, 1);
      warnings.push({
        code: "LATE_RAT_HOUR",
        message:
          input.calendar === "lunar"
            ? "Sinh giờ Tý muộn (23h–24h) và nhập theo âm lịch: dùng ngày âm đã nhập, Can Chi ngày tính theo ngày kế tiếp."
            : "Sinh giờ Tý muộn (23h–24h): theo cấu hình, ngày âm lịch và Can Chi ngày tính sang ngày hôm sau.",
      });
    } else {
      warnings.push({ code: "LATE_RAT_HOUR", message: "Sinh giờ Tý muộn (23h–24h): theo cấu hình, giữ nguyên ngày hiện tại." });
    }
  }

  const lunarOfEffective = solarToLunar(effective.day, effective.month, effective.year, calTz);
  // Với nhập âm lịch + giờ Tý muộn: giữ ngày âm như người dùng nhập.
  const lunar: LunarDate =
    input.calendar === "lunar"
      ? { day: input.day, month: input.month, year: input.year, isLeapMonth: !!input.isLeapMonth }
      : lunarOfEffective;
  // Ngày dùng cho Can Chi ngày.
  const dayPillarDate = input.calendar === "lunar" && calHour === 23 && rules.lateRatHour === "next-day" ? addDays(calDate, 1) : effective;

  // 4. Năm.
  const lapXuanJd = lapXuanMoment(solarDate.year, jdFromDate);
  const lapXuanYear = jdUT >= lapXuanJd ? solarDate.year : solarDate.year - 1;
  const chartYear = rules.yearBoundary === "lap-xuan" ? lapXuanYear : lunar.year;
  if (lapXuanYear !== lunar.year) {
    warnings.push({
      code: "YEAR_BOUNDARY_DIFFERS",
      message: `Năm âm lịch (${lunar.year}) khác năm theo tiết Lập Xuân (${lapXuanYear}). Lá số dùng: ${rules.yearBoundary === "lap-xuan" ? "Lập Xuân" : "Tết Nguyên Đán"}.`,
    });
  }

  // 5. Tháng.
  const termMonth = solarTermMonth(jdUT);
  let chartMonth: number;
  if (rules.monthSystem === "solar-term") {
    chartMonth = termMonth;
  } else {
    chartMonth = lunar.month;
    if (lunar.isLeapMonth) {
      if (rules.leapMonth === "as-next" || (rules.leapMonth === "split-15" && lunar.day > 15)) {
        chartMonth = (lunar.month % 12) + 1;
      }
      warnings.push({
        code: "LEAP_MONTH",
        message: `Sinh tháng ${lunar.month} nhuận – an sao theo tháng ${chartMonth} (quy tắc: ${LEAP_RULE_LABEL[rules.leapMonth]}).`,
      });
    }
  }

  const termDistance = minutesToNearestTermBoundary(jdUT);
  if (termDistance.minutes <= 60) {
    warnings.push({
      code: "NEAR_SOLAR_TERM",
      message: `Thời điểm sinh cách tiết ${termDistance.termName} khoảng ${Math.round(termDistance.minutes)} phút (sai số tính tiết khí ±${SOLAR_TERM_UNCERTAINTY_MINUTES} phút).`,
    });
  }

  // 6. Tứ trụ.
  const yStem = yearStem(chartYear);
  const yBranch = yearBranch(chartYear);
  const monthBranch = mod(chartMonth + 1, 12);
  const dayJd = jdFromDate(dayPillarDate.day, dayPillarDate.month, dayPillarDate.year);
  const dStem = mod(dayJd + 9, 10);
  const dBranch = mod(dayJd + 1, 12);
  const pillars = {
    year: { stem: yStem, branch: yBranch },
    month: { stem: stemOfBranchInYear(yStem, monthBranch), branch: monthBranch },
    day: { stem: dStem, branch: dBranch },
    hour: { stem: mod(ratHourStem(dStem) + hourBranch, 10), branch: hourBranch },
  };

  const termInfo = solarTermAt(jdUT);

  return {
    solar: { ...solarDate, hour, minute, timeZone },
    calendarSolar: { ...calDate, hour: calHour, minute: calMinute },
    effectiveSolar: dayPillarDate,
    lunar,
    calendarTimeZone: calTz,
    jdUT,
    hourBranch,
    chartYear,
    chartMonth,
    chartDay: lunar.day,
    pillars,
    reference: {
      lunarYear: lunar.year,
      lapXuanYear,
      lunarMonth: lunar.month,
      solarTermMonth: termMonth,
      solarTerm: { name: termInfo.name, longitude: termInfo.longitude },
      minutesToTermBoundary: termDistance,
      leapMonthOfYear: getLeapMonth(lunar.year, calTz),
    },
    warnings,
  };
}

const LEAP_RULE_LABEL: Record<CalendarRuleSet["leapMonth"], string> = {
  "as-current": "tháng nhuận tính như tháng chính",
  "as-next": "tháng nhuận tính sang tháng sau",
  "split-15": "15 ngày đầu tính tháng chính, từ ngày 16 tính tháng sau",
};

function fmtTz(tz: number): string {
  const sign = tz >= 0 ? "+" : "−";
  const abs = Math.abs(tz);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `${sign}${h}${m ? ":" + String(m).padStart(2, "0") : ""}`;
}
