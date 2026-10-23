import type { Element, Transformation } from "@/types/astrology";
import type { ChartStar } from "@/types/chart";

export const ELEMENT_TEXT: Record<Element, string> = {
  KIM: "text-el-kim",
  MOC: "text-el-moc",
  THUY: "text-el-thuy",
  HOA: "text-el-hoa",
  THO: "text-el-tho",
};

export const TRANSFORMATION_STYLE: Record<Transformation, { label: string; short: string; className: string }> = {
  LOC: { label: "Hóa Lộc", short: "Lộc", className: "bg-emerald-600 text-white" },
  QUYEN: { label: "Hóa Quyền", short: "Quyền", className: "bg-amber-500 text-white" },
  KHOA: { label: "Hóa Khoa", short: "Khoa", className: "bg-sky-600 text-white" },
  KY: { label: "Hóa Kỵ", short: "Kỵ", className: "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900" },
};

const TRANSFORMATION_TEXT: Record<string, string> = {
  "hoa-loc": "text-emerald-600 dark:text-emerald-400 font-semibold",
  "hoa-quyen": "text-amber-600 dark:text-amber-400 font-semibold",
  "hoa-khoa": "text-sky-600 dark:text-sky-400 font-semibold",
  "hoa-ky": "text-zinc-700 dark:text-zinc-300 font-semibold",
};

/** Màu sao theo Ngũ hành (cách tô lá số truyền thống); sao Tứ Hóa giữ màu riêng. */
export function starTextClass(s: ChartStar): string {
  if (s.category === "transformation") return TRANSFORMATION_TEXT[s.id] ?? "";
  if (s.element) return ELEMENT_TEXT[s.element];
  return "text-foreground";
}

/** Tên rút gọn của 12 cung dùng cho nhãn ĐV./LN. */
export const PALACE_SHORT = ["MỆNH", "HUYNH", "PHỐI", "TỬ", "TÀI", "TẬT", "DI", "NÔ", "QUAN", "ĐIỀN", "PHÚC", "PHỤ"];

/**
 * Vị trí của 12 địa chi trên lưới 4×4 (bố cục lá số truyền thống, cố định):
 *   Tỵ   Ngọ  Mùi  Thân
 *   Thìn [ trung tâm ] Dậu
 *   Mão  [ trung tâm ] Tuất
 *   Dần  Sửu  Tý   Hợi
 */
export const BRANCH_GRID: Record<number, { row: number; col: number }> = {
  5: { row: 1, col: 1 },
  6: { row: 1, col: 2 },
  7: { row: 1, col: 3 },
  8: { row: 1, col: 4 },
  9: { row: 2, col: 4 },
  10: { row: 3, col: 4 },
  11: { row: 4, col: 4 },
  0: { row: 4, col: 3 },
  1: { row: 4, col: 2 },
  2: { row: 4, col: 1 },
  3: { row: 3, col: 1 },
  4: { row: 2, col: 1 },
};
