/**
 * An Mệnh, Thân, 12 cung, Can cung, Ngũ hành Cục.
 * Nguồn: quy tắc an Mệnh Thân phổ biến (Thái Thứ Lang – Tử Vi Đẩu Số Tân Biên):
 *  - Từ cung Dần kể là tháng Giêng, đếm thuận đến tháng sinh.
 *  - Từ cung tháng sinh kể là giờ Tý, đếm NGHỊCH đến giờ sinh → Mệnh; đếm THUẬN → Thân.
 *  - 12 cung an nghịch từ Mệnh: Mệnh, Huynh Đệ, Phu Thê, Tử Tức, Tài Bạch, Tật Ách,
 *    Thiên Di, Nô Bộc, Quan Lộc, Điền Trạch, Phúc Đức, Phụ Mẫu.
 *  - Can cung theo Ngũ Hổ Độn (Can tháng Dần theo Can năm).
 *  - Cục = Ngũ hành Nạp Âm của Can Chi cung Mệnh.
 */
import type { BranchIndex, Element, Gender, StemIndex } from "@/types/astrology";
import { branchAt, stemOfBranchInYear, stemYinYang } from "@/core/stems-branches";
import { CUC_NUMBER, napAm } from "@/core/elements";

export const PALACE_NAMES = [
  "Mệnh",
  "Huynh Đệ",
  "Phu Thê",
  "Tử Tức",
  "Tài Bạch",
  "Tật Ách",
  "Thiên Di",
  "Nô Bộc",
  "Quan Lộc",
  "Điền Trạch",
  "Phúc Đức",
  "Phụ Mẫu",
] as const;

export const PALACE_KEYS = [
  "menh", "huynh-de", "phu-the", "tu-tuc", "tai-bach", "tat-ach",
  "thien-di", "no-boc", "quan-loc", "dien-trach", "phuc-duc", "phu-mau",
] as const;
export type PalaceKey = (typeof PALACE_KEYS)[number];

/** Vị trí cung tháng sinh (tháng 1 = Dần). */
export function monthPalace(month: number): BranchIndex {
  return branchAt(2 + month - 1);
}

export function menhBranch(month: number, hourBranch: BranchIndex): BranchIndex {
  return branchAt(monthPalace(month) - hourBranch);
}

export function thanBranch(month: number, hourBranch: BranchIndex): BranchIndex {
  return branchAt(monthPalace(month) + hourBranch);
}

/** Chỉ số tên cung (0 = Mệnh … 11 = Phụ Mẫu) tại địa chi branch. */
export function palaceIndexAt(branch: BranchIndex, menh: BranchIndex): number {
  return branchAt(menh - branch);
}

/** Địa chi của cung có chỉ số tên palaceIndex. */
export function branchOfPalace(palaceIndex: number, menh: BranchIndex): BranchIndex {
  return branchAt(menh - palaceIndex);
}

export function palaceStems(yStem: StemIndex): StemIndex[] {
  return Array.from({ length: 12 }, (_, b) => stemOfBranchInYear(yStem, b));
}

export interface CucInfo {
  element: Element;
  number: number;
  napAmName: string;
}

export function computeCuc(yStem: StemIndex, menh: BranchIndex): CucInfo {
  const stem = stemOfBranchInYear(yStem, menh);
  const na = napAm(stem, menh);
  return { element: na.element, number: CUC_NUMBER[na.element], napAmName: na.name };
}

/** Dương Nam / Âm Nữ → thuận (+1); Âm Nam / Dương Nữ → nghịch (−1). */
export function yinYangGenderDirection(yStem: StemIndex, gender: Gender): 1 | -1 {
  const duong = stemYinYang(yStem) === "duong";
  return (duong && gender === "male") || (!duong && gender === "female") ? 1 : -1;
}

export function yinYangGenderLabel(yStem: StemIndex, gender: Gender): string {
  return `${stemYinYang(yStem) === "duong" ? "Dương" : "Âm"} ${gender === "male" ? "Nam" : "Nữ"}`;
}

/** Chủ Mệnh theo địa chi cung Mệnh. */
export const CHU_MENH = ["tham-lang", "cu-mon", "loc-ton", "van-khuc", "liem-trinh", "vu-khuc", "pha-quan", "vu-khuc", "liem-trinh", "van-khuc", "loc-ton", "cu-mon"];
/** Chủ Thân theo địa chi năm sinh. */
export const CHU_THAN = ["linh-tinh", "thien-tuong", "thien-luong", "thien-dong", "van-xuong", "thien-co", "linh-tinh", "thien-tuong", "thien-luong", "thien-dong", "van-xuong", "thien-co"];

/** Tam phương tứ chính: bản cung, xung chiếu (đối cung) và hai cung tam hợp. */
export function tamPhuongTuChinh(branch: BranchIndex) {
  return {
    self: branch,
    opposite: branchAt(branch + 6),
    trine: [branchAt(branch + 4), branchAt(branch + 8)] as [BranchIndex, BranchIndex],
  };
}

/** Cung giáp (hai cung kề). */
export function flankingPalaces(branch: BranchIndex): [BranchIndex, BranchIndex] {
  return [branchAt(branch - 1), branchAt(branch + 1)];
}
