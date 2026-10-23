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
const BASE_HEIGHT = 945;

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

  // Tự co lá số vừa khung nhìn (cả chiều rộng lẫn chiều cao) để không phải cuộn trang.
  const [autoFit, setAutoFit] = useState(true);
  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth || BASE_WIDTH;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const availH = window.innerHeight - top - 12;
    const byWidth = w / BASE_WIDTH;
    // Trên màn hình hẹp (mobile) chỉ co theo chiều rộng, cho phép cuộn/pan.
    const z = window.innerWidth >= 1024 ? Math.min(byWidth, availH / BASE_HEIGHT) : byWidth;
    setZoom(Math.max(0.4, Math.min(1.6, +z.toFixed(3))));
    setAutoFit(true);
  }, []);
  useLayoutEffect(() => {
    fit();
  }, [fit, result?.ok, isDesktop]);
  useEffect(() => {
    if (!autoFit) return;
    const onResize = () => fit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [autoFit, fit]);
  const manualZoom = (z: number) => {
    setAutoFit(false);
    setZoom(z);
  };
  const [showWarnings, setShowWarnings] = useState(false);

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
      <Tabs defaultValue="chart">
        <div className="no-print flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-card/60 px-3 py-2 md:px-5">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold leading-tight">{title}</h1>
            <p className="truncate text-xs text-muted-foreground">
              {chart.yinYangGender} · {chart.banMenh.name} · {chart.cuc.name} · Mệnh tại {branchName(chart.menhBranch)}, Thân cư {chart.thanPalaceName}
            </p>
          </div>
          <TabsList className="h-8">
            <TabsTrigger value="chart" className="py-0.5">
              <LayoutGrid /> Lá số
            </TabsTrigger>
            <TabsTrigger value="interpretation" className="py-0.5">
              <ScrollText /> Luận giải
            </TabsTrigger>
            <TabsTrigger value="data" className="py-0.5">
              <Table2 /> Dữ liệu
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild title="Sửa thông tin">
              <Link href={`/?${requestToSearchParams(request).toString()}`} aria-label="Sửa">
                <Pencil /> <span className="hidden 2xl:inline">Sửa</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={save} aria-label="Lưu" title="Lưu lá số">
              <Bookmark /> <span className="hidden 2xl:inline">Lưu</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={copyLink} aria-label="Chia sẻ" title="Sao chép liên kết">
              <Link2 /> <span className="hidden 2xl:inline">Chia sẻ</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => doExport("png")} disabled={busy} aria-label="PNG" title="Xuất ảnh PNG">
              <Download /> <span className="hidden 2xl:inline">PNG</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => doExport("pdf")} disabled={busy} aria-label="PDF" title="Xuất PDF">
              <FileDown /> <span className="hidden 2xl:inline">PDF</span>
            </Button>
            <Button size="sm" onClick={() => window.print()} aria-label="In" title="In lá số">
              <Printer /> <span className="hidden 2xl:inline">In</span>
            </Button>
          </div>
        </div>

        <div className="p-2 md:px-4 md:py-3">
          <TabsContent value="chart" className="mt-0">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-start gap-2">
                  <ChartControls viewYear={viewYear} onViewYear={changeYear} display={display} onDisplay={setDisplay} zoom={zoom} onZoom={manualZoom} onFit={fit} />
                  {chart.birth.warnings.length > 0 && (
                    <div className="no-print relative">
                      <Button variant="outline" size="sm" className="h-9 border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300" onClick={() => setShowWarnings((v) => !v)} aria-expanded={showWarnings}>
                        <AlertTriangle /> {chart.birth.warnings.length} lưu ý
                      </Button>
                      {showWarnings && (
                        <div className="absolute left-0 top-full z-30 mt-2 w-[min(420px,90vw)] rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 shadow-lg dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                          <ul className="space-y-1">
                            {chart.birth.warnings.map((w) => (
                              <li key={w.code} className="flex gap-1.5">
                                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {w.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div ref={viewportRef} className="relative w-full overflow-auto rounded-xl scrollbar-thin" style={{ touchAction: "pan-x pan-y" }} onClick={clearSelection}>
                  <div className="mx-auto" style={{ width: BASE_WIDTH * zoom, height: BASE_HEIGHT * zoom }}>
                    <div style={{ width: BASE_WIDTH, height: BASE_HEIGHT, transform: `scale(${zoom})`, transformOrigin: "top left" }} onClick={(e) => e.stopPropagation()}>
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
                {!isDesktop && <Legend />}
              </div>

              {isDesktop && (
                <aside className="no-print sticky top-3 w-[340px] shrink-0">
                  <Card className="max-h-[calc(100vh-7rem)] overflow-y-auto">
                    {detail ? (
                      <CardContent className="pt-5">{detail}</CardContent>
                    ) : (
                      <>
                        <CardHeader>
                          <CardTitle>Chi tiết</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                          <p>Nhấp vào một cung để xem tam phương tứ chính, sao hội chiếu và bộ sao.</p>
                          <p>Nhấp vào một sao để xem vị trí, trạng thái Miếu Hãm, ý nghĩa và các sao hội chiếu.</p>
                          <Legend />
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

          <TabsContent value="interpretation" className="mt-0">
            <InterpretationView chart={chart} />
          </TabsContent>

          <TabsContent value="data" className="mt-0">
            <CalculationDataView chart={chart} />
          </TabsContent>
        </div>
      </Tabs>

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
