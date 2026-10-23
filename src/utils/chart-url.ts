import type { ChartRequest } from "@/core/chart/buildChart";

/** Mã hoá yêu cầu lập lá số vào URL để chia sẻ / tải lại. */
export function requestToSearchParams(r: ChartRequest): URLSearchParams {
  const p = new URLSearchParams();
  if (r.name) p.set("n", r.name);
  p.set("g", r.gender === "male" ? "m" : "f");
  p.set("c", r.birth.calendar === "solar" ? "s" : "l");
  p.set("d", `${r.birth.year}-${r.birth.month}-${r.birth.day}`);
  if (r.birth.isLeapMonth) p.set("leap", "1");
  p.set("t", `${r.birth.hour}:${r.birth.minute}`);
  p.set("tz", String(r.birth.timeZone));
  if (r.birthPlace) p.set("p", r.birthPlace);
  if (r.schoolId) p.set("s", r.schoolId);
  if (r.viewYear) p.set("vy", String(r.viewYear));
  if (r.ruleOverrides && Object.keys(r.ruleOverrides).length) p.set("o", JSON.stringify(r.ruleOverrides));
  return p;
}

export function searchParamsToRequest(p: URLSearchParams): ChartRequest | null {
  const d = p.get("d");
  const t = p.get("t");
  if (!d || !t) return null;
  const [year, month, day] = d.split("-").map(Number);
  const [hour, minute] = t.split(":").map(Number);
  if ([year, month, day, hour, minute].some((x) => !Number.isFinite(x))) return null;
  let ruleOverrides: ChartRequest["ruleOverrides"];
  try {
    ruleOverrides = p.get("o") ? JSON.parse(p.get("o")!) : undefined;
  } catch {
    ruleOverrides = undefined;
  }
  return {
    name: p.get("n") ?? "",
    gender: p.get("g") === "f" ? "female" : "male",
    birth: {
      calendar: p.get("c") === "l" ? "lunar" : "solar",
      day,
      month,
      year,
      isLeapMonth: p.get("leap") === "1",
      hour,
      minute,
      timeZone: Number(p.get("tz") ?? 7),
    },
    birthPlace: p.get("p") ?? "",
    schoolId: p.get("s") ?? undefined,
    viewYear: p.get("vy") ? Number(p.get("vy")) : undefined,
    ruleOverrides,
  };
}
