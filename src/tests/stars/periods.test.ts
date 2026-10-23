import { describe, expect, it } from "vitest";
import { majorPeriodAtAge, majorPeriods, nominalAge } from "@/core/major-periods";
import { annualStars, minorPeriodBranch, minorPeriodStart, minorPeriodYearBranchAt } from "@/core/annual-periods";
import { buildChart } from "@/core/chart/buildChart";
import { SCHOOLS } from "@/config/schools";

describe("[Major Periods] Đại hạn", () => {
  it("Khởi tại Mệnh, tuổi khởi = số Cục, mỗi cung 10 năm", () => {
    const st = Array(12).fill(0);
    const fwd = majorPeriods(2, 5, 1, st);
    expect(fwd[0]).toMatchObject({ branch: 2, startAge: 5, endAge: 14 });
    expect(fwd[1]).toMatchObject({ branch: 3, startAge: 15 });
    const bwd = majorPeriods(2, 3, -1, st);
    expect(bwd[1]).toMatchObject({ branch: 1, startAge: 13 });
    expect(majorPeriodAtAge(fwd, 4)).toBeNull();
    expect(majorPeriodAtAge(fwd, 37)?.branch).toBe(5);
  });
  it("Tuổi mụ", () => {
    expect(nominalAge(1990, 1990)).toBe(1);
    expect(nominalAge(1990, 2026)).toBe(37);
  });
  it("Nam/Nữ cùng ngày giờ sinh: đại hạn ngược chiều", () => {
    const birth = { calendar: "solar" as const, day: 15, month: 8, year: 1990, hour: 10, minute: 30, timeZone: 7 };
    const m = buildChart({ gender: "male", birth, viewYear: 2026 });
    const f = buildChart({ gender: "female", birth, viewYear: 2026 });
    expect(m.yinYangGender).toBe("Dương Nam");
    expect(f.yinYangGender).toBe("Dương Nữ");
    expect(m.menhBranch).toBe(f.menhBranch);
    const mNext = m.palaces.find((p) => p.majorPeriod.startAge === m.cuc.number + 10)!.branch;
    const fNext = f.palaces.find((p) => p.majorPeriod.startAge === f.cuc.number + 10)!.branch;
    expect(mNext).toBe((m.menhBranch + 1) % 12);
    expect(fNext).toBe((f.menhBranch + 11) % 12);
  });
});

describe("[Annual Periods] Tiểu hạn – Lưu niên", () => {
  it("Cung khởi tiểu hạn theo tam hợp năm sinh", () => {
    expect(minorPeriodStart(2)).toBe(4); // Dần → Thìn
    expect(minorPeriodStart(6)).toBe(4); // Ngọ → Thìn
    expect(minorPeriodStart(0)).toBe(10); // Tý → Tuất
    expect(minorPeriodStart(5)).toBe(7); // Tỵ → Mùi
    expect(minorPeriodStart(11)).toBe(1); // Hợi → Sửu
  });
  it("Năm sinh tiểu hạn tại cung khởi; nam thuận nữ nghịch", () => {
    expect(minorPeriodBranch(6, "male", 6)).toBe(4);
    expect(minorPeriodBranch(6, "male", 7)).toBe(5);
    expect(minorPeriodBranch(6, "female", 7)).toBe(3);
    for (let p = 0; p < 12; p++) {
      const yb = minorPeriodYearBranchAt(6, "female", p);
      expect(minorPeriodBranch(6, "female", yb)).toBe(p);
    }
  });
  it("Sao lưu niên năm Bính Ngọ 2026", () => {
    const list = annualStars(2, 6, SCHOOLS["vn-traditional"].rules.starPlacement);
    const by = Object.fromEntries(list.map((s) => [s.id, s.branch]));
    expect(by["thai-tue"]).toBe(6);
    expect(by["tang-mon"]).toBe(8);
    expect(by["bach-ho"]).toBe(2);
    expect(by["loc-ton"]).toBe(5); // Bính → Tỵ
    expect(by["kinh-duong"]).toBe(6);
    expect(by["da-la"]).toBe(4);
    expect(by["thien-ma"]).toBe(8);
  });
  it("Sao lưu không ghi đè sao nguyên cục", () => {
    const birth = { calendar: "solar" as const, day: 15, month: 8, year: 1990, hour: 10, minute: 30, timeZone: 7 };
    const a = buildChart({ gender: "male", birth, viewYear: 2026 });
    const b = buildChart({ gender: "male", birth, viewYear: 2030 });
    const natal = (c: typeof a) => c.palaces.map((p) => p.stars.filter((s) => s.layer === "natal").map((s) => `${s.id}:${s.branch}:${s.transformation ?? ""}`).sort());
    expect(natal(a)).toEqual(natal(b));
    const annual = a.palaces.flatMap((p) => p.stars.filter((s) => s.layer === "annual"));
    expect(annual.every((s) => s.displayName.startsWith("L."))).toBe(true);
    expect(annual.filter((s) => s.category === "transformation")).toHaveLength(4);
    expect(a.period.nominalAge).toBe(37);
    expect(a.period.annualBranch).toBe(6);
  });
});
