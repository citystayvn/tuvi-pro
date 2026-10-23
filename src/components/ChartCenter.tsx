import type { TuViChart } from "@/types/chart";
import { canChiName } from "@/core/stems-branches";
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
          {chart.yinYangGender} · {SCHOOLS[chart.input.schoolId]?.config.schoolName}
        </div>
      </div>
      {body ?? (
        <>
      <div className="grid gap-x-5 sm:grid-cols-2">
        <div>
          <Row label="Dương lịch" value={`${pad(b.solar.hour)}:${pad(b.solar.minute)} ${pad(b.solar.day)}/${pad(b.solar.month)}/${b.solar.year}${b.solar.timeZone !== 7 ? ` (${formatTz(b.solar.timeZone)})` : ""}`} />
          <Row label="Âm lịch" value={`${b.lunar.day}/${b.lunar.month}${b.lunar.isLeapMonth ? " nhuận" : ""}/${b.lunar.year}`} />
          <Row label="Năm" value={canChiName(b.pillars.year.stem, b.pillars.year.branch)} />
          <Row label="Tháng" value={canChiName(b.pillars.month.stem, b.pillars.month.branch)} />
          <Row label="Ngày" value={canChiName(b.pillars.day.stem, b.pillars.day.branch)} />
          <Row label="Giờ" value={canChiName(b.pillars.hour.stem, b.pillars.hour.branch)} />
          {chart.input.birthPlace && <Row label="Nơi sinh" value={chart.input.birthPlace} />}
        </div>
        <div>
          <Row label="Bản Mệnh" value={chart.banMenh.name} />
          <Row label="Cục" value={`${chart.cuc.name} · khởi hạn ${chart.cuc.number} tuổi`} />
          <Row label="Mệnh – Cục" value={chart.menhCucRelation} />
          <Row label="Chủ Mệnh" value={chart.chuMenh} />
          <Row label="Chủ Thân" value={chart.chuThan} />
          <Row label="Thân cư" value={chart.thanPalaceName} />
          <Row label={`Tuổi năm ${chart.period.viewYear}`} value={`${chart.period.nominalAge} tuổi`} />
        </div>
      </div>
        </>
      )}
      </div>
    </div>
  );
}
