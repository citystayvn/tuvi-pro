import { describe, expect, it } from "vitest";
import { buildChart } from "@/core/chart/buildChart";
import { analyzePalace, chartOverview } from "@/core/interpretation";

const chart = buildChart({ gender: "male", birth: { calendar: "solar", day: 15, month: 8, year: 1990, hour: 10, minute: 30, timeZone: 7 }, viewYear: 2026 });

describe("[Interpretation] Phân tích cấu trúc cung", () => {
  it("Tam phương tứ chính của cung Mệnh", () => {
    const a = analyzePalace(chart, chart.menhBranch);
    expect(a.palace.name).toBe("Mệnh");
    expect(a.opposite.name).toBe("Thiên Di");
    expect(a.trine.map((p) => p.name).sort()).toEqual(["Quan Lộc", "Tài Bạch"]);
    expect(a.converging.every((s) => s.branch !== chart.menhBranch)).toBe(true);
  });
  it("Cung vô chính diệu mượn sao cung đối", () => {
    const empty = chart.palaces.find((p) => !p.stars.some((s) => s.category === "main"))!;
    const a = analyzePalace(chart, empty.branch);
    expect(a.mainStars).toHaveLength(0);
    expect(a.borrowedMainStars.length).toBeGreaterThan(0);
  });
  it("Lá số mẫu: Mệnh Vũ Tướng tại Dần – có cách Tử Phủ Vũ Tướng", () => {
    const a = analyzePalace(chart, chart.menhBranch);
    expect(a.mainStars.map((s) => s.id).sort()).toEqual(["thien-tuong", "vu-khuc"]);
    expect(a.groups.map((g) => g.id)).toContain("tu-phu-vu-tuong");
  });
  it("Tổng quan có nội dung", () => {
    expect(chartOverview(chart).length).toBeGreaterThanOrEqual(3);
  });
});
