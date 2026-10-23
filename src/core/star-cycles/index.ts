/**
 * Các vòng sao 12 cung.
 *  - Vòng Thái Tuế: khởi Thái Tuế tại địa chi năm sinh, an THUẬN.
 *  - Vòng Bác Sĩ: khởi Bác Sĩ tại cung Lộc Tồn; Dương Nam/Âm Nữ thuận, Âm Nam/Dương Nữ nghịch.
 *  - Vòng Tràng Sinh: khởi theo Cục – Thủy/Thổ tại Thân, Mộc tại Hợi, Kim tại Tỵ, Hỏa tại Dần;
 *    chiều theo Âm Dương Nam Nữ (mặc định) hoặc theo giới tính (tuỳ chọn).
 */
import type { BranchIndex, Element } from "@/types/astrology";
import { branchAt } from "@/core/stems-branches";

export const THAI_TUE_CYCLE = [
  { id: "thai-tue", name: "Thái Tuế" },
  { id: "thieu-duong", name: "Thiếu Dương" },
  { id: "tang-mon", name: "Tang Môn" },
  { id: "thieu-am", name: "Thiếu Âm" },
  { id: "quan-phu-tt", name: "Quan Phù" },
  { id: "tu-phu", name: "Tử Phù" },
  { id: "tue-pha", name: "Tuế Phá" },
  { id: "long-duc", name: "Long Đức" },
  { id: "bach-ho", name: "Bạch Hổ" },
  { id: "phuc-duc", name: "Phúc Đức" },
  { id: "dieu-khach", name: "Điếu Khách" },
  { id: "truc-phu", name: "Trực Phù" },
] as const;

export const BAC_SI_CYCLE = [
  { id: "bac-si", name: "Bác Sĩ" },
  { id: "luc-si", name: "Lực Sĩ" },
  { id: "thanh-long", name: "Thanh Long" },
  { id: "tieu-hao", name: "Tiểu Hao" },
  { id: "tuong-quan", name: "Tướng Quân" },
  { id: "tau-thu", name: "Tấu Thư" },
  { id: "phi-liem", name: "Phi Liêm" },
  { id: "hy-than", name: "Hỷ Thần" },
  { id: "benh-phu", name: "Bệnh Phù" },
  { id: "dai-hao", name: "Đại Hao" },
  { id: "phuc-binh", name: "Phục Binh" },
  { id: "quan-phu-bs", name: "Quan Phủ" },
] as const;

export const TRANG_SINH_CYCLE = [
  { id: "trang-sinh", name: "Tràng Sinh" },
  { id: "moc-duc", name: "Mộc Dục" },
  { id: "quan-doi", name: "Quan Đới" },
  { id: "lam-quan", name: "Lâm Quan" },
  { id: "de-vuong", name: "Đế Vượng" },
  { id: "suy", name: "Suy" },
  { id: "benh", name: "Bệnh" },
  { id: "tu", name: "Tử" },
  { id: "mo", name: "Mộ" },
  { id: "tuyet", name: "Tuyệt" },
  { id: "thai", name: "Thai" },
  { id: "duong", name: "Dưỡng" },
] as const;

export const TRANG_SINH_START: Record<Element, BranchIndex> = { THUY: 8, THO: 8, MOC: 11, KIM: 5, HOA: 2 };

export function placeCycle(cycle: readonly { id: string }[], start: BranchIndex, direction: 1 | -1): Record<string, BranchIndex> {
  const res: Record<string, BranchIndex> = {};
  cycle.forEach((s, i) => (res[s.id] = branchAt(start + direction * i)));
  return res;
}
