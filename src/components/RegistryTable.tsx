"use client";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { STAR_REGISTRY } from "@/config/stars/registry";
import { ELEMENT_NAMES } from "@/core/elements";
import { Input } from "./ui/input";
import { NativeSelect } from "./ui/select";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { VERIFICATION_BADGE } from "./DetailPanel";

const CATEGORY_LABEL: Record<string, string> = {
  main: "Chính tinh",
  "luc-cat": "Lục cát",
  "luc-sat": "Lục sát",
  transformation: "Tứ Hóa",
  "loc-ton": "Lộc Tồn / Mã",
  minor: "Phụ tinh",
  "thai-tue-cycle": "Vòng Thái Tuế",
  "trang-sinh-cycle": "Vòng Tràng Sinh",
  "bac-si-cycle": "Vòng Bác Sĩ",
  "tuan-triet": "Tuần Triệt",
};
const INPUT_LABEL: Record<string, string> = {
  "can-nam": "Can năm", "chi-nam": "Chi năm", thang: "Tháng", ngay: "Ngày", gio: "Giờ", cuc: "Cục", "gioi-tinh": "Giới tính",
  menh: "Cung Mệnh", than: "Cung Thân", "sao-khac": "Sao khác", "co-dinh": "Cố định", "nam-han": "Năm hạn", "can-cung": "Can cung",
};

export function RegistryTable() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [ver, setVer] = useState("");
  const rows = useMemo(
    () =>
      STAR_REGISTRY.filter(
        (s) =>
          (!q || s.name.toLowerCase().includes(q.toLowerCase()) || s.rule.toLowerCase().includes(q.toLowerCase())) &&
          (!cat || s.category === cat) &&
          (!ver || (ver === "not-implemented" ? s.status === "not-implemented" : s.verification === ver && s.status === "implemented")),
      ),
    [q, cat, ver],
  );
  const counts = STAR_REGISTRY.reduce<Record<string, number>>((a, s) => {
    const k = s.status === "not-implemented" ? "not-implemented" : s.verification;
    a[k] = (a[k] ?? 0) + 1;
    return a;
  }, {});
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Tổng số sao", STAR_REGISTRY.length],
          ["Đối chiếu bảng tham chiếu", counts["reference-verified"] ?? 0],
          ["Đối chiếu chéo", counts["cross-checked"] ?? 0],
          ["Nguồn mâu thuẫn (tuỳ chọn)", counts["conflicting"] ?? 0],
          ["Chưa triển khai", counts["not-implemented"] ?? 0],
        ].map(([label, n]) => (
          <Card key={label as string}>
            <CardContent className="pt-5">
              <div className="text-2xl font-semibold tabular-nums">{n}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Tìm sao hoặc quy tắc…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Tìm sao" />
        </div>
        <div className="sm:w-52">
          <NativeSelect value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Lọc nhóm sao">
            <option value="">Tất cả nhóm</option>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="sm:w-60">
          <NativeSelect value={ver} onChange={(e) => setVer(e.target.value)} aria-label="Lọc mức kiểm chứng">
            <option value="">Mọi mức kiểm chứng</option>
            {Object.entries(VERIFICATION_BADGE).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
            <option value="not-implemented">Chưa triển khai</option>
          </NativeSelect>
        </div>
      </div>
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Sao</th>
                <th className="px-3 py-2.5 font-medium">Nhóm</th>
                <th className="px-3 py-2.5 font-medium">Hành</th>
                <th className="px-3 py-2.5 font-medium">Đầu vào</th>
                <th className="px-3 py-2.5 font-medium">Quy tắc an sao</th>
                <th className="px-3 py-2.5 font-medium">Kiểm chứng</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const v = VERIFICATION_BADGE[s.verification];
                return (
                  <tr key={s.id} className="border-t align-top">
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{s.name}</div>
                      <code className="text-[11px] text-muted-foreground">{s.id}</code>
                    </td>
                    <td className="px-3 py-2.5 text-xs">{CATEGORY_LABEL[s.category]}</td>
                    <td className="px-3 py-2.5 text-xs">{s.element ? ELEMENT_NAMES[s.element] : "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{s.inputs.map((i) => INPUT_LABEL[i]).join(", ")}</td>
                    <td className="max-w-md px-3 py-2.5 text-xs">
                      <p>{s.rule}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Nguồn: {s.source}</p>
                      {s.conflictNote && <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">⚠ {s.conflictNote}</p>}
                    </td>
                    <td className="px-3 py-2.5">
                      {s.status === "not-implemented" ? <Badge variant="danger">Chưa triển khai</Badge> : <Badge variant={v.variant}>{v.label}</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
