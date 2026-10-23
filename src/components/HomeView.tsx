"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "./AppShell";
import { BirthForm } from "./BirthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useChartStore } from "@/store/useChartStore";
import { requestToSearchParams, searchParamsToRequest } from "@/utils/chart-url";

export function HomeView() {
  const params = useSearchParams();
  const initial = useMemo(() => searchParamsToRequest(new URLSearchParams(params.toString())) ?? undefined, [params]);
  const saved = useChartStore((s) => s.saved);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div>
      <PageHeader title="Lập lá số mới" description="Nhập ngày giờ sinh – hệ thống chuyển đổi lịch, an sao và vẽ lá số theo trường phái đã chọn." />
      <div className="grid gap-6 p-4 md:p-8 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardContent className="pt-5">
            <BirthForm key={params.toString()} initial={initial} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lá số đã lưu</CardTitle>
              <CardDescription>Lưu trên trình duyệt của bạn.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {mounted && saved.length === 0 && <p className="text-sm text-muted-foreground">Chưa có lá số nào.</p>}
              {mounted &&
                saved.slice(0, 5).map((s) => (
                  <Link key={s.id} href={`/laso?${requestToSearchParams(s.request).toString()}`} className="group flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/60">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{s.request.name || "Không tên"}</div>
                      <div className="truncate text-xs text-muted-foreground">{s.summary}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                  </Link>
                ))}
              {mounted && saved.length > 5 && (
                <Link href="/saved" className="block text-center text-xs font-medium text-primary hover:underline">
                  Xem tất cả ({saved.length})
                </Link>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
