import { describe, expect, it } from "vitest";
import { AUX_STAR_INTERPRETATIONS } from "@/core/interpretation/aux-stars";
import { MINOR_STAR_INTERPRETATIONS } from "@/core/interpretation/aux-stars-minor";
import { CYCLE_STAR_INTERPRETATIONS, PALACE_ORDER } from "@/core/interpretation/cycle-stars";
import { hasStarInterpretation, starReading } from "@/core/interpretation";
import { STAR_REGISTRY, getStarDef } from "@/config/stars/registry";
import { BRIGHTNESS_TABLES } from "@/core/brightness";
import { buildChart } from "@/core/chart/buildChart";

const words = (s: string) => s.trim().split(/\s+/).length;
const AUX = [...AUX_STAR_INTERPRETATIONS, ...MINOR_STAR_INTERPRETATIONS];
const FIXED_PALACE: Record<string, string> = { "thien-su": "Tật Ách", "thien-thuong": "Nô Bộc" };

describe("[Interpretation] Luận giải phụ tinh", () => {
  it("Mọi phụ tinh đã triển khai (trừ chính tinh, Tràng Sinh, Tuần Triệt) đều có luận giải", () => {
    const need = STAR_REGISTRY.filter((s) => s.status === "implemented" && !["main", "trang-sinh-cycle", "tuan-triet"].includes(s.category)).map((s) => s.id);
    expect(need.filter((id) => !hasStarInterpretation(id))).toEqual([]);
  });

  it("Tên và id khớp Star Registry, không trùng id", () => {
    const ids = AUX.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of AUX) expect(getStarDef(s.id).name).toBe(s.name);
  });

  it("Tính chất, tích cực, tiêu cực 5–15 từ; câu theo cung 8–16 từ", () => {
    for (const s of AUX) {
      for (const t of [s.core, s.positive, s.negative]) expect(words(t), `${s.name}: ${t}`).toBeGreaterThanOrEqual(5);
      for (const t of [s.core, s.positive, s.negative]) expect(words(t), `${s.name}: ${t}`).toBeLessThanOrEqual(15);
      for (const t of Object.values(s.palaces)) {
        expect(words(t!), `${s.name}: ${t}`).toBeGreaterThanOrEqual(8);
        expect(words(t!), `${s.name}: ${t}`).toBeLessThanOrEqual(16);
      }
    }
  });

  it("Đủ 12 cung (Thiên Sứ, Thiên Thương chỉ ở cung cố định)", () => {
    for (const s of AUX) {
      if (FIXED_PALACE[s.id]) expect(Object.keys(s.palaces)).toEqual([FIXED_PALACE[s.id]]);
      else expect(Object.keys(s.palaces)).toEqual([...PALACE_ORDER]);
    }
  });

  it("Không trùng câu luận giải giữa các cung và giữa các sao", () => {
    const all = [...AUX, ...CYCLE_STAR_INTERPRETATIONS].flatMap((s) => Object.values(s.palaces) as string[]);
    expect(new Set(all).size).toBe(all.length);
  });

  it("Ý nghĩa đắc/hãm chỉ có ở sao có bảng Miếu Hãm hoặc quy tắc rõ", () => {
    const table = { ...BRIGHTNESS_TABLES["vn-ttl"].main, ...BRIGHTNESS_TABLES["vn-ttl"].auxiliary };
    for (const s of AUX) if (s.unfavorable) expect(table[s.id], s.id).toBeDefined();
  });

  it("Luận giải phụ tinh trên lá số thực tế", () => {
    const chart = buildChart({ gender: "male", birth: { calendar: "solar", day: 18, month: 6, year: 1995, hour: 15, minute: 30, timeZone: 7 }, viewYear: 2029 });
    const natal = chart.palaces.flatMap((p) => p.stars).filter((s) => s.layer === "natal" && hasStarInterpretation(s.id));
    for (const s of natal) {
      const r = starReading(chart, s)!;
      expect(r.palaceText, `${s.id} @ ${r.palaceName}`).toBeTruthy();
      if (r.brightnessRule === "HAM" && r.data.unfavorable) expect(r.positionText).toBe(r.data.unfavorable);
    }
    const sat = chart.palaces.flatMap((p) => p.stars).find((s) => s.id === "kinh-duong" && s.layer === "natal")!;
    expect(starReading(chart, sat)!.positionText).toBeTruthy();
  });
});
