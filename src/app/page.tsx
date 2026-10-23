import { Suspense } from "react";
import { ChartWorkspace } from "@/components/ChartWorkspace";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <ChartWorkspace />
    </Suspense>
  );
}
