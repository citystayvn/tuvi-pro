// Đóng gói ứng dụng thành MỘT file HTML để xem trong Claude (artifact).
//   node scripts/artifact/build.mjs  → dist-artifact/tu-vi-pro.html
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const out = path.join(root, "dist-artifact");
mkdirSync(out, { recursive: true });

execSync(`npx tailwindcss -c tailwind.config.ts -i src/app/globals.css -o ${out}/app.css --minify`, { stdio: "inherit" });

await build({
  entryPoints: ["scripts/artifact/entry.tsx"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  outfile: `${out}/app.js`,
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_ARTIFACT": '"1"' },
  alias: {
    "@": path.join(root, "src"),
    "next/link": path.join(root, "scripts/artifact/next-link.tsx"),
    "next/navigation": path.join(root, "scripts/artifact/next-navigation.ts"),
  },
  loader: { ".json": "json" },
  logLevel: "warning",
});

const css = readFileSync(`${out}/app.css`, "utf8");
const js = readFileSync(`${out}/app.js`, "utf8").replace(/<\/script/gi, "<\\/script");
const html = `<title>Tử Vi Pro</title>
<meta name="description" content="Lập lá số Tử Vi Đẩu Số">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Condensed:wght@400;500;600;700&display=swap">
<style>:root{--font-sans:"Inter";--font-chart:"Roboto Condensed"}html,body{height:100%}${css}</style>
<div id="root"></div>
<script>${js}</script>
`;
writeFileSync(`${out}/tu-vi-pro.html`, html);
console.log("OK", (html.length / 1024).toFixed(0) + " KB");
