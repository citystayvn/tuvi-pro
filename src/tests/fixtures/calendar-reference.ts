/**
 * Dữ liệu tham chiếu lịch pháp – lấy từ sự kiện lịch sử / thiên văn đã công bố,
 * KHÔNG sinh ra từ engine.
 */

/** Ngày mùng 1 Tết Nguyên Đán tại Việt Nam (dương lịch). */
export const VN_TET_DATES: { lunarYear: number; solar: [number, number, number]; note?: string }[] = [
  { lunarYear: 1968, solar: [29, 1, 1968], note: "Tết Mậu Thân – VN sớm hơn Trung Quốc 1 ngày" },
  { lunarYear: 1975, solar: [11, 2, 1975] },
  { lunarYear: 1985, solar: [21, 1, 1985], note: "VN sớm hơn Trung Quốc 1 tháng" },
  { lunarYear: 1990, solar: [27, 1, 1990] },
  { lunarYear: 1995, solar: [31, 1, 1995] },
  { lunarYear: 2000, solar: [5, 2, 2000] },
  { lunarYear: 2007, solar: [17, 2, 2007], note: "VN sớm hơn Trung Quốc 1 ngày" },
  { lunarYear: 2010, solar: [14, 2, 2010] },
  { lunarYear: 2015, solar: [19, 2, 2015] },
  { lunarYear: 2020, solar: [25, 1, 2020] },
  { lunarYear: 2023, solar: [22, 1, 2023] },
  { lunarYear: 2024, solar: [10, 2, 2024] },
  { lunarYear: 2025, solar: [29, 1, 2025] },
  { lunarYear: 2026, solar: [17, 2, 2026] },
];

/** Tháng nhuận âm lịch Việt Nam. */
export const VN_LEAP_MONTHS: [number, number][] = [
  [2001, 4],
  [2004, 2],
  [2006, 7],
  [2009, 5],
  [2012, 4],
  [2014, 9],
  [2017, 6],
  [2020, 4],
  [2023, 2],
  [2025, 6],
  [2028, 5],
  [2033, 11],
];
export const VN_NO_LEAP_YEARS = [2000, 2005, 2010, 2016, 2019, 2021, 2022, 2024, 2026];

/** Thời điểm phân/chí và Lập Xuân (UTC) theo số liệu thiên văn công bố. */
export const SOLAR_TERM_MOMENTS_UTC: { name: string; longitude: number; utc: [number, number, number, number, number] }[] = [
  { name: "Lập Xuân 2024", longitude: 315, utc: [2024, 2, 4, 8, 27] },
  { name: "Xuân Phân 2024", longitude: 0, utc: [2024, 3, 20, 3, 6] },
  { name: "Hạ Chí 2024", longitude: 90, utc: [2024, 6, 20, 20, 51] },
  { name: "Thu Phân 2024", longitude: 180, utc: [2024, 9, 22, 12, 44] },
  { name: "Đông Chí 2024", longitude: 270, utc: [2024, 12, 21, 9, 21] },
];

/** Can Chi ngày đã biết. */
export const KNOWN_DAY_PILLARS: { date: [number, number, number]; stem: number; branch: number; label: string }[] = [
  { date: [1, 1, 2000], stem: 4, branch: 6, label: "Mậu Ngọ" },
  { date: [10, 2, 2024], stem: 0, branch: 4, label: "Giáp Thìn (mùng 1 Tết Giáp Thìn)" },
];
