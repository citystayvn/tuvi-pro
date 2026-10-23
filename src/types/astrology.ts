/**
 * Kiểu dữ liệu nền tảng của hệ thống Tử Vi Đẩu Số.
 * Toàn bộ chỉ số dùng quy ước:
 *   - Thiên Can (stem):  0 Giáp … 9 Quý
 *   - Địa Chi (branch):  0 Tý … 11 Hợi  (đồng thời là chỉ số cung trên địa bàn)
 */

export type StemIndex = number; // 0..9
export type BranchIndex = number; // 0..11

export type Gender = "male" | "female";
export type YinYang = "duong" | "am";
export type Element = "KIM" | "MOC" | "THUY" | "HOA" | "THO";

export type Brightness = "MIEU" | "VUONG" | "DAC" | "BINH" | "HAM" | "UNDEFINED";

export type Transformation = "LOC" | "QUYEN" | "KHOA" | "KY";

/** Lớp dữ liệu – không bao giờ trộn lẫn nguyên cục với vận hạn. */
export type StarLayer = "natal" | "decadal" | "annual";

export type StarCategory =
  | "main" // 14 chính tinh
  | "luc-cat" // Lục cát tinh
  | "luc-sat" // Lục sát tinh
  | "transformation" // Tứ Hóa
  | "loc-ton" // Lộc Tồn, Thiên Mã
  | "minor" // Các phụ tinh khác
  | "thai-tue-cycle" // Vòng Thái Tuế
  | "trang-sinh-cycle" // Vòng Tràng Sinh
  | "bac-si-cycle" // Vòng Bác Sĩ
  | "tuan-triet"; // Tuần, Triệt

/** Tính chất dùng cho hiển thị màu sắc. Không phải luận giải. */
export type StarNature = "good" | "bad" | "neutral";

/** Mức độ kiểm chứng của một quy tắc an sao. */
export type VerificationLevel =
  /** Kết quả khớp bảng tra truyền thống / dữ liệu độc lập trong bộ Reference Tests. */
  | "reference-verified"
  /** Có quy tắc từ tài liệu, có unit test, đã đối chiếu chéo với một triển khai độc lập. */
  | "cross-checked"
  /** Có quy tắc, có unit test, CHƯA đối chiếu độc lập. */
  | "rule-tested"
  /** Các nguồn mâu thuẫn – triển khai thành tuỳ chọn cấu hình. */
  | "conflicting";

export type ImplementationStatus = "implemented" | "not-implemented";

export interface Star {
  id: string;
  name: string;
  category: StarCategory;
  palaceId: string;
  element?: Element;
  brightness?: Brightness;
  transformation?: Transformation;
  sourceRuleId: string;
}
