import jsPDF from "jspdf";
import type { ClientType, imageUrls, PaymentMethod } from "@/types/types";

export type PdfImageSource = File | imageUrls | string | null;

export interface PdfSubItem {
  id: string;
  subItemName: string;
  subItemPrice: number;
}

export interface PdfInvoiceItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subItems?: PdfSubItem[];
}

export interface PdfCompanySnapshot {
  name: string;
  email: string;
  address: string;
  invoicePrefix: string;
  paymentMethods: PaymentMethod[];
  logo: File | imageUrls | null;
}

export interface PdfSummary {
  discountValue: number;
  vatPercentage: number;
  nhilPercentage: number;
  getfundPercentage: number;
  notes: string;
  terms: string;
}

export interface PdfTotals {
  subtotal: number;
  discountValue: number;
  vatAmount: number;
  nhilAmount: number;
  getfundAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface PdfInvoiceCustomization {
  primaryColor: string | null;
  secondaryColor: string | null;
  letterHeadHeaderImg: PdfImageSource;
  letterHeadFooterImg: PdfImageSource;
  signatureImg: PdfImageSource;
  showLogo: boolean;
  showLetterHead: boolean;
  showSignature: boolean;
  showCompanySnapshot: boolean;
  showPaymentMethods: boolean;
  showNotes: boolean;
  showTerms: boolean;
  showItemTable: boolean;
}

export interface DownloadInvoicePdfOptions {
  form: {
    invoiceNumber: string;
    issueDate?: string;
    dueDate?: string;
    currency: string;
  };
  companySnapshot: PdfCompanySnapshot;
  clientDetails?: ClientType;
  items: PdfInvoiceItem[];
  totals: PdfTotals;
  summary: PdfSummary;
  invoiceCustomization: PdfInvoiceCustomization;
  accentColor?: string;
  fallbackLogoUrl?: string;
  formatMoney?: (amount: number, currency: string) => string;
  filename?: string;
}

function isImageUrlsObject(value: unknown): value is imageUrls {
  return (
    typeof value === "object" &&
    value !== null &&
    "imageUrl" in (value as Record<string, unknown>)
  );
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function resolveImageToBase64(
  source: PdfImageSource,
  label = "image",
): Promise<string | null> {
  if (!source) return null;

  try {
    if (source instanceof File) {
      return await blobToBase64(source);
    }

    const url = isImageUrlsObject(source) ? source.imageUrl : source;
    if (!url) return null;
    if (url.startsWith("data:")) return url;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(
        `[invoiceGenerator] Failed to fetch ${label} (${res.status} ${res.statusText}): ${url}`,
      );
      return null;
    }
    const blob = await res.blob();
    return await blobToBase64(blob);
  } catch (err) {
    console.warn(`[invoiceGenerator] Failed to resolve ${label}:`, err);
    return null;
  }
}

function cropImageToCircle(base64: string, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      ctx.restore();

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image for cropping"));
    img.src = base64;
  });
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 14;
const CONTENT_W = PAGE_W - MARGIN * 2;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const bigint = parseInt(full || "1f2937", 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function defaultFormatMoney(amount: number, currency: string): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `${currency} ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function addImageSafe(
  doc: jsPDF,
  base64: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  try {
    doc.addImage(base64, "PNG", x, y, w, h, undefined, "FAST");
  } catch {
    try {
      doc.addImage(base64, "JPEG", x, y, w, h, undefined, "FAST");
    } catch {}
  }
}

function drawLogoBadge(
  doc: jsPDF,
  circularBase64: string | null,
  x: number,
  y: number,
  diameter: number,
) {
  const r = diameter / 2;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);

  if (circularBase64) {
    addImageSafe(doc, circularBase64, x, y, diameter, diameter);
    doc.circle(x + r, y + r, r, "S");
  } else {
    doc.setFillColor(245, 245, 245);
    doc.circle(x + r, y + r, r, "FD");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("No Logo", x + r, y + r, { align: "center" });
  }
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PAGE_H - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

export async function generateInvoicePDF(
  options: DownloadInvoicePdfOptions,
): Promise<jsPDF> {
  const {
    form,
    companySnapshot,
    clientDetails,
    items,
    totals,
    summary,
    invoiceCustomization,
  } = options;

  const formatMoney = options.formatMoney ?? defaultFormatMoney;
  const accentHex =
    invoiceCustomization.primaryColor || options.accentColor || "#1f2937";
  const [ar, ag, ab] = hexToRgb(accentHex);
  const pageBgHex = invoiceCustomization.secondaryColor;

  console.debug("[invoiceGenerator] customization received:", {
    primaryColor: invoiceCustomization.primaryColor,
    secondaryColor: invoiceCustomization.secondaryColor,
    resolvedAccentHex: accentHex,
    hasLetterHeadSource: Boolean(invoiceCustomization.letterHeadHeaderImg),
    hasLetterHeadFooterSource: Boolean(
      invoiceCustomization.letterHeadFooterImg,
    ),
    hasSignatureSource: Boolean(invoiceCustomization.signatureImg),
    toggles: {
      showLogo: invoiceCustomization.showLogo,
      showLetterHead: invoiceCustomization.showLetterHead,
      showSignature: invoiceCustomization.showSignature,
      showCompanySnapshot: invoiceCustomization.showCompanySnapshot,
      showPaymentMethods: invoiceCustomization.showPaymentMethods,
      showNotes: invoiceCustomization.showNotes,
      showTerms: invoiceCustomization.showTerms,
      showItemTable: invoiceCustomization.showItemTable,
    },
  });

  const [
    logoBase64Raw,
    letterHeadBase64,
    letterHeadFooterBase64,
    signatureBase64,
  ] = await Promise.all([
    resolveImageToBase64(companySnapshot.logo, "logo").then((b) =>
      b !== null
        ? b
        : resolveImageToBase64(
            options.fallbackLogoUrl ?? null,
            "fallback logo",
          ),
    ),
    resolveImageToBase64(
      invoiceCustomization.letterHeadHeaderImg,
      "letterhead header",
    ),
    resolveImageToBase64(
      invoiceCustomization.letterHeadFooterImg,
      "letterhead footer",
    ),
    resolveImageToBase64(invoiceCustomization.signatureImg, "signature"),
  ]);

  let logoBase64: string | null = null;
  if (logoBase64Raw) {
    try {
      logoBase64 = await cropImageToCircle(logoBase64Raw);
    } catch {
      logoBase64 = logoBase64Raw;
    }
  }

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  if (pageBgHex) {
    const [br, bg, bb] = hexToRgb(pageBgHex);
    doc.setFillColor(br, bg, bb);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");
  }

  let y = MARGIN;

  let letterHeadHeight = 0;
  let letterHeadFooterHeight = 0;

  if (invoiceCustomization.showLetterHead && letterHeadFooterBase64) {
    const footerProps = doc.getImageProperties(letterHeadFooterBase64);
    letterHeadFooterHeight = (PAGE_W * footerProps.height) / footerProps.width;
  }

  const bottomLimit =
    invoiceCustomization.showLetterHead && letterHeadFooterBase64
      ? PAGE_H - MARGIN - letterHeadFooterHeight
      : PAGE_H - MARGIN;

  const drawLetterHeadFooter = () => {
    if (
      invoiceCustomization.showLetterHead &&
      letterHeadFooterBase64 &&
      letterHeadFooterHeight > 0
    ) {
      addImageSafe(
        doc,
        letterHeadFooterBase64,
        0,
        PAGE_H - letterHeadFooterHeight,
        PAGE_W,
        letterHeadFooterHeight,
      );
    }
  };

  if (invoiceCustomization.showLetterHead && letterHeadBase64) {
    const props = doc.getImageProperties(letterHeadBase64);
    letterHeadHeight = (PAGE_W * props.height) / props.width;

    addImageSafe(doc, letterHeadBase64, 0, 0, PAGE_W, letterHeadHeight);
    y = letterHeadHeight + 8;
  }

  drawLetterHeadFooter();

  const drawLetterHeadOnNewPage = (): number => {
    drawLetterHeadFooter();

    if (
      invoiceCustomization.showLetterHead &&
      letterHeadBase64 &&
      letterHeadHeight > 0
    ) {
      addImageSafe(doc, letterHeadBase64, 0, 0, PAGE_W, letterHeadHeight);
      return letterHeadHeight + 8;
    }
    return MARGIN;
  };

  let justBrokePage = false;

  const ensureSpace = (yCur: number, needed: number): number => {
    if (yCur + needed > bottomLimit) {
      doc.addPage();
      justBrokePage = true;
      return drawLetterHeadOnNewPage();
    }
    justBrokePage = false;
    return yCur;
  };

  /* ---- Header ---- */
  const headerTop = y;

  doc.setTextColor(ar, ag, ab);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(26);
  doc.text("Invoice", MARGIN, headerTop + 8);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Number:", MARGIN, headerTop + 16);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(
    (form.invoiceNumber || "").toUpperCase(),
    MARGIN + doc.getTextWidth("Invoice Number:  ") + 1,
    headerTop + 16,
  );

  if (invoiceCustomization.showLogo) {
    const d = 20;
    drawLogoBadge(doc, logoBase64, PAGE_W - MARGIN - d, headerTop, d);
  }

  y = headerTop + 28;

  /* ---- Issue / Due dates ---- */
  doc.setFontSize(10);
  doc.setTextColor(ar, ag, ab);
  doc.setFont("helvetica", "bold");
  doc.text("Issue Date:", MARGIN, y);
  doc.text("Due Date:", MARGIN + 121, y);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(90, 90, 90);
  doc.text(form.issueDate || "No Date", MARGIN, y + 5);
  doc.text(form.dueDate || "No Date", MARGIN + 121, y + 5);
  y += 12;

  const divider = (yy: number) => {
    doc.setDrawColor(ar, ag, ab);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, yy, PAGE_W - MARGIN, yy);
  };
  divider(y);
  y += 6;

  /* ---- Billed By / Billed To ---- */
  const colW = CONTENT_W / 1.5;
  const billBlock = (
    title: string,
    x: number,
    who: { name?: string; email?: string; address?: string },
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(ar, ag, ab);
    doc.text(title, x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(`Name: ${who.name || "Name Not Provided"}`, x, y + 5);
    doc.text(`Email: ${who.email || "Email Not Provided"}`, x, y + 10);
    const addrLines = doc.splitTextToSize(
      `Address: ${who.address || "Address Not Provided"}`,
      colW - 4,
    );
    doc.text(addrLines, x, y + 15);
    return 15 + addrLines.length * 4;
  };

  let blockHeight = 0;
  if (invoiceCustomization.showCompanySnapshot) {
    blockHeight = Math.max(
      blockHeight,
      billBlock("Billed By:", MARGIN, companySnapshot),
    );
  }

  const billedToX = invoiceCustomization.showCompanySnapshot
    ? MARGIN + colW
    : MARGIN;

  blockHeight = Math.max(
    blockHeight,
    billBlock("Billed To:", billedToX, clientDetails || {}),
  );
  y += blockHeight + 6;

  /* ---- Item table ---- */
  if (invoiceCustomization.showItemTable) {
    divider(y);
    y += 6;

    const cols = {
      item: MARGIN,
      qty: MARGIN + CONTENT_W - 80,
      price: MARGIN + CONTENT_W - 40,
      total: MARGIN + CONTENT_W - 2,
    };
    const rowH = 7;
    const subRowH = 5;

    const drawTableHeader = () => {
      doc.setFillColor(ar, ag, ab);
      doc.rect(MARGIN, y, CONTENT_W, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Item", cols.item + 2, y + 5.5);
      doc.text("Qty", cols.qty, y + 5.5, { align: "right" });
      doc.text("Price", cols.price, y + 5.5, { align: "right" });
      doc.text("Total", cols.total, y + 5.5, { align: "right" });
      y += 10;
    };

    drawTableHeader();

    const visibleItems = items.filter((i) => i.itemName.trim() !== "");

    if (visibleItems.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 160);
      doc.text("No items added yet", MARGIN, y + 2);
      y += 8;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(ar, ag, ab);

      visibleItems.forEach((item) => {
        y = ensureSpace(y, rowH + 2);
        if (justBrokePage) {
          drawTableHeader();
        }
        const nameLines = doc.splitTextToSize(
          item.itemName,
          cols.qty - cols.item - 4,
        );
        doc.text(nameLines[0], cols.item + 2, y + 4);
        doc.text(String(item.quantity), cols.qty, y + 4, { align: "right" });
        doc.text(
          formatMoney(item.unitPrice, form.currency),
          cols.price,
          y + 4,
          { align: "right" },
        );
        doc.setFont("helvetica", "bold");
        doc.text(
          formatMoney(item.quantity * item.unitPrice, form.currency),
          cols.total,
          y + 4,
          { align: "right" },
        );
        doc.setFont("helvetica", "normal");
        y += rowH;

        const visibleSubItems = (item.subItems ?? []).filter(
          (sub) => sub.subItemName.trim() !== "",
        );

        if (visibleSubItems.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(130, 130, 130);

          visibleSubItems.forEach((sub) => {
            y = ensureSpace(y, subRowH + 1);
            if (justBrokePage) {
              drawTableHeader();
            }
            const subLines = doc.splitTextToSize(
              `- ${sub.subItemName}`,
              cols.qty - cols.item - 6,
            );
            doc.text(subLines[0], cols.item + 5, y + 3.5);
            doc.text(
              formatMoney(sub.subItemPrice, form.currency),
              cols.total,
              y + 3.5,
              { align: "right" },
            );
            y += subRowH;
          });

          doc.setFontSize(9);
          doc.setTextColor(ar, ag, ab);
        }
      });
    }
    y += 4;
  }

  /* ---- Totals ---- */
  y = ensureSpace(y, 40);
  divider(y);
  y += 6;

  const totalsX = PAGE_W - MARGIN;
  const totalRow = (
    label: string,
    value: string,
    opts: {
      bold?: boolean;
      color?: [number, number, number];
      size?: number;
    } = {},
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(opts.size ?? 10);
    doc.setTextColor(ar, ag, ab);
    doc.text(label, MARGIN, y);
    doc.setTextColor(...(opts.color ?? [ar, ag, ab]));
    doc.text(value, totalsX, y, { align: "right" });
    y += 6;
  };

  totalRow("Subtotal", formatMoney(totals.subtotal, form.currency));
  totalRow("Discount", `-${formatMoney(totals.discountValue, form.currency)}`, {
    color: [220, 38, 38],
  });
  const taxPct =
    (summary.vatPercentage || 0) +
    (summary.nhilPercentage || 0) +
    (summary.getfundPercentage || 0);
  totalRow(
    `Tax (VAT, GETFund, NHIL): ${taxPct}%`,
    formatMoney(totals.taxAmount, form.currency),
  );

  y += 1;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(ar, ag, ab);
  doc.text("Total", MARGIN, y + 2);
  doc.setTextColor(ar, ag, ab);
  doc.text(formatMoney(totals.totalAmount, form.currency), totalsX, y + 2, {
    align: "right",
  });
  y += 10;

  /* ---- Notes / Terms ---- */
  const hasNotes = invoiceCustomization.showNotes && summary.notes;
  const hasTerms = invoiceCustomization.showTerms && summary.terms;
  if (hasNotes || hasTerms) {
    y = ensureSpace(y, 20);
    divider(y);
    y += 6;

    const writeBlock = (label: string, text: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(label, MARGIN, y);
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(text, CONTENT_W);
      y = ensureSpace(y, lines.length * 4.5);
      doc.text(lines, MARGIN, y);
      y += lines.length * 4.5 + 4;
    };

    if (hasNotes) writeBlock("Notes", summary.notes);
    if (hasTerms) writeBlock("Terms", summary.terms);
  }

  /* ---- Payment methods ---- */
  if (
    invoiceCustomization.showPaymentMethods &&
    companySnapshot.paymentMethods.length > 0
  ) {
    y = ensureSpace(y, 20);
    divider(y);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text(
      `Payment Method${companySnapshot.paymentMethods.length > 1 ? "s" : ""}`,
      MARGIN,
      y,
    );
    y += 6;

    const methodColW = CONTENT_W / 2 - 4;
    let colIndex = 0;
    let rowStartY = y;

    companySnapshot.paymentMethods.forEach((method) => {
      const x = MARGIN + colIndex * (methodColW + 8);
      let my = rowStartY;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(ar, ag, ab);
      doc.text(
        method.paymentType === "Bank" ? "Bank Transfer" : "Mobile Money",
        x,
        my,
      );
      my += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const lines =
        method.paymentType === "Bank"
          ? [
              `Bank: ${method.bankName || ""}`,
              `Branch: ${method.bankBranch || ""}`,
              `Account Name: ${method.accountName || ""}`,
              `Account Number: ${method.accountNumber || ""}`,
            ]
          : [
              `Network: ${method.momoVendor || ""}`,
              `Name: ${method.momoName || ""}`,
              `Wallet: ${method.momoWallet || ""}`,
            ];
      lines.forEach((line) => {
        doc.text(line, x, my);
        my += 4.5;
      });

      colIndex += 1;
      if (colIndex === 2) {
        colIndex = 0;
        rowStartY = Math.max(rowStartY, my) + 4;
        rowStartY = ensureSpace(rowStartY, 20);
      }
    });

    y = rowStartY + (colIndex === 1 ? 24 : 0);
  }

  /* ---- Signature ---- */
  if (invoiceCustomization.showSignature && signatureBase64) {
    y = ensureSpace(y, 30);
    divider(y);
    y += 8;
    const w = 40;
    const h = 16;
    addImageSafe(doc, signatureBase64, PAGE_W - MARGIN - w, y, w, h);
    y += h + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("Authorized Signature", PAGE_W - MARGIN, y, { align: "right" });
  }

  return doc;
}

export async function downloadInvoicePDF(
  options: DownloadInvoicePdfOptions,
): Promise<void> {
  const doc = await generateInvoicePDF(options);
  doc.save(
    options.filename || `invoice-${options.form.invoiceNumber || "draft"}.pdf`,
  );
}
