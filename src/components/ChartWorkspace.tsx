"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bookmark, Download, FileDown, LayoutGrid, Link2, Pencil, Printer, ScrollText, Table2 } from "lucide-react";
import { buildChart, type ChartRequest } from "@/core/chart/buildChart";
import { CalendarInputError } from "@/core/calendar";
import type { ChartStar } from "@/types/chart";
import { branchName } from "@/core/stems-branches";
import { searchParamsToRequest, requestToSearchParams } from "@/utils/chart-url";
import { exportPdf, exportPng } from "@/utils/export";
import { useChartStore } from "@/store/useChartStore";
import { PageHeader } from "./AppShell";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Sheet, SheetContent } from "./ui/sheet";
import { TuViChart } from "./TuViChart";
import { ChartControls } from "./ChartControls";
import { PalaceDetail, StarDetail } from "./DetailPanel";
import { InterpretationView } from "./InterpretationView";
import { CalculationDataView } from "./CalculationDataView";
import { BirthForm } from "./BirthForm";

const BASE_WIDTH = 920;

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function ChartWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const request = useMemo(() => searchParamsToRequest(new URLSearchParams(params.toString())), [params]);
  const display = useChartStore((s) => s.display);
  const setDisplay = useChartStore((s) => s.setDisplay);
  const saveChart = useChartStore((s) => s.saveChart);

  const [viewYear, setViewYear] = useState<number>(() => request?.viewYear ?? new Date().getFullYear());
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<ChartStar | null>(null);
  const [zoom, setZoom] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (request?.viewYear) setViewYear(request.viewYear);
  }, [request?.viewYear]);

  const result = useMemo(() => {
    if (!request) return null;
    try {
      return { ok: true as const, chart: buildChart({ ...request, viewYear }) };
    } catch (e) {
      return { ok: false as const, error: e instanceof CalendarInputError ? e.message : String((e as Error).message ?? e) };
    }
  }, [request, viewYear]);

  const fit = useCallback(() => {
    const w = viewportRef.current?.clientWidth ?? BASE_WIDTH;
    setZoom(Math.max(0.4, Math.min(1.4, +(w / BASE_WIDTH).toFixed(2))));
  }, []);
  useLayoutEffect(() => {
    fit();
  }, [fit, result?.ok]);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  };

  const changeYear = (y: number) => {
    setViewYear(y);
    if (request) {
      const p = requestToSearchParams({ ...request, viewYear: y });
      router.replace(`/laso?${p.toString()}`, { scroll: false });
    }
  };

  if (!request) {
    return (
      <div>
        <PageHeader title="Lá số" description="Chưa có dữ liệu. Nhập thông tin ngày giờ sinh để lập lá số." />
        <div className="mx-auto max-w-3xl p-4 md:p-8">
          <Card>
            <CardContent className="pt-5">
              <BirthForm />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!result?.ok) {
    return (
      <div>
        <PageHeader title="Lá số" />
        <div className="mx-auto max-w-xl p-8">
          <Card>
            <CardContent className="flex flex-col items-start gap-3 pt-5">
              <p className="flex items-center gap-2 font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" /> Không lập được lá số
              </p>
              <p className="text-sm text-muted-foreground">{result?.error}</p>
              <Button asChild variant="outline">
                <Link href="/">Nhập lại thông tin</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const chart = result.chart;
  const title = chart.input.name || "Lá số Tử Vi";

  const onSelectPalace = (b: number) => {
    setSelectedStar(null);
    setSelectedBranch((cur) => (cur === b && isDesktop ? null : b));
  };
  const onSelectStar = (s: ChartStar) => {
    setSelectedBranch(null);
    setSelectedStar(s);
  };
  const clearSelection = () => {
    setSelectedBranch(null);
    setSelectedStar(null);
  };

  const detail = selectedStar ? (
    <StarDetail chart={chart} star={selectedStar} onSelectStar={onSelectStar} onSelectPalace={onSelectPalace} />
  ) : selectedBranch !== null ? (
    <PalaceDetail chart={chart} branch={selectedBranch} onSelectStar={onSelectStar} onSelectPalace={onSelectPalace} />
  ) : null;

  const doExport = async (kind: "png" | "pdf") => {
    if (!chartRef.current) return;
    setBusy(true);
    try {
      if (kind === "png") await exportPng(chartRef.current, chart.input.name);
      else await exportPdf(chartRef.current, chart.input.name);
    } catch (e) {
      notify("Xuất file thất bại: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const save = () => {
    const req: ChartRequest = { ...request, viewYear };
    const id = requestToSearchParams({ ...req, viewYear: undefined }).toString();
    saveChart({
      id,
      savedAt: new Date().toISOString(),
      request: req,
      summary: `${chart.yinYangGender} · ${chart.birth.lunar.day}/${chart.birth.lunar.month}/${chart.birth.lunar.year} âm lịch · ${chart.cuc.name}`,
    });
    notify("Đã lưu lá số");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Đã sao chép liên kết");
    } catch {
      notify("Không sao chép được liên kết");
    }
  };

  return (
    <div>
      <PageHeader
        title={title}
        description={`${chart.yinYangGender} · ${chart.banMenh.name} · ${chart.cuc.name} · Mệnh tại ${branchName(chart.menhBranch)}, Thân cư ${chart.thanPalaceName}`}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/?${requestToSearchParams(request).toString()}`}>
                <Pencil /> Sửa
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={save}>
              <Bookmark /> Lưu
            </Button>
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Link2 /> Chia sẻ
            </Button>
            <Button variant="outline" size="sm" onClick={() => doExport("png")} disabled={busy}>
              <Download /> PNG
            </Button>
            <Button variant="outline" size="sm" onClick={() => doExport("pdf")} disabled={busy}>
              <FileDown /> PDF
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer /> In
            </Button>
          </>
        }
      />

      <div className="p-3 md:p-6">
        <Tabs defaultValue="chart">
          <TabsList className="no-print">
            <TabsTrigger value="chart">
              <LayoutGrid /> Lá số
            </TabsTrigger>
            <TabsTrigger value="interpretation">
              <ScrollText /> Luận giải
            </TabsTrigger>
            <TabsTrigger value="data">
              <Table2 /> Dữ liệu tính toán
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            {chart.birth.warnings.length > 0 && (
              <div className="no-print mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                <ul className="space-y-1">
                  {chart.birth.warnings.map((w) => (
                    <li key={w.code} className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {w.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
              <div className="min-w-0 flex-1 space-y-3">
                <ChartControls viewYear={viewYear} onViewYear={changeYear} display={display} onDisplay={setDisplay} zoom={zoom} onZoom={setZoom} onFit={fit} />
                <div ref={viewportRef} className="relative w-full overflow-auto rounded-xl scrollbar-thin" style={{ touchAction: "pan-x pan-y" }} onClick={clearSelection}>
                  <div style={{ width: BASE_WIDTH * zoom, height: BASE_WIDTH * 1.02 * zoom }}>
                    <div style={{ width: BASE_WIDTH, transform: `scale(${zoom})`, transformOrigin: "top left" }} onClick={(e) => e.stopPropagation()}>
                      <TuViChart
                        ref={chartRef}
                        chart={chart}
                        display={display}
                        selectedBranch={selectedBranch}
                        selectedStar={selectedStar}
                        onSelectPalace={onSelectPalace}
                        onSelectStar={onSelectStar}
                      />
                    </div>
                  </div>
                </div>
                <Legend />
              </div>

              {isDesktop && (
                <aside className="no-print sticky top-4 w-[360px] shrink-0">
                  <Card className="max-h-[calc(100vh-2rem)] overflow-y-auto">
                    {detail ? (
                      <CardContent className="pt-5">{detail}</CardContent>
                    ) : (
                      <>
                        <CardHeader>
                          <CardTitle>Chi tiết</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                          <p>Nhấp vào một cung để xem tam phương tứ chính, sao hội chiếu và bộ sao.</p>
                          <p>Nhấp vào một sao để xem quy tắc an sao, nguồn tham chiếu, trạng thái Miếu Hãm và ý nghĩa.</p>
                        </CardContent>
                      </>
                    )}
                  </Card>
                </aside>
              )}
            </div>
            {!isDesktop && (
              <Sheet open={!!detail} onOpenChange={(o) => !o && clearSelection()}>
                {detail && <SheetContent title={selectedStar ? selectedStar.displayName : `Cung ${chart.palaces[selectedBranch!].name}`}>{detail}</SheetContent>}
              </Sheet>
            )}
          </TabsContent>

          <TabsContent value="interpretation">
            <InterpretationView chart={chart} />
          </TabsContent>

          <TabsContent value="data">
            <CalculationDataView chart={chart} />
          </TabsContent>
        </Tabs>
      </div>

      {toast && (
        <div role="status" className="no-print fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-sm text-background shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

function Legend() {
  const item = (cls: string, label: string) => (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${cls}`} />
      {label}
    </span>
  );
  return (
    <div className="no-print flex flex-wrap gap-x-4 gap-y-1.5 rounded-xl border bg-card px-3 py-2 text-[11px] text-muted-foreground">
      <span className="font-semibold text-foreground">Chú giải:</span>
      {item("bg-el-kim", "Kim")}
      {item("bg-el-moc", "Mộc")}
      {item("bg-el-thuy", "Thủy")}
      {item("bg-el-hoa", "Hỏa")}
      {item("bg-el-tho", "Thổ")}
      {item("bg-good", "Cát tinh")}
      {item("bg-bad", "Sát / hung tinh")}
      {item("bg-annual", "Sao lưu (L.)")}
      {item("bg-decadal", "Sao đại vận (ĐV.)")}
      <span>(M) Miếu · (V) Vượng · (Đ) Đắc · (B) Bình · (H) Hãm</span>
    </div>
  );
}
