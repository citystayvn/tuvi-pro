"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, LayoutGrid, Menu, Moon, PenLine, Star, Sun, Bookmark, X } from "lucide-react";
import { cn } from "@/utils/cn";

const NAV = [
  { href: "/", label: "Lập lá số", icon: PenLine },
  { href: "/laso", label: "Lá số", icon: LayoutGrid },
  { href: "/saved", label: "Đã lưu", icon: Bookmark },
  { href: "/registry", label: "Danh mục sao", icon: Star },
  { href: "/methodology", label: "Phương pháp", icon: BookOpen },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 px-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-sm">紫</span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold">Tử Vi Pro</span>
        <span className="block text-[11px] text-muted-foreground">Tử Vi Đẩu Số</span>
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tuvi-theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button onClick={toggle} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Đổi giao diện sáng/tối">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {dark ? "Giao diện sáng" : "Giao diện tối"}
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar px-3 py-4 lg:flex">
        <Logo />
        <div className="mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Không gian làm việc</div>
        <div className="mt-2">
          <NavList />
        </div>
        <div className="mt-auto space-y-2">
          <ThemeToggle />
          <div className="rounded-lg border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Nội dung luận giải chỉ mang tính tham khảo.
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/80 px-4 backdrop-blur lg:hidden">
          <Logo />
          <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-muted" aria-label="Mở menu">
            <Menu className="h-5 w-5" />
          </button>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-card p-3 shadow-xl animate-fade-in">
              <div className="mb-4 flex items-center justify-between">
                <Logo />
                <button onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-muted" aria-label="Đóng menu">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavList onNavigate={() => setOpen(false)} />
              <div className="mt-auto">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="no-print flex flex-col gap-3 border-b bg-card/60 px-4 py-5 sm:flex-row sm:items-end sm:justify-between md:px-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
