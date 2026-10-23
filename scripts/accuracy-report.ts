/**
 * Chạy toàn bộ Vitest và xuất BÁO CÁO ĐỘ CHÍNH XÁC theo từng engine.
 *   npm run test:report
 * Kết quả: in ra console và ghi src/config/accuracy-report.json (hiển thị tại /accuracy).
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { STAR_REGISTRY } from "../src/config/stars/registry";
import { RULE_CONFLICTS } from "../src/config/rules/conflicts";

const ENGINES = ["Calendar Engine", "Palace Engine", "Main Stars", "Auxiliary Stars", "Transformations", "Major Periods", "Annual Periods", "Cross-check", "Interpretation"];

const outDir = path.join(process.cwd(), "test-results");
mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, "vitest.json");
try {
  execSync(`npx vitest run --reporter=json --outputFile=${jsonPath}`, { stdio: "inherit" });
} catch {
  // vẫn tạo báo cáo khi có test thất bại
}
const raw = JSON.parse(readFileSync(jsonPath, "utf8")) as {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  testResults: { assertionResults: { fullName: string; ancestorTitles: string[]; status: string }[] }[];
};

const stats = Object.fromEntries(ENGINES.map((e) => [e, { passed: 0, failed: 0 }]));
for (const file of raw.testResults) {
  for (const t of file.assertionResults) {
    const tags = new Set<string>();
    for (const m of t.fullName.matchAll(/\[([^\]]+)\]/g)) tags.add(m[1]);
    for (const tag of tags) {
      if (!stats[tag]) continue;
      if (t.status === "passed") stats[tag].passed++;
      else if (t.status === "failed") stats[tag].failed++;
    }
  }
}

const engines = ENGINES.map((name) => ({
  name,
  passed: stats[name].passed,
  failed: stats[name].failed,
  status: stats[name].passed + stats[name].failed === 0 ? "NO TESTS" : stats[name].failed === 0 ? "PASS" : "FAIL",
}));

const verification = STAR_REGISTRY.reduce<Record<string, number>>((acc, s) => {
  const key = s.status === "not-implemented" ? "not-implemented" : s.verification;
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  totals: { total: raw.numTotalTests, passed: raw.numPassedTests, failed: raw.numFailedTests },
  engines,
  stars: { total: STAR_REGISTRY.length, byVerification: verification },
  conflicts: { total: RULE_CONFLICTS.length, open: RULE_CONFLICTS.filter((c) => c.status !== "configurable").length },
};

writeFileSync(path.join(process.cwd(), "src/config/accuracy-report.json"), JSON.stringify(report, null, 2) + "\n");

console.log("\n================ BÁO CÁO ĐỘ CHÍNH XÁC ================");
for (const e of engines) console.log(`${(e.name + ":").padEnd(18)} ${e.status.padEnd(8)} (${e.passed} đạt, ${e.failed} lỗi)`);
console.log(`Tổng: ${report.totals.passed}/${report.totals.total} kiểm thử đạt`);
console.log(`Star Registry: ${report.stars.total} sao`, report.stars.byVerification);
console.log("Lưu ý: PASS nghĩa là khớp bộ dữ liệu tham chiếu hiện có – KHÔNG phải tuyên bố chính xác 100%.");
