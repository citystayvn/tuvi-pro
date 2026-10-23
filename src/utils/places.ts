/** Danh sách nơi sinh gợi ý kèm múi giờ chuẩn (giờ lệch UTC, không tính giờ mùa hè). */
export const PLACE_PRESETS: { name: string; tz: number }[] = [
  { name: "Hà Nội", tz: 7 },
  { name: "TP. Hồ Chí Minh", tz: 7 },
  { name: "Đà Nẵng", tz: 7 },
  { name: "Hải Phòng", tz: 7 },
  { name: "Cần Thơ", tz: 7 },
  { name: "Huế", tz: 7 },
  { name: "Bangkok", tz: 7 },
  { name: "Bắc Kinh / Đài Bắc / Singapore", tz: 8 },
  { name: "Tokyo / Seoul", tz: 9 },
  { name: "Sydney", tz: 10 },
  { name: "New Delhi", tz: 5.5 },
  { name: "Moscow", tz: 3 },
  { name: "Paris / Berlin", tz: 1 },
  { name: "London", tz: 0 },
  { name: "New York", tz: -5 },
  { name: "Houston", tz: -6 },
  { name: "Los Angeles / San Jose", tz: -8 },
];

export const TIMEZONE_OPTIONS = [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 3.5, 4, 4.5, 5, 5.5, 5.75, 6, 6.5, 7, 8, 9, 9.5, 10, 11, 12, 13, 14];

export function formatTz(tz: number): string {
  const sign = tz >= 0 ? "+" : "−";
  const abs = Math.abs(tz);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return `UTC${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
