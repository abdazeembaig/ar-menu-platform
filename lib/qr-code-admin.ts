import type { QrTemplateSettings, Table } from "@/types/domain";

export const qrFeatureLabels = {
  en: {
    menu: "Browse Menu",
    order: "Order Items",
    waiter: "Call Waiter",
    bill: "Request Bill",
    feedback: "Give Feedback",
    offers: "Get Special Offers",
  },
  ar: {
    menu: "تصفح القائمة",
    order: "اطلب الطعام",
    waiter: "اطلب النادل",
    bill: "اطلب الفاتورة",
    feedback: "قيّم تجربتك",
    offers: "احصل على العروض",
  },
};

export const qrTemplatePresets = [
  { id: "stand", label: "Table stand insert", width: 100, height: 150, unit: "mm" as const, orientation: "portrait" as const },
  { id: "a6-portrait", label: "A6 portrait", width: 105, height: 148, unit: "mm" as const, orientation: "portrait" as const },
  { id: "a6-landscape", label: "A6 landscape", width: 148, height: 105, unit: "mm" as const, orientation: "landscape" as const },
  { id: "a5-portrait", label: "A5 portrait", width: 148, height: 210, unit: "mm" as const, orientation: "portrait" as const },
  { id: "a5-landscape", label: "A5 landscape", width: 210, height: 148, unit: "mm" as const, orientation: "landscape" as const },
  { id: "sticker", label: "Small table sticker", width: 80, height: 80, unit: "mm" as const, orientation: "portrait" as const },
];

export function buildTableQrUrl(origin: string, basePath: string, restaurantSlug: string, tableCode: string) {
  const normalizedOrigin = origin.replace(/\/$/, "");
  const normalizedBasePath = basePath && !basePath.startsWith("/") ? `/${basePath}` : basePath;
  return `${normalizedOrigin}${normalizedBasePath}/r/${restaurantSlug}/t/${tableCode.toUpperCase()}`;
}

export function isValidQrDestination(url: string, restaurantSlug: string, table: Table) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.endsWith(`/r/${restaurantSlug}/t/${table.code}`) && table.active !== false;
  } catch {
    return false;
  }
}

export function getCardSizeMm(template: Pick<QrTemplateSettings, "width" | "height" | "unit" | "orientation">) {
  const multiplier = template.unit === "cm" ? 10 : 1;
  const width = Math.max(30, template.width * multiplier);
  const height = Math.max(30, template.height * multiplier);
  return template.orientation === "landscape" && height > width
    ? { widthMm: height, heightMm: width }
    : { widthMm: width, heightMm: height };
}

export function qrFilename(restaurantName: string, tableCode: string, extension: "png" | "svg" | "pdf" | "zip") {
  const slug = restaurantName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "restaurant"}-table-${tableCode.toUpperCase()}-qr.${extension}`;
}

export function bulkQrFilename(restaurantName: string, extension: "pdf" | "zip") {
  const slug = restaurantName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "restaurant"}-all-table-qr-codes.${extension}`;
}

export function contrastRatio(foreground: string, background: string) {
  const fg = relativeLuminance(hexToRgb(foreground));
  const bg = relativeLuminance(hexToRgb(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function hasReliableQrContrast(qrColor: string, backgroundColor: string) {
  return contrastRatio(qrColor, backgroundColor) >= 7;
}

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const value = clean.length === 3
    ? clean.split("").map((char) => `${char}${char}`).join("")
    : clean.padEnd(6, "0").slice(0, 6);
  return {
    r: Number.parseInt(value.slice(0, 2), 16) / 255,
    g: Number.parseInt(value.slice(2, 4), 16) / 255,
    b: Number.parseInt(value.slice(4, 6), 16) / 255,
  };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }) {
  const channel = (value: number) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
