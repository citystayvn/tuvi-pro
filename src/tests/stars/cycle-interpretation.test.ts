import { describe, expect, it } from "vitest";
import { CYCLE_STAR_INTERPRETATIONS, PALACE_ORDER } from "@/core/interpretation/cycle-stars";
import { cycleStarReading } from "@/core/interpretation";
import { BAC_SI_CYCLE, THAI_TUE_CYCLE } from "@/core/star-cycles";
import { getStarDef } from "@/config/stars/registry";
import { brightnessOf } from "@/core/brightness";
import { buildChart } from "@/core/chart/buildChart";

const words = (s: string) => s.trim().split(/\s+/).length;

describe("[Interpretation] Luận giải vòng Thái Tuế và vòng Bác Sĩ", () => {
  it("Đủ 24 sao, đúng thứ tự hai vòng", () => {
    expect(CYCLE_STAR_INTERPRETATIONS.map((s) => s.id)).toEqual([...THAI_TUE_CYCLE.map((s) => s.id), ...BAC_SI_CYCLE.map((s) => s.id)]);
    expect(CYCLE_STAR_INTERPRETATIONS.filter((s) => s.ring === "thai-tue")).toHaveLength(12);
    expect(CYCLE_STAR_INTERPRETATIONS.filter((s) => s.ring === "bac-si")).toHaveLength(12);
  });

  it("Không nhầm Quan Phù (Thái Tuế) với Quan Phủ (Bác Sĩ)", () => {
    const tt = CYCLE_STAR_INTERPRETATIONS.find((s) => s.id === "quan-phu-tt")!;
    const bs = CYCLE_STAR_INTERPRETATIONS.find((s) => s.id === "quan-phu-bs")!;
    expect([tt.name, tt.ring, getStarDef(tt.id).name, getStarDef(tt.id).category]).toEqual(["Quan Phù", "thai-tue", "Quan Phù", "thai-tue-cycle"]);
    expect([bs.name, bs.ring, getStarDef(bs.id).name, getStarDef(bs.id).category]).toEqual(["Quan Phủ", "bac-si", "Quan Phủ", "bac-si-cycle"]);
  });

  it("Tên và nhóm khớp Star Registry", () => {
    for (const s of CYCLE_STAR_INTERPRETATIONS) {
      expect(getStarDef(s.id).name).toBe(s.name);
      expect(getStarDef(s.id).category).toBe(s.ring === "thai-tue" ? "thai-tue-cycle" : "bac-si-cycle");
    }
  });

  it("Mỗi sao có tính chất, tích cực, tiêu cực (5–15 từ)", () => {
    for (const s of CYCLE_STAR_INTERPRETATIONS)
      for (const t of [s.core, s.positive, s.negative]) {
        expect(words(t), `${s.name}: ${t}`).toBeGreaterThanOrEqual(5);
        expect(words(t), `${s.name}: ${t}`).toBeLessThanOrEqual(15);
      }
  });

  it("Đủ 12 cung × 24 sao = 288 câu, mỗi câu 8–16 từ, không trùng lặp", () => {
    const all: string[] = [];
    for (const s of CYCLE_STAR_INTERPRETATIONS) {
      expect(Object.keys(s.palaces)).toEqual([...PALACE_ORDER]);
      for (const name of PALACE_ORDER) {
        const t = s.palaces[name];
        expect(words(t), `${s.name} – ${name}: ${t}`).toBeGreaterThanOrEqual(8);
        expect(words(t), `${s.name} – ${name}: ${t}`).toBeLessThanOrEqual(16);
        all.push(t);
      }
    }
    expect(all).toHaveLength(288);
    expect(new Set(all).size).toBe(288);
  });

  it("Không tự gán Miếu/Hãm cho 24 sao (hệ thống không quy định)", () => {
    for (const s of CYCLE_STAR_INTERPRETATIONS) for (let b = 0; b < 12; b++) expect(brightnessOf(s.id, b, "vn-ttl", true)).toBeUndefined();
  });

  it("Tổ hợp chỉ tham chiếu sao có thật", () => {
    for (const s of CYCLE_STAR_INTERPRETATIONS) for (const c of s.combos) for (const id of c.with) expect(() => getStarDef(id)).not.toThrow();
  });

  it("Luận giải theo cung chỉ dành cho sao nguyên cục, không dùng cho sao lưu niên", () => {
    const chart = buildChart({ gender: "male", birth: { calendar: "solar", day: 18, month: 6, year: 1995, hour: 15, minute: 30, timeZone: 7 }, viewYear: 2029 });
    const stars = chart.palaces.flatMap((p) => p.stars);
    const natal = stars.find((s) => s.id === "thai-tue" && s.layer === "natal")!;
    const annual = stars.find((s) => s.id === "thai-tue" && s.layer === "annual")!;
    const rn = cycleStarReading(chart, natal)!;
    expect(rn.palaceText).toBe(rn.data.palaces[chart.palaces[natal.branch].name as (typeof PALACE_ORDER)[number]]);
    expect(rn.brightnessRule).toBeNull();
    expect(cycleStarReading(chart, annual)!.palaceText).toBeNull();
    // Mọi sao vòng trên lá số đều có luận giải tại cung của nó
    for (const s of stars.filter((x) => x.layer === "natal" && (x.category === "thai-tue-cycle" || x.category === "bac-si-cycle")))
      expect(cycleStarReading(chart, s)!.palaceText).toBeTruthy();
  });
});
