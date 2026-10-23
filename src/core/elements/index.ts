import type { BranchIndex, Element, StemIndex } from "@/types/astrology";
import { sexagenaryIndex } from "@/core/stems-branches";

export const ELEMENT_NAMES: Record<Element, string> = {
  KIM: "Kim",
  MOC: "Mộc",
  THUY: "Thủy",
  HOA: "Hỏa",
  THO: "Thổ",
};

/**
 * Bảng Nạp Âm Lục thập hoa giáp – mỗi cặp Can Chi liên tiếp dùng chung một nạp âm.
 * Nguồn: bảng Nạp Âm truyền thống (Lục thập hoa giáp nạp âm).
 */
export const NAP_AM: { name: string; element: Element }[] = [
  { name: "Hải Trung Kim", element: "KIM" },
  { name: "Lô Trung Hỏa", element: "HOA" },
  { name: "Đại Lâm Mộc", element: "MOC" },
  { name: "Lộ Bàng Thổ", element: "THO" },
  { name: "Kiếm Phong Kim", element: "KIM" },
  { name: "Sơn Đầu Hỏa", element: "HOA" },
  { name: "Giản Hạ Thủy", element: "THUY" },
  { name: "Thành Đầu Thổ", element: "THO" },
  { name: "Bạch Lạp Kim", element: "KIM" },
  { name: "Dương Liễu Mộc", element: "MOC" },
  { name: "Tuyền Trung Thủy", element: "THUY" },
  { name: "Ốc Thượng Thổ", element: "THO" },
  { name: "Tích Lịch Hỏa", element: "HOA" },
  { name: "Tùng Bách Mộc", element: "MOC" },
  { name: "Trường Lưu Thủy", element: "THUY" },
  { name: "Sa Trung Kim", element: "KIM" },
  { name: "Sơn Hạ Hỏa", element: "HOA" },
  { name: "Bình Địa Mộc", element: "MOC" },
  { name: "Bích Thượng Thổ", element: "THO" },
  { name: "Kim Bạch Kim", element: "KIM" },
  { name: "Phú Đăng Hỏa", element: "HOA" },
  { name: "Thiên Hà Thủy", element: "THUY" },
  { name: "Đại Dịch Thổ", element: "THO" },
  { name: "Thoa Xuyến Kim", element: "KIM" },
  { name: "Tang Đố Mộc", element: "MOC" },
  { name: "Đại Khê Thủy", element: "THUY" },
  { name: "Sa Trung Thổ", element: "THO" },
  { name: "Thiên Thượng Hỏa", element: "HOA" },
  { name: "Thạch Lựu Mộc", element: "MOC" },
  { name: "Đại Hải Thủy", element: "THUY" },
];

export function napAm(stem: StemIndex, branch: BranchIndex) {
  return NAP_AM[Math.floor(sexagenaryIndex(stem, branch) / 2)];
}

/** Ngũ hành Cục: Thủy nhị, Mộc tam, Kim tứ, Thổ ngũ, Hỏa lục. */
export const CUC_NUMBER: Record<Element, number> = { THUY: 2, MOC: 3, KIM: 4, THO: 5, HOA: 6 };
export const CUC_NAMES: Record<number, string> = {
  2: "Thủy Nhị Cục",
  3: "Mộc Tam Cục",
  4: "Kim Tứ Cục",
  5: "Thổ Ngũ Cục",
  6: "Hỏa Lục Cục",
};

const GENERATES: Record<Element, Element> = { MOC: "HOA", HOA: "THO", THO: "KIM", KIM: "THUY", THUY: "MOC" };
const CONTROLS: Record<Element, Element> = { MOC: "THO", THO: "THUY", THUY: "HOA", HOA: "KIM", KIM: "MOC" };

export type ElementRelation = "same" | "a-generates-b" | "b-generates-a" | "a-controls-b" | "b-controls-a";

export function elementRelation(a: Element, b: Element): ElementRelation {
  if (a === b) return "same";
  if (GENERATES[a] === b) return "a-generates-b";
  if (GENERATES[b] === a) return "b-generates-a";
  if (CONTROLS[a] === b) return "a-controls-b";
  return "b-controls-a";
}

/** Mô tả quan hệ Mệnh (a) – Cục (b). */
export function menhCucRelationLabel(menh: Element, cuc: Element): string {
  switch (elementRelation(menh, cuc)) {
    case "same":
      return "Bình hòa";
    case "a-generates-b":
      return "Mệnh sinh Cục";
    case "b-generates-a":
      return "Cục sinh Mệnh";
    case "a-controls-b":
      return "Mệnh khắc Cục";
    case "b-controls-a":
      return "Cục khắc Mệnh";
  }
}
