/** Cấu hình trường phái – mọi quy tắc có tranh luận đều được tham số hoá ở đây. */

export interface AstrologySchoolConfig {
  schoolId: string;
  schoolName: string;
  calendarRules: string;
  starPlacementRules: string;
  transformationRules: string;
  brightnessRules: string;
  annualCycleRules: string;
}

export interface CalendarRuleSet {
  id: string;
  /** Múi giờ dùng để lập âm lịch (Việt Nam hiện hành: UTC+7). */
  calendarTimeZone: number;
  /** Dùng UTC+8 cho ngày trước 1968 (lịch lịch sử tại Việt Nam). */
  historicalTimeZoneBefore1968: boolean;
  /**
   * local-clock: dùng giờ đồng hồ tại nơi sinh để xác định ngày & giờ.
   * convert-to-calendar-tz: quy đổi thời điểm sinh sang múi giờ lập lịch (UTC+7).
   */
  timeMode: "local-clock" | "convert-to-calendar-tz";
  /** Giờ Tý muộn (23:00–23:59): tính sang ngày hôm sau hay giữ ngày hiện tại. */
  lateRatHour: "next-day" | "same-day";
  /** Ranh giới năm: Tết Nguyên Đán (âm lịch) hay tiết Lập Xuân. */
  yearBoundary: "lunar-new-year" | "lap-xuan";
  /** Tháng dùng để an sao: tháng âm lịch hay tháng theo tiết khí. */
  monthSystem: "lunar" | "solar-term";
  /** Xử lý tháng nhuận khi dùng tháng âm lịch. */
  leapMonth: "as-current" | "as-next" | "split-15";
}

export interface StarPlacementRuleSet {
  id: string;
  /** Thiên Khôi – Thiên Việt. classic: "Giáp Mậu Canh ngưu dương, Ất Kỷ thử hầu hương, Bính Đinh trư kê vị, Lục Tân phùng mã hổ, Nhâm Quý thố xà tàng". */
  khoiViet: "classic" | "variant-a";
  /** Bảng khởi Hỏa Tinh – Linh Tinh. */
  hoaLinhStart: "classic" | "variant-a";
  /** Chiều an Hỏa – Linh: theo Âm Dương Nam Nữ (Việt Nam) hay luôn thuận (Trung Hoa). */
  hoaLinhDirection: "by-yin-yang-gender" | "always-forward";
  /** Thiên Giải: từ Thân đếm thuận theo tháng, hay đếm nhảy cung (mỗi tháng 2 cung). */
  thienGiai: "count-month" | "skip-palace";
  luuHa: "classic" | "variant-a";
  phaToai: "classic" | "variant-a";
}

export interface TransformationRuleSet {
  id: string;
  /** Năm Canh: "Nhật Vũ Âm Đồng" (Thái Âm Khoa, Thiên Đồng Kỵ) hay "Nhật Vũ Đồng Âm". */
  canh: "nhat-vu-am-dong" | "nhat-vu-dong-am";
  /** Năm Nhâm: Khoa tại Thiên Phủ hay Tả Phụ. */
  nham: "luong-tu-phu-vu" | "luong-tu-ta-vu";
  /** Bắc phái: tính Phi Hóa theo Can của từng cung. */
  flyingTransformations: boolean;
}

export interface BrightnessRuleSet {
  id: string;
  /** Bảng tra đang dùng; "none" = không gán trạng thái. */
  table: "vn-ttl" | "none";
  /** Có gán trạng thái cho phụ tinh có bảng tra không. */
  auxiliary: boolean;
}

export interface AnnualCycleRuleSet {
  id: string;
  /** Tuổi dùng để tính hạn: tuổi mụ (tuổi âm). */
  ageCounting: "nominal";
  /** Chiều vòng Tràng Sinh. */
  trangSinhDirection: "by-yin-yang-gender" | "by-gender";
  /** Tính Tứ Hóa / Lộc Tồn đại hạn theo Can cung đại hạn. */
  decadalStars: boolean;
}

export interface SchoolRuleSet {
  calendar: CalendarRuleSet;
  starPlacement: StarPlacementRuleSet;
  transformation: TransformationRuleSet;
  brightness: BrightnessRuleSet;
  annualCycle: AnnualCycleRuleSet;
}

export interface SchoolDefinition {
  config: AstrologySchoolConfig;
  rules: SchoolRuleSet;
  status: "stable" | "experimental";
  description: string;
}
