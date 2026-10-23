import { describe, expect, it } from "vitest";
import { transformationsForStem } from "@/core/transformations";
import { buildChart } from "@/core/chart/buildChart";
import { TU_HOA_TABLE } from "../fixtures/classic-tables";

const VN = { canh: "nhat-vu-am-dong" as const, nham: "luong-tu-phu-vu" as const };

describe("[Transformations] Tứ Hóa theo Can năm", () => {
  it.each(TU_HOA_TABLE.map((row, stem) => ({ stem, row })))("Can $stem", ({ stem, row }) => {
    expect(transformationsForStem(stem, VN)).toEqual(row);
  });
  it("Biến thể năm Canh và Nhâm", () => {
    expect(transformationsForStem(6, { ...VN, canh: "nhat-vu-dong-am" })).toEqual(["thai-duong", "vu-khuc", "thien-dong", "thai-am"]);
    expect(transformationsForStem(8, { ...VN, nham: "luong-tu-ta-vu" })).toEqual(["thien-luong", "tu-vi", "ta-phu", "vu-khuc"]);
  });
  it("Sao Hóa được đặt vào cung của sao bị hóa và gắn nhãn lên sao gốc", () => {
    const c = buildChart({ gender: "male", birth: { calendar: "solar", day: 15, month: 8, year: 1990, hour: 10, minute: 30, timeZone: 7 }, viewYear: 2026 });
    // Năm Canh: Thái Dương hóa Lộc
    const all = c.palaces.flatMap((p) => p.stars.filter((s) => s.layer === "natal"));
    const td = all.find((s) => s.id === "thai-duong")!;
    const loc = all.find((s) => s.id === "hoa-loc")!;
    expect(td.transformation).toBe("LOC");
    expect(loc.branch).toBe(td.branch);
    expect(loc.transformsStarId).toBe("thai-duong");
    expect(all.filter((s) => s.category === "transformation")).toHaveLength(4);
  });
});
