import type { SchoolDefinition, SchoolRuleSet } from "./types";

export * from "./types";

const VN_RULES: SchoolRuleSet = {
  calendar: {
    id: "vn-lunar-utc7",
    calendarTimeZone: 7,
    historicalTimeZoneBefore1968: false,
    timeMode: "local-clock",
    lateRatHour: "next-day",
    yearBoundary: "lunar-new-year",
    monthSystem: "lunar",
    leapMonth: "as-current",
  },
  starPlacement: {
    id: "vn-ttl",
    khoiViet: "classic",
    hoaLinhStart: "classic",
    hoaLinhDirection: "by-yin-yang-gender",
    thienGiai: "count-month",
    luuHa: "classic",
    phaToai: "classic",
  },
  transformation: {
    id: "vn-ttl",
    canh: "nhat-vu-am-dong",
    nham: "luong-tu-phu-vu",
    flyingTransformations: false,
  },
  brightness: { id: "vn-ttl", table: "vn-ttl", auxiliary: true },
  annualCycle: { id: "vn-standard", ageCounting: "nominal", trangSinhDirection: "by-yin-yang-gender", decadalStars: true },
};

export const SCHOOLS: Record<string, SchoolDefinition> = {
  "vn-traditional": {
    status: "stable",
    description:
      "Tử Vi Đẩu Số phổ biến tại Việt Nam, theo hệ thống của Thái Thứ Lang (Tử Vi Đẩu Số Tân Biên). Âm lịch Việt Nam UTC+7, năm/tháng âm lịch.",
    config: {
      schoolId: "vn-traditional",
      schoolName: "Việt Nam truyền thống",
      calendarRules: VN_RULES.calendar.id,
      starPlacementRules: VN_RULES.starPlacement.id,
      transformationRules: VN_RULES.transformation.id,
      brightnessRules: VN_RULES.brightness.id,
      annualCycleRules: VN_RULES.annualCycle.id,
    },
    rules: VN_RULES,
  },
  "trung-chau": {
    status: "experimental",
    description:
      "Trung Châu phái (Vương Đình Chi) – THỬ NGHIỆM. Mới chỉ tham số hoá các khác biệt đã xác định: Tứ Hóa Canh/Nhâm, Hỏa Linh luôn an thuận. Chưa có bảng Miếu Hãm riêng nên không gán trạng thái sao.",
    config: {
      schoolId: "trung-chau",
      schoolName: "Trung Châu phái (thử nghiệm)",
      calendarRules: "vn-lunar-utc7",
      starPlacementRules: "trung-chau-partial",
      transformationRules: "trung-chau",
      brightnessRules: "none",
      annualCycleRules: "vn-standard",
    },
    rules: {
      ...VN_RULES,
      starPlacement: { ...VN_RULES.starPlacement, id: "trung-chau-partial", hoaLinhDirection: "always-forward" },
      transformation: { id: "trung-chau", canh: "nhat-vu-am-dong", nham: "luong-tu-ta-vu", flyingTransformations: false },
      brightness: { id: "none", table: "none", auxiliary: false },
    },
  },
  "bac-phai": {
    status: "experimental",
    description:
      "Bắc phái Phi Tinh Tứ Hóa – THỬ NGHIỆM. An sao như hệ Việt Nam, bổ sung Phi Hóa theo Can từng cung (Can cung theo Ngũ Hổ Độn). Chưa triển khai luận giải Phi Tinh.",
    config: {
      schoolId: "bac-phai",
      schoolName: "Bắc phái Phi Tinh (thử nghiệm)",
      calendarRules: "vn-lunar-utc7",
      starPlacementRules: "vn-ttl",
      transformationRules: "bac-phai",
      brightnessRules: "vn-ttl",
      annualCycleRules: "vn-standard",
    },
    rules: {
      ...VN_RULES,
      transformation: { id: "bac-phai", canh: "nhat-vu-am-dong", nham: "luong-tu-ta-vu", flyingTransformations: true },
    },
  },
};

export const DEFAULT_SCHOOL_ID = "vn-traditional";

export function getSchool(id: string): SchoolDefinition {
  const s = SCHOOLS[id];
  if (!s) throw new Error(`Không tìm thấy trường phái: ${id}`);
  return s;
}

/** Áp dụng các ghi đè quy tắc của người dùng lên bộ quy tắc của trường phái. */
export function resolveRules(schoolId: string, overrides?: DeepPartial<SchoolRuleSet>): SchoolRuleSet {
  const base = getSchool(schoolId).rules;
  if (!overrides) return base;
  return {
    calendar: { ...base.calendar, ...overrides.calendar },
    starPlacement: { ...base.starPlacement, ...overrides.starPlacement },
    transformation: { ...base.transformation, ...overrides.transformation },
    brightness: { ...base.brightness, ...overrides.brightness },
    annualCycle: { ...base.annualCycle, ...overrides.annualCycle },
  };
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K] };
