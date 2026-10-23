/**
 * Tiểu hạn và Lưu niên.
 *  - Tiểu hạn: khởi tại cung theo tam hợp Chi năm sinh – Dần Ngọ Tuất tại Thìn, Thân Tý Thìn
 *    tại Tuất, Tỵ Dậu Sửu tại Mùi, Hợi Mão Mùi tại Sửu (cung khởi ứng với năm sinh).
 *    Nam đi thuận, Nữ đi nghịch; mỗi năm một cung.
 *  - Lưu niên: cung có Lưu Thái Tuế (= Chi của năm xem hạn).
 *  - Sao lưu dùng chính quy tắc an sao nguyên cục nhưng thay Can/Chi năm sinh bằng Can/Chi
 *    năm xem hạn. Kết quả nằm ở lớp "annual" – không ghi đè dữ liệu nguyên cục.
 */
import type { BranchIndex, Gender, StemIndex } from "@/types/astrology";
import { branchAt } from "@/core/stems-branches";
import { KHOI_CLASSIC, KHOI_VARIANT_A, LOC_TON_BY_STEM, trineGroup, VIET_CLASSIC, VIET_VARIANT_A } from "@/core/auxiliary-stars";
import type { StarPlacementRuleSet } from "@/config/schools/types";

const MINOR_START = [10, 7, 4, 1]; // theo trineGroup: Thân Tý Thìn→Tuất, Tỵ Dậu Sửu→Mùi, Dần Ngọ Tuất→Thìn, Hợi Mão Mùi→Sửu

export function minorPeriodStart(yBranch: BranchIndex): BranchIndex {
  return MINOR_START[trineGroup(yBranch)];
}

export function minorPeriodDirection(gender: Gender): 1 | -1 {
  return gender === "male" ? 1 : -1;
}

/** Cung tiểu hạn của năm có Chi viewBranch. */
export function minorPeriodBranch(yBranch: BranchIndex, gender: Gender, viewBranch: BranchIndex): BranchIndex {
  return branchAt(minorPeriodStart(yBranch) + minorPeriodDirection(gender) * branchAt(viewBranch - yBranch));
}

/** Chi của năm có tiểu hạn tại cung palace. */
export function minorPeriodYearBranchAt(yBranch: BranchIndex, gender: Gender, palace: BranchIndex): BranchIndex {
  return branchAt(yBranch + minorPeriodDirection(gender) * (palace - minorPeriodStart(yBranch)));
}

export interface LayerStarPlacement {
  id: string;
  name: string;
  branch: BranchIndex;
  ruleId: string;
}

const THIEN_MA = [2, 11, 8, 5];
const DAO_HOA = [9, 6, 3, 0];

/** Sao lưu niên (không gồm Tứ Hóa – xem transformations). */
export function annualStars(vStem: StemIndex, vBranch: BranchIndex, rules: StarPlacementRuleSet): LayerStarPlacement[] {
  const lt = LOC_TON_BY_STEM[vStem];
  const khoi = rules.khoiViet === "variant-a" ? KHOI_VARIANT_A : KHOI_CLASSIC;
  const viet = rules.khoiViet === "variant-a" ? VIET_VARIANT_A : VIET_CLASSIC;
  const g = trineGroup(vBranch);
  const list: [string, string, number, string][] = [
    ["thai-tue", "Thái Tuế", vBranch, "ANNUAL.THAI_TUE"],
    ["tang-mon", "Tang Môn", vBranch + 2, "ANNUAL.TANG_MON"],
    ["bach-ho", "Bạch Hổ", vBranch + 8, "ANNUAL.BACH_HO"],
    ["thien-khoc", "Thiên Khốc", 6 - vBranch, "ANNUAL.THIEN_KHOC"],
    ["thien-hu", "Thiên Hư", 6 + vBranch, "ANNUAL.THIEN_HU"],
    ["loc-ton", "Lộc Tồn", lt, "ANNUAL.LOC_TON"],
    ["kinh-duong", "Kình Dương", lt + 1, "ANNUAL.KINH_DUONG"],
    ["da-la", "Đà La", lt - 1, "ANNUAL.DA_LA"],
    ["thien-ma", "Thiên Mã", THIEN_MA[g], "ANNUAL.THIEN_MA"],
    ["hong-loan", "Hồng Loan", 3 - vBranch, "ANNUAL.HONG_LOAN"],
    ["thien-hy", "Thiên Hỷ", 9 - vBranch, "ANNUAL.THIEN_HY"],
    ["dao-hoa", "Đào Hoa", DAO_HOA[g], "ANNUAL.DAO_HOA"],
    ["thien-khoi", "Thiên Khôi", khoi[vStem], "ANNUAL.THIEN_KHOI"],
    ["thien-viet", "Thiên Việt", viet[vStem], "ANNUAL.THIEN_VIET"],
  ];
  return list.map(([id, name, b, ruleId]) => ({ id, name, branch: branchAt(b), ruleId }));
}

/** Sao đại vận theo Can cung đại hạn (Lộc Tồn, Kình Dương, Đà La). */
export function decadalStars(dStem: StemIndex): LayerStarPlacement[] {
  const lt = LOC_TON_BY_STEM[dStem];
  return [
    { id: "loc-ton", name: "Lộc Tồn", branch: branchAt(lt), ruleId: "DECADAL.LOC_TON" },
    { id: "kinh-duong", name: "Kình Dương", branch: branchAt(lt + 1), ruleId: "DECADAL.KINH_DUONG" },
    { id: "da-la", name: "Đà La", branch: branchAt(lt - 1), ruleId: "DECADAL.DA_LA" },
  ];
}
