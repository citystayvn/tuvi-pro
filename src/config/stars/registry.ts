/**
 * STAR REGISTRY – danh mục đầy đủ các sao được hỗ trợ.
 * Mỗi sao: quy tắc an sao (bằng lời), dữ liệu đầu vào, nguồn, trạng thái triển khai
 * và mức độ kiểm chứng. Đây là nguồn sự thật cho báo cáo độ chính xác.
 */
import { BAC_SI_CYCLE, THAI_TUE_CYCLE, TRANG_SINH_CYCLE } from "@/core/star-cycles";
import type { Element, ImplementationStatus, StarCategory, StarNature, VerificationLevel } from "@/types/astrology";

export type StarInput = "can-nam" | "chi-nam" | "thang" | "ngay" | "gio" | "cuc" | "gioi-tinh" | "menh" | "than" | "sao-khac" | "co-dinh" | "nam-han" | "can-cung";

export interface StarDefinition {
  id: string;
  name: string;
  category: StarCategory;
  nature: StarNature;
  element?: Element;
  inputs: StarInput[];
  rule: string;
  ruleIds: string[];
  source: string;
  status: ImplementationStatus;
  verification: VerificationLevel;
  /** Ghi chú về khác biệt giữa các nguồn. */
  conflictNote?: string;
}

const TTL = "Thái Thứ Lang – Tử Vi Đẩu Số Tân Biên (hệ an sao phổ biến tại Việt Nam)";
const CLASSIC = "Bảng/khẩu quyết an sao truyền thống";

function s(def: Omit<StarDefinition, "status"> & { status?: ImplementationStatus }): StarDefinition {
  return { status: "implemented", ...def };
}

export const STAR_REGISTRY: StarDefinition[] = [
  // ---------------- 14 chính tinh ----------------
  s({ id: "tu-vi", name: "Tử Vi", category: "main", nature: "good", element: "THO", inputs: ["ngay", "cuc"], rule: "Ngày âm d, Cục c: tìm x ≥ 0 nhỏ nhất để (d+x) chia hết c, q=(d+x)/c. Từ Dần đếm thuận q cung; x lẻ lùi x cung, x chẵn tiến x cung.", ruleIds: ["MAIN.TU_VI.DAY_CUC"], source: TTL, verification: "reference-verified" }),
  s({ id: "thien-co", name: "Thiên Cơ", category: "main", nature: "good", element: "MOC", inputs: ["sao-khac"], rule: "Lùi 1 cung từ Tử Vi.", ruleIds: ["MAIN.TU_VI_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "thai-duong", name: "Thái Dương", category: "main", nature: "good", element: "HOA", inputs: ["sao-khac"], rule: "Lùi 3 cung từ Tử Vi (cách Thiên Cơ 1 cung).", ruleIds: ["MAIN.TU_VI_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "vu-khuc", name: "Vũ Khúc", category: "main", nature: "good", element: "KIM", inputs: ["sao-khac"], rule: "Lùi 4 cung từ Tử Vi.", ruleIds: ["MAIN.TU_VI_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "thien-dong", name: "Thiên Đồng", category: "main", nature: "good", element: "THUY", inputs: ["sao-khac"], rule: "Lùi 5 cung từ Tử Vi.", ruleIds: ["MAIN.TU_VI_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "liem-trinh", name: "Liêm Trinh", category: "main", nature: "neutral", element: "HOA", inputs: ["sao-khac"], rule: "Lùi 8 cung từ Tử Vi (cách Thiên Đồng 2 cung).", ruleIds: ["MAIN.TU_VI_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "thien-phu", name: "Thiên Phủ", category: "main", nature: "good", element: "THO", inputs: ["sao-khac"], rule: "Đối xứng Tử Vi qua trục Dần–Thân: vị trí = (4 − Tử Vi) mod 12.", ruleIds: ["MAIN.THIEN_PHU.MIRROR"], source: TTL, verification: "reference-verified" }),
  s({ id: "thai-am", name: "Thái Âm", category: "main", nature: "good", element: "THUY", inputs: ["sao-khac"], rule: "Thiên Phủ + 1 (thuận).", ruleIds: ["MAIN.THIEN_PHU_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "tham-lang", name: "Tham Lang", category: "main", nature: "neutral", element: "THUY", inputs: ["sao-khac"], rule: "Thiên Phủ + 2.", ruleIds: ["MAIN.THIEN_PHU_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "cu-mon", name: "Cự Môn", category: "main", nature: "neutral", element: "THUY", inputs: ["sao-khac"], rule: "Thiên Phủ + 3.", ruleIds: ["MAIN.THIEN_PHU_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "thien-tuong", name: "Thiên Tướng", category: "main", nature: "good", element: "THUY", inputs: ["sao-khac"], rule: "Thiên Phủ + 4.", ruleIds: ["MAIN.THIEN_PHU_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "thien-luong", name: "Thiên Lương", category: "main", nature: "good", element: "MOC", inputs: ["sao-khac"], rule: "Thiên Phủ + 5.", ruleIds: ["MAIN.THIEN_PHU_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "that-sat", name: "Thất Sát", category: "main", nature: "neutral", element: "KIM", inputs: ["sao-khac"], rule: "Thiên Phủ + 6.", ruleIds: ["MAIN.THIEN_PHU_GROUP"], source: TTL, verification: "reference-verified" }),
  s({ id: "pha-quan", name: "Phá Quân", category: "main", nature: "neutral", element: "THUY", inputs: ["sao-khac"], rule: "Thiên Phủ + 10 (cách Thất Sát 3 cung).", ruleIds: ["MAIN.THIEN_PHU_GROUP"], source: TTL, verification: "reference-verified" }),

  // ---------------- Lục cát tinh ----------------
  s({ id: "ta-phu", name: "Tả Phụ", category: "luc-cat", nature: "good", element: "THO", inputs: ["thang"], rule: "Từ Thìn kể là tháng Giêng, đếm thuận đến tháng sinh.", ruleIds: ["AUX.TA_PHU.THIN_FWD_MONTH"], source: TTL, verification: "cross-checked" }),
  s({ id: "huu-bat", name: "Hữu Bật", category: "luc-cat", nature: "good", element: "THUY", inputs: ["thang"], rule: "Từ Tuất kể là tháng Giêng, đếm nghịch đến tháng sinh.", ruleIds: ["AUX.HUU_BAT.TUAT_BWD_MONTH"], source: TTL, verification: "cross-checked" }),
  s({ id: "van-xuong", name: "Văn Xương", category: "luc-cat", nature: "good", element: "KIM", inputs: ["gio"], rule: "Từ Tuất kể là giờ Tý, đếm nghịch đến giờ sinh.", ruleIds: ["AUX.VAN_XUONG.TUAT_BWD_HOUR"], source: TTL, verification: "cross-checked" }),
  s({ id: "van-khuc", name: "Văn Khúc", category: "luc-cat", nature: "good", element: "THUY", inputs: ["gio"], rule: "Từ Thìn kể là giờ Tý, đếm thuận đến giờ sinh.", ruleIds: ["AUX.VAN_KHUC.THIN_FWD_HOUR"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-khoi", name: "Thiên Khôi", category: "luc-cat", nature: "good", element: "HOA", inputs: ["can-nam"], rule: "Giáp Mậu Canh: Sửu; Ất Kỷ: Tý; Bính Đinh: Hợi; Tân: Ngọ; Nhâm Quý: Mão.", ruleIds: ["AUX.THIEN_KHOI.STEM_CLASSIC", "AUX.THIEN_KHOI.STEM_VARIANT-A"], source: CLASSIC, verification: "conflicting", conflictNote: "Biến thể A (một số phần mềm VN): Đinh Dậu, Mậu Canh Mùi, Nhâm Tỵ." }),
  s({ id: "thien-viet", name: "Thiên Việt", category: "luc-cat", nature: "good", element: "HOA", inputs: ["can-nam"], rule: "Giáp Mậu Canh: Mùi; Ất Kỷ: Thân; Bính Đinh: Dậu; Tân: Dần; Nhâm Quý: Tỵ.", ruleIds: ["AUX.THIEN_VIET.STEM_CLASSIC", "AUX.THIEN_VIET.STEM_VARIANT-A"], source: CLASSIC, verification: "conflicting", conflictNote: "Biến thể A: Đinh Hợi, Mậu Canh Sửu, Nhâm Mão." }),

  // ---------------- Lục sát tinh ----------------
  s({ id: "kinh-duong", name: "Kình Dương", category: "luc-sat", nature: "bad", element: "KIM", inputs: ["can-nam"], rule: "Cung trước Lộc Tồn (Lộc Tồn + 1).", ruleIds: ["AUX.KINH_DUONG.LOC_TON_PLUS_1"], source: TTL, verification: "cross-checked" }),
  s({ id: "da-la", name: "Đà La", category: "luc-sat", nature: "bad", element: "KIM", inputs: ["can-nam"], rule: "Cung sau Lộc Tồn (Lộc Tồn − 1).", ruleIds: ["AUX.DA_LA.LOC_TON_MINUS_1"], source: TTL, verification: "cross-checked" }),
  s({ id: "dia-khong", name: "Địa Không", category: "luc-sat", nature: "bad", element: "HOA", inputs: ["gio"], rule: "Từ Hợi kể là giờ Tý, đếm nghịch đến giờ sinh.", ruleIds: ["AUX.DIA_KHONG.HOI_BWD_HOUR"], source: TTL, verification: "cross-checked" }),
  s({ id: "dia-kiep", name: "Địa Kiếp", category: "luc-sat", nature: "bad", element: "HOA", inputs: ["gio"], rule: "Từ Hợi kể là giờ Tý, đếm thuận đến giờ sinh.", ruleIds: ["AUX.DIA_KIEP.HOI_FWD_HOUR"], source: TTL, verification: "cross-checked" }),
  s({ id: "hoa-tinh", name: "Hỏa Tinh", category: "luc-sat", nature: "bad", element: "HOA", inputs: ["chi-nam", "gio", "can-nam", "gioi-tinh"], rule: "Khởi giờ Tý: Dần Ngọ Tuất tại Sửu; Thân Tý Thìn tại Dần; Tỵ Dậu Sửu tại Mão; Hợi Mão Mùi tại Dậu. Dương Nam/Âm Nữ đếm thuận, Âm Nam/Dương Nữ đếm nghịch đến giờ sinh.", ruleIds: ["AUX.HOA_TINH.BY_YIN_YANG_GENDER", "AUX.HOA_TINH.FORWARD"], source: TTL, verification: "conflicting", conflictNote: "Biến thể A: nhóm Tỵ Dậu Sửu khởi Hỏa tại Tuất. Trường phái Trung Hoa an thuận cho mọi người." }),
  s({ id: "linh-tinh", name: "Linh Tinh", category: "luc-sat", nature: "bad", element: "HOA", inputs: ["chi-nam", "gio", "can-nam", "gioi-tinh"], rule: "Khởi giờ Tý: Dần Ngọ Tuất tại Mão; các nhóm khác tại Tuất. Chiều ngược với Hỏa Tinh.", ruleIds: ["AUX.LINH_TINH.BY_YIN_YANG_GENDER", "AUX.LINH_TINH.FORWARD"], source: TTL, verification: "conflicting", conflictNote: "Biến thể A: nhóm Tỵ Dậu Sửu khởi Linh tại Mão." }),

  // ---------------- Tứ Hóa ----------------
  s({ id: "hoa-loc", name: "Hóa Lộc", category: "transformation", nature: "good", element: "MOC", inputs: ["can-nam"], rule: "Theo bảng Tứ Hóa của Can năm.", ruleIds: ["TRANS.STEM_TABLE"], source: TTL, verification: "cross-checked" }),
  s({ id: "hoa-quyen", name: "Hóa Quyền", category: "transformation", nature: "good", inputs: ["can-nam"], rule: "Theo bảng Tứ Hóa của Can năm.", ruleIds: ["TRANS.STEM_TABLE"], source: TTL, verification: "cross-checked" }),
  s({ id: "hoa-khoa", name: "Hóa Khoa", category: "transformation", nature: "good", inputs: ["can-nam"], rule: "Theo bảng Tứ Hóa của Can năm.", ruleIds: ["TRANS.STEM_TABLE"], source: TTL, verification: "conflicting", conflictNote: "Năm Canh: Thái Âm hay Thiên Đồng hóa Khoa; năm Nhâm: Thiên Phủ hay Tả Phụ hóa Khoa." }),
  s({ id: "hoa-ky", name: "Hóa Kỵ", category: "transformation", nature: "bad", element: "THUY", inputs: ["can-nam"], rule: "Theo bảng Tứ Hóa của Can năm.", ruleIds: ["TRANS.STEM_TABLE"], source: TTL, verification: "conflicting", conflictNote: "Năm Canh: Thiên Đồng hay Thái Âm hóa Kỵ." }),

  // ---------------- Lộc Tồn & sao quan trọng ----------------
  s({ id: "loc-ton", name: "Lộc Tồn", category: "loc-ton", nature: "good", element: "THO", inputs: ["can-nam"], rule: "Giáp Dần, Ất Mão, Bính Mậu Tỵ, Đinh Kỷ Ngọ, Canh Thân, Tân Dậu, Nhâm Hợi, Quý Tý.", ruleIds: ["AUX.LOC_TON.STEM"], source: TTL, verification: "reference-verified" }),
  s({ id: "thien-ma", name: "Thiên Mã", category: "loc-ton", nature: "good", element: "HOA", inputs: ["chi-nam"], rule: "Dần Ngọ Tuất: Thân; Thân Tý Thìn: Dần; Tỵ Dậu Sửu: Hợi; Hợi Mão Mùi: Tỵ.", ruleIds: ["AUX.THIEN_MA.YEAR_BRANCH_TRINE"], source: TTL, verification: "cross-checked" }),
  s({ id: "hong-loan", name: "Hồng Loan", category: "minor", nature: "good", element: "THUY", inputs: ["chi-nam"], rule: "Từ Mão kể là Tý, đếm nghịch đến năm sinh.", ruleIds: ["AUX.HONG_LOAN.MAO_BWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-hy", name: "Thiên Hỷ", category: "minor", nature: "good", element: "THUY", inputs: ["sao-khac"], rule: "Đối cung Hồng Loan.", ruleIds: ["AUX.THIEN_HY.OPPOSITE_HONG_LOAN"], source: TTL, verification: "cross-checked" }),
  s({ id: "dao-hoa", name: "Đào Hoa", category: "minor", nature: "neutral", element: "MOC", inputs: ["chi-nam"], rule: "Dần Ngọ Tuất: Mão; Thân Tý Thìn: Dậu; Tỵ Dậu Sửu: Ngọ; Hợi Mão Mùi: Tý.", ruleIds: ["AUX.DAO_HOA.YEAR_BRANCH_TRINE"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-rieu", name: "Thiên Riêu", category: "minor", nature: "bad", element: "THUY", inputs: ["thang"], rule: "Từ Sửu kể là tháng Giêng, đếm thuận đến tháng sinh.", ruleIds: ["AUX.THIEN_RIEU.SUU_FWD_MONTH"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-y", name: "Thiên Y", category: "minor", nature: "good", element: "THUY", inputs: ["thang"], rule: "Đồng cung Thiên Riêu.", ruleIds: ["AUX.THIEN_Y.WITH_THIEN_RIEU"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-hinh", name: "Thiên Hình", category: "minor", nature: "bad", element: "HOA", inputs: ["thang"], rule: "Từ Dậu kể là tháng Giêng, đếm thuận đến tháng sinh.", ruleIds: ["AUX.THIEN_HINH.DAU_FWD_MONTH"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-duc", name: "Thiên Đức", category: "minor", nature: "good", element: "HOA", inputs: ["chi-nam"], rule: "Từ Dậu kể là Tý, đếm thuận đến năm sinh (đồng cung Phúc Đức vòng Thái Tuế).", ruleIds: ["AUX.THIEN_DUC.DAU_FWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "nguyet-duc", name: "Nguyệt Đức", category: "minor", nature: "good", element: "HOA", inputs: ["chi-nam"], rule: "Từ Tỵ kể là Tý, đếm thuận đến năm sinh (đồng cung Tử Phù).", ruleIds: ["AUX.NGUYET_DUC.TI_FWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-quan", name: "Thiên Quan", category: "minor", nature: "good", element: "HOA", inputs: ["can-nam"], rule: "Giáp Mùi, Ất Thìn, Bính Tỵ, Đinh Dần, Mậu Mão, Kỷ Dậu, Canh Hợi, Tân Dậu, Nhâm Tuất, Quý Ngọ.", ruleIds: ["AUX.THIEN_QUAN.STEM"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-phuc", name: "Thiên Phúc", category: "minor", nature: "good", element: "HOA", inputs: ["can-nam"], rule: "Giáp Dậu, Ất Thân, Bính Tý, Đinh Hợi, Mậu Mão, Kỷ Dần, Canh Ngọ, Tân Tỵ, Nhâm Ngọ, Quý Tỵ.", ruleIds: ["AUX.THIEN_PHUC.STEM"], source: TTL, verification: "cross-checked" }),
  s({ id: "an-quang", name: "Ân Quang", category: "minor", nature: "good", element: "MOC", inputs: ["sao-khac", "ngay"], rule: "Từ Văn Xương kể là mồng 1, đếm thuận đến ngày sinh, lùi lại 1 cung.", ruleIds: ["AUX.AN_QUANG.VAN_XUONG_FWD_DAY_BACK_1"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-quy", name: "Thiên Quý", category: "minor", nature: "good", element: "THO", inputs: ["sao-khac", "ngay"], rule: "Từ Văn Khúc kể là mồng 1, đếm nghịch đến ngày sinh, lùi lại 1 cung.", ruleIds: ["AUX.THIEN_QUY.VAN_KHUC_BWD_DAY_BACK_1"], source: TTL, verification: "cross-checked" }),
  s({ id: "tam-thai", name: "Tam Thai", category: "minor", nature: "good", element: "MOC", inputs: ["sao-khac", "ngay"], rule: "Từ Tả Phụ kể là mồng 1, đếm thuận đến ngày sinh.", ruleIds: ["AUX.TAM_THAI.TA_PHU_FWD_DAY"], source: TTL, verification: "cross-checked" }),
  s({ id: "bat-toa", name: "Bát Tọa", category: "minor", nature: "good", element: "THUY", inputs: ["sao-khac", "ngay"], rule: "Từ Hữu Bật kể là mồng 1, đếm nghịch đến ngày sinh.", ruleIds: ["AUX.BAT_TOA.HUU_BAT_BWD_DAY"], source: TTL, verification: "cross-checked" }),
  s({ id: "thai-phu", name: "Thai Phụ", category: "minor", nature: "good", element: "KIM", inputs: ["sao-khac"], rule: "Văn Khúc tiến 2 cung.", ruleIds: ["AUX.THAI_PHU.VAN_KHUC_PLUS_2"], source: TTL, verification: "cross-checked" }),
  s({ id: "phong-cao", name: "Phong Cáo", category: "minor", nature: "good", element: "THO", inputs: ["sao-khac"], rule: "Văn Khúc lùi 2 cung.", ruleIds: ["AUX.PHONG_CAO.VAN_KHUC_MINUS_2"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-khoc", name: "Thiên Khốc", category: "minor", nature: "bad", element: "THUY", inputs: ["chi-nam"], rule: "Từ Ngọ kể là Tý, đếm nghịch đến năm sinh.", ruleIds: ["AUX.THIEN_KHOC.NGO_BWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-hu", name: "Thiên Hư", category: "minor", nature: "bad", element: "THUY", inputs: ["chi-nam"], rule: "Từ Ngọ kể là Tý, đếm thuận đến năm sinh.", ruleIds: ["AUX.THIEN_HU.NGO_FWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "co-than", name: "Cô Thần", category: "minor", nature: "bad", element: "THO", inputs: ["chi-nam"], rule: "Hợi Tý Sửu: Dần; Dần Mão Thìn: Tỵ; Tỵ Ngọ Mùi: Thân; Thân Dậu Tuất: Hợi.", ruleIds: ["AUX.CO_THAN.YEAR_BRANCH_SEASON"], source: TTL, verification: "cross-checked" }),
  s({ id: "qua-tu", name: "Quả Tú", category: "minor", nature: "bad", element: "THO", inputs: ["chi-nam"], rule: "Hợi Tý Sửu: Tuất; Dần Mão Thìn: Sửu; Tỵ Ngọ Mùi: Thìn; Thân Dậu Tuất: Mùi.", ruleIds: ["AUX.QUA_TU.YEAR_BRANCH_SEASON"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-la", name: "Thiên La", category: "minor", nature: "bad", inputs: ["co-dinh"], rule: "Cố định tại Thìn.", ruleIds: ["AUX.THIEN_LA.FIXED_THIN"], source: TTL, verification: "cross-checked" }),
  s({ id: "dia-vong", name: "Địa Võng", category: "minor", nature: "bad", inputs: ["co-dinh"], rule: "Cố định tại Tuất.", ruleIds: ["AUX.DIA_VONG.FIXED_TUAT"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-khong", name: "Thiên Không", category: "minor", nature: "bad", element: "HOA", inputs: ["chi-nam"], rule: "Cung trước Thái Tuế (Chi năm + 1).", ruleIds: ["AUX.THIEN_KHONG.THAI_TUE_PLUS_1"], source: TTL, verification: "cross-checked" }),
  s({ id: "kiep-sat", name: "Kiếp Sát", category: "minor", nature: "bad", element: "HOA", inputs: ["chi-nam"], rule: "Dần Ngọ Tuất: Hợi; Thân Tý Thìn: Tỵ; Tỵ Dậu Sửu: Dần; Hợi Mão Mùi: Thân.", ruleIds: ["AUX.KIEP_SAT.YEAR_BRANCH_TRINE"], source: TTL, verification: "cross-checked" }),
  s({ id: "pha-toai", name: "Phá Toái", category: "minor", nature: "bad", element: "HOA", inputs: ["chi-nam"], rule: "Tý Ngọ Mão Dậu: Tỵ; Dần Thân Tỵ Hợi: Dậu; Thìn Tuất Sửu Mùi: Sửu.", ruleIds: ["AUX.PHA_TOAI.CLASSIC", "AUX.PHA_TOAI.VARIANT-A"], source: CLASSIC, verification: "conflicting", conflictNote: "Biến thể A: Tý Ngọ Mão Dậu tại Dậu; Dần Thân Tỵ Hợi tại Tỵ." }),
  s({ id: "luu-ha", name: "Lưu Hà", category: "minor", nature: "bad", element: "THUY", inputs: ["can-nam"], rule: "Giáp Dậu, Ất Tuất, Bính Mùi, Đinh Thân, Mậu Tỵ, Kỷ Ngọ, Canh Thìn, Tân Mão, Nhâm Hợi, Quý Dần.", ruleIds: ["AUX.LUU_HA.CLASSIC", "AUX.LUU_HA.VARIANT-A"], source: CLASSIC, verification: "conflicting", conflictNote: "Biến thể A: Đinh Thìn, Canh Thân. Sách Thái Thứ Lang/Thiên Lương không nêu sao này." }),
  s({ id: "thien-tru", name: "Thiên Trù", category: "minor", nature: "good", element: "THO", inputs: ["can-nam"], rule: "Giáp Tỵ, Ất Ngọ, Bính Tý, Đinh Tỵ, Mậu Ngọ, Kỷ Thân, Canh Dần, Tân Ngọ, Nhâm Dậu, Quý Tuất.", ruleIds: ["AUX.THIEN_TRU.STEM"], source: CLASSIC, verification: "cross-checked" }),
  s({ id: "quoc-an", name: "Quốc Ấn", category: "minor", nature: "good", element: "THO", inputs: ["sao-khac"], rule: "Từ Lộc Tồn đếm thuận đến cung thứ 9 (Lộc Tồn + 8).", ruleIds: ["AUX.QUOC_AN.LOC_TON_PLUS_8"], source: TTL, verification: "cross-checked" }),
  s({ id: "duong-phu", name: "Đường Phù", category: "minor", nature: "good", element: "MOC", inputs: ["sao-khac"], rule: "Từ Lộc Tồn đếm nghịch đến cung thứ 8 (Lộc Tồn − 7).", ruleIds: ["AUX.DUONG_PHU.LOC_TON_MINUS_7"], source: TTL, verification: "cross-checked" }),
  s({ id: "van-tinh", name: "Văn Tinh", category: "minor", nature: "good", element: "HOA", inputs: ["sao-khac"], rule: "Lộc Tồn + 3 (Kình Dương + 2).", ruleIds: ["AUX.VAN_TINH.LOC_TON_PLUS_3"], source: "Một số tài liệu Việt Nam", verification: "rule-tested" }),
  s({ id: "thien-tho", name: "Thiên Thọ", category: "minor", nature: "good", element: "THO", inputs: ["than", "chi-nam"], rule: "Từ cung Thân kể là Tý, đếm thuận đến năm sinh.", ruleIds: ["AUX.THIEN_THO.THAN_FWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-tai", name: "Thiên Tài", category: "minor", nature: "good", element: "THO", inputs: ["menh", "chi-nam"], rule: "Từ cung Mệnh kể là Tý, đếm thuận đến năm sinh.", ruleIds: ["AUX.THIEN_TAI.MENH_FWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-su", name: "Thiên Sứ", category: "minor", nature: "bad", element: "THUY", inputs: ["menh"], rule: "Luôn tại cung Tật Ách.", ruleIds: ["AUX.THIEN_SU.TAT_ACH"], source: TTL, verification: "cross-checked", conflictNote: "Một số trường phái Trung Hoa đổi chỗ Thương/Sứ theo Âm Dương Nam Nữ – chưa triển khai." }),
  s({ id: "thien-thuong", name: "Thiên Thương", category: "minor", nature: "bad", element: "THO", inputs: ["menh"], rule: "Luôn tại cung Nô Bộc.", ruleIds: ["AUX.THIEN_THUONG.NO_BOC"], source: TTL, verification: "cross-checked" }),
  s({ id: "long-tri", name: "Long Trì", category: "minor", nature: "good", element: "THUY", inputs: ["chi-nam"], rule: "Từ Thìn kể là Tý, đếm thuận đến năm sinh.", ruleIds: ["AUX.LONG_TRI.THIN_FWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "phuong-cac", name: "Phượng Các", category: "minor", nature: "good", element: "THO", inputs: ["chi-nam"], rule: "Từ Tuất kể là Tý, đếm nghịch đến năm sinh.", ruleIds: ["AUX.PHUONG_CAC.TUAT_BWD_YEAR"], source: TTL, verification: "cross-checked" }),
  s({ id: "giai-than", name: "Giải Thần", category: "minor", nature: "good", element: "MOC", inputs: ["chi-nam"], rule: "Đồng cung Phượng Các.", ruleIds: ["AUX.GIAI_THAN.WITH_PHUONG_CAC"], source: TTL, verification: "cross-checked" }),
  s({ id: "thien-giai", name: "Thiên Giải", category: "minor", nature: "good", element: "HOA", inputs: ["thang"], rule: "Từ Thân kể là tháng Giêng, đếm thuận đến tháng sinh.", ruleIds: ["AUX.THIEN_GIAI.COUNT-MONTH", "AUX.THIEN_GIAI.SKIP-PALACE"], source: TTL, verification: "conflicting", conflictNote: "Một số tài liệu (theo cụ Thiên Lương) đếm nhảy cung: Thân + 2×(tháng − 1)." }),
  s({ id: "dia-giai", name: "Địa Giải", category: "minor", nature: "good", element: "THO", inputs: ["thang"], rule: "Từ Mùi kể là tháng Giêng, đếm thuận đến tháng sinh.", ruleIds: ["AUX.DIA_GIAI.MUI_FWD_MONTH"], source: TTL, verification: "cross-checked" }),
  s({ id: "hoa-cai", name: "Hoa Cái", category: "minor", nature: "good", element: "KIM", inputs: ["chi-nam"], rule: "Dần Ngọ Tuất: Tuất; Thân Tý Thìn: Thìn; Tỵ Dậu Sửu: Sửu; Hợi Mão Mùi: Mùi.", ruleIds: ["AUX.HOA_CAI.YEAR_BRANCH_TRINE"], source: TTL, verification: "cross-checked" }),
  s({ id: "dau-quan", name: "Đẩu Quân", category: "minor", nature: "neutral", element: "HOA", inputs: ["chi-nam", "thang", "gio"], rule: "Từ cung Thái Tuế kể là tháng Giêng, đếm nghịch đến tháng sinh, rồi kể là giờ Tý đếm thuận đến giờ sinh.", ruleIds: ["AUX.DAU_QUAN.THAI_TUE_BWD_MONTH_FWD_HOUR"], source: TTL, verification: "cross-checked" }),

  // ---------------- Tuần – Triệt ----------------
  s({ id: "tuan", name: "Tuần", category: "tuan-triet", nature: "bad", inputs: ["can-nam", "chi-nam"], rule: "Hai địa chi Không Vong của tuần Giáp chứa năm sinh.", ruleIds: ["AUX.TUAN.XUN_EMPTY"], source: CLASSIC, verification: "cross-checked" }),
  s({ id: "triet", name: "Triệt", category: "tuan-triet", nature: "bad", inputs: ["can-nam"], rule: "Giáp Kỷ: Thân Dậu; Ất Canh: Ngọ Mùi; Bính Tân: Thìn Tỵ; Đinh Nhâm: Dần Mão; Mậu Quý: Tý Sửu.", ruleIds: ["AUX.TRIET.STEM"], source: CLASSIC, verification: "cross-checked" }),

  // ---------------- Chưa triển khai (đã ghi nhận) ----------------
  s({ id: "thien-vu", name: "Thiên Vu", category: "minor", nature: "neutral", inputs: ["thang"], rule: "Chưa triển khai – cần xác minh nguồn.", ruleIds: [], source: "—", verification: "rule-tested", status: "not-implemented" }),
  s({ id: "thien-nguyet", name: "Thiên Nguyệt", category: "minor", nature: "bad", inputs: ["thang"], rule: "Chưa triển khai – cần xác minh nguồn.", ruleIds: [], source: "—", verification: "rule-tested", status: "not-implemented" }),
  s({ id: "am-sat", name: "Âm Sát", category: "minor", nature: "bad", inputs: ["thang"], rule: "Chưa triển khai – cần xác minh nguồn.", ruleIds: [], source: "—", verification: "rule-tested", status: "not-implemented" }),
];

// ---------------- Vòng sao (sinh tự động) ----------------

const CYCLE_ELEMENTS: Record<string, Element> = {
  "bac-si": "THUY", "luc-si": "HOA", "thanh-long": "THUY", "tieu-hao": "HOA", "tuong-quan": "MOC", "tau-thu": "KIM",
  "phi-liem": "HOA", "hy-than": "HOA", "benh-phu": "THO", "dai-hao": "HOA", "phuc-binh": "HOA", "quan-phu-bs": "HOA",
};
const CYCLE_NATURE: Record<string, StarNature> = {
  "bac-si": "good", "thanh-long": "good", "tuong-quan": "good", "tau-thu": "good", "hy-than": "good", "luc-si": "good",
  "tieu-hao": "bad", "phi-liem": "bad", "benh-phu": "bad", "dai-hao": "bad", "phuc-binh": "bad", "quan-phu-bs": "bad",
  "thai-tue": "neutral", "thieu-duong": "good", "tang-mon": "bad", "thieu-am": "good", "quan-phu-tt": "bad", "tu-phu": "bad",
  "tue-pha": "bad", "long-duc": "good", "bach-ho": "bad", "phuc-duc": "good", "dieu-khach": "bad", "truc-phu": "bad",
};

for (const st of BAC_SI_CYCLE) {
  STAR_REGISTRY.push(s({ id: st.id, name: st.name, category: "bac-si-cycle", nature: CYCLE_NATURE[st.id] ?? "neutral", element: CYCLE_ELEMENTS[st.id], inputs: ["can-nam", "gioi-tinh"], rule: "Vòng Bác Sĩ: khởi Bác Sĩ tại Lộc Tồn; Dương Nam/Âm Nữ an thuận, Âm Nam/Dương Nữ an nghịch, theo thứ tự Bác Sĩ, Lực Sĩ, Thanh Long, Tiểu Hao, Tướng Quân, Tấu Thư, Phi Liêm, Hỷ Thần, Bệnh Phù, Đại Hao, Phục Binh, Quan Phủ.", ruleIds: ["CYCLE.BAC_SI"], source: TTL, verification: "cross-checked" }));
}
for (const st of THAI_TUE_CYCLE) {
  STAR_REGISTRY.push(s({ id: st.id, name: st.name, category: "thai-tue-cycle", nature: CYCLE_NATURE[st.id] ?? "neutral", inputs: ["chi-nam"], rule: "Vòng Thái Tuế: khởi Thái Tuế tại Chi năm sinh, an thuận 12 cung: Thái Tuế, Thiếu Dương, Tang Môn, Thiếu Âm, Quan Phù, Tử Phù, Tuế Phá, Long Đức, Bạch Hổ, Phúc Đức, Điếu Khách, Trực Phù.", ruleIds: ["CYCLE.THAI_TUE"], source: TTL, verification: "cross-checked" }));
}
for (const st of TRANG_SINH_CYCLE) {
  STAR_REGISTRY.push(s({ id: st.id, name: st.name, category: "trang-sinh-cycle", nature: ["trang-sinh", "quan-doi", "lam-quan", "de-vuong"].includes(st.id) ? "good" : "neutral", inputs: ["cuc", "can-nam", "gioi-tinh"], rule: "Vòng Tràng Sinh: Thủy/Thổ cục khởi tại Thân, Mộc tại Hợi, Kim tại Tỵ, Hỏa tại Dần; Dương Nam/Âm Nữ an thuận, Âm Nam/Dương Nữ an nghịch.", ruleIds: ["CYCLE.TRANG_SINH"], source: TTL, verification: "cross-checked", conflictNote: "Một số tác giả an theo giới tính (Nam thuận, Nữ nghịch) – có tuỳ chọn cấu hình." }));
}

export const STAR_BY_ID: Record<string, StarDefinition> = Object.fromEntries(STAR_REGISTRY.map((d) => [d.id, d]));

export function getStarDef(id: string): StarDefinition {
  const d = STAR_BY_ID[id];
  if (!d) throw new Error(`Sao không có trong registry: ${id}`);
  return d;
}
