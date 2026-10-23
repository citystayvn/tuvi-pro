# Tử Vi Pro – Lập lá số Tử Vi Đẩu Số

Ứng dụng web lập lá số Tử Vi Đẩu Số với **thuật toán an sao minh bạch, có kiểm thử và cấu hình theo trường phái**.

- Next.js 15 (App Router) · TypeScript · React 19 · Tailwind CSS · shadcn/ui (Radix) · Lucide · Zustand
- Vitest (thuật toán) · Playwright (giao diện)

## Chạy

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # 145 unit/reference/cross-check test
npm run test:report    # báo cáo PASS/FAIL theo engine → src/config/accuracy-report.json
npm run test:e2e       # Playwright (desktop + mobile)
npm run build
```

## Kiến trúc

```
src/
├── app/                 # Trang: / (form), /laso, /saved, /registry
├── components/          # Rendering Engine: BirthForm, TuViChart, PalaceCell, StarItem, ChartCenter, ChartControls…
├── core/                # Calculation Engine – hàm thuần, không phụ thuộc React
│   ├── calendar/        # Calendar Engine: âm lịch VN, tiết khí, Can Chi, múi giờ
│   ├── stems-branches/  # Can Chi, Ngũ Hổ Độn, Ngũ Thử Độn
│   ├── elements/        # Ngũ hành, Nạp Âm, Cục
│   ├── palaces/         # Mệnh, Thân, 12 cung, Can cung
│   ├── main-stars/      # 14 chính tinh
│   ├── auxiliary-stars/ # Phụ tinh, Tuần, Triệt
│   ├── transformations/ # Tứ Hóa
│   ├── star-cycles/     # Vòng Thái Tuế, Tràng Sinh, Bác Sĩ
│   ├── brightness/      # Miếu – Vượng – Đắc – Bình – Hãm
│   ├── major-periods/   # Đại hạn
│   ├── annual-periods/  # Tiểu hạn, lưu niên, sao lưu
│   ├── chart/           # Chart Engine: lắp ráp lá số (JSON)
│   └── interpretation/  # Interpretation Engine: tam phương tứ chính, bộ sao, ý nghĩa tham khảo
├── config/              # Configuration Engine
│   ├── schools/         # Trường phái + bộ quy tắc tham số hoá
│   ├── stars/           # Star Registry (quy tắc, nguồn, mức kiểm chứng)
│   └── rules/           # Danh mục quy tắc mâu thuẫn / chưa xác minh
├── tests/               # calendar, palaces, stars, fixtures
└── types/
```

## Độ chính xác

| Engine | Kết quả |
|---|---|
| Calendar Engine | PASS |
| Palace Engine | PASS |
| Main Stars | PASS |
| Auxiliary Stars | PASS |
| Transformations | PASS |
| Major Periods | PASS |
| Annual Periods | PASS |

PASS = khớp bộ dữ liệu tham chiếu hiện có, **không** phải tuyên bố chính xác 100%.

Bộ tham chiếu (kết quả kỳ vọng không sinh từ engine):
- Ngày Tết Việt Nam 1968–2026 (gồm 1968, 1985, 2007 khác Trung Quốc), tháng nhuận (gồm 2033 nhuận 11).
- Thời điểm phân/chí/Lập Xuân 2024 (±20 phút).
- Bảng tìm Cục (60 tổ hợp), bảng an Tử Vi (150 tổ hợp), tổ hợp chính tinh đồng cung với Tử Vi, bảng Lộc Tồn, Tứ Hóa.
- Đối chiếu chéo 240 lá số với triển khai độc lập [lasotuvi](https://github.com/doanguyen/lasotuvi) (MIT) – sinh bởi `scripts/reference/generate_lasotuvi_fixtures.py`. Khi cấu hình engine theo đúng lựa chọn trường phái của lasotuvi, mọi vị trí sao khớp, trừ Thai/Dưỡng (lasotuvi đảo chỗ – lỗi phía lasotuvi).

Lỗi đã phát hiện nhờ kiểm thử: thuật toán âm lịch gốc trả về "ngày 0" tại 7/5/2054 và 9/4/2062 → đã hiệu chỉnh.

## Quy tắc có khác biệt giữa các nguồn (đều có tuỳ chọn cấu hình)

Giờ Tý muộn · tháng nhuận · ranh giới năm (Tết/Lập Xuân) · tháng âm lịch/tiết khí · múi giờ · UTC+8 trước 1968 · Thiên Khôi/Việt · Hỏa/Linh · Tứ Hóa Canh/Nhâm · Thiên Giải · Lưu Hà · Phá Toái · chiều Tràng Sinh. Xem `src/config/rules/conflicts.ts` hoặc trang `/accuracy`.

## Chưa hoàn thành

- Giờ Mặt Trời thực theo kinh độ, giờ mùa hè (DST) tự động.
- Lưu đại hạn / lưu nguyệt / lưu nhật; sao Thiên Vu, Thiên Nguyệt, Âm Sát.
- Miếu Hãm của Thiên Phủ tại Sửu/Mùi và phụ tinh ngoài Lục sát (để UNDEFINED cho tới khi xác minh).
- Trung Châu phái, Bắc phái: mới ở mức thử nghiệm.
- Chưa đối chiếu với lá số do chuyên gia lập trên giấy.

Nội dung luận giải chỉ mang tính tham khảo và được tách biệt khỏi dữ liệu tính toán.
