/**
 * Calendar Engine – Âm lịch Việt Nam.
 *
 * Thuật toán: Hồ Ngọc Đức, "Thuật toán tính âm lịch" (2004), dựa trên
 * Jean Meeus, "Astronomical Algorithms" (1998) – tính điểm Sóc (trăng mới) và
 * kinh độ Mặt Trời để xác định tháng 11 âm lịch (chứa Đông Chí) và tháng nhuận
 * (tháng đầu tiên không chứa Trung khí).
 *
 * Âm lịch Việt Nam hiện hành tính theo múi giờ UTC+7 (từ năm 1968). Trước 1968
 * lịch tại Việt Nam được tính theo UTC+8; tham số timeZone cho phép lựa chọn.
 */
import { jdFromDate, jdToDate, type SimpleDate } from "./julian";

const PI = Math.PI;
const INT = Math.floor;

/** Thời điểm Sóc thứ k (tính từ Sóc 1/1/1900) – Julian Day (giờ UT). */
export function newMoonJd(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return Jd1 + C1 - deltat;
}

/** Kinh độ Mặt Trời (radian, 0..2π) tại Julian Day jdn (UT) – độ chính xác thấp (~0.01°). */
export function sunLongitudeRad(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - PI * 2 * INT(L / (PI * 2));
  return L;
}

/** Ngày (số nguyên JDN, giờ địa phương) bắt đầu tháng âm lịch thứ k. */
export function getNewMoonDay(k: number, timeZone: number): number {
  return INT(newMoonJd(k) + 0.5 + timeZone / 24);
}

/** Cung hoàng đạo 30° (0..11) của Mặt Trời lúc 0h giờ địa phương ngày dayNumber. */
function getSunLongitudeSector(dayNumber: number, timeZone: number): number {
  return INT((sunLongitudeRad(dayNumber - 0.5 - timeZone / 24) / PI) * 6);
}

/** Ngày bắt đầu tháng 11 âm lịch (tháng chứa Đông Chí) của năm dương lịch yy. */
export function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = INT(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitudeSector(nm, timeZone);
  if (sunLong >= 9) nm = getNewMoonDay(k - 1, timeZone);
  return nm;
}

/** Vị trí (tính từ tháng 11) của tháng nhuận trong năm âm lịch có 13 tháng. */
export function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = getSunLongitudeSector(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitudeSector(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeapMonth: boolean;
}

export function solarToLunar(dd: number, mm: number, yy: number, timeZone = 7): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = INT((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k, timeZone);
  // Hiệu chỉnh so với bản gốc: ước lượng k có thể lệch 1 tháng khi điểm Sóc rơi sát
  // nửa đêm (ví dụ 7/5/2054, 9/4/2062) khiến bản gốc trả về "ngày 0".
  if (monthStart > dayNumber) monthStart = getNewMoonDay(k - 1, timeZone);
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = INT((monthStart - a11) / 29);
  let isLeapMonth = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) isLeapMonth = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeapMonth };
}

/** Trả về null nếu ngày âm lịch không tồn tại (ví dụ tháng nhuận không có trong năm). */
export function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, isLeap: boolean, timeZone = 7): SimpleDate | null {
  let a11: number, b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (isLeap && lunarMonth !== leapMonth) return null;
    if (isLeap || off >= leapOff) off += 1;
  } else if (isLeap) {
    return null;
  }
  const monthStart = getNewMoonDay(k + off, timeZone);
  return jdToDate(monthStart + lunarDay - 1);
}

/** Tháng nhuận của năm âm lịch (1..12) hoặc 0 nếu không có. */
export function getLeapMonth(lunarYear: number, timeZone = 7): number {
  const leapInCycle = (a11: number, b11: number): number => {
    if (b11 - a11 <= 365) return 0;
    let leapMonth = getLeapMonthOffset(a11, timeZone) - 2;
    if (leapMonth < 0) leapMonth += 12;
    return leapMonth;
  };
  // Tháng 1..10 của năm Y nằm trong chu kỳ [tháng 11 năm Y-1, tháng 11 năm Y).
  const a = leapInCycle(getLunarMonth11(lunarYear - 1, timeZone), getLunarMonth11(lunarYear, timeZone));
  if (a >= 1 && a <= 10) return a;
  // Tháng 11, 12 nhuận của năm Y nằm trong chu kỳ [tháng 11 năm Y, tháng 11 năm Y+1).
  const b = leapInCycle(getLunarMonth11(lunarYear, timeZone), getLunarMonth11(lunarYear + 1, timeZone));
  if (b >= 11) return b;
  return 0;
}

/** Số ngày của một tháng âm lịch (29 hoặc 30). */
export function lunarMonthLength(lunarMonth: number, lunarYear: number, isLeap: boolean, timeZone = 7): number | null {
  const start = lunarToSolar(1, lunarMonth, lunarYear, isLeap, timeZone);
  if (!start) return null;
  const startJd = jdFromDate(start.day, start.month, start.year);
  const k = INT((startJd + 15 - 2415021.076998695) / 29.530588853);
  let next = getNewMoonDay(k + 1, timeZone);
  if (next <= startJd) next = getNewMoonDay(k + 2, timeZone);
  return next - startJd;
}

export function isValidLunarDate(day: number, month: number, year: number, isLeap: boolean, timeZone = 7): { valid: boolean; reason?: string } {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return { valid: false, reason: "Ngày tháng năm phải là số nguyên" };
  if (month < 1 || month > 12) return { valid: false, reason: "Tháng âm lịch phải từ 1 đến 12" };
  if (day < 1 || day > 30) return { valid: false, reason: "Ngày âm lịch phải từ 1 đến 30" };
  const len = lunarMonthLength(month, year, isLeap, timeZone);
  if (len === null) return { valid: false, reason: `Năm âm lịch ${year} không có tháng ${month} nhuận` };
  if (day > len) return { valid: false, reason: `Tháng ${month}${isLeap ? " nhuận" : ""} năm ${year} chỉ có ${len} ngày` };
  return { valid: true };
}
