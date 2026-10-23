import type React from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "@/components/AppShell";
import HomePage from "@/app/page";
import LaSoPage from "@/app/laso/page";
import SavedPage from "@/app/saved/page";
import RegistryPage from "@/app/registry/page";
import AccuracyPage from "@/app/accuracy/page";
import MethodologyPage from "@/app/methodology/page";
import { usePathname } from "./next-navigation";

const ROUTES: Record<string, () => React.ReactElement> = {
  "/": HomePage,
  "/laso": LaSoPage,
  "/saved": SavedPage,
  "/registry": RegistryPage,
  "/accuracy": AccuracyPage,
  "/methodology": MethodologyPage,
};

function App() {
  const path = usePathname();
  const Page = ROUTES[path] ?? HomePage;
  return (
    <AppShell>
      <Page />
    </AppShell>
  );
}

// Theo giao diện sáng/tối của khung xem Claude.
function syncTheme() {
  const root = document.documentElement;
  const t = root.getAttribute("data-theme");
  const dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.classList.toggle("dark", dark);
}
syncTheme();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncTheme);
new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

createRoot(document.getElementById("root")!).render(<App />);
