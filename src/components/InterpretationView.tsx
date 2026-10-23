"use client";
import { Info } from "lucide-react";
import type { TuViChart } from "@/types/chart";
import { analyzePalace, chartOverview, PALACE_MEANINGS } from "@/core/interpretation";
import { branchName, canChiName } from "@/core/stems-branches";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { cn } from "@/utils/cn";

export function InterpretationView({ chart }: { chart: TuViChart }) {
  const overview = chartOverview(chart);
  const order = Array.from({ length: 12 }, (_, i) => chart.palaces.find((p) => p.nameIndex === i)!);
  const periods = [...chart.palaces].sort((a, b) => a.majorPeriod.startAge - b.majorPeriod.startAge);
  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Phần luận giải được sinh từ cấu trúc lá số (chính tinh, tam phương tứ chính, bộ sao) kèm ý nghĩa truyền thống tóm lược. Đây là nội dung tham khảo, tách biệt với dữ liệu an sao và không thay thế luận đoán của người có chuyên môn.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {overview.map((o) => (
          <Card key={o.title}>
            <CardHeader>
              <CardTitle>{o.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">{o.body}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đại hạn</CardTitle>
          <CardDescription>
            Khởi {chart.cuc.number} tuổi tại cung Mệnh, đi {chart.direction === 1 ? "thuận" : "nghịch"} ({chart.yinYangGender}). Năm {chart.period.viewYear}: {chart.period.nominalAge} tuổi (tuổi mụ).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {periods.map((p) => {
              const current = chart.period.majorPeriod?.branch === p.branch;
              return (
                <div key={p.branch} className={cn("rounded-lg border p-2 text-xs", current && "border-primary bg-accent")}>
                  <div className="font-semibold tabular-nums">
                    {p.majorPeriod.startAge}–{p.majorPeriod.endAge}
                  </div>
                  <div className="text-muted-foreground">
                    {p.name} · {canChiName(p.stem, p.branch)}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tiểu hạn năm {chart.period.viewYear} tại cung {chart.palaces[chart.period.minorPeriodBranch].name} ({branchName(chart.period.minorPeriodBranch)}); lưu niên (Lưu Thái Tuế) tại cung{" "}
            {chart.palaces[chart.period.annualBranch].name} ({branchName(chart.period.annualBranch)}).
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {order.map((p) => {
          const a = analyzePalace(chart, p.branch);
          return (
            <Card key={p.branch}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {p.name}
                  <span className="text-xs font-normal text-muted-foreground">{canChiName(p.stem, p.branch)}</span>
                  {p.isThan && <Badge>Thân</Badge>}
                </CardTitle>
                <CardDescription>{PALACE_MEANINGS[p.name]}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Chính tinh: </span>
                  {a.mainStars.length ? a.mainStars.map((s) => s.name).join(", ") : `Vô chính diệu (mượn ${a.borrowedMainStars.map((s) => s.name).join(", ") || "—"})`}
                </div>
                {a.groups.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {a.groups.map((g) => (
                      <Badge key={g.id} variant="secondary" title={g.description}>
                        {g.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
