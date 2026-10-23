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
  { id: "tu-phu-vu-tuong", name: "Tử Phủ Vũ Tướng", description: "Cách cục ổn định, thiên về quản lý, tổ chức.", any: ["tu-vi", "thien-phu", "vu-khuc", "thien-tuong"], minCount: 3, scope: "tam-phuong" },
  { id: "sat-pha-tham", name: "Sát Phá Tham", description: "Cách cục biến động, khai phá, dám mạo hiểm.", all: ["that-sat", "pha-quan", "tham-lang"], scope: "tam-phuong" },
  { id: "co-nguyet-dong-luong", name: "Cơ Nguyệt Đồng Lương", description: "Cách cục thiên về chuyên môn, hành chính, phục vụ.", all: ["thien-co", "thai-am", "thien-dong", "thien-luong"], scope: "tam-phuong" },
  { id: "cu-nhat", name: "Cự Nhật", description: "Cự Môn và Thái Dương hội hợp – lợi về ngôn luận, danh tiếng.", all: ["cu-mon", "thai-duong"], scope: "tam-phuong" },
  { id: "nhat-nguyet", name: "Nhật Nguyệt", description: "Thái Dương và Thái Âm cùng hội chiếu.", all: ["thai-duong", "thai-am"], scope: "tam-phuong" },
  { id: "ta-huu", name: "Tả Hữu", description: "Tả Phụ, Hữu Bật hội hợp – được trợ giúp.", all: ["ta-phu", "huu-bat"], scope: "tam-phuong" },
  { id: "xuong-khuc", name: "Xương Khúc", description: "Văn Xương, Văn Khúc hội hợp – lợi học vấn.", all: ["van-xuong", "van-khuc"], scope: "tam-phuong" },
  { id: "khoi-viet", name: "Khôi Việt", description: "Thiên Khôi, Thiên Việt hội hợp – quý nhân.", all: ["thien-khoi", "thien-viet"], scope: "tam-phuong" },
  { id: "song-loc", name: "Song Lộc", description: "Lộc Tồn và Hóa Lộc hội hợp.", all: ["loc-ton", "hoa-loc"], scope: "tam-phuong" },
  { id: "tam-hoa", name: "Tam Hóa liên châu", description: "Hóa Lộc, Hóa Quyền, Hóa Khoa cùng hội.", all: ["hoa-loc", "hoa-quyen", "hoa-khoa"], scope: "tam-phuong" },
  { id: "loc-ma", name: "Lộc Mã giao trì", description: "Lộc Tồn (hoặc Hóa Lộc) gặp Thiên Mã.", all: ["thien-ma"], any: ["loc-ton", "hoa-loc"], minCount: 1, scope: "tam-phuong" },
  { id: "khong-kiep", name: "Không Kiếp", description: "Địa Không, Địa Kiếp hội hợp – dễ hao tán.", all: ["dia-khong", "dia-kiep"], scope: "tam-phuong" },
  { id: "kinh-da", name: "Kình Đà", description: "Kình Dương, Đà La cùng chiếu.", all: ["kinh-duong", "da-la"], scope: "tam-phuong" },
  { id: "hoa-linh", name: "Hỏa Linh", description: "Hỏa Tinh, Linh Tinh cùng chiếu.", all: ["hoa-tinh", "linh-tinh"], scope: "tam-phuong" },
  { id: "luc-sat", name: "Lục sát hội tụ", description: "Từ 3 sát tinh trở lên hội chiếu.", any: ["kinh-duong", "da-la", "dia-khong", "dia-kiep", "hoa-tinh", "linh-tinh"], minCount: 3, scope: "tam-phuong" },
  { id: "tam-thai-bat-toa", name: "Tam Thai Bát Tọa", description: "Tam Thai, Bát Tọa hội hợp – địa vị.", all: ["tam-thai", "bat-toa"], scope: "tam-phuong" },
  { id: "long-phuong", name: "Long Phượng", description: "Long Trì, Phượng Các hội hợp.", all: ["long-tri", "phuong-cac"], scope: "tam-phuong" },
  { id: "giap-ta-huu", name: "Giáp Tả Hữu", description: "Tả Phụ, Hữu Bật kẹp hai bên cung.", all: ["ta-phu", "huu-bat"], scope: "giap" },
  { id: "giap-xuong-khuc", name: "Giáp Xương Khúc", description: "Văn Xương, Văn Khúc kẹp hai bên cung.", all: ["van-xuong", "van-khuc"], scope: "giap" },
  { id: "giap-khong-kiep", name: "Giáp Không Kiếp", description: "Địa Không, Địa Kiếp kẹp hai bên cung.", all: ["dia-khong", "dia-kiep"], scope: "giap" },
  { id: "giap-kinh-da", name: "Giáp Kình Đà", description: "Kình Dương, Đà La kẹp hai bên cung.", all: ["kinh-duong", "da-la"], scope: "giap" },
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
