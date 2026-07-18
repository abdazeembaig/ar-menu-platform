"use client";

import QRCode from "qrcode";
import JSZip from "jszip";
import Image from "next/image";
import { jsPDF } from "jspdf";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CreditCard,
  Download,
  Eye,
  FileArchive,
  FileImage,
  FileText,
  MessageSquareText,
  Printer,
  QrCode,
  RefreshCcw,
  Save,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { withAssetBasePath } from "@/lib/asset-path";
import {
  buildTableQrUrl,
  bulkQrFilename,
  getCardSizeMm,
  hasReliableQrContrast,
  isValidQrDestination,
  qrFeatureLabels,
  qrFilename,
  qrTemplatePresets,
} from "@/lib/qr-code-admin";
import type { QrTemplateSettings, Restaurant, Table } from "@/types/domain";

interface QrCodeManagementProps {
  restaurant: Restaurant;
  tables: Table[];
  defaultTemplate: QrTemplateSettings;
}

type TableFilter = "active" | "inactive" | "generated" | "missing";

const templateStorageKey = "ar-menu-admin:qr-template";
const authStorageKey = "ar-menu-admin:authenticated";
const safePin = "2468";
const fontOptions = ["Arial", "Helvetica", "Georgia", "Trebuchet MS", "Verdana"];
const featureIcons = {
  menu: Utensils,
  order: ShoppingBag,
  waiter: Bell,
  bill: CreditCard,
  feedback: MessageSquareText,
  offers: BadgeCheck,
};

export function QrCodeManagement({ restaurant, tables, defaultTemplate }: QrCodeManagementProps) {
  const activeTables = useMemo(() => tables.filter((table) => table.active !== false), [tables]);
  const [authenticated, setAuthenticated] = useState(() => (
    typeof window === "undefined" ? false : window.localStorage.getItem(authStorageKey) === "true"
  ));
  const [pin, setPin] = useState("");
  const [template, setTemplate] = useState<QrTemplateSettings>(() => readStoredTemplate(defaultTemplate));
  const [selectedTableCodes, setSelectedTableCodes] = useState<string[]>(activeTables.map((table) => table.code));
  const [focusedTableCode, setFocusedTableCode] = useState(activeTables[0]?.code ?? "");
  const [filter, setFilter] = useState<TableFilter>("active");
  const [range, setRange] = useState("");
  const [qrSvgByCode, setQrSvgByCode] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const [printTableCodes, setPrintTableCodes] = useState<string[]>([]);

  const origin = typeof window === "undefined" ? "https://abdazeembaig.github.io" : window.location.origin;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const focusedTable = tables.find((table) => table.code === focusedTableCode) ?? activeTables[0];
  const focusedUrl = focusedTable ? buildTableQrUrl(origin, basePath, restaurant.slug, focusedTable.code) : "";
  const contrastOk = hasReliableQrContrast(template.qrColor, "#ffffff");
  const selectedTables = selectedTableCodes
    .map((code) => tables.find((table) => table.code === code))
    .filter((table): table is Table => Boolean(table));
  const displayedTables = useMemo(
    () =>
      tables.filter((table) => {
        const generated = Boolean(table.qrGeneratedAt);
        const inRange = !range.trim() || table.code.toLowerCase().includes(range.trim().toLowerCase()) || table.number.includes(range.trim());
        if (!inRange) return false;
        if (filter === "active") return table.active !== false;
        if (filter === "inactive") return table.active === false;
        if (filter === "generated") return generated;
        return !generated;
      }),
    [filter, range, tables],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      activeTables.map(async (table) => {
        const url = buildTableQrUrl(origin, basePath, restaurant.slug, table.code);
        const svg = await QRCode.toString(url, {
          type: "svg",
          errorCorrectionLevel: "H",
          margin: 4,
          color: { dark: template.qrColor, light: "#ffffff" },
        });
        return [table.code, svg] as const;
      }),
    ).then((entries) => {
      if (!cancelled) setQrSvgByCode(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [activeTables, basePath, origin, restaurant.slug, template.qrColor]);

  const updateTemplate = <Key extends keyof QrTemplateSettings>(key: Key, value: QrTemplateSettings[Key]) => {
    setTemplate((current) => ({ ...current, [key]: value }));
  };

  const toggleTable = (code: string) => {
    setSelectedTableCodes((current) => (current.includes(code) ? current.filter((item) => item !== code) : [...current, code]));
    setFocusedTableCode(code);
  };

  const saveTemplate = () => {
    window.localStorage.setItem(templateStorageKey, JSON.stringify(template));
    setStatus("Template saved for this browser. Supabase storage schema is included for production persistence.");
  };

  const resetTemplate = () => {
    setTemplate(defaultTemplate);
    window.localStorage.removeItem(templateStorageKey);
    setStatus("Template reset to default.");
  };

  const authenticate = () => {
    if (pin === safePin) {
      window.localStorage.setItem(authStorageKey, "true");
      setAuthenticated(true);
      setStatus("");
      return;
    }
    setStatus("Invalid admin PIN.");
  };

  const makeCardSvg = async (table: Table) => {
    const url = buildTableQrUrl(origin, basePath, restaurant.slug, table.code);
    const valid = isValidQrDestination(url, restaurant.slug, table);
    if (!valid) {
      throw new Error(`Invalid QR destination for ${table.code}`);
    }
    const qr = await QRCode.toString(url, {
      type: "svg",
      errorCorrectionLevel: "H",
      margin: 4,
      color: { dark: template.qrColor, light: "#ffffff" },
    });
    return renderCardSvg(template, table, qr, url);
  };

  const downloadSvg = async (table = focusedTable) => {
    if (!table) return;
    const svg = await makeCardSvg(table);
    downloadText(svg, qrFilename(template.restaurantName.en, table.code, "svg"), "image/svg+xml");
  };

  const downloadPng = async (table = focusedTable) => {
    if (!table) return;
    const svg = await makeCardSvg(table);
    const png = await svgToPngBlob(svg, 4);
    downloadBlob(png, qrFilename(template.restaurantName.en, table.code, "png"));
  };

  const downloadPdf = async (table = focusedTable) => {
    if (!table) return;
    const svg = await makeCardSvg(table);
    const { widthMm, heightMm } = getCardSizeMm(template);
    const png = await svgToDataUrl(svg, 4);
    const pdf = new jsPDF({ unit: "mm", format: [widthMm, heightMm], orientation: template.orientation });
    pdf.addImage(png, "PNG", 0, 0, widthMm, heightMm);
    pdf.save(qrFilename(template.restaurantName.en, table.code, "pdf"));
  };

  const downloadSelectedPdf = async () => {
    if (!selectedTables.length) return;
    const { widthMm, heightMm } = getCardSizeMm(template);
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const margin = 10;
    const gap = 6;
    const cardWidth = Math.min(widthMm, 90);
    const cardHeight = Math.min(heightMm, 135);
    let x = margin;
    let y = margin;

    for (const table of selectedTables) {
      const dataUrl = await svgToDataUrl(await makeCardSvg(table), 3);
      if (y + cardHeight > 287) {
        pdf.addPage();
        x = margin;
        y = margin;
      }
      pdf.addImage(dataUrl, "PNG", x, y, cardWidth, cardHeight);
      pdf.setDrawColor(180);
      pdf.setLineDashPattern([2, 2], 0);
      pdf.rect(x, y, cardWidth, cardHeight);
      x += cardWidth + gap;
      if (x + cardWidth > 200) {
        x = margin;
        y += cardHeight + gap;
      }
    }
    pdf.save(bulkQrFilename(template.restaurantName.en, "pdf"));
  };

  const downloadZip = async () => {
    if (!selectedTables.length) return;
    const zip = new JSZip();
    for (const table of selectedTables) {
      const png = await svgToPngBlob(await makeCardSvg(table), 4);
      zip.file(qrFilename(template.restaurantName.en, table.code, "png"), png);
      zip.file(qrFilename(template.restaurantName.en, table.code, "svg"), await makeCardSvg(table));
    }
    downloadBlob(await zip.generateAsync({ type: "blob" }), bulkQrFilename(template.restaurantName.en, "zip"));
  };

  const printTables = (codes: string[]) => {
    setPrintTableCodes(codes.length ? codes : selectedTableCodes);
    window.setTimeout(() => window.print(), 100);
  };

  if (!authenticated) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-4">
        <section className="w-full max-w-sm rounded-[var(--radius-brand)] border border-border bg-surface p-6 shadow-lg">
          <QrCode aria-hidden="true" size={32} className="text-accent" />
          <h1 className="mt-4 text-2xl font-black">Admin QR tools</h1>
          <p className="mt-2 text-sm leading-6 text-muted">Enter the admin PIN to manage printable table QR cards.</p>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") authenticate();
            }}
            className="mt-5 h-12 w-full rounded-2xl border border-border bg-background px-4 text-base font-bold"
            type="password"
            inputMode="numeric"
            placeholder="Admin PIN"
          />
          <button type="button" onClick={authenticate} className="touch-target mt-3 w-full rounded-full bg-primary px-4 text-sm font-extrabold text-white">
            Continue
          </button>
          <p className="mt-3 text-xs font-bold text-muted">Preview PIN: 2468</p>
          <p className="mt-2 min-h-5 text-sm font-bold text-accent" aria-live="polite">{status}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <div className="app-shell py-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-accent">Admin / Tables</p>
            <h1 className="mt-1 text-3xl font-black">QR code cards</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Generate high-resolution, table-specific QR cards for GitHub Pages menu URLs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={Save} label="Save Template" onClick={saveTemplate} />
            <ActionButton icon={RefreshCcw} label="Reset" onClick={resetTemplate} />
          </div>
        </header>

        <div className="mt-6 grid gap-5 xl:grid-cols-[310px_1fr_390px]">
          <section className="rounded-[var(--radius-brand)] border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-black">Tables</h2>
              <button type="button" onClick={() => setSelectedTableCodes(activeTables.map((table) => table.code))} className="text-sm font-extrabold text-accent">
                Select active
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              <select value={filter} onChange={(event) => setFilter(event.target.value as TableFilter)} className="h-11 rounded-2xl border border-border bg-background px-3 text-sm font-bold">
                <option value="active">Active tables</option>
                <option value="inactive">Inactive tables</option>
                <option value="generated">QR generated</option>
                <option value="missing">QR not generated</option>
              </select>
              <input
                value={range}
                onChange={(event) => setRange(event.target.value)}
                placeholder="Table, range, area"
                className="h-11 rounded-2xl border border-border bg-background px-3 text-sm font-bold"
              />
            </div>
            <div className="mt-4 max-h-[560px] space-y-2 overflow-auto pe-1">
              {displayedTables.map((table) => {
                const url = buildTableQrUrl(origin, basePath, restaurant.slug, table.code);
                const selected = selectedTableCodes.includes(table.code);
                return (
                  <article key={table.code} className={`rounded-2xl border p-3 ${focusedTableCode === table.code ? "border-accent bg-accent/5" : "border-border bg-background"}`}>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTable(table.code)}
                        className="mt-1 size-5 accent-[var(--color-accent)]"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <strong className="text-base">Table {table.number}</strong>
                          <span className="rounded-full bg-surface px-2 py-1 text-[11px] font-black text-muted">{table.status?.replaceAll("_", " ") ?? "available"}</span>
                        </span>
                        <button type="button" onClick={() => setFocusedTableCode(table.code)} className="mt-1 block truncate text-xs font-bold text-accent">
                          {url}
                        </button>
                        <span className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold text-muted">
                          <span>Generated: {formatDate(table.qrGeneratedAt)}</span>
                          <span>Printed: {formatDate(table.qrPrintedAt)}</span>
                        </span>
                      </span>
                    </label>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button type="button" onClick={() => setFocusedTableCode(table.code)} className="rounded-full border border-border bg-surface px-2 py-2 text-xs font-black">Preview</button>
                      <button type="button" onClick={() => downloadPng(table)} className="rounded-full border border-border bg-surface px-2 py-2 text-xs font-black">PNG</button>
                      <button type="button" onClick={() => printTables([table.code])} className="rounded-full border border-border bg-surface px-2 py-2 text-xs font-black">Print</button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-[var(--radius-brand)] border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black">Template customization</h2>
              <select
                onChange={(event) => {
                  const preset = qrTemplatePresets.find((candidate) => candidate.id === event.target.value);
                  if (preset) setTemplate((current) => ({ ...current, ...preset }));
                }}
                className="h-11 rounded-2xl border border-border bg-background px-3 text-sm font-bold"
                defaultValue=""
              >
                <option value="" disabled>Apply size preset</option>
                {qrTemplatePresets.map((preset) => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
              </select>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextInput label="Template name" value={template.templateName} onChange={(value) => updateTemplate("templateName", value)} />
              <TextInput label="Restaurant slogan" value={template.slogan.en} onChange={(value) => updateTemplate("slogan", { ...template.slogan, en: value })} />
              <TextInput label="Main heading" value={template.heading.en} onChange={(value) => updateTemplate("heading", { ...template.heading, en: value })} />
              <TextInput label="Arabic heading" value={template.heading.ar} onChange={(value) => updateTemplate("heading", { ...template.heading, ar: value })} />
              <TextInput label="Instruction text" value={template.instructionText.en} onChange={(value) => updateTemplate("instructionText", { ...template.instructionText, en: value })} />
              <TextInput label="Arabic instruction" value={template.instructionText.ar} onChange={(value) => updateTemplate("instructionText", { ...template.instructionText, ar: value })} />
              <TextInput label="Footer text" value={template.footerText.en} onChange={(value) => updateTemplate("footerText", { ...template.footerText, en: value })} />
              <TextInput label="Arabic footer" value={template.footerText.ar} onChange={(value) => updateTemplate("footerText", { ...template.footerText, ar: value })} />
              <SelectInput label="Language" value={template.language} options={[["en", "English"], ["ar", "Arabic"], ["both", "English and Arabic"]]} onChange={(value) => updateTemplate("language", value as QrTemplateSettings["language"])} />
              <SelectInput label="Font" value={template.fontFamily} options={fontOptions.map((font) => [font, font])} onChange={(value) => updateTemplate("fontFamily", value)} />
              <SelectInput label="Orientation" value={template.orientation} options={[["portrait", "Portrait"], ["landscape", "Landscape"]]} onChange={(value) => updateTemplate("orientation", value as QrTemplateSettings["orientation"])} />
              <SelectInput label="Border" value={template.borderStyle} options={[["solid", "Solid"], ["dashed", "Dashed"], ["double", "Double"], ["none", "None"]]} onChange={(value) => updateTemplate("borderStyle", value as QrTemplateSettings["borderStyle"])} />
              <NumberInput label="Width" value={template.width} onChange={(value) => updateTemplate("width", value)} />
              <NumberInput label="Height" value={template.height} onChange={(value) => updateTemplate("height", value)} />
              <SelectInput label="Unit" value={template.unit} options={[["mm", "mm"], ["cm", "cm"]]} onChange={(value) => updateTemplate("unit", value as QrTemplateSettings["unit"])} />
              <ColorInput label="Background" value={template.backgroundColor} onChange={(value) => updateTemplate("backgroundColor", value)} />
              <ColorInput label="Primary" value={template.primaryColor} onChange={(value) => updateTemplate("primaryColor", value)} />
              <ColorInput label="Text" value={template.textColor} onChange={(value) => updateTemplate("textColor", value)} />
              <ColorInput label="QR colour" value={template.qrColor} onChange={(value) => updateTemplate("qrColor", value)} />
            </div>
            <fieldset className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <legend className="mb-2 text-sm font-black">Visible features</legend>
              {[
                ["showMenuFeature", "Browse Menu"],
                ["showOrderFeature", "Order Items"],
                ["showWaiterFeature", "Call Waiter"],
                ["showBillFeature", "Request Bill"],
                ["showFeedbackFeature", "Give Feedback"],
                ["showOffersFeature", "Get Offers"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-2xl border border-border bg-background px-3 py-2 text-sm font-bold">
                  {label}
                  <input
                    type="checkbox"
                    checked={Boolean(template[key as keyof QrTemplateSettings])}
                    onChange={(event) => updateTemplate(key as keyof QrTemplateSettings, event.target.checked as never)}
                    className="size-5 accent-[var(--color-accent)]"
                  />
                </label>
              ))}
            </fieldset>
          </section>

          <aside className="rounded-[var(--radius-brand)] border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-black">Live preview</h2>
              <span className="rounded-full bg-background px-3 py-1 text-xs font-black">Table {focusedTable?.number}</span>
            </div>
            <div className="mt-4 flex justify-center overflow-auto rounded-2xl bg-zinc-100 p-4">
              {focusedTable ? <QrCardPreview restaurant={restaurant} table={focusedTable} template={template} qrSvg={qrSvgByCode[focusedTable.code] ?? ""} /> : null}
            </div>
            <div className="mt-4 rounded-2xl bg-background p-3 text-xs font-bold leading-5 text-muted">
              <p>Destination: <span className="break-all text-accent">{focusedUrl}</span></p>
              <p>Validation: {focusedTable && isValidQrDestination(focusedUrl, restaurant.slug, focusedTable) ? "Correct restaurant and table URL" : "Invalid destination"}</p>
              {!contrastOk ? <p className="mt-2 text-red-700">Warning: QR colour contrast may reduce scan reliability.</p> : null}
              <p className="mt-2">WhatsApp wording remains optional and consent-safe.</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <ActionButton icon={Eye} label="Preview" onClick={() => setStatus(`Previewing ${focusedUrl}`)} />
              <ActionButton icon={FileImage} label="Download PNG" onClick={() => downloadPng()} />
              <ActionButton icon={FileText} label="Download SVG" onClick={() => downloadSvg()} />
              <ActionButton icon={FileText} label="Download PDF" onClick={() => downloadPdf()} />
              <ActionButton icon={Printer} label="Print" onClick={() => focusedTable && printTables([focusedTable.code])} />
              <ActionButton icon={Download} label="Selected PDF" onClick={downloadSelectedPdf} />
              <ActionButton icon={FileArchive} label="ZIP images" onClick={downloadZip} />
              <ActionButton icon={Printer} label="Print Selected" onClick={() => printTables(selectedTableCodes)} />
              <button type="button" onClick={() => printTables(activeTables.map((table) => table.code))} className="touch-target col-span-2 rounded-full bg-primary px-4 text-sm font-extrabold text-white">
                Print All Tables
              </button>
            </div>
            <p className="mt-3 min-h-6 text-sm font-bold text-accent" aria-live="polite">{status}</p>
          </aside>
        </div>
      </div>

      <div className="print-only">
        <div className="print-sheet">
          {(printTableCodes.length ? printTableCodes : selectedTableCodes).map((code) => {
            const table = tables.find((candidate) => candidate.code === code);
            return table ? <QrCardPreview key={code} restaurant={restaurant} table={table} template={template} qrSvg={qrSvgByCode[code] ?? ""} /> : null;
          })}
        </div>
      </div>

      <style>{`
        .print-only { display: none; }
        @media print {
          body > *:not(.print-only) { display: none !important; }
          .print-only { display: block; }
          .print-sheet {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8mm;
            padding: 8mm;
          }
          .qr-admin-card {
            break-inside: avoid;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function QrCardPreview({
  restaurant,
  table,
  template,
  qrSvg,
}: {
  restaurant: Restaurant;
  table: Table;
  template: QrTemplateSettings;
  qrSvg: string;
}) {
  const { widthMm, heightMm } = getCardSizeMm(template);
  const lang = template.language;
  const features = getVisibleFeatures(template);
  const showArabic = lang === "ar" || lang === "both";
  const showEnglish = lang === "en" || lang === "both";
  const direction = lang === "ar" ? "rtl" : "ltr";

  return (
    <article
      className="qr-admin-card grid overflow-hidden rounded-[20px] border bg-white p-4 text-center shadow-lg"
      dir={direction}
      style={{
        width: `${widthMm}mm`,
        minHeight: `${heightMm}mm`,
        background: template.backgroundColor,
        color: template.textColor,
        borderColor: template.primaryColor,
        borderStyle: template.borderStyle === "none" ? "solid" : template.borderStyle,
        borderWidth: template.borderStyle === "none" ? 0 : template.borderStyle === "double" ? 5 : 2,
        fontFamily: template.fontFamily,
      }}
    >
      <div className="mx-auto grid place-items-center gap-1">
        <Image src={withAssetBasePath(template.logoUrl) ?? "/logo.svg"} alt="" width={48} height={48} className="size-12 rounded-2xl bg-white p-1" />
        <h2 className="text-lg font-black leading-tight">{showArabic && !showEnglish ? template.restaurantName.ar : template.restaurantName.en || restaurant.name.en}</h2>
        <p className="text-xs font-bold opacity-75">{showArabic && !showEnglish ? template.slogan.ar : template.slogan.en}</p>
      </div>
      <div className="my-3">
        {showEnglish ? <h3 className="text-2xl font-black uppercase leading-tight" style={{ color: template.primaryColor }}>{template.heading.en}</h3> : null}
        {showArabic ? <h3 className="text-xl font-black leading-tight" style={{ color: template.primaryColor }}>{template.heading.ar}</h3> : null}
      </div>
      <div className="mx-auto grid w-[66%] place-items-center rounded-3xl bg-white p-3">
        {qrSvg ? <div className="w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} /> : <QrCode aria-hidden="true" size={140} />}
      </div>
      <p className="mt-3 text-xl font-black tracking-wide" style={{ color: template.primaryColor }}>TABLE {table.number}</p>
      <div className="mx-auto mt-2 max-w-[82%] text-xs font-bold leading-5 opacity-80">
        {showEnglish ? <p>{template.instructionText.en}</p> : null}
        {showArabic ? <p>{template.instructionText.ar}</p> : null}
      </div>
      <div className="mt-4 rounded-3xl bg-white/70 p-3">
        <p className="text-xs font-black uppercase tracking-wide" style={{ color: template.primaryColor }}>{showArabic && !showEnglish ? "ماذا يمكنك أن تفعل؟" : "What can you do?"}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {features.map((feature) => {
            const Icon = featureIcons[feature];
            return (
              <div key={feature} className="rounded-2xl border border-black/5 bg-white p-2">
                <Icon aria-hidden="true" size={16} className="mx-auto" style={{ color: template.primaryColor }} />
                <p className="mt-1 text-[10px] font-black leading-tight">
                  {showArabic && !showEnglish ? qrFeatureLabels.ar[feature] : qrFeatureLabels.en[feature]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 text-xs font-bold leading-5">
        {showEnglish ? <p>{template.footerText.en}</p> : null}
        {showArabic ? <p>{template.footerText.ar}</p> : null}
        <p className="mt-2 font-black" style={{ color: template.primaryColor }}>Scan · Order · Enjoy</p>
      </div>
    </article>
  );
}

function ActionButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="touch-target inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 text-sm font-extrabold text-primary">
      <Icon aria-hidden="true" size={16} />
      {label}
    </button>
  );
}

function TextInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-2xl border border-border bg-background px-3" />
    </label>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <input value={value} onChange={(event) => onChange(Number(event.target.value))} type="number" min={1} className="h-11 rounded-2xl border border-border bg-background px-3" />
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <span className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-background px-3">
        <input value={value} onChange={(event) => onChange(event.target.value)} type="color" className="size-7 rounded" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent" />
      </span>
    </label>
  );
}

function SelectInput({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[] | string[][];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm font-bold">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-2xl border border-border bg-background px-3">
        {options.map((option) => {
          const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
          return <option key={optionValue} value={optionValue}>{optionLabel}</option>;
        })}
      </select>
    </label>
  );
}

function getVisibleFeatures(template: QrTemplateSettings) {
  return [
    template.showMenuFeature ? "menu" : null,
    template.showOrderFeature ? "order" : null,
    template.showWaiterFeature ? "waiter" : null,
    template.showBillFeature ? "bill" : null,
    template.showFeedbackFeature ? "feedback" : null,
    template.showOffersFeature ? "offers" : null,
  ].filter((feature): feature is keyof typeof featureIcons => Boolean(feature));
}

function readStoredTemplate(defaultTemplate: QrTemplateSettings) {
  if (typeof window === "undefined") {
    return defaultTemplate;
  }

  const stored = window.localStorage.getItem(templateStorageKey);
  if (!stored) {
    return defaultTemplate;
  }

  try {
    return { ...defaultTemplate, ...(JSON.parse(stored) as Partial<QrTemplateSettings>) };
  } catch {
    window.localStorage.removeItem(templateStorageKey);
    return defaultTemplate;
  }
}

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(new Date(value)) : "Never";
}

function renderCardSvg(template: QrTemplateSettings, table: Table, qrSvg: string, url: string) {
  const { widthMm, heightMm } = getCardSizeMm(template);
  const width = widthMm * 4;
  const height = heightMm * 4;
  const qrSize = Math.min(width * 0.54, height * 0.34);
  const qrX = (width - qrSize) / 2;
  const qrY = height * 0.28;
  const encodedQr = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(qrSvg)))}`;
  const features = getVisibleFeatures(template).slice(0, 6);
  const featureText = features
    .map((feature, index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = width * (column ? 0.58 : 0.22);
      const y = height * 0.66 + row * 34;
      return `<rect x="${x - 52}" y="${y - 15}" width="104" height="27" rx="10" fill="#ffffff" opacity="0.82"/><text x="${x}" y="${y + 3}" text-anchor="middle" font-size="12" font-weight="700" fill="${escapeXml(template.textColor)}">${escapeXml(qrFeatureLabels.en[feature])}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" rx="24" fill="${escapeXml(template.backgroundColor)}"/>
  <rect x="8" y="8" width="${width - 16}" height="${height - 16}" rx="22" fill="none" stroke="${escapeXml(template.primaryColor)}" stroke-width="${template.borderStyle === "none" ? 0 : 5}" stroke-dasharray="${template.borderStyle === "dashed" ? "12 8" : "0"}"/>
  <circle cx="${width / 2}" cy="48" r="28" fill="#ffffff"/>
  <text x="${width / 2}" y="58" text-anchor="middle" font-size="28" font-weight="900" fill="${escapeXml(template.primaryColor)}">QR</text>
  <text x="${width / 2}" y="98" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="22" font-weight="900" fill="${escapeXml(template.textColor)}">${escapeXml(template.restaurantName.en)}</text>
  <text x="${width / 2}" y="120" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="13" font-weight="700" fill="${escapeXml(template.textColor)}" opacity="0.72">${escapeXml(template.slogan.en)}</text>
  <text x="${width / 2}" y="${height * 0.23}" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="29" font-weight="900" fill="${escapeXml(template.primaryColor)}">${escapeXml(template.heading.en)}</text>
  <image href="${encodedQr}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}"/>
  <text x="${width / 2}" y="${qrY + qrSize + 30}" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="27" font-weight="900" fill="${escapeXml(template.primaryColor)}">TABLE ${escapeXml(table.number)}</text>
  <text x="${width / 2}" y="${qrY + qrSize + 54}" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="13" font-weight="700" fill="${escapeXml(template.textColor)}">Scan with your phone camera. No app is required.</text>
  <rect x="${width * 0.12}" y="${height * 0.61}" width="${width * 0.76}" height="${height * 0.23}" rx="22" fill="#ffffff" opacity="0.58"/>
  <text x="${width / 2}" y="${height * 0.65}" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="16" font-weight="900" fill="${escapeXml(template.primaryColor)}">WHAT CAN YOU DO?</text>
  ${featureText}
  <text x="${width / 2}" y="${height - 48}" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="14" font-weight="700" fill="${escapeXml(template.textColor)}">${escapeXml(template.footerText.en)}</text>
  <text x="${width / 2}" y="${height - 24}" text-anchor="middle" font-family="${escapeXml(template.fontFamily)}" font-size="15" font-weight="900" fill="${escapeXml(template.primaryColor)}">Scan · Order · Enjoy</text>
  <metadata>${escapeXml(url)}</metadata>
</svg>`;
}

async function svgToDataUrl(svg: string, scale = 2) {
  const blob = await svgToPngBlob(svg, scale);
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function svgToPngBlob(svg: string, scale = 2) {
  const image = new window.Image();
  const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  image.src = objectUrl;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.width * scale;
  canvas.height = image.height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(objectUrl);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not render PNG."))), "image/png", 1);
  });
}

function downloadText(content: string, filename: string, type: string) {
  downloadBlob(new Blob([content], { type }), filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
