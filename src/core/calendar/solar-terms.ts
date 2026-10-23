/**
 * Tiết khí – 24 vị trí của Mặt Trời trên Hoàng đạo (mỗi 15°).
 *
 * Kinh độ biểu kiến của Mặt Trời theo Jean Meeus, "Astronomical Algorithms",
 * chương 25 (độ chính xác thấp, sai số ≈ 0.01° ≈ 15 phút thời gian), có hiệu chỉnh
 * chương động + quang sai, và ΔT theo đa thức Espenak–Meeus (NASA, 2006).
 *
 * GIỚI HẠN: thời điểm giao tiết có sai số cỡ ±15 phút. Với người sinh sát giờ giao
 * tiết (đặc biệt Lập Xuân khi dùng năm theo tiết khí) cần cảnh báo cho người dùng.
 */
import { mod } from "@/core/stems-branches";

export const SOLAR_TERMS = [
  "Xuân Phân", "Thanh Minh", "Cốc Vũ", "Lập Hạ", "Tiểu Mãn", "Mang Chủng",
  "Hạ Chí", "Tiểu Thử", "Đại Thử", "Lập Thu", "Xử Thử", "Bạch Lộ",
  "Thu Phân", "Hàn Lộ", "Sương Giáng", "Lập Đông", "Tiểu Tuyết", "Đại Tuyết",
  "Đông Chí", "Tiểu Hàn", "Đại Hàn", "Lập Xuân", "Vũ Thủy", "Kinh Trập",
] as const;

/** Sai số ước lượng (phút) của thời điểm giao tiết. */
export const SOLAR_TERM_UNCERTAINTY_MINUTES = 15;

/** ΔT = TT − UT (giây), đa thức Espenak–Meeus cho 1800–2150. */
export function deltaTSeconds(yearFraction: number): number {
  const y = yearFraction;
  if (y < 1800) {
    const u = (y - 1820) / 100;
    return -20 + 32 * u * u;
  }
  if (y < 1860) {
    const t = y - 1800;
    return 13.72 - 0.332447 * t + 0.0068612 * t ** 2 + 0.0041116 * t ** 3 - 0.00037436 * t ** 4 + 0.0000121272 * t ** 5 - 0.0000001699 * t ** 6 + 0.000000000875 * t ** 7;
  }
  if (y < 1900) {
    const t = y - 1860;
    return 7.62 + 0.5737 * t - 0.251754 * t ** 2 + 0.01680668 * t ** 3 - 0.0004473624 * t ** 4 + t ** 5 / 233174;
  }
  if (y < 1920) {
    const t = y - 1900;
    return -2.79 + 1.494119 * t - 0.0598939 * t ** 2 + 0.0061966 * t ** 3 - 0.000197 * t ** 4;
  }
  if (y < 1941) {
    const t = y - 1920;
    return 21.2 + 0.84493 * t - 0.0761 * t ** 2 + 0.0020936 * t ** 3;
  }
  if (y < 1961) {
    const t = y - 1950;
    return 29.07 + 0.407 * t - t ** 2 / 233 + t ** 3 / 2547;
  }
  if (y < 1986) {
    const t = y - 1975;
    return 45.45 + 1.067 * t - t ** 2 / 260 - t ** 3 / 718;
  }
  if (y < 2005) {
    const t = y - 2000;
    return 63.86 + 0.3345 * t - 0.060374 * t ** 2 + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  }
  if (y < 2050) {
    const t = y - 2000;
    return 62.92 + 0.32217 * t + 0.005589 * t ** 2;
  }
  if (y < 2150) {
    return -20 + 32 * ((y - 1820) / 100) ** 2 - 0.5628 * (2150 - y);
  }
  const u = (y - 1820) / 100;
  return -20 + 32 * u * u;
}

/** Kinh độ biểu kiến của Mặt Trời (độ, 0..360) tại thời điểm jdUT (Julian Day, giờ UT). */
export function apparentSunLongitude(jdUT: number): number {
  const year = 2000 + (jdUT - 2451545.0) / 365.25;
  const jde = jdUT + deltaTSeconds(year) / 86400;
  const T = (jde - 2451545.0) / 36525;
  const dr = Math.PI / 180;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * dr) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) +
    0.000289 * Math.sin(3 * M * dr);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const apparent = trueLong - 0.00569 - 0.00478 * Math.sin(omega * dr);
  return mod(apparent, 360);
}

/** Tìm thời điểm (JD UT) Mặt Trời đạt kinh độ targetDeg, gần thời điểm approxJd. */
export function findSunLongitudeMoment(targetDeg: number, approxJd: number): number {
  let jd = approxJd;
  for (let i = 0; i < 50; i++) {
    const diff = mod(targetDeg - apparentSunLongitude(jd) + 180, 360) - 180;
    if (Math.abs(diff) < 1e-7) break;
    jd += (diff / 360) * 365.2422;
  }
  return jd;
}

/** JD UT của một thời điểm dương lịch theo giờ địa phương (tz = giờ lệch UTC). */
export function jdFromLocal(year: number, month: number, day: number, hour: number, minute: number, tz: number, jdnOf: (d: number, m: number, y: number) => number): number {
  return jdnOf(day, month, year) - 0.5 + (hour + minute / 60 - tz) / 24;
}

export interface SolarTermInfo {
  index: number; // 0 = Xuân Phân
  name: string;
  longitude: number;
}

export function solarTermAt(jdUT: number): SolarTermInfo {
  const lon = apparentSunLongitude(jdUT);
  const index = Math.floor(lon / 15);
  return { index, name: SOLAR_TERMS[index], longitude: lon };
}

/**
 * Tháng theo tiết khí (tiết lệnh): 1 = tháng Dần (từ Lập Xuân 315°), 2 = Mão (Kinh Trập 345°) …
 */
export function solarTermMonth(jdUT: number): number {
  const lon = apparentSunLongitude(jdUT);
  return Math.floor(mod(lon - 315, 360) / 30) + 1;
}

/** Thời điểm Lập Xuân (JD UT) của năm dương lịch year. */
export function lapXuanMoment(year: number, jdnOf: (d: number, m: number, y: number) => number): number {
  return findSunLongitudeMoment(315, jdnOf(4, 2, year));
}

/** Khoảng cách (phút) tới ranh giới tiết khí gần nhất (bội số 15°). */
export function minutesToNearestTermBoundary(jdUT: number): { minutes: number; termName: string } {
  const lon = apparentSunLongitude(jdUT);
  const lower = Math.floor(lon / 15) * 15;
  const upper = lower + 15;
  const target = lon - lower < upper - lon ? lower : mod(upper, 360);
  const moment = findSunLongitudeMoment(target, jdUT);
  return { minutes: Math.abs(moment - jdUT) * 1440, termName: SOLAR_TERMS[Math.round(target / 15) % 24] };
}

/** 24 tiết khí của một năm dương lịch, thời điểm theo JD UT. */
export function solarTermsOfYear(year: number, jdnOf: (d: number, m: number, y: number) => number): { name: string; longitude: number; jdUT: number }[] {
  const result: { name: string; longitude: number; jdUT: number }[] = [];
  // Bắt đầu từ Tiểu Hàn (285°) đầu tháng 1.
  for (let i = 0; i < 24; i++) {
    const lon = mod(285 + i * 15, 360);
    const approx = jdnOf(6, 1, year) + i * 15.2;
    const jd = findSunLongitudeMoment(lon, approx);
    result.push({ name: SOLAR_TERMS[lon / 15], longitude: lon, jdUT: jd });
  }
  return result;
}
