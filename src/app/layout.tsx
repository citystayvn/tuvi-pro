import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Tử Vi Pro – Lập lá số Tử Vi Đẩu Số", template: "%s · Tử Vi Pro" },
  description: "Lập lá số Tử Vi Đẩu Số với thuật toán an sao minh bạch, có kiểm thử và cấu hình theo trường phái.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const themeScript = `try{if(localStorage.getItem('tuvi-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
