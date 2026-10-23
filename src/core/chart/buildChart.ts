/**
 * Chart Engine – lắp ráp toàn bộ dữ liệu lá số từ các module tính toán.
 * Không phụ thuộc React. Đầu vào thuần, đầu ra thuần (có thể serialize JSON).
 */
import type { BranchIndex, Gender, StarLayer, Transformation } from "@/types/astrology";
import type { ChartPalace, ChartStar, FlyingTransformation, TuViChart } from "@/types/chart";
import { resolveRules, DEFAULT_SCHOOL_ID, type DeepPartial, type SchoolRuleSet } from "@/config/schools";
import { getStarDef } from "@/config/stars/registry";
import { resolveBirth, type BirthInput } from "@/core/calendar";
import { BRANCH_IDS, branchAt, yearBranch, yearStem } from "@/core/stems-branches";
import { CUC_NAMES, menhCucRelationLabel, napAm } from "@/core/elements";
import {
  CHU_MENH,
  CHU_THAN,
  computeCuc,
  menhBranch,
  PALACE_NAMES,
  palaceIndexAt,
  palaceStems,
  thanBranch,
  yinYangGenderDirection,
  yinYangGenderLabel,
  branchOfPalace,
} from "@/core/palaces";
import { mainStarRuleId, placeMainStars } from "@/core/main-stars";
import { LOC_TON_BY_STEM, placeAuxiliaryStars, trietPositions, tuanPositions } from "@/core/auxiliary-stars";
import { BAC_SI_CYCLE, placeCycle, THAI_TUE_CYCLE, TRANG_SINH_CYCLE, TRANG_SINH_START } from "@/core/star-cycles";
import { TRANSFORMATION_NAMES, TRANSFORMATION_ORDER, TRANSFORMATION_STAR_IDS, transformationsForStem } from "@/core/transformations";
import { brightnessOf } from "@/core/brightness";
import { majorPeriodAtAge, majorPeriods, nominalAge } from "@/core/major-periods";
import { annualStars, decadalStars, minorPeriodBranch, minorPeriodYearBranchAt } from "@/core/annual-periods";

export const ENGINE_VERSION = "0.1.0";

export interface ChartRequest {
  name?: string;
  gender: Gender;
  birth: BirthInput;
  birthPlace?: string;
  schoolId?: string;
  ruleOverrides?: DeepPartial<SchoolRuleSet>;
  /** Năm (âm lịch) xem hạn. Mặc định: năm hiện tại. */
  viewYear?: number;
}

export function buildChart(req: ChartRequest): TuViChart {
  const schoolId = req.schoolId ?? DEFAULT_SCHOOL_ID;
  const rules = resolveRules(schoolId, req.ruleOverrides);
  const birth = resolveBirth(req.birth, rules.calendar);

  const y = birth.pillars.year.stem;
  const Y = birth.pillars.year.branch;
  const month = birth.chartMonth;
  const day = birth.chartDay;
  const hour = birth.hourBranch;
  const gender = req.gender;

  // ---- Cung ----
  const menh = menhBranch(month, hour);
  const than = thanBranch(month, hour);
  const stems = palaceStems(y);
  const cuc = computeCuc(y, menh);
  const direction = yinYangGenderDirection(y, gender);

  // ---- Sao nguyên cục ----
  const natal: { id: string; branch: BranchIndex; ruleId: string; transformsStarId?: string }[] = [];
  const main = placeMainStars(day, cuc.number);
  for (const [id, b] of Object.entries(main)) natal.push({ id, branch: b, ruleId: mainStarRuleId(id) });

  const aux = placeAuxiliaryStars({
    yStem: y, yBranch: Y, month, day, hour, menh, than, gender, direction,
    palaceBranch: (i) => branchOfPalace(i, menh),
    rules: rules.starPlacement,
  });
  for (const [id, p] of Object.entries(aux)) natal.push({ id, branch: p.branch, ruleId: p.ruleId });

  const bacSi = placeCycle(BAC_SI_CYCLE, LOC_TON_BY_STEM[y], direction);
  for (const [id, b] of Object.entries(bacSi)) natal.push({ id, branch: b, ruleId: "CYCLE.BAC_SI" });
  const thaiTue = placeCycle(THAI_TUE_CYCLE, Y, 1);
  for (const [id, b] of Object.entries(thaiTue)) natal.push({ id, branch: b, ruleId: "CYCLE.THAI_TUE" });
  const tsDirection = rules.annualCycle.trangSinhDirection === "by-gender" ? (gender === "male" ? 1 : -1) : direction;
  const trangSinh = placeCycle(TRANG_SINH_CYCLE, TRANG_SINH_START[cuc.element], tsDirection);

  const position: Record<string, BranchIndex> = Object.fromEntries(natal.map((n) => [n.id, n.branch]));

  // ---- Tứ Hóa nguyên cục ----
  const natalTrans = transformationsForStem(y, rules.transformation);
  const transformationOf: Record<string, Transformation> = {};
  TRANSFORMATION_ORDER.forEach((t, i) => {
    const target = natalTrans[i];
    transformationOf[target] = t;
    natal.push({ id: TRANSFORMATION_STAR_IDS[t], branch: position[target], ruleId: "TRANS.STEM_TABLE", transformsStarId: target });
  });

  // ---- Vận hạn ----
  const viewYear = req.viewYear ?? new Date().getFullYear();
  const age = nominalAge(birth.chartYear, viewYear);
  const vStem = yearStem(viewYear);
  const vBranch = yearBranch(viewYear);
  const periods = majorPeriods(menh, cuc.number, direction, stems);
  const currentMajor = majorPeriodAtAge(periods, age);
  const minorBranch = minorPeriodBranch(Y, gender, vBranch);

  const layerTrans: Record<string, { layer: StarLayer; type: Transformation }[]> = {};
  const layered: ChartStar[] = [];

  const addLayerTransformations = (layer: StarLayer, stem: number, prefix: string) => {
    const targets = transformationsForStem(stem, rules.transformation);
    TRANSFORMATION_ORDER.forEach((t, i) => {
      const target = targets[i];
      (layerTrans[target] ??= []).push({ layer, type: t });
      const b = position[target];
      layered.push(makeStar(TRANSFORMATION_STAR_IDS[t], b, layer, `${prefix}${TRANSFORMATION_NAMES[t]}`, layer === "annual" ? "ANNUAL.TRANSFORMATION" : "DECADAL.TRANSFORMATION", { transformsStarId: target }));
    });
  };

  if (currentMajor && rules.annualCycle.decadalStars) {
    for (const st of decadalStars(currentMajor.stem)) layered.push(makeStar(st.id, st.branch, "decadal", `ĐV.${st.name}`, st.ruleId));
    addLayerTransformations("decadal", currentMajor.stem, "ĐV.");
  }
  for (const st of annualStars(vStem, vBranch, rules.starPlacement)) layered.push(makeStar(st.id, st.branch, "annual", `L.${st.name}`, st.ruleId));
  addLayerTransformations("annual", vStem, "L.");

  // ---- Phi Hóa (Bắc phái) ----
  const flying: FlyingTransformation[] = [];
  if (rules.transformation.flyingTransformations) {
    for (let b = 0; b < 12; b++) {
      const targets = transformationsForStem(stems[b], rules.transformation);
      TRANSFORMATION_ORDER.forEach((t, i) => {
        flying.push({ fromBranch: b, stem: stems[b], type: t, starId: targets[i], toBranch: position[targets[i]] ?? null });
      });
    }
  }

  // ---- Lắp ráp cung ----
  const [tuan1, tuan2] = tuanPositions(y, Y);
  const [triet1, triet2] = trietPositions(y);
  const palaces: ChartPalace[] = Array.from({ length: 12 }, (_, b) => {
    const nameIndex = palaceIndexAt(b, menh);
    const period = periods.find((p) => p.branch === b)!;
    const tsEntry = TRANG_SINH_CYCLE.find((c) => trangSinh[c.id] === b)!;
    return {
      branch: b,
      palaceId: BRANCH_IDS[b],
      stem: stems[b],
      nameIndex,
      name: PALACE_NAMES[nameIndex],
      isMenh: b === menh,
      isThan: b === than,
      majorPeriod: period,
      minorPeriodYearBranch: minorPeriodYearBranchAt(Y, gender, b),
      trangSinh: tsEntry.name,
      hasTuan: b === tuan1 || b === tuan2,
      hasTriet: b === triet1 || b === triet2,
      stars: [],
    };
  });

  for (const n of natal) {
    const star = makeStar(n.id, n.branch, "natal", undefined, n.ruleId, n.transformsStarId ? { transformsStarId: n.transformsStarId } : {});
    star.transformation = transformationOf[n.id];
    if (layerTrans[n.id]) star.layerTransformations = layerTrans[n.id];
    star.brightness = brightnessOf(n.id, n.branch, rules.brightness.table, rules.brightness.auxiliary);
    palaces[n.branch].stars.push(star);
  }
  for (const st of layered) palaces[st.branch].stars.push(st);
  // Trạng thái Tràng Sinh cũng được đưa vào danh sách sao để có thể tra cứu.
  for (const c of TRANG_SINH_CYCLE) {
    palaces[trangSinh[c.id]].stars.push(makeStar(c.id, trangSinh[c.id], "natal", undefined, "CYCLE.TRANG_SINH"));
  }

  const banMenh = napAm(y, Y);

  return {
    input: {
      name: req.name ?? "",
      gender,
      birthPlace: req.birthPlace ?? "",
      schoolId,
      viewYear,
    },
    rules,
    birth,
    yearStem: y,
    yearBranch: Y,
    yinYangGender: yinYangGenderLabel(y, gender),
    direction,
    menhBranch: menh,
    thanBranch: than,
    thanPalaceName: PALACE_NAMES[palaceIndexAt(than, menh)],
    banMenh: { name: banMenh.name, element: banMenh.element },
    cuc: { element: cuc.element, number: cuc.number, name: CUC_NAMES[cuc.number], napAmName: cuc.napAmName },
    menhCucRelation: menhCucRelationLabel(banMenh.element, cuc.element),
    chuMenh: getStarDef(CHU_MENH[menh]).name,
    chuThan: getStarDef(CHU_THAN[Y]).name,
    palaces,
    period: {
      viewYear,
      nominalAge: age,
      viewYearStem: vStem,
      viewYearBranch: vBranch,
      majorPeriod: currentMajor,
      minorPeriodBranch: minorBranch,
      annualBranch: vBranch,
    },
    flyingTransformations: flying,
    generatedAt: new Date().toISOString(),
    engineVersion: ENGINE_VERSION,
  };
}

function makeStar(
  id: string,
  branch: BranchIndex,
  layer: StarLayer,
  displayName: string | undefined,
  ruleId: string,
  extra: Partial<ChartStar> = {},
): ChartStar {
  const def = getStarDef(id);
  return {
    id,
    name: def.name,
    displayName: displayName ?? def.name,
    category: def.category,
    nature: def.nature,
    layer,
    palaceId: BRANCH_IDS[branchAt(branch)],
    branch: branchAt(branch),
    element: def.element,
    sourceRuleId: ruleId,
    ...extra,
  };
}

