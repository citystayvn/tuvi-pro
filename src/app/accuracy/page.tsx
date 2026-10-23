import type { Metadata } from "next";
import { CheckCircle2, CircleAlert, XCircle } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import report from "@/config/accuracy-report.json";
import { RULE_CONFLICTS } from "@/config/rules/conflicts";

export const metadata: Metadata = { title: "Độ chính xác" };

type Report = {
  generatedAt: string | null;
  totals: { total: number; passed: number; failed: number };
  engines: { name: string; status: string; passed: number; failed: number }[];
  stars: { total: number; byVerification: Record<string, number> };
};

const REFERENCE_SETS = [
  { name: "Ngày Tết Nguyên Đán Việt Nam", detail: "14 năm (1968–2026), gồm các năm Việt Nam khác Trung Quốc: 1968, 1985, 2007." },
  { name: "Tháng nhuận âm lịch", detail: "12 năm có nhuận (gồm 2033 nhuận tháng 11) và 9 năm không nhuận." },
  { name: "Phân / chí / Lập Xuân", detail: "Thời điểm thiên văn công bố năm 2024, sai số cho phép 20 phút." },
  { name: "Bảng tìm Cục truyền thống", detail: "60 tổ hợp Can năm × cung Mệnh." },
  { name: "Bảng an Tử Vi truyền thống", detail: "150 tổ hợp (5 Cục × 30 ngày)." },
  { name: "Tổ hợp chính tinh đồng cung với Tử Vi", detail: "Tử Phá Sửu Mùi, Tử Phủ Dần Thân, Tử Tham Mão Dậu, Tử Tướng Thìn Tuất, Tử Sát Tỵ Hợi." },
  { name: "Bảng Lộc Tồn, Tứ Hóa theo Can", detail: "Nhập tay từ bảng truyền thống." },
  { name: "Đối chiếu chéo lasotuvi", detail: "240 lá số × ~110 sao, Mệnh/Thân, Tuần/Triệt, đại hạn, tiểu hạn, âm lịch – sinh bởi một triển khai độc lập (Python, MIT)." },
];

export default function AccuracyPage() {
  const r = report as Report;
  return (
    <div>
      <PageHeader title="Báo cáo độ chính xác" description="Kết quả kiểm thử thuật toán theo từng engine. PASS nghĩa là khớp bộ dữ liệu tham chiếu hiện có – không phải tuyên bố chính xác tuyệt đối." />
      <div className="grid gap-6 p-4 md:p-8 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kết quả kiểm thử</CardTitle>
            <CardDescription>
              {r.generatedAt ? `Cập nhật ${new Date(r.generatedAt).toLocaleString("vi-VN")} · ${r.totals.passed}/${r.totals.total} đạt` : "Chưa chạy – dùng lệnh npm run test:report"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="mb-4 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-[12.5px] leading-6">
              {r.engines.map((e) => `${(e.name + ":").padEnd(18)} ${e.status}`).join("\n")}
            </pre>
            <div className="space-y-2">
              {r.engines.map((e) => (
                <div key={e.name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    {e.status === "PASS" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : e.status === "FAIL" ? <XCircle className="h-4 w-4 text-destructive" /> : <CircleAlert className="h-4 w-4 text-amber-500" />}
                    {e.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {e.passed} đạt · {e.failed} lỗi
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bộ dữ liệu tham chiếu</CardTitle>
            <CardDescription>Kết quả kỳ vọng không được sinh bởi chính thuật toán đang kiểm thử.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {REFERENCE_SETS.map((s) => (
              <div key={s.name} className="rounded-lg border p-3">
                <div className="text-sm font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.detail}</div>
              </div>
            ))}
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              Phát hiện qua đối chiếu chéo: lasotuvi an Thai/Dưỡng đảo chỗ (lỗi phía lasotuvi – thứ tự đúng là Tuyệt → Thai → Dưỡng → Tràng Sinh); thuật toán âm lịch gốc trả về &quot;ngày 0&quot; ở 7/5/2054 và 9/4/2062 – đã hiệu chỉnh.
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Quy tắc còn mâu thuẫn hoặc chưa xác minh</CardTitle>
            <CardDescription>Mỗi điểm khác biệt được triển khai thành tuỳ chọn cấu hình thay vì tự chọn công thức.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Chủ đề</th>
                  <th className="py-2 pr-3 font-medium">Mặc định</th>
                  <th className="py-2 pr-3 font-medium">Phương án khác</th>
                  <th className="py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {RULE_CONFLICTS.map((c) => (
                  <tr key={c.id} className="border-b align-top last:border-0">
                    <td className="py-2 pr-3 font-medium">{c.topic}</td>
                    <td className="py-2 pr-3 text-xs">{c.defaultChoice}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">{c.alternatives.join("; ") || "—"}</td>
                    <td className="py-2">
                      <Badge variant={c.status === "configurable" ? "info" : c.status === "needs-verification" ? "warning" : "danger"}>
                        {c.status === "configurable" ? "Có tuỳ chọn" : c.status === "needs-verification" ? "Cần xác minh" : "Chưa triển khai"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
