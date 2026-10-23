"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useChartStore } from "@/store/useChartStore";
import { requestToSearchParams } from "@/utils/chart-url";

export default function SavedPage() {
  const saved = useChartStore((s) => s.saved);
  const remove = useChartStore((s) => s.removeChart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div>
      <PageHeader title="Lá số đã lưu" description="Dữ liệu được lưu cục bộ trên trình duyệt này." />
      <div className="mx-auto max-w-4xl space-y-2 p-4 md:p-8">
        {mounted && saved.length === 0 && (
          <Card>
            <CardContent className="pt-5 text-sm text-muted-foreground">
              Chưa có lá số nào.{" "}
              <Link href="/" className="font-medium text-primary hover:underline">
                Lập lá số mới
              </Link>
            </CardContent>
          </Card>
        )}
        {mounted &&
          saved.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between gap-3 pt-5">
                <Link href={`/laso?${requestToSearchParams(s.request).toString()}`} className="min-w-0 flex-1">
                  <div className="truncate font-medium">{s.request.name || "Không tên"}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {s.request.birth.day}/{s.request.birth.month}/{s.request.birth.year} ({s.request.birth.calendar === "solar" ? "DL" : "ÂL"}) · {s.summary}
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => remove(s.id)} aria-label="Xoá">
                  <Trash2 />
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
