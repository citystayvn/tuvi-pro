"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Bookmark, ChevronLeft, ChevronRight, Download, FileDown, Link2, Pencil, Printer, SlidersHorizontal } from "lucide-react";
import { buildChart, type ChartRequest } from "@/core/chart/buildChart";
import { CalendarInputError } from "@/core/calendar";
import type { ChartStar } from "@/types/chart";
import { branchName, canChiName, yearBranch, yearStem } from "@/core/stems-branches";
import { searchParamsToRequest, requestToSearchParams } from "@/utils/chart-url";
import { exportPdf, exportPng } from "@/utils/export";
import { useChartStore } from "@/store/useChartStore";
import { cn } from "@/utils/cn";
import { PageHeader } from "./AppShell";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sheet, SheetContent } from "./ui/sheet";
import { TuViChart } from "./TuViChart";
import { ChartControls } from "./ChartControls";
import { CenterEditForm } from "./CenterEditForm";
import { Switch } from "./ui/switch";
import { PalaceDetail, StarDetail } from "./DetailPanel";
import { BirthForm } from "./BirthForm";

/** Bản đóng gói chạy trong Claude: khung xem chặn in, tải file và liên kết trang. */
const IS_ARTIFACT = process.env.NEXT_PUBLIC_ARTIFACT === "1";
const BASE_WIDTH = 920;
const BASE_HEIGHT = 945;
/** Chiều rộng tối thiểu để vẽ lá số; màn hình hẹp hơn thì thu nhỏ cả lá số. */
const MIN_WIDTH = 620;
/** Lá số mở sẵn khi chưa nhập thông tin. */
const DEFAULT_REQUEST: ChartRequest = {
  name: "",
  gender: "male",
  birth: { calendar: "solar", day: 1, month: 1, year: 2000, hour: 12, minute: 30, timeZone: 7 },
};
/** Giới hạn hệ số cỡ chữ trong lá số (1 = cỡ gốc). */
const TEXT_SCALE_MAX = 2;
const TEXT_SCALE_MIN = 0.7;

function useMediaQuery(query: string) {
  const [match, setMatch] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return match;
}

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
  const request = useMemo(() => searchParamsToRequest(new URLSearchParams(params.toString())) ?? DEFAULT_REQUEST, [params]);
  const display = useChartStore((s) => s.display);
  const setDisplay = useChartStore((s) => s.setDisplay);
  const saveChart = useChartStore((s) => s.saveChart);

  const [viewYear, setViewYear] = useState<number>(() => request?.viewYear ?? new Date().getFullYear());
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<ChartStar | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();
  // Từ 768px trở lên, thanh điều khiển nằm trong ô giữa lá số (trang không cuộn).
  const centerControls = useMediaQuery("(min-width: 768px)");

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

  const [showWarnings, setShowWarnings] = useState(false);
  const [centerMode, setCenterMode] = useState<"info" | "edit" | "display">("info");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Lá số luôn lấp đúng phần khung nhìn còn lại của trình duyệt – không bao giờ phải cuộn.
  // Kích thước gốc (box.w × box.h) được kéo giãn theo tỉ lệ khung, rồi scale bằng box.zoom.
  const [box, setBox] = useState({ w: BASE_WIDTH, h: BASE_HEIGHT, zoom: 1 });
  const fit = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const h = window.innerHeight - top - 12;
    if (w <= 0 || h <= 0) return;
    // Lá số luôn lấp đúng khung; chỉ thu nhỏ toàn bộ khi khung hẹp hơn MIN_WIDTH.
    const zoom = Math.min(1, w / MIN_WIDTH);
    setBox({ zoom, w: w / zoom, h: h / zoom });
  }, []);
  useLayoutEffect(() => {
    fit();
  }, [fit, result?.ok, isDesktop]);
  useEffect(() => {
    const el = viewportRef.current;
    window.addEventListener("resize", fit);
    const ro = el ? new ResizeObserver(() => fit()) : null;
    if (el && ro) ro.observe(el);
    return () => {
      window.removeEventListener("resize", fit);
      ro?.disconnect();
    };
  }, [fit, result?.ok]);

  // Cỡ chữ lớn nhất mà mọi ô vẫn chứa đủ nội dung (không tràn dọc, không cắt tên sao).
  useLayoutEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const overflows = () => {
      for (const g of el.querySelectorAll<HTMLElement>("[data-palace] > div.grid")) if (g.scrollHeight > g.clientHeight + 1) return true;
      for (const t of el.querySelectorAll<HTMLElement>(".truncate")) if (t.scrollWidth > t.clientWidth + 1) return true;
      const center = el.querySelector<HTMLElement>("[data-center]");
      if (center && center.scrollHeight > center.clientHeight + 1) return true;
      return false;
    };
    let k = TEXT_SCALE_MAX;
    el.style.setProperty("--k", String(k));
    while (k > TEXT_SCALE_MIN && overflows()) {
      k = +(k * 0.95).toFixed(3);
      el.style.setProperty("--k", String(k));
    }
  });


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

  const warningsBlock =
    chart.birth.warnings.length > 0 ? (
      <div className="no-print">
        <button
          type="button"
          onClick={() => setShowWarnings((v) => !v)}
          aria-expanded={showWarnings}
          className="flex w-full items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
        >
          <AlertTriangle className="h-3.5 w-3.5" /> {chart.birth.warnings.length} lưu ý về lịch pháp
        </button>
        {showWarnings && (
          <ul className="mt-1.5 space-y-1 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            {chart.birth.warnings.map((w) => (
              <li key={w.code} className="flex gap-1.5">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" /> {w.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : null;

  const actions = (
    <div className={cn("grid gap-1", IS_ARTIFACT ? "grid-cols-2" : "grid-cols-6 xl:grid-cols-3")}>
      <Button variant="outline" size="sm" onClick={() => setCenterMode("edit")} aria-label="Sửa" title="Sửa thông tin">
        <Pencil /> <span className="hidden sm:inline">Sửa</span>
      </Button>
      <Button variant="outline" size="sm" onClick={save} aria-label="Lưu" title="Lưu lá số">
        <Bookmark /> <span className="hidden sm:inline">Lưu</span>
      </Button>
      {!IS_ARTIFACT && (
        <>
      <Button variant="outline" size="sm" onClick={copyLink} aria-label="Chia sẻ" title="Sao chép liên kết">
        <Link2 /> <span className="hidden sm:inline">Chia sẻ</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => doExport("png")} disabled={busy} aria-label="PNG" title="Xuất ảnh PNG">
        <Download /> <span className="hidden sm:inline">PNG</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => doExport("pdf")} disabled={busy} aria-label="PDF" title="Xuất PDF">
        <FileDown /> <span className="hidden sm:inline">PDF</span>
      </Button>
      <Button size="sm" onClick={() => window.print()} aria-label="In" title="In lá số">
        <Printer /> <span className="hidden sm:inline">In</span>
      </Button>
        </>
      )}
    </div>
  );

  // Toàn bộ thông tin & điều khiển nằm ở cột phải (desktop) hoặc phía trên (màn hình nhỏ).
  const controlPanel = (
    <div className="no-print space-y-3">
      <div>
        <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {chart.yinYangGender} · {chart.banMenh.name} · {chart.cuc.name} · Mệnh tại {branchName(chart.menhBranch)}, Thân cư {chart.thanPalaceName}
        </p>
      </div>
      {actions}
      {<ChartControls viewYear={viewYear} onViewYear={changeYear} display={display} onDisplay={setDisplay} inline />}
      {warningsBlock}
    </div>
  );

  const reload = (next: ChartRequest) => {
    setCenterMode("info");
    clearSelection();
    router.replace(`/laso?${requestToSearchParams({ ...next, viewYear }).toString()}`, { scroll: false });
  };

  const cBtn = (active = false) =>
    cn(
      "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[12px] font-medium transition-colors hover:bg-accent [&_svg]:h-3.5 [&_svg]:w-3.5",
      active ? "border-primary bg-accent text-accent-foreground" : "bg-card",
    );

  const nameAction = (
    <button
      type="button"
      onClick={() => setCenterMode((m) => (m === "edit" ? "info" : "edit"))}
      aria-label="Sửa"
      title="Sửa thông tin lá số"
      className={cn(
        "inline-flex shrink-0 items-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&_svg]:h-[calc(14px*var(--k,1))] [&_svg]:w-[calc(14px*var(--k,1))]",
        centerMode === "edit" && "bg-accent text-accent-foreground",
      )}
    >
      <Pencil />
    </button>
  );

  const centerToolbar = (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button type="button" className={cBtn()} onClick={save} aria-label="Lưu">
          <Bookmark /> Lưu
        </button>
        <button type="button" className={cBtn(centerMode === "display")} onClick={() => setCenterMode((m) => (m === "display" ? "info" : "display"))} aria-label="Hiển thị">
          <SlidersHorizontal /> Hiển thị
        </button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1">
      <div className="flex items-center gap-1 rounded-md border bg-card px-1 py-0.5">
        <button type="button" className="rounded p-0.5 hover:bg-muted" onClick={() => changeYear(viewYear - 1)} aria-label="Năm trước">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[11px] text-muted-foreground">Xem hạn</span>
        <input
          aria-label="Năm xem hạn"
          inputMode="numeric"
          className="h-6 w-14 rounded border border-input bg-card text-center text-[12px] font-semibold"
          value={viewYear}
          onChange={(e) => {
            const v = Number(e.target.value.replace(/\D/g, ""));
            if (v >= 1800 && v <= 2199) changeYear(v);
          }}
        />
        <span className="text-[11px] font-medium text-muted-foreground">{canChiName(yearStem(viewYear), yearBranch(viewYear))}</span>
        <button type="button" className="rounded p-0.5 hover:bg-muted" onClick={() => changeYear(viewYear + 1)} aria-label="Năm sau">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
        {!IS_ARTIFACT && (
          <>
            <button type="button" className={cBtn()} onClick={copyLink} aria-label="Chia sẻ" title="Sao chép liên kết">
              <Link2 />
            </button>
            <button type="button" className={cBtn()} onClick={() => doExport("png")} disabled={busy} aria-label="PNG" title="Xuất ảnh PNG">
              <Download />
            </button>
            <button type="button" className={cBtn()} onClick={() => doExport("pdf")} disabled={busy} aria-label="PDF" title="Xuất PDF">
              <FileDown />
            </button>
            <button type="button" className={cBtn()} onClick={() => window.print()} aria-label="In" title="In lá số">
              <Printer />
            </button>
          </>
        )}
      </div>
    </div>
  );

  const DISPLAY_TOGGLES: { key: keyof typeof display; label: string }[] = [
    { key: "showAuxiliary", label: "Phụ tinh" },
    { key: "showMinorStars", label: "Sao nhỏ" },
    { key: "showCycles", label: "Vòng Thái Tuế / Bác Sĩ" },
    { key: "showTrangSinh", label: "Tràng Sinh" },
    { key: "showBrightness", label: "Miếu Hãm" },
    { key: "showTransformations", label: "Tứ Hóa" },
    { key: "showAnnualStars", label: "Sao lưu niên" },
    { key: "showDecadalStars", label: "Sao đại vận" },
  ];

  const centerBody =
    centerMode === "edit" ? (
      <div className="no-print" data-export-hide="1">
        <CenterEditForm request={{ ...request, viewYear }} calendarRules={chart.rules.calendar} onSubmit={reload} onCancel={() => setCenterMode("info")} onAdvanced={() => setAdvancedOpen(true)} />
      </div>
    ) : centerMode === "display" ? (
      <div className="no-print space-y-2" data-export-hide="1">
        <div className="grid grid-cols-2 gap-1">
          {DISPLAY_TOGGLES.map((t) => (
            <label key={t.key} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 text-[12px] hover:bg-muted/60">
              {t.label}
              <Switch checked={display[t.key] as boolean} onCheckedChange={(v) => setDisplay({ [t.key]: v })} aria-label={t.label} />
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <button type="button" className={cBtn()} onClick={() => setCenterMode("info")}>
            Xong
          </button>
        </div>
      </div>
    ) : undefined;

  const chartView = (
    <div ref={viewportRef} className="relative w-full overflow-hidden" style={{ height: box.h * box.zoom }} onClick={clearSelection}>
      <div>
        <div style={{ width: box.w, height: box.h, transform: `scale(${box.zoom})`, transformOrigin: "top left" }} onClick={(e) => e.stopPropagation()}>
          <TuViChart
            ref={chartRef}
            chart={chart}
            display={display}
            selectedBranch={selectedBranch}
            selectedStar={selectedStar}
            onSelectPalace={onSelectPalace}
            onSelectStar={onSelectStar}
            centerToolbar={centerControls ? centerToolbar : undefined}
            centerNameAction={centerControls ? nameAction : undefined}
            centerBody={centerControls ? centerBody : undefined}
          />
        </div>
      </div>
    </div>
  );

  const mainContent = chartView;

  return (
    <>
      {isDesktop ? (
        <div className="flex h-screen">
          <div className={"min-w-0 flex-1 overflow-hidden p-3"}>{mainContent}</div>
          {(
          <aside className="no-print flex h-screen w-[360px] shrink-0 flex-col gap-4 overflow-y-auto border-l bg-card/60 p-4">
            {warningsBlock}
            {(
              <Card>
                {detail ? (
                  <CardContent className="pt-5">{detail}</CardContent>
                ) : (
                  <>
                    <CardHeader>
                      <CardTitle>Chi tiết</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <p>Nhấp vào một cung để xem sao hội chiếu (tam hợp, xung chiếu, giáp cung) và bộ sao.</p>
                      <p>Nhấp vào một sao để xem vị trí, trạng thái Miếu Hãm, ý nghĩa và các sao hội chiếu.</p>
                      <Legend />
                    </CardContent>
                  </>
                )}
              </Card>
            )}
          </aside>
          )}
        </div>
      ) : (
        <div className="space-y-3 p-3">
          {mainContent}
          {!centerControls && controlPanel}
          {!centerControls && <Legend />}
          <Sheet open={!!detail} onOpenChange={(o) => !o && clearSelection()}>
            {detail && <SheetContent title={selectedStar ? selectedStar.displayName : `Cung ${chart.palaces[selectedBranch!].name}`}>{detail}</SheetContent>}
          </Sheet>
        </div>
      )}

      {!centerControls && (
        <Sheet open={centerMode === "edit"} onOpenChange={(o) => !o && setCenterMode("info")}>
          {centerMode === "edit" && (
            <SheetContent title="Sửa thông tin">
              <CenterEditForm request={{ ...request, viewYear }} calendarRules={chart.rules.calendar} onSubmit={reload} onCancel={() => setCenterMode("info")} onAdvanced={() => setAdvancedOpen(true)} />
            </SheetContent>
          )}
        </Sheet>
      )}
      <Sheet open={advancedOpen} onOpenChange={setAdvancedOpen}>
        {advancedOpen && (
          <SheetContent title="Thông tin & cấu hình nâng cao" className="max-w-2xl">
            <BirthForm
              initial={{ ...request, viewYear }}
              onDone={() => {
                setAdvancedOpen(false);
                setCenterMode("info");
              }}
            />
          </SheetContent>
        )}
      </Sheet>

      {toast && (
        <div role="status" className="no-print fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-foreground px-4 py-2 text-sm text-background shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </>
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
