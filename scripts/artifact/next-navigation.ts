/** Shim next/navigation: bộ định tuyến trong bộ nhớ cho bản artifact. */
import { useSyncExternalStore } from "react";

let current = "/";
const listeners = new Set<() => void>();

export function navigate(href: string) {
  current = href.startsWith("/") ? href : "/" + href;
  listeners.forEach((l) => l());
  try {
    window.scrollTo(0, 0);
  } catch {}
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function useRoute() {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

export function usePathname() {
  return useRoute().split("?")[0] || "/";
}
export function useSearchParams() {
  const r = useRoute();
  const q = r.includes("?") ? r.slice(r.indexOf("?") + 1) : "";
  return new URLSearchParams(q);
}
export function useRouter() {
  return { push: (h: string) => navigate(h), replace: (h: string) => navigate(h), back: () => {}, refresh: () => {} };
}
export { useRoute };
