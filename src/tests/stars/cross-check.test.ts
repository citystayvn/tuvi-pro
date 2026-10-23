/**
 * Đối chiếu chéo với một triển khai độc lập (lasotuvi, Python, MIT).
 * Fixture được sinh bởi scripts/reference/generate_lasotuvi_fixtures.py – KHÔNG dùng engine này.
 *
 * 1. Cấu hình engine theo đúng các lựa chọn trường phái của lasotuvi → phải khớp 100%.
 * 2. Cấu hình mặc định → chỉ được khác ở các sao đã ghi nhận là có mâu thuẫn nguồn.
 */
import { describe, expect, it } from "vitest";
import fixture from "../fixtures/lasotuvi-cross-check.json";
import { buildChart } from "@/core/chart/buildChart";
import { BRANCHES } from "@/core/stems-branches";

interface Case {
  input: { day: number; month: number; year: number; hourBranch: number; gender: "male" | "female" };
  lunar: { day: number; month: number; year: number; isLeap: boolean };
  menh: number;
  than: number;
  stars: Record<string, number>;
  tuan: number[];
  triet: number[];
  majorPeriodStartAge: Record<string, number>;
  minorPeriodYearBranch: Record<string, string>;
}

const cases = (fixture as { cases: Case[] }).cases;

const LASOTUVI_PROFILE = {
  starPlacement: { khoiViet: "variant-a", hoaLinhStart: "variant-a", thienGiai: "skip-palace", luuHa: "variant-a", phaToai: "variant-a" },
  transformation: { canh: "nhat-vu-dong-am", nham: "luong-tu-phu-vu" },
} as const;

/** Sao có quy tắc khác nhau giữa mặc định và lasotuvi (xem src/config/rules/conflicts.ts). */
const KNOWN_CONFLICT_STARS = new Set(["thien-khoi", "thien-viet", "hoa-tinh", "linh-tinh", "thien-giai", "luu-ha", "pha-toai", "hoa-khoa", "hoa-ky"]);

/**
 * Sai khác đã phân tích và xác định là lỗi của lasotuvi (không phải khác biệt trường phái):
 * lasotuvi an Thai tại (Tràng Sinh − 1) và Dưỡng tại (Tràng Sinh − 2), trong khi thứ tự
 * 12 giai đoạn là "… Tuyệt, Thai, Dưỡng, Tràng Sinh" – Dưỡng phải liền trước Tràng Sinh.
 */
const LASOTUVI_KNOWN_ERRORS = new Set(["thai", "duong"]);

function run(c: Case, overrides?: object) {
  return buildChart({
    gender: c.input.gender,
    birth: { calendar: "solar", day: c.input.day, month: c.input.month, year: c.input.year, hour: c.input.hourBranch * 2, minute: 0, timeZone: 7 },
    viewYear: 2026,
    ruleOverrides: overrides as never,
  });
}

function natalPositions(chart: ReturnType<typeof buildChart>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of chart.palaces) for (const s of p.stars) if (s.layer === "natal") out[s.id] = s.branch;
  return out;
}

describe("[Cross-check] Đối chiếu với lasotuvi (240 lá số)", () => {
  it("Fixture đủ dữ liệu", () => {
    expect(cases.length).toBe(240);
    expect(Object.keys(cases[0].stars).length).toBeGreaterThan(100);
  });

  it("[Calendar Engine] Âm lịch khớp", () => {
    for (const c of cases) {
      const ch = run(c);
      expect(ch.birth.lunar, JSON.stringify(c.input)).toEqual({ day: c.lunar.day, month: c.lunar.month, year: c.lunar.year, isLeapMonth: c.lunar.isLeap });
    }
  });

  it("[Palace Engine] Mệnh, Thân khớp", () => {
    for (const c of cases) {
      const ch = run(c);
      expect([ch.menhBranch, ch.thanBranch], JSON.stringify(c.input)).toEqual([c.menh, c.than]);
    }
  });

  it("[Main Stars] [Auxiliary Stars] [Transformations] Khớp 100% khi dùng cùng lựa chọn trường phái", () => {
    const mismatches: string[] = [];
    for (const c of cases) {
      const pos = natalPositions(run(c, LASOTUVI_PROFILE));
      for (const [id, b] of Object.entries(c.stars)) {
        if (LASOTUVI_KNOWN_ERRORS.has(id)) continue;
        if (pos[id] !== b) mismatches.push(`${JSON.stringify(c.input)} ${id}: engine=${pos[id]} lasotuvi=${b}`);
      }
    }
    expect(mismatches.slice(0, 20)).toEqual([]);
  });

  it("Thai – Dưỡng: lasotuvi đảo chỗ; engine giữ thứ tự Tuyệt → Thai → Dưỡng → Tràng Sinh", () => {
    for (const c of cases) {
      const pos = natalPositions(run(c));
      expect(pos["thai"]).toBe(c.stars["duong"]);
      expect(pos["duong"]).toBe(c.stars["thai"]);
    }
  });

  it("[Auxiliary Stars] Tuần – Triệt khớp", () => {
    for (const c of cases) {
      const ch = run(c);
      expect(ch.palaces.filter((p) => p.hasTuan).map((p) => p.branch)).toEqual(c.tuan);
      expect(ch.palaces.filter((p) => p.hasTriet).map((p) => p.branch)).toEqual(c.triet);
    }
  });

  it("[Major Periods] Đại hạn khớp", () => {
    for (const c of cases) {
      const ch = run(c);
      for (const p of ch.palaces) expect(p.majorPeriod.startAge).toBe(c.majorPeriodStartAge[String(p.branch)]);
    }
  });

  it("[Annual Periods] Tiểu hạn khớp", () => {
    for (const c of cases) {
      const ch = run(c);
      for (const p of ch.palaces) expect(BRANCHES[p.minorPeriodYearBranch]).toBe(c.minorPeriodYearBranch[String(p.branch)]);
    }
  });

  it("Cấu hình mặc định chỉ khác ở các sao có mâu thuẫn nguồn đã ghi nhận", () => {
    const unexpected: string[] = [];
    for (const c of cases) {
      const pos = natalPositions(run(c));
      for (const [id, b] of Object.entries(c.stars)) {
        if (pos[id] !== b && !KNOWN_CONFLICT_STARS.has(id) && !LASOTUVI_KNOWN_ERRORS.has(id)) unexpected.push(`${JSON.stringify(c.input)} ${id}`);
      }
    }
    expect(unexpected).toEqual([]);
  });
});
