import { describe, expect, it } from "vitest";
import { MAIN_STAR_IDS, placeMainStars, thienPhuPosition, tuViPosition } from "@/core/main-stars";
import { TU_VI_COMPANIONS, TU_VI_TABLE } from "../fixtures/classic-tables";

describe("[Main Stars] Tử Vi – bảng an Tử Vi truyền thống", () => {
  for (const cuc of [2, 3, 4, 5, 6]) {
    it(`Cục ${cuc}, ngày 1–30`, () => {
      for (let d = 1; d <= 30; d++) expect(tuViPosition(d, cuc), `ngày ${d}`).toBe(TU_VI_TABLE[cuc][d - 1]);
    });
  }
  it("Từ chối dữ liệu không hợp lệ", () => {
    expect(() => tuViPosition(0, 2)).toThrow();
    expect(() => tuViPosition(31, 2)).toThrow();
    expect(() => tuViPosition(5, 7)).toThrow();
  });
});

describe("[Main Stars] Thiên Phủ và tổ hợp đồng cung", () => {
  it.each(TU_VI_COMPANIONS)("Tử Vi tại $tuVi", ({ tuVi, companion, thienPhu }) => {
    expect(thienPhuPosition(tuVi)).toBe(thienPhu);
    // tìm ngày/cục bất kỳ cho Tử Vi tại vị trí này
    let found: Record<string, number> | null = null;
    for (const cuc of [2, 3, 4, 5, 6]) for (let d = 1; d <= 30 && !found; d++) if (tuViPosition(d, cuc) === tuVi) found = placeMainStars(d, cuc);
    expect(found).not.toBeNull();
    const together = Object.entries(found!).filter(([id, b]) => b === tuVi && id !== "tu-vi").map(([id]) => id);
    expect(together).toEqual(companion ? [companion] : []);
  });

  it("Quan hệ cố định: Thất Sát xung Thiên Phủ, Phá Quân xung Thiên Tướng, Tử Vi + Thiên Phủ ≡ Thìn", () => {
    for (const cuc of [2, 3, 4, 5, 6])
      for (let d = 1; d <= 30; d++) {
        const p = placeMainStars(d, cuc);
        expect((p["that-sat"] - p["thien-phu"] + 12) % 12).toBe(6);
        expect((p["pha-quan"] - p["thien-tuong"] + 12) % 12).toBe(6);
        expect((p["thai-am"] - p["thien-phu"] + 12) % 12).toBe(1);
        expect((p["tu-vi"] + p["thien-phu"]) % 12).toBe(4);
      }
  });

  it("Mỗi chính tinh được an đúng một lần, 14 sao", () => {
    expect(MAIN_STAR_IDS).toHaveLength(14);
    for (const cuc of [2, 3, 4, 5, 6])
      for (let d = 1; d <= 30; d++) {
        const p = placeMainStars(d, cuc);
        expect(Object.keys(p).sort()).toEqual([...MAIN_STAR_IDS].sort());
      }
  });

  it("Chòm Tử Vi: khoảng cách cố định", () => {
    const p = placeMainStars(1, 2); // Tử Vi tại Sửu
    expect(p["tu-vi"]).toBe(1);
    expect(p["thien-co"]).toBe(0);
    expect(p["thai-duong"]).toBe(10);
    expect(p["vu-khuc"]).toBe(9);
    expect(p["thien-dong"]).toBe(8);
    expect(p["liem-trinh"]).toBe(5);
    expect(p["thien-phu"]).toBe(3);
    expect(p["thai-am"]).toBe(4);
    expect(p["tham-lang"]).toBe(5);
    expect(p["cu-mon"]).toBe(6);
    expect(p["thien-tuong"]).toBe(7);
    expect(p["thien-luong"]).toBe(8);
    expect(p["that-sat"]).toBe(9);
    expect(p["pha-quan"]).toBe(1);
  });
});
