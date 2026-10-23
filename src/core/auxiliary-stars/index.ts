/**
 * An phụ tinh. Mỗi sao là một quy tắc thuần (pure function) có mã sourceRuleId.
 * Mô tả quy tắc bằng lời nằm trong Star Registry (src/config/stars/registry.ts).
 *
 * Ký hiệu: y = Can năm, Y = Chi năm, m = tháng an sao (1..12), d = ngày âm (1..30),
 * h = giờ địa chi (0 = Tý … 11 = Hợi). Mọi vị trí là chỉ số địa chi 0 = Tý … 11 = Hợi.
 */
import type { BranchIndex, Gender, StemIndex } from "@/types/astrology";
import type { StarPlacementRuleSet } from "@/config/schools/types";
import { branchAt } from "@/core/stems-branches";

export interface AuxContext {
  yStem: StemIndex;
  yBranch: BranchIndex;
  month: number;
  day: number;
  hour: BranchIndex;
  menh: BranchIndex;
  than: BranchIndex;
  gender: Gender;
  /** +1 Dương Nam/Âm Nữ, −1 Âm Nam/Dương Nữ. */
  direction: 1 | -1;
  /** Địa chi của cung theo chỉ số tên cung (0 = Mệnh … 11 = Phụ Mẫu). */
  palaceBranch: (palaceIndex: number) => BranchIndex;
  rules: StarPlacementRuleSet;
}

export interface Placement {
  branch: BranchIndex;
  ruleId: string;
}

// ---------------- Bảng tra theo Can năm ----------------
/** Lộc Tồn: Giáp Dần, Ất Mão, Bính Mậu Tỵ, Đinh Kỷ Ngọ, Canh Thân, Tân Dậu, Nhâm Hợi, Quý Tý. */
export const LOC_TON_BY_STEM = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];
/** Thiên Khôi / Thiên Việt – "Giáp Mậu Canh ngưu dương, Ất Kỷ thử hầu hương, Bính Đinh trư kê vị, Lục Tân phùng mã hổ, Nhâm Quý thố xà tàng". */
export const KHOI_CLASSIC = [1, 0, 11, 11, 1, 0, 1, 6, 3, 3];
export const VIET_CLASSIC = [7, 8, 9, 9, 7, 8, 7, 2, 5, 5];
/** Biến thể A (một số tài liệu/phần mềm Việt Nam): Đinh Dậu/Hợi, Mậu Canh Mùi/Sửu, Nhâm Tỵ/Mão. */
export const KHOI_VARIANT_A = [1, 0, 11, 9, 7, 0, 7, 6, 5, 3];
export const VIET_VARIANT_A = [7, 8, 9, 11, 1, 8, 1, 2, 3, 5];
export const THIEN_QUAN_BY_STEM = [7, 4, 5, 2, 3, 9, 11, 9, 10, 6];
export const THIEN_PHUC_BY_STEM = [9, 8, 0, 11, 3, 2, 6, 5, 6, 5];
/** Lưu Hà: "Giáp kê, Ất khuyển, Bính dương, Đinh hầu, Mậu xà, Kỷ mã, Canh long, Tân thố, Nhâm trư, Quý hổ". */
export const LUU_HA_CLASSIC = [9, 10, 7, 8, 5, 6, 4, 3, 11, 2];
/** Biến thể A: Đinh Thìn, Canh Thân. */
export const LUU_HA_VARIANT_A = [9, 10, 7, 4, 5, 6, 8, 3, 11, 2];
export const THIEN_TRU_BY_STEM = [5, 6, 0, 5, 6, 8, 2, 6, 9, 10];
/** Triệt: Giáp Kỷ Thân Dậu, Ất Canh Ngọ Mùi, Bính Tân Thìn Tỵ, Đinh Nhâm Dần Mão, Mậu Quý Tý Sửu. */
export const TRIET_BY_STEM: [number, number][] = [[8, 9], [6, 7], [4, 5], [2, 3], [0, 1]];

// ---------------- Bảng tra theo Chi năm (nhóm tam hợp) ----------------
/** Nhóm tam hợp: 0 = Thân Tý Thìn, 1 = Tỵ Dậu Sửu, 2 = Dần Ngọ Tuất, 3 = Hợi Mão Mùi. */
export function trineGroup(b: BranchIndex): 0 | 1 | 2 | 3 {
  return (b % 4) as 0 | 1 | 2 | 3;
}
// theo trineGroup:                 TýThìnThân  SửuTỵDậu  DầnNgọTuất  MãoMùiHợi
const THIEN_MA = [2, 11, 8, 5];
const DAO_HOA = [9, 6, 3, 0];
const HOA_CAI = [4, 1, 10, 7];
const KIEP_SAT = [5, 2, 11, 8];
/** Hỏa Tinh / Linh Tinh khởi (giờ Tý): "Dần Ngọ Tuất Sửu Mão, Thân Tý Thìn Dần Tuất, Tỵ Dậu Sửu Mão Tuất, Hợi Mão Mùi Dậu Tuất". */
const HOA_START_CLASSIC = [2, 3, 1, 9];
const LINH_START_CLASSIC = [10, 10, 3, 10];
/** Biến thể A: nhóm Tỵ Dậu Sửu khởi Hỏa Tuất, Linh Mão. */
const HOA_START_VARIANT_A = [2, 10, 1, 9];
const LINH_START_VARIANT_A = [10, 3, 3, 10];

/** Cô Thần / Quả Tú theo phương: Hợi Tý Sửu, Dần Mão Thìn, Tỵ Ngọ Mùi, Thân Dậu Tuất. */
function seasonGroup(b: BranchIndex): number {
  return Math.floor(branchAt(b + 1) / 3);
}
const CO_THAN = [2, 5, 8, 11];
const QUA_TU = [10, 1, 4, 7];

/** Phá Toái: Tý Ngọ Mão Dậu → Tỵ; Dần Thân Tỵ Hợi → Dậu; Thìn Tuất Sửu Mùi → Sửu. */
function phaToai(b: BranchIndex, variant: StarPlacementRuleSet["phaToai"]): BranchIndex {
  const g = b % 3; // 0: Tý Mão Ngọ Dậu, 1: Sửu Thìn Mùi Tuất, 2: Dần Tỵ Thân Hợi
  if (g === 1) return 1;
  if (variant === "variant-a") return g === 0 ? 9 : 5;
  return g === 0 ? 5 : 9;
}

export function placeAuxiliaryStars(ctx: AuxContext): Record<string, Placement> {
  const { yStem: y, yBranch: Y, month: m, day: d, hour: h, menh, than, direction, rules } = ctx;
  const out: Record<string, Placement> = {};
  const put = (id: string, branch: number, ruleId: string) => (out[id] = { branch: branchAt(branch), ruleId });

  // Lục cát tinh
  put("ta-phu", 4 + (m - 1), "AUX.TA_PHU.THIN_FWD_MONTH");
  put("huu-bat", 10 - (m - 1), "AUX.HUU_BAT.TUAT_BWD_MONTH");
  put("van-xuong", 10 - h, "AUX.VAN_XUONG.TUAT_BWD_HOUR");
  put("van-khuc", 4 + h, "AUX.VAN_KHUC.THIN_FWD_HOUR");
  const khoi = rules.khoiViet === "variant-a" ? KHOI_VARIANT_A : KHOI_CLASSIC;
  const viet = rules.khoiViet === "variant-a" ? VIET_VARIANT_A : VIET_CLASSIC;
  put("thien-khoi", khoi[y], `AUX.THIEN_KHOI.STEM_${rules.khoiViet.toUpperCase()}`);
  put("thien-viet", viet[y], `AUX.THIEN_VIET.STEM_${rules.khoiViet.toUpperCase()}`);

  // Lộc Tồn, Kình Dương, Đà La, Thiên Mã
  const locTon = LOC_TON_BY_STEM[y];
  put("loc-ton", locTon, "AUX.LOC_TON.STEM");
  put("kinh-duong", locTon + 1, "AUX.KINH_DUONG.LOC_TON_PLUS_1");
  put("da-la", locTon - 1, "AUX.DA_LA.LOC_TON_MINUS_1");
  put("thien-ma", THIEN_MA[trineGroup(Y)], "AUX.THIEN_MA.YEAR_BRANCH_TRINE");

  // Địa Không, Địa Kiếp
  put("dia-kiep", 11 + h, "AUX.DIA_KIEP.HOI_FWD_HOUR");
  put("dia-khong", 11 - h, "AUX.DIA_KHONG.HOI_BWD_HOUR");

  // Hỏa Tinh, Linh Tinh
  const g = trineGroup(Y);
  const hoaStart = (rules.hoaLinhStart === "variant-a" ? HOA_START_VARIANT_A : HOA_START_CLASSIC)[g];
  const linhStart = (rules.hoaLinhStart === "variant-a" ? LINH_START_VARIANT_A : LINH_START_CLASSIC)[g];
  if (rules.hoaLinhDirection === "always-forward") {
    put("hoa-tinh", hoaStart + h, "AUX.HOA_TINH.FORWARD");
    put("linh-tinh", linhStart + h, "AUX.LINH_TINH.FORWARD");
  } else {
    put("hoa-tinh", hoaStart + direction * h, "AUX.HOA_TINH.BY_YIN_YANG_GENDER");
    put("linh-tinh", linhStart - direction * h, "AUX.LINH_TINH.BY_YIN_YANG_GENDER");
  }

  // Sao theo Chi năm
  put("hong-loan", 3 - Y, "AUX.HONG_LOAN.MAO_BWD_YEAR");
  put("thien-hy", 3 - Y + 6, "AUX.THIEN_HY.OPPOSITE_HONG_LOAN");
  put("dao-hoa", DAO_HOA[g], "AUX.DAO_HOA.YEAR_BRANCH_TRINE");
  put("hoa-cai", HOA_CAI[g], "AUX.HOA_CAI.YEAR_BRANCH_TRINE");
  put("kiep-sat", KIEP_SAT[g], "AUX.KIEP_SAT.YEAR_BRANCH_TRINE");
  put("thien-khoc", 6 - Y, "AUX.THIEN_KHOC.NGO_BWD_YEAR");
  put("thien-hu", 6 + Y, "AUX.THIEN_HU.NGO_FWD_YEAR");
  put("co-than", CO_THAN[seasonGroup(Y)], "AUX.CO_THAN.YEAR_BRANCH_SEASON");
  put("qua-tu", QUA_TU[seasonGroup(Y)], "AUX.QUA_TU.YEAR_BRANCH_SEASON");
  put("thien-khong", Y + 1, "AUX.THIEN_KHONG.THAI_TUE_PLUS_1");
  put("pha-toai", phaToai(Y, rules.phaToai), `AUX.PHA_TOAI.${rules.phaToai.toUpperCase()}`);
  put("thien-duc", 9 + Y, "AUX.THIEN_DUC.DAU_FWD_YEAR");
  put("nguyet-duc", 5 + Y, "AUX.NGUYET_DUC.TI_FWD_YEAR");
  put("long-tri", 4 + Y, "AUX.LONG_TRI.THIN_FWD_YEAR");
  put("phuong-cac", 10 - Y, "AUX.PHUONG_CAC.TUAT_BWD_YEAR");
  put("giai-than", 10 - Y, "AUX.GIAI_THAN.WITH_PHUONG_CAC");
  put("thien-tai", menh + Y, "AUX.THIEN_TAI.MENH_FWD_YEAR");
  put("thien-tho", than + Y, "AUX.THIEN_THO.THAN_FWD_YEAR");

  // Sao theo Can năm
  put("thien-quan", THIEN_QUAN_BY_STEM[y], "AUX.THIEN_QUAN.STEM");
  put("thien-phuc", THIEN_PHUC_BY_STEM[y], "AUX.THIEN_PHUC.STEM");
  put("luu-ha", (rules.luuHa === "variant-a" ? LUU_HA_VARIANT_A : LUU_HA_CLASSIC)[y], `AUX.LUU_HA.${rules.luuHa.toUpperCase()}`);
  put("thien-tru", THIEN_TRU_BY_STEM[y], "AUX.THIEN_TRU.STEM");
  put("quoc-an", locTon + 8, "AUX.QUOC_AN.LOC_TON_PLUS_8");
  put("duong-phu", locTon - 7, "AUX.DUONG_PHU.LOC_TON_MINUS_7");
  put("van-tinh", locTon + 3, "AUX.VAN_TINH.LOC_TON_PLUS_3");

  // Sao theo tháng
  put("thien-hinh", 9 + (m - 1), "AUX.THIEN_HINH.DAU_FWD_MONTH");
  put("thien-rieu", 1 + (m - 1), "AUX.THIEN_RIEU.SUU_FWD_MONTH");
  put("thien-y", 1 + (m - 1), "AUX.THIEN_Y.WITH_THIEN_RIEU");
  put(
    "thien-giai",
    rules.thienGiai === "skip-palace" ? 8 + 2 * (m - 1) : 8 + (m - 1),
    `AUX.THIEN_GIAI.${rules.thienGiai.toUpperCase()}`,
  );
  put("dia-giai", 7 + (m - 1), "AUX.DIA_GIAI.MUI_FWD_MONTH");

  // Sao theo ngày (phụ thuộc sao khác)
  const ta = out["ta-phu"].branch, huu = out["huu-bat"].branch;
  const xuong = out["van-xuong"].branch, khuc = out["van-khuc"].branch;
  put("tam-thai", ta + (d - 1), "AUX.TAM_THAI.TA_PHU_FWD_DAY");
  put("bat-toa", huu - (d - 1), "AUX.BAT_TOA.HUU_BAT_BWD_DAY");
  put("an-quang", xuong + (d - 1) - 1, "AUX.AN_QUANG.VAN_XUONG_FWD_DAY_BACK_1");
  put("thien-quy", khuc - (d - 1) + 1, "AUX.THIEN_QUY.VAN_KHUC_BWD_DAY_BACK_1");

  // Sao theo giờ
  put("thai-phu", khuc + 2, "AUX.THAI_PHU.VAN_KHUC_PLUS_2");
  put("phong-cao", khuc - 2, "AUX.PHONG_CAO.VAN_KHUC_MINUS_2");

  // Đẩu Quân
  put("dau-quan", Y - (m - 1) + h, "AUX.DAU_QUAN.THAI_TUE_BWD_MONTH_FWD_HOUR");

  // Sao cố định / theo cung
  put("thien-la", 4, "AUX.THIEN_LA.FIXED_THIN");
  put("dia-vong", 10, "AUX.DIA_VONG.FIXED_TUAT");
  put("thien-thuong", ctx.palaceBranch(7), "AUX.THIEN_THUONG.NO_BOC");
  put("thien-su", ctx.palaceBranch(5), "AUX.THIEN_SU.TAT_ACH");

  return out;
}

/** Tuần: hai địa chi "không vong" của tuần Giáp chứa năm sinh. */
export function tuanPositions(y: StemIndex, Y: BranchIndex): [BranchIndex, BranchIndex] {
  const first = branchAt(Y - y + 10);
  return [first, branchAt(first + 1)];
}

export function trietPositions(y: StemIndex): [BranchIndex, BranchIndex] {
  return TRIET_BY_STEM[y % 5];
}
