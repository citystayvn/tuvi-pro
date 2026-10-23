import { describe, expect, it } from "vitest";
import { MAIN_STAR_INTERPRETATIONS } from "@/core/interpretation/main-stars";
import { AUX_STAR_INTERPRETATIONS } from "@/core/interpretation/aux-stars";
import { MINOR_STAR_INTERPRETATIONS } from "@/core/interpretation/aux-stars-minor";
import { CYCLE_STAR_INTERPRETATIONS, PALACE_ORDER } from "@/core/interpretation/cycle-stars";
import { starReading } from "@/core/interpretation";
import { STAR_REGISTRY, getStarDef } from "@/config/stars/registry";
import { BRIGHTNESS_TABLES } from "@/core/brightness";
import { buildChart } from "@/core/chart/buildChart";

const words = (s: string) => s.trim().split(/\s+/).length;
const MAIN = MAIN_STAR_INTERPRETATIONS;

describe("[Interpretation] Luận giải 14 chính tinh", () => {
  it("Đủ 14 chính tinh trong Star Registry, tên khớp", () => {
    const ids = STAR_REGISTRY.filter((s) => s.category === "main").map((s) => s.id).sort();
    expect(MAIN.map((s) => s.id).sort()).toEqual(ids);
    for (const s of MAIN) expect(getStarDef(s.id).name).toBe(s.name);
  });

  it("Đủ 12 cung, tổng 168 câu, độ dài hợp lệ", () => {
    let n = 0;
    for (const s of MAIN) {
      expect(Object.keys(s.palaces)).toEqual([...PALACE_ORDER]);
      for (const t of [s.core, s.positive, s.negative]) expect(words(t), t).toBeGreaterThanOrEqual(5);
      for (const t of [s.core, s.positive, s.negative]) expect(words(t), t).toBeLessThanOrEqual(15);
      for (const t of Object.values(s.palaces)) {
        n++;
        expect(words(t!), t).toBeGreaterThanOrEqual(8);
        expect(words(t!), t).toBeLessThanOrEqual(16);
      }
    }
    expect(n).toBe(168);
  });

  it("Không trùng câu với mọi sao khác", () => {
    const all = [...MAIN, ...AUX_STAR_INTERPRETATIONS, ...MINOR_STAR_INTERPRETATIONS, ...CYCLE_STAR_INTERPRETATIONS].flatMap((s) => Object.values(s.palaces) as string[]);
    expect(new Set(all).size).toBe(all.length);
  });

  it("Câu hãm địa chỉ có ở sao có vị trí Hãm trong bảng vn-ttl", () => {
    const table = BRIGHTNESS_TABLES["vn-ttl"].main as Record<string, string[]>;
    for (const s of MAIN) expect(Boolean(s.unfavorable), s.id).toBe(table[s.id].includes("HAM"));
  });

  it("Luận giải chính tinh trên lá số thực tế (Bình không luận đắc/hãm)", () => {
    const chart = buildChart({ gender: "male", birth: { calendar: "solar", day: 18, month: 6, year: 1995, hour: 15, minute: 30, timeZone: 7 }, viewYear: 2029 });
    const mains = chart.palaces.flatMap((p) => p.stars).filter((s) => s.layer === "natal" && s.category === "main");
    expect(mains.length).toBe(14);
    for (const s of mains) {
      const r = starReading(chart, s)!;
      expect(r.palaceText).toBe(r.data.palaces[r.palaceName as (typeof PALACE_ORDER)[number]]);
      if (r.brightnessRule === "HAM") expect(r.positionText).toBe(r.data.unfavorable);
      else if (r.brightnessRule === "BINH" || !r.brightnessRule) expect(r.positionText).toBeNull();
      else expect(r.positionText).toBe(r.data.favorable);
    }
  });
});
