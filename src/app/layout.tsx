import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-sans", display: "swap" });
// Kiểu chữ hẹp cho lá số – chứa được nhiều tên sao trong mỗi cung.
const chartFont = Roboto_Condensed({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-chart", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Tử Vi Pro – Lập lá số Tử Vi Đẩu Số", template: "%s · Tử Vi Pro" },
  description: "Lập lá số Tử Vi Đẩu Số theo trường phái Tử Vi Việt Nam.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

const themeScript = `try{if(localStorage.getItem('tuvi-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${chartFont.variable} font-sans`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
