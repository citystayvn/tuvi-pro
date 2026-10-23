/**
 * Đại hạn (10 năm).
 *  - Đại hạn đầu tiên tại cung Mệnh, khởi từ tuổi = số Cục (tuổi mụ).
 *  - Dương Nam/Âm Nữ đi thuận, Âm Nam/Dương Nữ đi nghịch; mỗi cung 10 năm.
 */
import type { BranchIndex, StemIndex } from "@/types/astrology";
import type { MajorPeriod } from "@/types/chart";
import { branchAt, mod } from "@/core/stems-branches";

export function majorPeriods(menh: BranchIndex, cuc: number, direction: 1 | -1, stems: StemIndex[]): MajorPeriod[] {
  return Array.from({ length: 12 }, (_, k) => {
    const branch = branchAt(menh + direction * k);
    return { startAge: cuc + 10 * k, endAge: cuc + 10 * k + 9, branch, stem: stems[branch] };
  });
}

/** Đại hạn chứa tuổi mụ age; null nếu chưa tới đại hạn đầu tiên. */
export function majorPeriodAtAge(periods: MajorPeriod[], age: number): MajorPeriod | null {
  if (age < periods[0].startAge) return null;
  const k = mod(Math.floor((age - periods[0].startAge) / 10), 12);
  return periods[k];
}

/** Tuổi mụ (tuổi âm) tại năm âm lịch viewYear. */
export function nominalAge(birthLunarYear: number, viewYear: number): number {
  return viewYear - birthLunarYear + 1;
}
