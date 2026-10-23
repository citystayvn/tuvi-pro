/**
 * Bảng tra truyền thống được nhập tay từ sách Tử Vi (không sinh từ engine).
 * Chỉ số địa chi: 0 Tý … 11 Hợi.
 */

/**
 * Bảng tìm Cục: hàng = cặp Can năm (Giáp Kỷ, Ất Canh, Bính Tân, Đinh Nhâm, Mậu Quý),
 * cột = cặp cung Mệnh (Tý Sửu, Dần Mão, Thìn Tỵ, Ngọ Mùi, Thân Dậu, Tuất Hợi).
 */
export const CUC_TABLE: number[][] = [
  [2, 6, 3, 5, 4, 6],
  [6, 5, 4, 3, 2, 5],
  [5, 3, 2, 4, 6, 3],
  [3, 4, 6, 2, 5, 4],
  [4, 2, 5, 6, 3, 2],
];

const [Ty, Suu, Dan, Mao, Thin, Ti, Ngo, Mui, Than, Dau, Tuat, Hoi] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Bảng an Tử Vi theo ngày (1..30) cho từng Cục. */
export const TU_VI_TABLE: Record<number, number[]> = {
  2: [Suu, Dan, Dan, Mao, Mao, Thin, Thin, Ti, Ti, Ngo, Ngo, Mui, Mui, Than, Than, Dau, Dau, Tuat, Tuat, Hoi, Hoi, Ty, Ty, Suu, Suu, Dan, Dan, Mao, Mao, Thin],
  3: [Thin, Suu, Dan, Ti, Dan, Mao, Ngo, Mao, Thin, Mui, Thin, Ti, Than, Ti, Ngo, Dau, Ngo, Mui, Tuat, Mui, Than, Hoi, Than, Dau, Ty, Dau, Tuat, Suu, Tuat, Hoi],
  4: [Hoi, Thin, Suu, Dan, Ty, Ti, Dan, Mao, Suu, Ngo, Mao, Thin, Dan, Mui, Thin, Ti, Mao, Than, Ti, Ngo, Thin, Dau, Ngo, Mui, Ti, Tuat, Mui, Than, Ngo, Hoi],
  5: [Ngo, Hoi, Thin, Suu, Dan, Mui, Ty, Ti, Dan, Mao, Than, Suu, Ngo, Mao, Thin, Dau, Dan, Mui, Thin, Ti, Tuat, Mao, Than, Ti, Ngo, Hoi, Thin, Dau, Ngo, Mui],
  6: [Dau, Ngo, Hoi, Thin, Suu, Dan, Tuat, Mui, Ty, Ti, Dan, Mao, Hoi, Than, Suu, Ngo, Mao, Thin, Ty, Dau, Dan, Mui, Thin, Ti, Suu, Tuat, Mao, Than, Ti, Ngo],
};

/** Lộc Tồn theo Can năm. */
export const LOC_TON_TABLE = [Dan, Mao, Ti, Ngo, Ti, Ngo, Than, Dau, Hoi, Ty];

/**
 * Các cặp chính tinh đồng cung với Tử Vi – sự kiện cơ bản của Tử Vi:
 * Tử Phá Sửu Mùi, Tử Phủ Dần Thân, Tử Tham Mão Dậu, Tử Tướng Thìn Tuất, Tử Sát Tỵ Hợi;
 * Tử Vi độc tọa Tý Ngọ (Thiên Phủ ở Thìn/Tuất).
 */
export const TU_VI_COMPANIONS: { tuVi: number; companion: string | null; thienPhu: number }[] = [
  { tuVi: Ty, companion: null, thienPhu: Thin },
  { tuVi: Suu, companion: "pha-quan", thienPhu: Mao },
  { tuVi: Dan, companion: "thien-phu", thienPhu: Dan },
  { tuVi: Mao, companion: "tham-lang", thienPhu: Suu },
  { tuVi: Thin, companion: "thien-tuong", thienPhu: Ty },
  { tuVi: Ti, companion: "that-sat", thienPhu: Hoi },
  { tuVi: Ngo, companion: null, thienPhu: Tuat },
  { tuVi: Mui, companion: "pha-quan", thienPhu: Dau },
  { tuVi: Than, companion: "thien-phu", thienPhu: Than },
  { tuVi: Dau, companion: "tham-lang", thienPhu: Mui },
  { tuVi: Tuat, companion: "thien-tuong", thienPhu: Ngo },
  { tuVi: Hoi, companion: "that-sat", thienPhu: Ti },
];

/** Tứ Hóa theo Can (bảng Việt Nam mặc định): [Lộc, Quyền, Khoa, Kỵ]. */
export const TU_HOA_TABLE: string[][] = [
  ["liem-trinh", "pha-quan", "vu-khuc", "thai-duong"],
  ["thien-co", "thien-luong", "tu-vi", "thai-am"],
  ["thien-dong", "thien-co", "van-xuong", "liem-trinh"],
  ["thai-am", "thien-dong", "thien-co", "cu-mon"],
  ["tham-lang", "thai-am", "huu-bat", "thien-co"],
  ["vu-khuc", "tham-lang", "thien-luong", "van-khuc"],
  ["thai-duong", "vu-khuc", "thai-am", "thien-dong"],
  ["cu-mon", "thai-duong", "van-khuc", "van-xuong"],
  ["thien-luong", "tu-vi", "thien-phu", "vu-khuc"],
  ["pha-quan", "cu-mon", "thai-am", "tham-lang"],
];
