import type { BranchIndex, Element, StemIndex, YinYang } from "@/types/astrology";

export const STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
export const BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;
/** Mã ASCII ổn định của 12 địa chi – dùng làm palaceId. */
export const BRANCH_IDS = ["ty", "suu", "dan", "mao", "thin", "ti", "ngo", "mui", "than", "dau", "tuat", "hoi"] as const;

export const STEM_ELEMENTS: Element[] = ["MOC", "MOC", "HOA", "HOA", "THO", "THO", "KIM", "KIM", "THUY", "THUY"];
export const BRANCH_ELEMENTS: Element[] = [
  "THUY", "THO", "MOC", "MOC", "THO", "HOA", "HOA", "THO", "KIM", "KIM", "THO", "THUY",
];

/** Phép modulo luôn trả về số không âm. */
export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function branchAt(n: number): BranchIndex {
  return mod(n, 12);
}

export function stemYinYang(stem: StemIndex): YinYang {
  return stem % 2 === 0 ? "duong" : "am";
}

export function stemName(s: StemIndex): string {
  return STEMS[mod(s, 10)];
}
export function branchName(b: BranchIndex): string {
  return BRANCHES[mod(b, 12)];
}
export function canChiName(s: StemIndex, b: BranchIndex): string {
  return `${stemName(s)} ${branchName(b)}`;
}

/** Chỉ số trong Lục thập hoa giáp (0 = Giáp Tý … 59 = Quý Hợi). */
export function sexagenaryIndex(stem: StemIndex, branch: BranchIndex): number {
  if (mod(stem, 2) !== mod(branch, 2)) {
    throw new Error(`Can ${stemName(stem)} và Chi ${branchName(branch)} không cùng âm dương`);
  }
  return mod(6 * stem - 5 * branch, 60);
}

export function yearStem(year: number): StemIndex {
  return mod(year + 6, 10); // 1984 → Giáp
}
export function yearBranch(year: number): BranchIndex {
  return mod(year + 8, 12); // 1984 → Tý
}

/**
 * Ngũ Hổ Độn: Thiên Can của tháng Dần (tháng Giêng) theo Can năm.
 * Giáp/Kỷ → Bính Dần, Ất/Canh → Mậu Dần, Bính/Tân → Canh Dần, Đinh/Nhâm → Nhâm Dần, Mậu/Quý → Giáp Dần.
 */
export function tigerMonthStem(yStem: StemIndex): StemIndex {
  return mod((yStem % 5) * 2 + 2, 10);
}

/** Can của một địa chi (cung hoặc tháng) theo Ngũ Hổ Độn. */
export function stemOfBranchInYear(yStem: StemIndex, branch: BranchIndex): StemIndex {
  return mod(tigerMonthStem(yStem) + mod(branch - 2, 12), 10);
}

/** Ngũ Thử Độn: Can của giờ Tý theo Can ngày. Giáp/Kỷ → Giáp Tý … */
export function ratHourStem(dayStem: StemIndex): StemIndex {
  return mod((dayStem % 5) * 2, 10);
}

/** Giờ đồng hồ → chỉ số giờ địa chi. 23:00–00:59 = Tý, 01:00–02:59 = Sửu … */
export function hourToBranch(hour: number): BranchIndex {
  return mod(Math.floor((hour + 1) / 2), 12);
}

export const HOUR_RANGES = BRANCHES.map((name, i) => {
  const start = mod(i * 2 - 1, 24);
  const end = mod(i * 2 + 1, 24);
  return { name, label: `${String(start).padStart(2, "0")}:00–${String(end).padStart(2, "0")}:00` };
});
