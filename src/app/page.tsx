import { Suspense } from "react";
import { HomeView } from "@/components/HomeView";

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomeView />
    </Suspense>
  );
}
