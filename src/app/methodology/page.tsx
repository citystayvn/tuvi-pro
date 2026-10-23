import type { Metadata } from "next";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Phương pháp" };

const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "Kiến trúc",
    items: [
      "Calendar Engine (src/core/calendar): âm lịch, tiết khí, Can Chi, múi giờ – không phụ thuộc React.",
      "Calculation Engine (src/core/palaces, main-stars, auxiliary-stars, star-cycles, transformations, brightness, major-periods, annual-periods): các hàm thuần, mỗi sao có mã quy tắc sourceRuleId.",
      "Chart Engine (src/core/chart): lắp ráp dữ liệu lá số có thể serialize JSON, tách lớp nguyên cục / đại vận / lưu niên.",
      "Rendering Engine (src/components): lưới 4×4, vị trí 12 địa chi cố định theo bố cục truyền thống.",
      "Interpretation Engine (src/core/interpretation): tam phương tứ chính, hội chiếu, bộ sao, ý nghĩa tham khảo.",
      "Configuration Engine (src/config): trường phái, Star Registry, danh mục quy tắc mâu thuẫn.",
    ],
  },
  {
    title: "Lịch pháp",
    items: [
      "Âm lịch Việt Nam: thuật toán của Hồ Ngọc Đức dựa trên Jean Meeus (Astronomical Algorithms) – điểm Sóc, Trung khí, tháng 11 chứa Đông Chí, tháng nhuận là tháng đầu tiên không chứa Trung khí. Múi giờ UTC+7 (tuỳ chọn UTC+8 trước 1968).",
      "Tiết khí: kinh độ biểu kiến Mặt Trời theo Meeus chương 25, hiệu chỉnh chương động/quang sai và ΔT (Espenak–Meeus). Sai số thời điểm giao tiết ước tính ±15 phút – có cảnh báo khi sinh sát giờ giao tiết.",
      "Phân biệt: năm âm lịch ↔ năm theo Lập Xuân, tháng âm lịch ↔ tháng tiết khí. Lá số dùng loại nào là do cấu hình trường phái quyết định.",
      "Can Chi ngày = (JDN + 9) mod 10, (JDN + 1) mod 12; Can tháng/cung theo Ngũ Hổ Độn; Can giờ theo Ngũ Thử Độn.",
    ],
  },
  {
    title: "An sao",
    items: [
      "Hệ mặc định: Tử Vi Việt Nam theo Thái Thứ Lang (Tử Vi Đẩu Số Tân Biên).",
      "Tử Vi: phép bù ngày theo số Cục; Thiên Phủ đối xứng Tử Vi qua trục Dần – Thân.",
      "Miếu Hãm: bảng tra riêng, không suy luận từ Ngũ hành; ô chưa thống nhất để UNDEFINED.",
      "Đại hạn khởi tại Mệnh từ tuổi = số Cục; Tiểu hạn khởi theo tam hợp năm sinh; sao lưu dùng Can Chi năm xem hạn và không ghi đè dữ liệu nguyên cục.",
    ],
  },
  {
    title: "Kiểm thử",
    items: [
      "Unit test cho từng module; reference test với dữ liệu lịch sử / thiên văn / bảng tra truyền thống nhập tay.",
      "Đối chiếu chéo 240 lá số với một triển khai độc lập (lasotuvi). Khi cấu hình engine theo đúng lựa chọn trường phái của lasotuvi, mọi vị trí sao khớp – trừ Thai/Dưỡng là lỗi đã xác định của lasotuvi.",
      "Lệnh: npm test · npm run test:report (báo cáo PASS/FAIL theo engine) · npm run test:e2e (Playwright).",
    ],
  },
  {
    title: "Giới hạn hiện tại",
    items: [
      "Chưa hiệu chỉnh giờ Mặt Trời thực theo kinh độ nơi sinh và chưa xử lý giờ mùa hè (DST) tự động – người dùng chọn múi giờ chuẩn.",
      "Chưa triển khai: lưu đại hạn, lưu nguyệt, lưu nhật; một số sao hiếm (Thiên Vu, Thiên Nguyệt, Âm Sát).",
      "Trung Châu phái và Bắc phái mới ở mức thử nghiệm (chỉ tham số hoá các khác biệt đã xác định).",
      "Chưa đối chiếu với lá số giấy do chuyên gia lập – đây là bước kiểm chứng độc lập tiếp theo cần làm.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div>
      <PageHeader title="Phương pháp & nguồn tham chiếu" description="Cách hệ thống tính toán, nguồn quy tắc và giới hạn đã biết." />
      <div className="grid gap-4 p-4 md:p-8 lg:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <CardHeader>
              <CardTitle>{s.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
