/**
 * Tứ Hóa theo Thiên Can.
 * Bảng gốc (Việt Nam – Thái Thứ Lang, cũng là bảng phổ biến của Trung Hoa) với hai
 * điểm khác biệt được tham số hoá: năm Canh và năm Nhâm.
 *
 *   Giáp: Liêm Phá Vũ Dương      Ất: Cơ Lương Tử Âm       Bính: Đồng Cơ Xương Liêm
 *   Đinh: Âm Đồng Cơ Cự          Mậu: Tham Âm Bật Cơ      Kỷ:   Vũ Tham Lương Khúc
 *   Canh: Dương Vũ Âm Đồng | Dương Vũ Đồng Âm
 *   Tân:  Cự Dương Khúc Xương    Nhâm: Lương Tử Phủ Vũ | Lương Tử Tả Vũ
 *   Quý:  Phá Cự Âm Tham
 */
import type { StemIndex, Transformation } from "@/types/astrology";
import type { TransformationRuleSet } from "@/config/schools/types";

export const TRANSFORMATION_ORDER: Transformation[] = ["LOC", "QUYEN", "KHOA", "KY"];
export const TRANSFORMATION_NAMES: Record<Transformation, string> = {
  LOC: "Hóa Lộc",
  QUYEN: "Hóa Quyền",
  KHOA: "Hóa Khoa",
  KY: "Hóa Kỵ",
};
export const TRANSFORMATION_STAR_IDS: Record<Transformation, string> = {
  LOC: "hoa-loc",
  QUYEN: "hoa-quyen",
  KHOA: "hoa-khoa",
  KY: "hoa-ky",
};

const BASE: string[][] = [
  ["liem-trinh", "pha-quan", "vu-khuc", "thai-duong"],
  ["thien-co", "thien-luong", "tu-vi", "thai-am"],
  ["thien-dong", "thien-co", "van-xuong", "liem-trinh"],
  ["thai-am", "thien-dong", "thien-co", "cu-mon"],
  ["tham-lang", "thai-am", "huu-bat", "thien-co"],
  ["vu-khuc", "tham-lang", "thien-luong", "van-khuc"],
  ["thai-duong", "vu-khuc", "thai-am", "thien-dong"], // Canh – nhat-vu-am-dong
  ["cu-mon", "thai-duong", "van-khuc", "van-xuong"],
  ["thien-luong", "tu-vi", "thien-phu", "vu-khuc"], // Nhâm – luong-tu-phu-vu
  ["pha-quan", "cu-mon", "thai-am", "tham-lang"],
];

/** Trả về [sao Hóa Lộc, Quyền, Khoa, Kỵ] cho Can stem. */
export function transformationsForStem(stem: StemIndex, rules: Pick<TransformationRuleSet, "canh" | "nham">): string[] {
  const row = [...BASE[stem]];
  if (stem === 6 && rules.canh === "nhat-vu-dong-am") {
    row[2] = "thien-dong";
    row[3] = "thai-am";
  }
  if (stem === 8 && rules.nham === "luong-tu-ta-vu") {
    row[2] = "ta-phu";
  }
  return row;
}
