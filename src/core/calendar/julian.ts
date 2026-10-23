/**
 * Số ngày Julius (Julian Day Number) cho lịch Gregory/Julius.
 * Công thức theo "Calendar FAQ" (Claus Tøndering) – cũng là công thức dùng trong
 * thuật toán Âm lịch Việt Nam của Hồ Ngọc Đức.
 */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

export interface SimpleDate {
  day: number;
  month: number;
  year: number;
}

export function jdToDate(jd: number): SimpleDate {
  let b: number, c: number;
  if (jd > 2299160) {
    const a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  return {
    day: e - Math.floor((153 * m + 2) / 5) + 1,
    month: m + 3 - 12 * Math.floor(m / 10),
    year: b * 100 + d - 4800 + Math.floor(m / 10),
  };
}

export function isGregorianLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInSolarMonth(month: number, year: number): number {
  return [31, isGregorianLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function isValidSolarDate(d: number, m: number, y: number): boolean {
  return Number.isInteger(d) && Number.isInteger(m) && Number.isInteger(y) && m >= 1 && m <= 12 && d >= 1 && d <= daysInSolarMonth(m, y);
}

/** Cộng/trừ ngày trên lịch dương. */
export function addDays(date: SimpleDate, days: number): SimpleDate {
  return jdToDate(jdFromDate(date.day, date.month, date.year) + days);
}
