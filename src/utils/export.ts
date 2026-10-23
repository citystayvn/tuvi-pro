"use client";

function fileBase(name: string) {
  const slug = (name || "la-so")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `tuvi-${slug || "la-so"}`;
}

async function renderPng(node: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  return toPng(node, {
    pixelRatio: 2,
    backgroundColor: bg,
    cacheBust: true,
    filter: (n) => !(n instanceof HTMLElement && n.dataset.exportHide === "1"),
  });
}

export async function exportPng(node: HTMLElement, name: string) {
  const url = await renderPng(node);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileBase(name)}.png`;
  a.click();
}

export async function exportPdf(node: HTMLElement, name: string) {
  const url = await renderPng(node);
  const { jsPDF } = await import("jspdf");
  const img = new Image();
  img.src = url;
  await img.decode();
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const ratio = Math.min((pageW - 2 * margin) / img.width, (pageH - 2 * margin) / img.height);
  const w = img.width * ratio;
  const h = img.height * ratio;
  pdf.addImage(url, "PNG", (pageW - w) / 2, margin, w, h);
  pdf.save(`${fileBase(name)}.pdf`);
}
