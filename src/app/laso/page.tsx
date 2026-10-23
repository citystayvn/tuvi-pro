import { Suspense } from "react";
import type { Metadata } from "next";
import { ChartWorkspace } from "@/components/ChartWorkspace";

export const metadata: Metadata = { title: "Lá số" };

export default function LaSoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Đang tải lá số…</div>}>
      <ChartWorkspace />
    </Suspense>
  );
}
