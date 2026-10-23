/**
 * Danh mục các quy tắc còn mâu thuẫn giữa các nguồn hoặc chưa được xác minh đầy đủ.
 * Mỗi mục đều đã được triển khai thành tuỳ chọn cấu hình (nếu có thể) – không tự chọn
 * công thức "cho xong".
 */
export interface RuleConflict {
  id: string;
  topic: string;
  defaultChoice: string;
  alternatives: string[];
  configKey?: string;
  status: "configurable" | "not-implemented" | "needs-verification";
}

export const RULE_CONFLICTS: RuleConflict[] = [
  {
    id: "late-rat-hour",
    topic: "Giờ Tý muộn (23:00–23:59) thuộc ngày nào",
    defaultChoice: "Tính sang ngày hôm sau (ngày mới bắt đầu từ giờ Tý)",
    alternatives: ["Giữ ngày hiện tại (ngày mới bắt đầu từ 00:00)"],
    configKey: "calendar.lateRatHour",
    status: "configurable",
  },
  {
    id: "leap-month",
    topic: "Sinh tháng nhuận âm lịch",
    defaultChoice: "Tính như tháng chính (tháng trước đó)",
    alternatives: ["Tính sang tháng sau", "15 ngày đầu tính tháng chính, từ 16 tính tháng sau"],
    configKey: "calendar.leapMonth",
    status: "configurable",
  },
  {
    id: "year-boundary",
    topic: "Ranh giới năm: Tết Nguyên Đán hay Lập Xuân",
    defaultChoice: "Tết Nguyên Đán (năm âm lịch) – phổ biến trong Tử Vi Việt Nam",
    alternatives: ["Tiết Lập Xuân"],
    configKey: "calendar.yearBoundary",
    status: "configurable",
  },
  {
    id: "month-system",
    topic: "Tháng an sao: tháng âm lịch hay tháng tiết khí",
    defaultChoice: "Tháng âm lịch",
    alternatives: ["Tháng theo tiết khí (tiết lệnh)"],
    configKey: "calendar.monthSystem",
    status: "configurable",
  },
  {
    id: "time-zone",
    topic: "Người sinh ngoài múi giờ UTC+7",
    defaultChoice: "Dùng giờ đồng hồ tại nơi sinh",
    alternatives: ["Quy đổi thời điểm sinh sang UTC+7", "Giờ Mặt Trời thực theo kinh độ (CHƯA triển khai)"],
    configKey: "calendar.timeMode",
    status: "configurable",
  },
  {
    id: "historical-tz",
    topic: "Âm lịch Việt Nam trước năm 1968 (tính theo UTC+8)",
    defaultChoice: "Dùng UTC+7 cho mọi năm",
    alternatives: ["UTC+8 cho ngày trước 1968"],
    configKey: "calendar.historicalTimeZoneBefore1968",
    status: "configurable",
  },
  {
    id: "khoi-viet",
    topic: "Thiên Khôi – Thiên Việt năm Đinh, Mậu, Canh, Nhâm",
    defaultChoice: "Khẩu quyết \"Giáp Mậu Canh ngưu dương … Lục Tân phùng mã hổ, Nhâm Quý thố xà tàng\"",
    alternatives: ["Biến thể A: Đinh Dậu/Hợi, Mậu Canh Mùi/Sửu, Nhâm Tỵ/Mão"],
    configKey: "starPlacement.khoiViet",
    status: "configurable",
  },
  {
    id: "hoa-linh",
    topic: "Hỏa Tinh – Linh Tinh: cung khởi nhóm Tỵ Dậu Sửu và chiều an",
    defaultChoice: "Hỏa khởi Mão, Linh khởi Tuất; chiều theo Âm Dương Nam Nữ",
    alternatives: ["Hỏa khởi Tuất, Linh khởi Mão", "Luôn an thuận (Trung Hoa)"],
    configKey: "starPlacement.hoaLinhStart / hoaLinhDirection",
    status: "configurable",
  },
  {
    id: "tu-hoa-canh-nham",
    topic: "Tứ Hóa năm Canh và năm Nhâm",
    defaultChoice: "Canh: Dương Vũ Âm Đồng; Nhâm: Lương Tử Phủ Vũ",
    alternatives: ["Canh: Dương Vũ Đồng Âm", "Nhâm: Lương Tử Tả Vũ"],
    configKey: "transformation.canh / nham",
    status: "configurable",
  },
  {
    id: "thien-giai",
    topic: "Thiên Giải: đếm liền hay nhảy cung",
    defaultChoice: "Từ Thân đếm thuận theo tháng",
    alternatives: ["Đếm nhảy cung (Thân + 2×(tháng−1))"],
    configKey: "starPlacement.thienGiai",
    status: "configurable",
  },
  {
    id: "luu-ha",
    topic: "Lưu Hà năm Đinh và Canh",
    defaultChoice: "Đinh Thân, Canh Thìn",
    alternatives: ["Đinh Thìn, Canh Thân"],
    configKey: "starPlacement.luuHa",
    status: "configurable",
  },
  {
    id: "pha-toai",
    topic: "Phá Toái nhóm Tý Ngọ Mão Dậu / Dần Thân Tỵ Hợi",
    defaultChoice: "Tý Ngọ Mão Dậu tại Tỵ; Dần Thân Tỵ Hợi tại Dậu",
    alternatives: ["Đảo ngược: Tý Ngọ Mão Dậu tại Dậu; Dần Thân Tỵ Hợi tại Tỵ"],
    configKey: "starPlacement.phaToai",
    status: "configurable",
  },
  {
    id: "trang-sinh-direction",
    topic: "Chiều vòng Tràng Sinh",
    defaultChoice: "Theo Âm Dương Nam Nữ",
    alternatives: ["Nam thuận, Nữ nghịch"],
    configKey: "annualCycle.trangSinhDirection",
    status: "configurable",
  },
  {
    id: "thien-phu-brightness",
    topic: "Miếu Hãm của Thiên Phủ tại Sửu, Mùi",
    defaultChoice: "Để UNDEFINED (không gán)",
    alternatives: ["Đắc", "Bình"],
    status: "needs-verification",
  },
  {
    id: "auxiliary-brightness",
    topic: "Miếu Hãm của phụ tinh (Xương, Khúc, Mã, Hình, Riêu…)",
    defaultChoice: "Chỉ gán Đắc/Hãm cho Lục sát tinh",
    alternatives: ["Bảng đầy đủ theo từng tác giả"],
    status: "needs-verification",
  },
  {
    id: "luu-dai-han",
    topic: "Lưu đại hạn, lưu nguyệt, lưu nhật",
    defaultChoice: "Chưa triển khai",
    alternatives: [],
    status: "not-implemented",
  },
];
