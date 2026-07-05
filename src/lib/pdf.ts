import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Order } from "../types";
import { formatCRC, formatUSD, formatDate } from "./format";

let logoDataUrlCache: string | null = null;

async function loadLogoDataUrl(): Promise<string> {
  if (logoDataUrlCache) return logoDataUrlCache;
  const res = await fetch(`${import.meta.env.BASE_URL}logo.png`);
  const blob = await res.blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  logoDataUrlCache = dataUrl;
  return dataUrl;
}

export async function buildOrderPdf(order: Order): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;

  try {
    const logo = await loadLogoDataUrl();
    const logoW = 220;
    const logoH = (196 / 876) * logoW;
    doc.addImage(logo, "PNG", marginX, 30, logoW, logoH);
  } catch {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TUWA CR PRO", marginX, 50);
  }

  doc.setDrawColor(232, 121, 42);
  doc.setLineWidth(2);
  doc.line(marginX, 90, pageWidth - marginX, 90);

  doc.setTextColor(10, 10, 10);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Orden de Compra", marginX, 115);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(74, 74, 74);
  doc.text(`No. de orden: ${order.id ?? "-"}`, pageWidth - marginX, 108, { align: "right" });
  doc.text(`Fecha: ${formatDate(order.date)}`, pageWidth - marginX, 122, { align: "right" });

  let y = 145;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(10, 10, 10);
  doc.text("Cliente", marginX, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  doc.text(`Nombre: ${order.clientName}`, marginX, y);
  y += 14;
  doc.text(`Dirección: ${order.clientAddress}`, marginX, y);
  y += 14;
  doc.text(`Contacto: ${order.clientContact}`, marginX, y);
  y += 20;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Código", "Descripción", "Tarifa", "Cant.", "Precio unit.", "Subtotal"]],
    body: order.items.map((item) => {
      const subtotal = item.quantity * item.unitPrice;
      const unitLabel = item.currency === "USD" ? formatUSD(item.unitPrice) : formatCRC(item.unitPrice);
      const subtotalLabel = item.currency === "USD" ? formatUSD(subtotal) : formatCRC(subtotal);
      return [item.code, item.description, item.priceLabel, String(item.quantity), unitLabel, subtotalLabel];
    }),
    headStyles: { fillColor: [10, 10, 10], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [242, 242, 242] },
    styles: { fontSize: 9, cellPadding: 6 },
    columnStyles: {
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(10, 10, 10);

  let totalsY = finalY;
  if (order.totalCRC > 0) {
    doc.text(`Total ₡: ${formatCRC(order.totalCRC)}`, pageWidth - marginX, totalsY, { align: "right" });
    totalsY += 16;
  }
  if (order.totalUSD > 0) {
    doc.setTextColor(232, 121, 42);
    doc.text(`Total $: ${formatUSD(order.totalUSD)}`, pageWidth - marginX, totalsY, { align: "right" });
  }

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(138, 138, 138);
  doc.text(
    "Generado desde la app TUWA CR PRO",
    marginX,
    doc.internal.pageSize.getHeight() - 30
  );

  return doc.output("blob");
}

export function orderFileName(order: Order): string {
  const safeClient = order.clientName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `orden-${order.id ?? "nueva"}-${safeClient}.pdf`;
}
