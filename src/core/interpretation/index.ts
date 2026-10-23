/**
 * Interpretation Engine – phân tích CẤU TRÚC (tam phương tứ chính, hội chiếu, bộ sao)
 * từ dữ liệu lá số đã tính và đính kèm ý nghĩa truyền thống tham khảo.
 * Không thay đổi dữ liệu lá số.
 */
import type { BranchIndex } from "@/types/astrology";
import type { ChartPalace, ChartStar, TuViChart } from "@/types/chart";
import { branchAt } from "@/core/stems-branches";
import { tamPhuongTuChinh } from "@/core/palaces";
import { PALACE_MEANINGS, STAR_MEANINGS } from "./meanings";
import { CYCLE_STAR_BY_ID, CYCLE_STAR_INTERPRETATIONS, RING_LABEL, TRANSFORMATION_FOCUS, type ComboRule, type PalaceName } from "./cycle-stars";
import { AUX_STAR_INTERPRETATIONS } from "./aux-stars";
import { MINOR_STAR_INTERPRETATIONS } from "./aux-stars-minor";
import { brightnessOf } from "@/core/brightness";

export { PALACE_MEANINGS, STAR_MEANINGS };

export interface StarGroupMatch {
  id: string;
  name: string;
  description: string;
  stars: string[];
  scope: "dong-cung" | "tam-phuong" | "giap";
}

interface GroupRule {
  id: string;
  name: string;
  description: string;
  /** Cần đủ các sao này trong phạm vi. */
  all?: string[];
  /** Cần ít nhất minCount sao trong danh sách. */
  any?: string[];
  minCount?: number;
  scope: "dong-cung" | "tam-phuong" | "giap";
}

const GROUP_RULES: GroupRule[] = [
  { id: "tu-phu-vu-tuong", name: "Tử Phủ Vũ Tướng", description: "Ổn định, giỏi quản lý, tổ chức.", any: ["tu-vi", "thien-phu", "vu-khuc", "thien-tuong"], minCount: 3, scope: "tam-phuong" },
  { id: "sat-pha-tham", name: "Sát Phá Tham", description: "Biến động, khai phá, dám mạo hiểm.", all: ["that-sat", "pha-quan", "tham-lang"], scope: "tam-phuong" },
  { id: "co-nguyet-dong-luong", name: "Cơ Nguyệt Đồng Lương", description: "Chuyên môn, hành chính, phục vụ.", all: ["thien-co", "thai-am", "thien-dong", "thien-luong"], scope: "tam-phuong" },
  { id: "cu-nhat", name: "Cự Nhật", description: "Lợi ngôn luận, danh tiếng.", all: ["cu-mon", "thai-duong"], scope: "tam-phuong" },
  { id: "nhat-nguyet", name: "Nhật Nguyệt", description: "Âm dương hòa hợp, sáng sủa.", all: ["thai-duong", "thai-am"], scope: "tam-phuong" },
  { id: "ta-huu", name: "Tả Hữu", description: "Được trợ giúp, nhiều người phò tá.", all: ["ta-phu", "huu-bat"], scope: "tam-phuong" },
  { id: "xuong-khuc", name: "Xương Khúc", description: "Lợi học vấn, văn chương.", all: ["van-xuong", "van-khuc"], scope: "tam-phuong" },
  { id: "khoi-viet", name: "Khôi Việt", description: "Gặp quý nhân nâng đỡ.", all: ["thien-khoi", "thien-viet"], scope: "tam-phuong" },
  { id: "song-loc", name: "Song Lộc", description: "Tài lộc dồi dào.", all: ["loc-ton", "hoa-loc"], scope: "tam-phuong" },
  { id: "tam-hoa", name: "Tam Hóa liên châu", description: "Tài, quyền, danh cùng hội.", all: ["hoa-loc", "hoa-quyen", "hoa-khoa"], scope: "tam-phuong" },
  { id: "loc-ma", name: "Lộc Mã giao trì", description: "Đi xa, buôn bán phát tài.", all: ["thien-ma"], any: ["loc-ton", "hoa-loc"], minCount: 1, scope: "tam-phuong" },
  { id: "khong-kiep", name: "Không Kiếp", description: "Dễ hao tán, thăng trầm bất ngờ.", all: ["dia-khong", "dia-kiep"], scope: "tam-phuong" },
  { id: "kinh-da", name: "Kình Đà", description: "Trắc trở, va chạm, thị phi.", all: ["kinh-duong", "da-la"], scope: "tam-phuong" },
  { id: "hoa-linh", name: "Hỏa Linh", description: "Nóng nảy, biến cố bất ngờ.", all: ["hoa-tinh", "linh-tinh"], scope: "tam-phuong" },
  { id: "luc-sat", name: "Lục sát hội tụ", description: "Nhiều trở ngại, cần thận trọng.", any: ["kinh-duong", "da-la", "dia-khong", "dia-kiep", "hoa-tinh", "linh-tinh"], minCount: 3, scope: "tam-phuong" },
  { id: "tam-thai-bat-toa", name: "Tam Thai Bát Tọa", description: "Có địa vị, được trọng vọng.", all: ["tam-thai", "bat-toa"], scope: "tam-phuong" },
  { id: "long-phuong", name: "Long Phượng", description: "Thanh nhã, có tài văn chương.", all: ["long-tri", "phuong-cac"], scope: "tam-phuong" },
  { id: "giap-ta-huu", name: "Giáp Tả Hữu", description: "Được người hai bên phò trợ.", all: ["ta-phu", "huu-bat"], scope: "giap" },
  { id: "giap-xuong-khuc", name: "Giáp Xương Khúc", description: "Được văn tinh hỗ trợ học hành.", all: ["van-xuong", "van-khuc"], scope: "giap" },
  { id: "giap-khong-kiep", name: "Giáp Không Kiếp", description: "Bị kẹp sát tinh, dễ hao tổn.", all: ["dia-khong", "dia-kiep"], scope: "giap" },
  { id: "giap-kinh-da", name: "Giáp Kình Đà", description: "Bị kẹp sát tinh, dễ trắc trở.", all: ["kinh-duong", "da-la"], scope: "giap" },
];

function natalIds(p: ChartPalace): string[] {
  return p.stars.filter((s) => s.layer === "natal").map((s) => s.id);
}

export interface PalaceAnalysis {
  palace: ChartPalace;
  meaning: string;
  mainStars: ChartStar[];
  /** Cung vô chính diệu: mượn chính tinh cung đối diện. */
  borrowedMainStars: ChartStar[];
  opposite: ChartPalace;
  trine: [ChartPalace, ChartPalace];
  flanking: [ChartPalace, ChartPalace];
  /** Sao hội chiếu: sao tại 3 cung tam phương + xung chiếu (không gồm bản cung). */
  converging: ChartStar[];
  groups: StarGroupMatch[];
}

export function analyzePalace(chart: TuViChart, branch: BranchIndex): PalaceAnalysis {
  const palace = chart.palaces[branch];
  const t = tamPhuongTuChinh(branch);
  const opposite = chart.palaces[t.opposite];
  const trine: [ChartPalace, ChartPalace] = [chart.palaces[t.trine[0]], chart.palaces[t.trine[1]]];
  const flanking: [ChartPalace, ChartPalace] = [chart.palaces[branchAt(branch - 1)], chart.palaces[branchAt(branch + 1)]];
  const mainStars = palace.stars.filter((s) => s.layer === "natal" && s.category === "main");
  const borrowedMainStars = mainStars.length === 0 ? opposite.stars.filter((s) => s.layer === "natal" && s.category === "main") : [];
  const converging = [opposite, ...trine].flatMap((p) => p.stars.filter((s) => s.layer === "natal"));

  const tamPhuongSet = new Set([palace, opposite, ...trine].flatMap(natalIds));
  const dongCungSet = new Set(natalIds(palace));
  const giapLeft = new Set(natalIds(flanking[0]));
  const giapRight = new Set(natalIds(flanking[1]));

  const groups: StarGroupMatch[] = [];
  for (const r of GROUP_RULES) {
    if (r.scope === "giap") {
      const [a, b] = r.all!;
      if ((giapLeft.has(a) && giapRight.has(b)) || (giapLeft.has(b) && giapRight.has(a))) {
        groups.push({ id: r.id, name: r.name, description: r.description, stars: r.all!, scope: r.scope });
      }
      continue;
    }
    const set = r.scope === "dong-cung" ? dongCungSet : tamPhuongSet;
    const allOk = !r.all || r.all.every((id) => set.has(id));
    const anyMatched = r.any ? r.any.filter((id) => set.has(id)) : [];
    const anyOk = !r.any || anyMatched.length >= (r.minCount ?? 1);
    if (allOk && anyOk) groups.push({ id: r.id, name: r.name, description: r.description, stars: [...(r.all ?? []), ...anyMatched], scope: r.scope });
  }

  return {
    palace,
    meaning: PALACE_MEANINGS[palace.name] ?? "",
    mainStars,
    borrowedMainStars,
    opposite,
    trine,
    flanking,
    converging,
    groups,
  };
}

export interface StarAnalysis {
  star: ChartStar;
  palace: ChartPalace;
  meaning?: string;
  /** Sao cùng cung. */
  together: ChartStar[];
  /** Sao hội chiếu từ tam phương tứ chính. */
  converging: ChartStar[];
}

export function analyzeStar(chart: TuViChart, star: ChartStar): StarAnalysis {
  const palace = chart.palaces[star.branch];
  const pa = analyzePalace(chart, star.branch);
  return {
    star,
    palace,
    meaning: STAR_MEANINGS[star.id],
    together: palace.stars.filter((s) => s !== star && s.layer === "natal"),
    converging: pa.converging,
  };
}

/** Tóm tắt luận giải tổng quan (tham khảo) – chỉ dựa trên cấu trúc lá số. */
export function chartOverview(chart: TuViChart): { title: string; body: string }[] {
  const menh = analyzePalace(chart, chart.menhBranch);
  const items: { title: string; body: string }[] = [];
  const mains = menh.mainStars.length ? menh.mainStars : menh.borrowedMainStars;
  items.push({
    title: "Cung Mệnh",
    body:
      (menh.mainStars.length
        ? `Mệnh có ${menh.mainStars.map((s) => s.name).join(", ")} thủ mệnh. `
        : `Mệnh vô chính diệu, mượn ${menh.borrowedMainStars.map((s) => s.name).join(", ")} ở cung xung chiếu. `) +
      mains.map((s) => STAR_MEANINGS[s.id]).filter(Boolean).join(" "),
  });
  items.push({ title: "Thân cư " + chart.thanPalaceName, body: PALACE_MEANINGS[chart.thanPalaceName] ?? "" });
  items.push({ title: "Mệnh – Cục", body: `Bản mệnh ${chart.banMenh.name}, ${chart.cuc.name}: ${chart.menhCucRelation}.` });
  if (menh.groups.length) items.push({ title: "Bộ sao tại tam phương Mệnh", body: menh.groups.map((g) => `${g.name}: ${g.description}`).join(" ") });
  return items;
}

// ---------------- Luận giải phụ tinh (vòng Thái Tuế, Bác Sĩ, cát/sát tinh, Tứ Hóa, sao nhỏ) ----------------

export interface StarInterpretationData {
  id: string;
  name: string;
  core: string;
  positive: string;
  negative: string;
  palaces: Partial<Record<PalaceName, string>>;
  favorable?: string;
  unfavorable?: string;
  combos: ComboRule[];
}

const INTERPRETATION_BY_ID: Record<string, { data: StarInterpretationData; groupLabel: string }> = Object.fromEntries([
  ...CYCLE_STAR_INTERPRETATIONS.map((d) => [d.id, { data: d, groupLabel: RING_LABEL[d.ring] }]),
  ...[...AUX_STAR_INTERPRETATIONS, ...MINOR_STAR_INTERPRETATIONS].map((d) => [d.id, { data: d, groupLabel: d.group }]),
]);

export interface StarReading {
  data: StarInterpretationData;
  groupLabel: string;
  /** Ý nghĩa tại cung đang xét – chỉ có với sao nguyên cục. */
  palaceText: string | null;
  palaceName: string;
  /** Trạng thái Miếu/Hãm theo hệ thống đang dùng; null nếu không có quy định. */
  brightnessRule: string | null;
  /** Ý nghĩa theo vị trí đắc / hãm (chỉ khi có bảng tra). */
  positionText: string | null;
  combos: (ComboRule & { matched: string[] })[];
  transformationNotes: string[];
}

/** Đã có cơ sở dữ liệu luận giải cho sao này chưa. */
export function hasStarInterpretation(id: string): boolean {
  return id in INTERPRETATION_BY_ID;
}

export function starReading(chart: TuViChart, star: ChartStar): StarReading | null {
  const entry = INTERPRETATION_BY_ID[star.id];
  if (!entry) return null;
  const { data, groupLabel } = entry;
  const palace = chart.palaces[star.branch];
  const t = tamPhuongTuChinh(star.branch);
  const natalAt = (b: BranchIndex) => chart.palaces[b].stars.filter((s) => s.layer === "natal" && s !== star).map((s) => s.id);
  const same = new Set(natalAt(star.branch));
  const tamPhuong = new Set([star.branch, t.opposite, ...t.trine].flatMap(natalAt));
  const combos = data.combos
    .map((c) => ({ ...c, matched: c.with.filter((id) => (c.scope === "dong-cung" ? same : tamPhuong).has(id)) }))
    .filter((c) => c.matched.length > 0);
  // Ghi chú Tứ Hóa chung (không áp dụng cho chính sao Hóa), trừ khi tổ hợp riêng đã nói về sao Hóa đó.
  const covered = new Set(combos.flatMap((c) => c.matched));
  const transformationNotes = star.category === "transformation" ? [] : Object.keys(TRANSFORMATION_FOCUS)
    .filter((id) => same.has(id) && !covered.has(id))
    .map((id) => TRANSFORMATION_FOCUS[id]);
  const b = brightnessOf(star.id, star.branch, chart.rules.brightness.table, chart.rules.brightness.auxiliary);
  const brightnessRule = b && b !== "UNDEFINED" ? b : null;
  const positionText =
    brightnessRule === "HAM" ? data.unfavorable ?? null : brightnessRule ? data.favorable ?? null : null;
  const natal = star.layer === "natal";
  return {
    data,
    groupLabel,
    palaceText: natal ? data.palaces[palace.name as PalaceName] ?? null : null,
    palaceName: palace.name,
    brightnessRule,
    positionText: natal ? positionText : null,
    combos: natal ? combos : [],
    transformationNotes: natal ? transformationNotes : [],
  };
}

/** Giữ tên cũ cho vòng Thái Tuế / Bác Sĩ. */
export function cycleStarReading(chart: TuViChart, star: ChartStar) {
  const r = starReading(chart, star);
  return r && CYCLE_STAR_BY_ID[star.id] ? { ...r, ringLabel: r.groupLabel } : null;
}
