import { describe, expect, it } from "vitest";
import { placeAuxiliaryStars, trietPositions, tuanPositions, LOC_TON_BY_STEM, type AuxContext } from "@/core/auxiliary-stars";
import { SCHOOLS } from "@/config/schools";
import { branchOfPalace, yinYangGenderDirection } from "@/core/palaces";
import { LOC_TON_TABLE } from "../fixtures/classic-tables";

const RULES = SCHOOLS["vn-traditional"].rules.starPlacement;

function ctx(p: Partial<AuxContext> & { yStem: number; yBranch: number }): AuxContext {
  const gender = p.gender ?? "male";
  const menh = p.menh ?? 2;
  return {
    month: 1, day: 1, hour: 0, menh, than: p.than ?? menh, gender,
    direction: yinYangGenderDirection(p.yStem, gender),
    palaceBranch: (i) => branchOfPalace(i, menh),
    rules: RULES,
    ...p,
  };
}

describe("[Auxiliary Stars] Lộc Tồn – Kình – Đà", () => {
  it("Lộc Tồn khớp bảng truyền thống", () => {
    expect(LOC_TON_BY_STEM).toEqual(LOC_TON_TABLE);
  });
  it("Kình Dương trước, Đà La sau Lộc Tồn", () => {
    for (let s = 0; s < 10; s++) {
      const a = placeAuxiliaryStars(ctx({ yStem: s, yBranch: s % 2 }));
      expect(a["kinh-duong"].branch).toBe((LOC_TON_TABLE[s] + 1) % 12);
      expect(a["da-la"].branch).toBe((LOC_TON_TABLE[s] + 11) % 12);
    }
  });
});

describe("[Auxiliary Stars] Sao theo tháng", () => {
  it("Tả Phụ / Hữu Bật / Thiên Hình / Thiên Riêu / Thiên Y / Địa Giải / Thiên Giải", () => {
    const m1 = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0, month: 1 }));
    expect(m1["ta-phu"].branch).toBe(4); // Thìn
    expect(m1["huu-bat"].branch).toBe(10); // Tuất
    expect(m1["thien-hinh"].branch).toBe(9); // Dậu
    expect(m1["thien-rieu"].branch).toBe(1); // Sửu
    expect(m1["thien-y"].branch).toBe(1);
    expect(m1["dia-giai"].branch).toBe(7); // Mùi
    expect(m1["thien-giai"].branch).toBe(8); // Thân
    const m5 = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0, month: 5 }));
    expect(m5["ta-phu"].branch).toBe(8); // Thân
    expect(m5["huu-bat"].branch).toBe(6); // Ngọ
    expect(m5["thien-hinh"].branch).toBe(1); // Sửu
    expect(m5["thien-giai"].branch).toBe(0); // Tý
    const skip = placeAuxiliaryStars({ ...ctx({ yStem: 0, yBranch: 0, month: 5 }), rules: { ...RULES, thienGiai: "skip-palace" } });
    expect(skip["thien-giai"].branch).toBe(4); // Thân + 8 = Thìn
  });
});

describe("[Auxiliary Stars] Sao theo giờ", () => {
  it("Văn Xương / Văn Khúc / Địa Không / Địa Kiếp", () => {
    const h0 = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0, hour: 0 }));
    expect(h0["van-xuong"].branch).toBe(10);
    expect(h0["van-khuc"].branch).toBe(4);
    expect(h0["dia-khong"].branch).toBe(11);
    expect(h0["dia-kiep"].branch).toBe(11);
    const h3 = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0, hour: 3 })); // giờ Mão
    expect(h3["van-xuong"].branch).toBe(7); // Mùi
    expect(h3["van-khuc"].branch).toBe(7); // Mùi
    expect(h3["dia-khong"].branch).toBe(8); // Thân
    expect(h3["dia-kiep"].branch).toBe(2); // Dần
    expect(h3["thai-phu"].branch).toBe(9);
    expect(h3["phong-cao"].branch).toBe(5);
  });

  it("Hỏa Tinh / Linh Tinh – Dương Nam năm Giáp Tý (Thân Tý Thìn: Hỏa Dần, Linh Tuất)", () => {
    const a = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0, hour: 2, gender: "male" }));
    expect(a["hoa-tinh"].branch).toBe(4); // Dần + 2
    expect(a["linh-tinh"].branch).toBe(8); // Tuất − 2
    const f = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0, hour: 2, gender: "female" })); // Dương Nữ: đảo chiều
    expect(f["hoa-tinh"].branch).toBe(0);
    expect(f["linh-tinh"].branch).toBe(0);
    const tc = placeAuxiliaryStars({ ...ctx({ yStem: 0, yBranch: 0, hour: 2, gender: "female" }), rules: { ...RULES, hoaLinhDirection: "always-forward" } });
    expect(tc["hoa-tinh"].branch).toBe(4);
    expect(tc["linh-tinh"].branch).toBe(0);
  });

  it("Hỏa Linh nhóm Tỵ Dậu Sửu – mặc định và biến thể", () => {
    const a = placeAuxiliaryStars(ctx({ yStem: 1, yBranch: 1, hour: 0, gender: "female" })); // Ất Sửu, Âm Nữ
    expect(a["hoa-tinh"].branch).toBe(3); // Mão
    expect(a["linh-tinh"].branch).toBe(10); // Tuất
    const v = placeAuxiliaryStars({ ...ctx({ yStem: 1, yBranch: 1, hour: 0, gender: "female" }), rules: { ...RULES, hoaLinhStart: "variant-a" } });
    expect(v["hoa-tinh"].branch).toBe(10);
    expect(v["linh-tinh"].branch).toBe(3);
  });
});

describe("[Auxiliary Stars] Sao theo Chi năm", () => {
  it("Năm Tý", () => {
    const a = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0 }));
    expect(a["thien-ma"].branch).toBe(2); // Dần
    expect(a["dao-hoa"].branch).toBe(9); // Dậu
    expect(a["hong-loan"].branch).toBe(3); // Mão
    expect(a["thien-hy"].branch).toBe(9); // Dậu
    expect(a["thien-khoc"].branch).toBe(6); // Ngọ
    expect(a["thien-hu"].branch).toBe(6); // Ngọ
    expect(a["co-than"].branch).toBe(2); // Dần
    expect(a["qua-tu"].branch).toBe(10); // Tuất
    expect(a["hoa-cai"].branch).toBe(4); // Thìn
    expect(a["kiep-sat"].branch).toBe(5); // Tỵ
    expect(a["pha-toai"].branch).toBe(5); // Tỵ
    expect(a["thien-khong"].branch).toBe(1); // Sửu
    expect(a["thien-duc"].branch).toBe(9); // Dậu
    expect(a["nguyet-duc"].branch).toBe(5); // Tỵ
    expect(a["long-tri"].branch).toBe(4); // Thìn
    expect(a["phuong-cac"].branch).toBe(10); // Tuất
    expect(a["giai-than"].branch).toBe(10);
  });
  it("Năm Ngọ / Mão / Dậu", () => {
    const ngo = placeAuxiliaryStars(ctx({ yStem: 6, yBranch: 6 }));
    expect(ngo["thien-ma"].branch).toBe(8); // Thân
    expect(ngo["dao-hoa"].branch).toBe(3); // Mão
    expect(ngo["hong-loan"].branch).toBe(9); // Dậu
    expect(ngo["thien-khoc"].branch).toBe(0); // Tý
    expect(ngo["thien-hu"].branch).toBe(0); // Tý
    expect(ngo["co-than"].branch).toBe(8); // Thân
    expect(ngo["qua-tu"].branch).toBe(4); // Thìn
    const mao = placeAuxiliaryStars(ctx({ yStem: 1, yBranch: 3 }));
    expect(mao["thien-ma"].branch).toBe(5); // Tỵ
    expect(mao["dao-hoa"].branch).toBe(0); // Tý
    expect(mao["co-than"].branch).toBe(5); // Tỵ
    expect(mao["qua-tu"].branch).toBe(1); // Sửu
    const dau = placeAuxiliaryStars(ctx({ yStem: 3, yBranch: 9 }));
    expect(dau["thien-ma"].branch).toBe(11); // Hợi
    expect(dau["pha-toai"].branch).toBe(5); // Tỵ
    const dan = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 2 }));
    expect(dan["pha-toai"].branch).toBe(9); // Dậu
    const suu = placeAuxiliaryStars(ctx({ yStem: 1, yBranch: 1 }));
    expect(suu["pha-toai"].branch).toBe(1); // Sửu
  });
});

describe("[Auxiliary Stars] Sao theo Can năm", () => {
  it("Thiên Khôi / Việt (khẩu quyết)", () => {
    const expected: [number, number][] = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [6, 2], [3, 5], [3, 5]];
    for (let s = 0; s < 10; s++) {
      const a = placeAuxiliaryStars(ctx({ yStem: s, yBranch: s % 2 }));
      expect([a["thien-khoi"].branch, a["thien-viet"].branch]).toEqual(expected[s]);
    }
  });
  it("Thiên Quan, Thiên Phúc, Lưu Hà, Thiên Trù năm Giáp", () => {
    const a = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0 }));
    expect(a["thien-quan"].branch).toBe(7);
    expect(a["thien-phuc"].branch).toBe(9);
    expect(a["luu-ha"].branch).toBe(9);
    expect(a["thien-tru"].branch).toBe(5);
    expect(a["quoc-an"].branch).toBe(10); // Tuất
    expect(a["duong-phu"].branch).toBe(7); // Mùi
  });
});

describe("[Auxiliary Stars] Sao theo ngày", () => {
  it("Tam Thai / Bát Tọa / Ân Quang / Thiên Quý – tháng Giêng giờ Tý ngày 5", () => {
    const a = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 0, month: 1, hour: 0, day: 5 }));
    expect(a["tam-thai"].branch).toBe(8); // Thìn + 4
    expect(a["bat-toa"].branch).toBe(6); // Tuất − 4
    expect(a["an-quang"].branch).toBe(1); // Xương (Tuất) + 4 − 1 = Sửu
    expect(a["thien-quy"].branch).toBe(1); // Khúc (Thìn) − 4 + 1 = Sửu
  });
});

describe("[Auxiliary Stars] Sao theo cung", () => {
  it("Thiên Thương tại Nô Bộc, Thiên Sứ tại Tật Ách, Thiên Tài/Thọ", () => {
    const a = placeAuxiliaryStars(ctx({ yStem: 0, yBranch: 2, menh: 2, than: 6 }));
    expect(a["thien-thuong"].branch).toBe(7); // Mệnh Dần → Nô Bộc Mùi
    expect(a["thien-su"].branch).toBe(9); // Tật Ách Dậu
    expect(a["thien-tai"].branch).toBe(4); // Dần + 2
    expect(a["thien-tho"].branch).toBe(8); // Ngọ + 2
    expect(a["thien-la"].branch).toBe(4);
    expect(a["dia-vong"].branch).toBe(10);
  });
  it("Tuần – Triệt", () => {
    expect(tuanPositions(0, 0)).toEqual([10, 11]); // Giáp Tý: Tuất Hợi
    expect(tuanPositions(0, 10)).toEqual([8, 9]); // Giáp Tuất: Thân Dậu
    expect(tuanPositions(6, 6)).toEqual([10, 11]); // Canh Ngọ thuộc tuần Giáp Tý → Tuất Hợi
    expect(tuanPositions(9, 11)).toEqual([0, 1]); // Quý Hợi thuộc tuần Giáp Dần → Tý Sửu
    expect(trietPositions(0)).toEqual([8, 9]); // Giáp: Thân Dậu
    expect(trietPositions(6)).toEqual([6, 7]); // Canh: Ngọ Mùi
    expect(trietPositions(9)).toEqual([0, 1]); // Quý: Tý Sửu
  });
});
