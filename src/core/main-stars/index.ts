/**
 * An 14 chính tinh.
 *
 * Tử Vi (quy tắc truyền thống): lấy ngày sinh âm lịch d và số Cục c. Tìm số bù x ≥ 0
 * nhỏ nhất để (d + x) chia hết cho c; thương q = (d + x) / c. Từ Dần (kể là 1) đếm
 * thuận q cung. Nếu x lẻ lùi lại x cung, nếu x chẵn tiến thêm x cung.
 *
 * Chòm Tử Vi (an nghịch từ Tử Vi): Tử Vi, Thiên Cơ, (cách 1), Thái Dương, Vũ Khúc,
 * Thiên Đồng, (cách 2), Liêm Trinh.
 * Thiên Phủ đối xứng với Tử Vi qua trục Dần – Thân.
 * Chòm Thiên Phủ (an thuận): Thiên Phủ, Thái Âm, Tham Lang, Cự Môn, Thiên Tướng,
 * Thiên Lương, Thất Sát, (cách 3), Phá Quân.
 */
import type { BranchIndex } from "@/types/astrology";
import { branchAt } from "@/core/stems-branches";

export function tuViPosition(lunarDay: number, cuc: number): BranchIndex {
  if (![2, 3, 4, 5, 6].includes(cuc)) throw new Error(`Số Cục không hợp lệ: ${cuc}`);
  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) throw new Error(`Ngày âm lịch không hợp lệ: ${lunarDay}`);
  const x = (cuc - (lunarDay % cuc)) % cuc;
  const q = (lunarDay + x) / cuc;
  const base = 2 + q - 1;
  return branchAt(x % 2 === 1 ? base - x : base + x);
}

export function thienPhuPosition(tuVi: BranchIndex): BranchIndex {
  return branchAt(4 - tuVi);
}

export const TU_VI_GROUP_OFFSETS: Record<string, number> = {
  "tu-vi": 0,
  "thien-co": -1,
  "thai-duong": -3,
  "vu-khuc": -4,
  "thien-dong": -5,
  "liem-trinh": -8,
};

export const THIEN_PHU_GROUP_OFFSETS: Record<string, number> = {
  "thien-phu": 0,
  "thai-am": 1,
  "tham-lang": 2,
  "cu-mon": 3,
  "thien-tuong": 4,
  "thien-luong": 5,
  "that-sat": 6,
  "pha-quan": 10,
};

export const MAIN_STAR_IDS = [...Object.keys(TU_VI_GROUP_OFFSETS), ...Object.keys(THIEN_PHU_GROUP_OFFSETS)];

export function placeMainStars(lunarDay: number, cuc: number): Record<string, BranchIndex> {
  const tv = tuViPosition(lunarDay, cuc);
  const tp = thienPhuPosition(tv);
  const result: Record<string, BranchIndex> = {};
  for (const [id, off] of Object.entries(TU_VI_GROUP_OFFSETS)) result[id] = branchAt(tv + off);
  for (const [id, off] of Object.entries(THIEN_PHU_GROUP_OFFSETS)) result[id] = branchAt(tp + off);
  return result;
}

export function mainStarRuleId(id: string): string {
  if (id === "tu-vi") return "MAIN.TU_VI.DAY_CUC";
  if (id === "thien-phu") return "MAIN.THIEN_PHU.MIRROR";
  return id in TU_VI_GROUP_OFFSETS ? "MAIN.TU_VI_GROUP" : "MAIN.THIEN_PHU_GROUP";
}
