/**
 * Bảng Miếu – Vượng – Đắc – Bình – Hãm theo địa chi.
 *
 * Bảng "vn-ttl": theo hệ thống Thái Thứ Lang (Tử Vi Đẩu Số Tân Biên) như được lưu
 * truyền trong tài liệu Tử Vi Việt Nam. Đã đối chiếu chéo với một triển khai độc lập
 * (mã nguồn mở lasotuvi) – 13/14 chính tinh trùng khớp hoàn toàn; triển khai đó
 * không có dữ liệu cho Thiên Phủ.
 *
 * Nguyên tắc: không suy luận trạng thái từ Ngũ hành; ô nào nguồn chưa thống nhất
 * để UNDEFINED.
 */
import type { BranchIndex, Brightness } from "@/types/astrology";

const M = "MIEU", V = "VUONG", D = "DAC", B = "BINH", H = "HAM", U = "UNDEFINED";
type Row = Brightness[];

//                    Tý Sửu Dần Mão Thìn Tỵ Ngọ Mùi Thân Dậu Tuất Hợi
const VN_TTL_MAIN: Record<string, Row> = {
  "tu-vi":       [B, D, M, B, V, M, M, D, M, B, V, B],
  "thien-co":    [D, D, H, M, M, V, D, D, V, M, M, H],
  "thai-duong":  [H, D, V, V, V, M, M, D, H, H, H, H],
  "vu-khuc":     [V, M, V, D, M, H, V, M, V, D, M, H],
  "thien-dong":  [V, H, M, D, H, D, H, H, M, H, H, D],
  "liem-trinh":  [V, D, V, H, M, H, V, D, V, H, M, H],
  // Thiên Phủ: Sửu, Mùi chưa thống nhất giữa các nguồn → UNDEFINED.
  "thien-phu":   [M, U, M, B, V, D, M, U, M, B, V, D],
  "thai-am":     [V, D, H, H, H, H, H, D, V, M, M, M],
  "tham-lang":   [H, M, D, H, V, H, H, M, D, H, V, H],
  "cu-mon":      [V, H, V, M, H, H, V, H, D, M, H, D],
  "thien-tuong": [V, D, M, H, V, D, V, D, M, H, V, D],
  "thien-luong": [V, D, V, V, M, H, M, D, V, H, M, H],
  "that-sat":    [M, D, M, H, H, V, M, D, M, H, H, V],
  "pha-quan":    [M, V, H, H, D, H, M, V, H, H, D, H],
} as Record<string, Row>;

/** Phụ tinh: chỉ những sao có quy tắc Đắc/Hãm rõ ràng. */
const VN_TTL_AUX: Record<string, Row> = {
  "kinh-duong": [H, D, H, H, D, H, H, D, H, H, D, H],
  "da-la":      [H, D, H, H, D, H, H, D, H, H, D, H],
  "hoa-tinh":   [H, H, D, D, D, D, D, H, H, H, H, H],
  "linh-tinh":  [H, H, D, D, D, D, D, H, H, H, H, H],
  "dia-khong":  [H, H, D, H, H, D, H, H, D, H, H, D],
  "dia-kiep":   [H, H, D, H, H, D, H, H, D, H, H, D],
} as Record<string, Row>;

export const BRIGHTNESS_TABLES = { "vn-ttl": { main: VN_TTL_MAIN, auxiliary: VN_TTL_AUX } };

export const BRIGHTNESS_LABEL: Record<Brightness, string> = {
  MIEU: "Miếu",
  VUONG: "Vượng",
  DAC: "Đắc",
  BINH: "Bình",
  HAM: "Hãm",
  UNDEFINED: "Chưa xác định",
};
export const BRIGHTNESS_SHORT: Record<Brightness, string> = {
  MIEU: "M",
  VUONG: "V",
  DAC: "Đ",
  BINH: "B",
  HAM: "H",
  UNDEFINED: "",
};

export function brightnessOf(
  starId: string,
  branch: BranchIndex,
  table: "vn-ttl" | "none",
  includeAuxiliary: boolean,
): Brightness | undefined {
  if (table === "none") return undefined;
  const t = BRIGHTNESS_TABLES[table];
  const row = t.main[starId] ?? (includeAuxiliary ? t.auxiliary[starId] : undefined);
  if (!row) return undefined;
  return row[branch];
}
