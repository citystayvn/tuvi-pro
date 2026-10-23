import type { TuViChart } from "@/types/chart";
import { canChiName, stemName, branchName } from "@/core/stems-branches";
import { ELEMENT_NAMES } from "@/core/elements";
import { SCHOOLS } from "@/config/schools";
import { formatTz } from "@/utils/places";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-border/70 py-[3px] last:border-0">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function ChartCenter({ chart, toolbar, body }: { chart: TuViChart; toolbar?: React.ReactNode; body?: React.ReactNode }) {
  const b = chart.birth;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-card via-card to-accent/40 px-4 py-3 text-[11.5px] leading-snug">
      {toolbar && (
        <div className="no-print mb-2" data-export-hide="1">
          {toolbar}
        </div>
      )}
      <div className="my-auto">
      <div className="mb-2 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Lá số Tử Vi</div>
        <div className="mt-0.5 truncate font-serif text-lg font-bold text-foreground">{chart.input.name || "Không tên"}</div>
        <div className="text-[11px] text-muted-foreground">
          {chart.yinYangGender} · {canChiName(chart.yearStem, chart.yearBranch)}
        </div>
      </div>
      {body ?? (
        <>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <div>
          <Row label="Dương lịch" value={`${pad(b.solar.hour)}:${pad(b.solar.minute)} ${pad(b.solar.day)}/${pad(b.solar.month)}/${b.solar.year}`} />
          <Row label="Âm lịch" value={`${b.lunar.day}/${b.lunar.month}${b.lunar.isLeapMonth ? "N" : ""}/${b.lunar.year} · giờ ${branchName(b.hourBranch)}`} />
          <Row label="Năm" value={canChiName(b.pillars.year.stem, b.pillars.year.branch)} />
          <Row label="Tháng" value={canChiName(b.pillars.month.stem, b.pillars.month.branch)} />
          <Row label="Ngày" value={canChiName(b.pillars.day.stem, b.pillars.day.branch)} />
          <Row label="Giờ" value={canChiName(b.pillars.hour.stem, b.pillars.hour.branch)} />
        </div>
        <div>
          <Row label="Bản Mệnh" value={chart.banMenh.name} />
          <Row label="Cục" value={chart.cuc.name} />
          <Row label="Mệnh – Cục" value={chart.menhCucRelation} />
          <Row label="Chủ Mệnh / Thân" value={`${chart.chuMenh} / ${chart.chuThan}`} />
          <Row label="Thân cư" value={chart.thanPalaceName} />
          <Row label="Nơi sinh" value={`${chart.input.birthPlace || "—"} (${formatTz(b.solar.timeZone)})`} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[10.5px]">
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
          Xem hạn {chart.period.viewYear} ({stemName(chart.period.viewYearStem)} {branchName(chart.period.viewYearBranch)}) · {chart.period.nominalAge} tuổi
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">{SCHOOLS[chart.input.schoolId]?.config.schoolName}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">Cục {ELEMENT_NAMES[chart.cuc.element]} · khởi hạn {chart.cuc.number} tuổi</span>
      </div>
        </>
      )}
      </div>
    </div>
  );
}
