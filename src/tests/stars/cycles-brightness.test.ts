import { describe, expect, it } from "vitest";
import { BAC_SI_CYCLE, placeCycle, THAI_TUE_CYCLE, TRANG_SINH_CYCLE, TRANG_SINH_START } from "@/core/star-cycles";
import { brightnessOf } from "@/core/brightness";
import { buildChart } from "@/core/chart/buildChart";

describe("[Auxiliary Stars] Vòng sao", () => {
  it("Vòng Thái Tuế an thuận từ Chi năm", () => {
    const p = placeCycle(THAI_TUE_CYCLE, 4, 1); // năm Thìn
    expect(p["thai-tue"]).toBe(4);
    expect(p["tang-mon"]).toBe(6);
    expect(p["bach-ho"]).toBe(0);
    expect(p["truc-phu"]).toBe(3);
  });
  it("Vòng Bác Sĩ: thuận/nghịch", () => {
    const fwd = placeCycle(BAC_SI_CYCLE, 2, 1);
    expect(fwd["bac-si"]).toBe(2);
    expect(fwd["luc-si"]).toBe(3);
    expect(fwd["quan-phu-bs"]).toBe(1);
    const bwd = placeCycle(BAC_SI_CYCLE, 2, -1);
    expect(bwd["luc-si"]).toBe(1);
    expect(bwd["quan-phu-bs"]).toBe(3);
  });
  it("Vòng Tràng Sinh khởi theo Cục", () => {
    expect(TRANG_SINH_START).toEqual({ THUY: 8, THO: 8, MOC: 11, KIM: 5, HOA: 2 });
    const p = placeCycle(TRANG_SINH_CYCLE, 8, 1);
    expect(p["de-vuong"]).toBe(0); // Thủy: Đế Vượng tại Tý
    expect(p["mo"]).toBe(4); // Thủy: Mộ tại Thìn
    const k = placeCycle(TRANG_SINH_CYCLE, 5, 1);
    expect(k["de-vuong"]).toBe(9); // Kim: Đế Vượng tại Dậu
    expect(k["mo"]).toBe(1); // Kim: Mộ tại Sửu
  });
  it("Mỗi vòng phủ đủ 12 cung", () => {
    for (const cyc of [THAI_TUE_CYCLE, BAC_SI_CYCLE, TRANG_SINH_CYCLE])
      for (const dir of [1, -1] as const) expect(new Set(Object.values(placeCycle(cyc, 3, dir))).size).toBe(12);
  });
});

describe("[Main Stars] Miếu – Vượng – Đắc – Bình – Hãm", () => {
  it("Bảng tra chính tinh", () => {
    expect(brightnessOf("thai-duong", 6, "vn-ttl", true)).toBe("MIEU"); // Ngọ
    expect(brightnessOf("thai-duong", 0, "vn-ttl", true)).toBe("HAM"); // Tý
    expect(brightnessOf("thai-am", 11, "vn-ttl", true)).toBe("MIEU"); // Hợi
    expect(brightnessOf("tu-vi", 6, "vn-ttl", true)).toBe("MIEU");
    expect(brightnessOf("cu-mon", 4, "vn-ttl", true)).toBe("HAM"); // Thìn
    expect(brightnessOf("thien-phu", 1, "vn-ttl", true)).toBe("UNDEFINED");
  });
  it("Không gán trạng thái khi không có quy tắc", () => {
    expect(brightnessOf("thien-hy", 3, "vn-ttl", true)).toBeUndefined();
    expect(brightnessOf("tu-vi", 3, "none", true)).toBeUndefined();
    expect(brightnessOf("kinh-duong", 4, "vn-ttl", false)).toBeUndefined();
    expect(brightnessOf("kinh-duong", 4, "vn-ttl", true)).toBe("DAC");
  });
  it("Trường phái không có bảng tra không gán trạng thái", () => {
    const c = buildChart({ gender: "male", schoolId: "trung-chau", birth: { calendar: "solar", day: 15, month: 8, year: 1990, hour: 10, minute: 30, timeZone: 7 }, viewYear: 2026 });
    expect(c.palaces.flatMap((p) => p.stars).every((s) => s.brightness === undefined)).toBe(true);
  });
});
