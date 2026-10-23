import { expect, test } from "@playwright/test";

// 15/8/1990 10:30 Hà Nội, Nam – Mệnh tại Dần (Vũ Khúc, Thiên Tướng), Thổ Ngũ Cục.
const CHART_URL = "/laso?n=Nguyen+Van+A&g=m&c=s&d=1990-8-15&t=10:30&tz=7&p=H%C3%A0+N%E1%BB%99i&vy=2026";

test("Mở trang là có lá số mặc định, sửa và lập lại", async ({ page }) => {
  await page.goto("/");
  const chart = page.getByTestId("tuvi-chart");
  await expect(chart.locator("[data-palace]")).toHaveCount(12);
  await page.getByRole("button", { name: "Sửa" }).click();
  await page.locator("#ce-name").fill("Trần Thị B");
  await page.getByRole("button", { name: "Nữ", exact: true }).click();
  await page.locator("#ce-day").fill("10");
  await page.locator("#ce-month").fill("2");
  await page.locator("#ce-year").fill("2024");
  await page.locator("#ce-hour").fill("8");
  await page.getByRole("button", { name: "Lập lại lá số" }).click();
  await expect(page).toHaveURL(/d=2024-2-10/);
  await expect(chart.getByText("Trần Thị B")).toBeVisible();
  await expect(chart.getByText(/Dương Nữ/)).toBeVisible();
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
  await expect(palace).toContainText("Xung chiếu");
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
  await page.getByRole("button", { name: "Sửa" }).click();
  await page.getByRole("button", { name: "Âm lịch", exact: true }).click();
  await page.locator("#ce-day").fill("15");
  await page.locator("#ce-month").fill("5");
  await page.locator("#ce-year").fill("2020");
  await page.getByLabel("Tháng nhuận").check();
  await expect(page.getByText("không có tháng 5 nhuận")).toBeVisible();
  await expect(page.getByRole("button", { name: "Lập lại lá số" })).toBeDisabled();
});

test("Trang danh mục sao", async ({ page }) => {
  await page.goto("/registry");
  await expect(page.getByRole("cell", { name: /Tử Vi/ }).first()).toBeVisible();
});

test("Xuất PNG và PDF", async ({ page }) => {
  await page.goto(CHART_URL);
  await expect(page.getByTestId("tuvi-chart")).toBeVisible();
  const [png] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "PNG" }).click()]);
  expect(png.suggestedFilename()).toBe("tuvi-nguyen-van-a.png");
  const [pdf] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "PDF" }).click()]);
  expect(pdf.suggestedFilename()).toBe("tuvi-nguyen-van-a.pdf");
});

test("Sửa thông tin và lập lại lá số giữ nguyên ngày sinh khác", async ({ page }) => {
  await page.goto(CHART_URL);
  await page.getByRole("button", { name: "Sửa" }).click();
  await page.locator("#ce-name").fill("Trần B");
  await page.locator("#ce-year").fill("1995");
  await page.getByRole("button", { name: "Lập lại lá số" }).click();
  await expect(page).toHaveURL(/d=1995-8-15/);
  await expect(page.getByTestId("tuvi-chart").getByText("Trần B")).toBeVisible();
});

test("Thêm và sửa ý nghĩa riêng của sao tại một cung", async ({ page }) => {
  await page.goto(CHART_URL);
  await page.locator('[data-palace="ngo"] [data-star="tu-vi"]').click();
  const detail = page.getByTestId("star-detail");
  await expect(detail).toContainText("Ý nghĩa tại cung Quan Lộc");
  await detail.getByRole("button", { name: "Sửa ý nghĩa" }).first().click();
  await page.locator("#star-palace-note").fill("Tử Vi ở Quan Lộc: sự nghiệp vững, có quyền.");
  await detail.getByRole("button", { name: "Lưu" }).click();
  await expect(detail).toContainText("sự nghiệp vững, có quyền");
  await page.reload();
  await page.locator('[data-palace="ngo"] [data-star="tu-vi"]').click();
  await expect(page.getByTestId("star-detail")).toContainText("sự nghiệp vững, có quyền");
  await expect(page.getByTestId("star-detail").getByRole("button", { name: "Sửa ý nghĩa" }).first()).toBeVisible();
});
