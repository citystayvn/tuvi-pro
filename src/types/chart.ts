import type {
  BranchIndex,
  Brightness,
  Element,
  Gender,
  StarCategory,
  StarLayer,
  StarNature,
  StemIndex,
  Transformation,
} from "./astrology";
import type { ResolvedBirth } from "@/core/calendar";
import type { SchoolRuleSet } from "@/config/schools/types";

export interface ChartStar {
  id: string;
  name: string;
  /** Tên hiển thị, có tiền tố "L." cho sao lưu, "ĐV." cho sao đại vận. */
  displayName: string;
  category: StarCategory;
  nature: StarNature;
  layer: StarLayer;
  palaceId: string;
  branch: BranchIndex;
  element?: Element;
  brightness?: Brightness;
  /** Tứ Hóa (nguyên cục) gắn với sao này nếu có. */
  transformation?: Transformation;
  /** Tứ Hóa theo lớp vận hạn gắn với sao này. */
  layerTransformations?: { layer: StarLayer; type: Transformation }[];
  /** Với sao Hóa: id sao bị hóa. */
  transformsStarId?: string;
  sourceRuleId: string;
}

export interface MajorPeriod {
  startAge: number;
  endAge: number;
  branch: BranchIndex;
  stem: StemIndex;
}

export interface ChartPalace {
  branch: BranchIndex;
  palaceId: string;
  stem: StemIndex;
  /** Chỉ số tên cung: 0 = Mệnh … 11 = Phụ Mẫu. */
  nameIndex: number;
  name: string;
  isMenh: boolean;
  isThan: boolean;
  majorPeriod: MajorPeriod;
  /** Địa chi năm có tiểu hạn tại cung này. */
  minorPeriodYearBranch: BranchIndex;
  trangSinh: string;
  hasTuan: boolean;
  hasTriet: boolean;
  stars: ChartStar[];
}

export interface FlyingTransformation {
  fromBranch: BranchIndex;
  stem: StemIndex;
  type: Transformation;
  starId: string;
  toBranch: BranchIndex | null;
}

export interface PeriodState {
  viewYear: number;
  nominalAge: number;
  viewYearStem: StemIndex;
  viewYearBranch: BranchIndex;
  majorPeriod: MajorPeriod | null;
  minorPeriodBranch: BranchIndex;
  annualBranch: BranchIndex;
}

export interface TuViChart {
  input: {
    name: string;
    gender: Gender;
    birthPlace: string;
    schoolId: string;
    viewYear: number;
  };
  rules: SchoolRuleSet;
  birth: ResolvedBirth;
  yearStem: StemIndex;
  yearBranch: BranchIndex;
  yinYangGender: string;
  /** +1 thuận, −1 nghịch. */
  direction: 1 | -1;
  menhBranch: BranchIndex;
  thanBranch: BranchIndex;
  thanPalaceName: string;
  banMenh: { name: string; element: Element };
  cuc: { element: Element; number: number; name: string; napAmName: string };
  menhCucRelation: string;
  chuMenh: string;
  chuThan: string;
  palaces: ChartPalace[]; // chỉ số = địa chi
  period: PeriodState;
  flyingTransformations: FlyingTransformation[];
  generatedAt: string;
  engineVersion: string;
}
