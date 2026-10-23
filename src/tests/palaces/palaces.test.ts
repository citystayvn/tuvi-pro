import { describe, expect, it } from "vitest";
import {
  branchOfPalace,
  computeCuc,
  menhBranch,
  palaceIndexAt,
  palaceStems,
  tamPhuongTuChinh,
  thanBranch,
  yinYangGenderDirection,
} from "@/core/palaces";
import { napAm, menhCucRelationLabel } from "@/core/elements";
import { sexagenaryIndex } from "@/core/stems-branches";
import { CUC_TABLE } from "../fixtures/classic-tables";

describe("[Palace Engine] An Mệnh – Thân", () => {
  it("Tháng Giêng giờ Tý: Mệnh và Thân đều tại Dần", () => {
    expect(menhBranch(1, 0)).toBe(2);
    expect(thanBranch(1, 0)).toBe(2);
  });
  it("Tháng Giêng giờ Sửu: Mệnh Sửu, Thân Mão", () => {
    expect(menhBranch(1, 1)).toBe(1);
    expect(thanBranch(1, 1)).toBe(3);
  });
  it("Tháng 6 giờ Tỵ: Mệnh Dần, Thân Tý", () => {
    expect(menhBranch(6, 5)).toBe(2);
    expect(thanBranch(6, 5)).toBe(0);
  });
  it("Giờ Tý và giờ Ngọ: Mệnh Thân đồng cung / xung chiếu", () => {
    for (let m = 1; m <= 12; m++) {
      expect(menhBranch(m, 0)).toBe(thanBranch(m, 0));
      expect(menhBranch(m, 6)).toBe(thanBranch(m, 6));
    }
  });
  it("Thân chỉ cư 6 cung: Mệnh, Phu Thê, Tài Bạch, Thiên Di, Quan Lộc, Phúc Đức", () => {
    const allowed = new Set([0, 2, 4, 6, 8, 10]);
    for (let m = 1; m <= 12; m++)
      for (let h = 0; h < 12; h++) expect(allowed.has(palaceIndexAt(thanBranch(m, h), menhBranch(m, h)))).toBe(true);
  });
});

describe("[Palace Engine] 12 cung và Can cung", () => {
  it("12 cung an nghịch từ Mệnh", () => {
    const menh = 2; // Dần
    expect(branchOfPalace(1, menh)).toBe(1); // Huynh Đệ – Sửu
    expect(branchOfPalace(2, menh)).toBe(0); // Phu Thê – Tý
    expect(branchOfPalace(6, menh)).toBe(8); // Thiên Di – Thân
    expect(branchOfPalace(11, menh)).toBe(3); // Phụ Mẫu – Mão
    for (let i = 0; i < 12; i++) expect(palaceIndexAt(branchOfPalace(i, menh), menh)).toBe(i);
  });
  it("Can cung năm Giáp: Bính Dần, Đinh Mão … Bính Tý, Đinh Sửu", () => {
    const st = palaceStems(0);
    expect(st[2]).toBe(2);
    expect(st[3]).toBe(3);
    expect(st[11]).toBe(1); // Ất Hợi
    expect(st[0]).toBe(2); // Bính Tý
    expect(st[1]).toBe(3); // Đinh Sửu
  });
  it("Tam phương tứ chính", () => {
    expect(tamPhuongTuChinh(2)).toEqual({ self: 2, opposite: 8, trine: [6, 10] });
  });
});

describe("[Palace Engine] Ngũ hành Cục – bảng tra truyền thống", () => {
  it("Toàn bộ 60 tổ hợp Can năm × cung Mệnh khớp bảng tìm Cục", () => {
    for (let stem = 0; stem < 10; stem++)
      for (let b = 0; b < 12; b++) expect(computeCuc(stem, b).number).toBe(CUC_TABLE[stem % 5][Math.floor(b / 2)]);
  });
  it("Nạp âm", () => {
    expect(napAm(0, 0).name).toBe("Hải Trung Kim");
    expect(napAm(6, 6).name).toBe("Lộ Bàng Thổ"); // Canh Ngọ
    expect(napAm(0, 4).name).toBe("Phú Đăng Hỏa"); // Giáp Thìn
    expect(napAm(9, 11).name).toBe("Đại Hải Thủy"); // Quý Hợi
    expect(sexagenaryIndex(0, 10)).toBe(10); // Giáp Tuất
    expect(() => sexagenaryIndex(0, 1)).toThrow();
  });
  it("Quan hệ Mệnh – Cục", () => {
    expect(menhCucRelationLabel("KIM", "THUY")).toBe("Mệnh sinh Cục");
    expect(menhCucRelationLabel("KIM", "THO")).toBe("Cục sinh Mệnh");
    expect(menhCucRelationLabel("KIM", "MOC")).toBe("Mệnh khắc Cục");
    expect(menhCucRelationLabel("KIM", "HOA")).toBe("Cục khắc Mệnh");
    expect(menhCucRelationLabel("KIM", "KIM")).toBe("Bình hòa");
  });
  it("Âm Dương Nam Nữ", () => {
    expect(yinYangGenderDirection(0, "male")).toBe(1); // Dương Nam
    expect(yinYangGenderDirection(1, "female")).toBe(1); // Âm Nữ
    expect(yinYangGenderDirection(1, "male")).toBe(-1); // Âm Nam
    expect(yinYangGenderDirection(0, "female")).toBe(-1); // Dương Nữ
  });
});
