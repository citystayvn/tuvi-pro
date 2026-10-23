import { expect, test } from "@playwright/test";

// 15/8/1990 10:30 Hà Nội, Nam – Mệnh tại Dần (Vũ Khúc, Thiên Tướng), Thổ Ngũ Cục.
const CHART_URL = "/laso?n=Nguyen+Van+A&g=m&c=s&d=1990-8-15&t=10:30&tz=7&p=H%C3%A0+N%E1%BB%99i&vy=2026";

test("Lập lá số từ form", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Họ tên").fill("Trần Thị B");
  await page.getByRole("radio", { name: "Nữ" }).click();
  await page.getByLabel("Ngày", { exact: true }).fill("10");
  await page.getByLabel("Tháng", { exact: true }).selectOption("2");
  await page.getByLabel("Năm", { exact: true }).fill("2024");
  await page.getByLabel("Giờ", { exact: true }).selectOption("8");
  await expect(page.getByText("1/1/2024")).toBeVisible(); // xem trước âm lịch: mùng 1 Tết Giáp Thìn
  await expect(page.getByText("Giáp Thìn").first()).toBeVisible();
  await page.getByRole("button", { name: "Lập lá số" }).click();
  await expect(page).toHaveURL(/\/laso\?/);
  const chart = page.getByTestId("tuvi-chart");
  await expect(chart).toBeVisible();
  await expect(chart.locator("[data-palace]")).toHaveCount(12);
  await expect(chart.getByText("Trần Thị B")).toBeVisible();
});

test("Bố cục 12 cung cố định và dữ liệu lá số mẫu", async ({ page }) => {
  await page.goto(CHART_URL);
  const chart = page.getByTestId("tuvi-chart");
  await expect(chart).toBeVisible();
  // Mệnh tại Dần: ô góc dưới bên trái
  const dan = chart.locator('[data-palace="dan"]');
  await expect(dan).toContainText("Mệnh");
  await expect(dan).toContainText("Vũ Khúc");
  await expect(dan).toContainText("Thiên Tướng");
  // Tử Vi tại Ngọ (hàng trên, cột 2)
  await expect(chart.locator('[data-palace="ngo"]').locator('[data-star="tu-vi"]')).toHaveCount(1);
  const ti = await chart.locator('[data-palace="ti"]').boundingBox();
  const hoi = await chart.locator('[data-palace="hoi"]').boundingBox();
  expect(ti!.x).toBeLessThan(hoi!.x);
  expect(ti!.y).toBeLessThan(hoi!.y);
  await expect(chart.getByText("Thổ Ngũ Cục")).toBeVisible();
});

test("Nhấp vào sao và cung hiển thị chi tiết", async ({ page }) => {
  await page.goto(CHART_URL);
  await page.locator('[data-palace="ngo"] [data-star="tu-vi"]').click();
  const star = page.getByTestId("star-detail");
  await expect(star).toBeVisible();
  await expect(star).toContainText("Ý nghĩa truyền thống");
  await expect(star).toContainText("Miếu");
  await page.keyboard.press("Escape");
  await page.locator('[data-palace="dan"]').click({ position: { x: 10, y: 10 } });
  const palace = page.getByTestId("palace-detail");
  await expect(palace).toBeVisible();
  await expect(palace).toContainText("Tam phương tứ chính");
  await expect(palace).toContainText("Thiên Di");
});

test("Đổi năm xem hạn cập nhật lưu niên, không đổi nguyên cục", async ({ page }) => {
  await page.goto(CHART_URL);
  const chart = page.getByTestId("tuvi-chart");
  await expect(chart.locator('[data-palace="ngo"]')).toContainText("Lưu niên");
  await page.getByRole("button", { name: "Năm sau" }).click();
  await expect(chart.locator('[data-palace="mui"]')).toContainText("Lưu niên");
  await expect(chart.locator('[data-palace="ngo"] [data-star="tu-vi"]')).toHaveCount(1);
});

test("Tắt sao lưu", async ({ page }) => {
  await page.goto(CHART_URL);
  const chart = page.getByTestId("tuvi-chart");
  await expect(chart.locator('[data-layer="annual"]').first()).toBeVisible();
  await page.getByRole("button", { name: "Hiển thị" }).click();
  await page.getByRole("switch", { name: "Sao lưu niên" }).click();
  await expect(chart.locator('[data-layer="annual"]')).toHaveCount(0);
  await page.getByRole("switch", { name: "Sao lưu niên" }).click();
});

test("Ngày âm lịch tháng nhuận không hợp lệ bị từ chối", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("radio", { name: "Âm lịch" }).click();
  await page.getByLabel("Ngày", { exact: true }).fill("15");
  await page.getByLabel("Tháng (âm)").selectOption("5");
  await page.getByLabel("Năm", { exact: true }).fill("2020");
  await page.getByRole("switch", { name: "Tháng nhuận" }).click();
  await expect(page.getByText("không có tháng 5 nhuận")).toBeVisible();
  await expect(page.getByRole("button", { name: "Lập lá số" })).toBeDisabled();
});

test("Trang danh mục sao và báo cáo độ chính xác", async ({ page }) => {
  await page.goto("/registry");
  await expect(page.getByRole("cell", { name: /Tử Vi/ }).first()).toBeVisible();
  await page.goto("/accuracy");
  await expect(page.getByText("Calendar Engine").first()).toBeVisible();
});

test("Xuất PNG và PDF", async ({ page }) => {
  await page.goto(CHART_URL);
  await expect(page.getByTestId("tuvi-chart")).toBeVisible();
  const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "PNG" }).click()]);
  expect(png.suggestedFilename()).toBe("tuvi-nguyen-van-a.png");
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "PDF" }).click()]);
  expect(pdf.suggestedFilename()).toBe("tuvi-nguyen-van-a.pdf");
});
