"use client";
import { Download } from "lucide-react";
import type { TuViChart } from "@/types/chart";
import { branchName, canChiName, stemName } from "@/core/stems-branches";
import { getStarDef } from "@/config/stars/registry";
import { TRANSFORMATION_NAMES } from "@/core/transformations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

function KV({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed py-1 text-sm last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}

export function CalculationDataView({ chart }: { chart: TuViChart }) {
  const b = chart.birth;
  const stars = chart.palaces.flatMap((p) => p.stars.map((s) => ({ ...s, palaceName: p.name })));
  const download = () => {
    const blob = new Blob([JSON.stringify(chart, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "la-so-tuvi.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="space-y-4">
      <div className={process.env.NEXT_PUBLIC_ARTIFACT === "1" ? "hidden" : "flex justify-end"}>
        <Button variant="outline" size="sm" onClick={download}>
          <Download /> Tải JSON lá số
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Engine</CardTitle>
            <CardDescription>Các đại lượng lịch pháp được phân biệt rõ, không mặc định tương đương.</CardDescription>
          </CardHeader>
          <CardContent>
            <KV k="Dương lịch (giờ nơi sinh)" v={`${b.solar.day}/${b.solar.month}/${b.solar.year} ${b.solar.hour}:${String(b.solar.minute).padStart(2, "0")} (UTC${b.solar.timeZone >= 0 ? "+" : ""}${b.solar.timeZone})`} />
            <KV k="Dương lịch dùng lập lịch" v={`${b.calendarSolar.day}/${b.calendarSolar.month}/${b.calendarSolar.year} ${b.calendarSolar.hour}:${String(b.calendarSolar.minute).padStart(2, "0")} (UTC+${b.calendarTimeZone})`} />
            <KV k="Ngày hiệu lực (Can Chi ngày)" v={`${b.effectiveSolar.day}/${b.effectiveSolar.month}/${b.effectiveSolar.year}`} />
            <KV k="Julian Day (UT)" v={b.jdUT.toFixed(5)} />
            <KV k="Âm lịch" v={`${b.lunar.day}/${b.lunar.month}${b.lunar.isLeapMonth ? " nhuận" : ""}/${b.lunar.year}`} />
            <KV k="Năm âm lịch / năm theo Lập Xuân" v={`${b.reference.lunarYear} / ${b.reference.lapXuanYear}`} />
            <KV k="Tháng âm lịch / tháng tiết khí" v={`${b.reference.lunarMonth} / ${b.reference.solarTermMonth}`} />
            <KV k="Tiết khí" v={`${b.reference.solarTerm.name} (λ☉ = ${b.reference.solarTerm.longitude.toFixed(3)}°)`} />
            <KV k="Cách ranh giới tiết gần nhất" v={`${Math.round(b.reference.minutesToTermBoundary.minutes)} phút (${b.reference.minutesToTermBoundary.termName})`} />
            <KV k="Tháng nhuận của năm" v={b.reference.leapMonthOfYear || "Không"} />
            <KV k="Năm / tháng / ngày dùng an sao" v={`${b.chartYear} / ${b.chartMonth} / ${b.chartDay}`} />
            <KV k="Giờ địa chi" v={branchName(b.hourBranch)} />
            <KV k="Tứ trụ" v={(["year", "month", "day", "hour"] as const).map((k) => canChiName(b.pillars[k].stem, b.pillars[k].branch)).join(" · ")} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Palace Engine & cấu hình</CardTitle>
          </CardHeader>
          <CardContent>
            <KV k="Mệnh / Thân" v={`${branchName(chart.menhBranch)} / ${branchName(chart.thanBranch)} (Thân cư ${chart.thanPalaceName})`} />
            <KV k="Cục" v={`${chart.cuc.name} (Mệnh ${canChiName(chart.palaces[chart.menhBranch].stem, chart.menhBranch)} – ${chart.cuc.napAmName})`} />
            <KV k="Bản Mệnh" v={chart.banMenh.name} />
            <KV k="Âm Dương / chiều" v={`${chart.yinYangGender} / ${chart.direction === 1 ? "thuận" : "nghịch"}`} />
                        <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted p-3 text-[11px] leading-relaxed">{JSON.stringify(chart.rules, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bảng vị trí sao ({stars.length})</CardTitle>
          <CardDescription>Vị trí của từng sao theo lớp nguyên cục, đại vận và lưu niên.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">Sao</th>
                <th className="py-2 pr-3 font-medium">Lớp</th>
                <th className="py-2 pr-3 font-medium">Cung</th>
                <th className="py-2 pr-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {stars.map((s, i) => {
                return (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-3 font-medium">{s.displayName}</td>
                    <td className="py-1.5 pr-3 text-xs text-muted-foreground">{s.layer}</td>
                    <td className="py-1.5 pr-3">
                      {s.palaceName} ({branchName(s.branch)})
                    </td>
                    <td className="py-1.5 pr-3 text-xs">{s.brightness ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {chart.flyingTransformations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Phi Hóa theo Can cung (Bắc phái – thử nghiệm)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Cung phát</th>
                  <th className="py-2 pr-3 font-medium">Can</th>
                  <th className="py-2 pr-3 font-medium">Hóa</th>
                  <th className="py-2 pr-3 font-medium">Sao</th>
                  <th className="py-2 font-medium">Nhập cung</th>
                </tr>
              </thead>
              <tbody>
                {chart.flyingTransformations.map((f, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-3">{chart.palaces[f.fromBranch].name}</td>
                    <td className="py-1.5 pr-3">{stemName(f.stem)}</td>
                    <td className="py-1.5 pr-3">{TRANSFORMATION_NAMES[f.type]}</td>
                    <td className="py-1.5 pr-3">{getStarDef(f.starId).name}</td>
                    <td className="py-1.5">{f.toBranch === null ? "—" : chart.palaces[f.toBranch].name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
