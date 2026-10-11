import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import {
  QrCode,
  Download,
  FolderArchive,
  FileText,
  Plus,
  Minus,
  X,
  ExternalLink,
  Check,
  Sparkles,
  Grid,
  Printer,
} from 'lucide-react';
import {
  deriveTableLabels,
  type ClientMenu,
  type Language,
} from '../menus';
import { config, getBaseUrl } from '../config';

const STUDIO_TEXT: Record<
  Language,
  {
    title: string;
    subtitle: string;
    tableCountLabel: string;
    tableCountHint: string;
    extraTablesLabel: string;
    extraTablesPlaceholder: string;
    addExtraBtn: string;
    showLogoLabel: string;
    useBrandColorLabel: string;
    downloadZipBtn: string;
    downloadingZip: string;
    downloadA6PdfBtn: string;
    downloadA4SheetBtn: string;
    generatingPdf: string;
    mainMenuCardTitle: string;
    mainMenuCardSubtitle: string;
    tablePrefix: string;
    testLinkBtn: string;
    pngBtn: string;
    svgBtn: string;
    totalQrCount: string;
    scanCtaFr: string;
    scanCtaEn: string;
    scanCtaAr: string;
  }
> = {
  ar: {
    title: 'الطاولات ورموز QR التلقائية',
    subtitle:
      'حدد فقط عدد الطاولات ليتم توليد رمز QR خاص بكل طاولة تلقائياً مع رقم الطاولة المدمج.',
    tableCountLabel: 'عدد الطاولات المرقمة (1 إلى N)',
    tableCountHint: 'يتم توليد الطاولات من 1 إلى هذا الرقم تلقائياً.',
    extraTablesLabel: 'طاولات إضافية مخصصة (مثل: Terrasse 1, VIP)',
    extraTablesPlaceholder: 'مثال: Terrasse 1 أو VIP...',
    addExtraBtn: 'إضافة',
    showLogoLabel: 'إظهار شعار المقهى وسط رمز QR (تصحيح خطأ عالي H)',
    useBrandColorLabel: 'تلوين رمز QR بلون هوية المقهى',
    downloadZipBtn: 'تحميل جميع الرموز (ZIP PNG)',
    downloadingZip: 'جاري ضغط ملفات PNG...',
    downloadA6PdfBtn: 'تحميل حوامل الطاولات PDF (A6 لكل طاولة)',
    downloadA4SheetBtn: 'تحميل ورقة الطباعة PDF (A4 — 6 طاولات في الصفحة)',
    generatingPdf: 'جاري تجهيز ملف PDF...',
    mainMenuCardTitle: 'رمز QR العام للمنيو (بدون رقم طاولة)',
    mainMenuCardSubtitle: 'مناسب للواجهة، التوصيل أو النشر على إنستغرام',
    tablePrefix: 'طاولة',
    testLinkBtn: 'تجربة الرابط',
    pngBtn: 'PNG',
    svgBtn: 'SVG',
    totalQrCount: 'إجمالي رموز الطاولات الجاهزة',
    scanCtaFr: 'Scannez pour commander',
    scanCtaEn: 'Scan to order',
    scanCtaAr: 'امسح الرمز للطلب من طاولتك',
  },
  fr: {
    title: 'Tables & QR Codes Automatiques',
    subtitle:
      'Indiquez uniquement le nombre de tables : un QR code unique par table est généré instantanément.',
    tableCountLabel: 'Nombre de tables numérotées (1 à N)',
    tableCountHint: 'Génère automatiquement les tables "1" jusqu’à ce nombre.',
    extraTablesLabel: 'Tables supplémentaires (ex: Terrasse 1, VIP)',
    extraTablesPlaceholder: 'Ex: Terrasse 1, Salon VIP...',
    addExtraBtn: 'Ajouter',
    showLogoLabel: 'Centrer le logo du restaurant dans le QR (niveau H)',
    useBrandColorLabel: 'Utiliser la couleur principale du restaurant',
    downloadZipBtn: 'Télécharger TOUT en ZIP (PNG)',
    downloadingZip: 'Création du ZIP...',
    downloadA6PdfBtn: 'PDF Chevalets A6 (1 page / table)',
    downloadA4SheetBtn: 'PDF Planche A4 (6 chevalets / page)',
    generatingPdf: 'Génération du PDF...',
    mainMenuCardTitle: 'QR Menu Principal (sans numéro de table)',
    mainMenuCardSubtitle: 'Idéal pour comptoir, vitrine, flyers et Instagram',
    tablePrefix: 'Table',
    testLinkBtn: 'Tester',
    pngBtn: 'PNG',
    svgBtn: 'SVG',
    totalQrCount: 'QR codes de tables générés',
    scanCtaFr: 'Scannez pour commander',
    scanCtaEn: 'Scan to order',
    scanCtaAr: 'امسح الرمز للطلب',
  },
  en: {
    title: 'Automatic Tables & QR Codes',
    subtitle:
      'Simply set your number of tables: a dedicated QR code per table is generated automatically.',
    tableCountLabel: 'Number of numbered tables (1 to N)',
    tableCountHint: 'Automatically derives tables "1" through N.',
    extraTablesLabel: 'Extra table labels (e.g. Terrasse 1, VIP)',
    extraTablesPlaceholder: 'e.g. Terrasse 1, VIP...',
    addExtraBtn: 'Add',
    showLogoLabel: 'Embed business logo in QR center (Error Correction H)',
    useBrandColorLabel: 'Use business primary color for QR modules',
    downloadZipBtn: 'Download ALL as ZIP (PNGs)',
    downloadingZip: 'Building ZIP...',
    downloadA6PdfBtn: 'Printable A6 Table Tents PDF (1 per page)',
    downloadA4SheetBtn: 'Printable A4 Sheet PDF (6 tents per page)',
    generatingPdf: 'Generating PDF...',
    mainMenuCardTitle: 'Main Menu QR (without table)',
    mainMenuCardSubtitle: 'Ideal for counter, takeaway flyers, and social media',
    tablePrefix: 'Table',
    testLinkBtn: 'Test URL',
    pngBtn: 'PNG',
    svgBtn: 'SVG',
    totalQrCount: 'Active table QR codes',
    scanCtaFr: 'Scannez pour commander',
    scanCtaEn: 'Scan to order',
    scanCtaAr: 'امسح الرمز للطلب',
  },
};

function sanitizeFileSlug(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0');
  const num = parseInt(full.slice(0, 6), 16) || 0;
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

async function renderQrPngDataUrl(options: {
  url: string;
  size: number;
  fgColor: string;
  bgColor: string;
  logoUrl?: string;
  businessName: string;
}): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = options.size;
  canvas.height = options.size;

  await QRCode.toCanvas(canvas, options.url, {
    width: options.size,
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: options.fgColor,
      light: options.bgColor,
    },
  });

  if (options.logoUrl) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const boxSize = Math.round(options.size * 0.22);
      const x = Math.round((options.size - boxSize) / 2);
      const y = Math.round((options.size - boxSize) / 2);
      const pad = Math.round(boxSize * 0.12);

      // Draw white rounded background behind logo
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(
        x - pad,
        y - pad,
        boxSize + pad * 2,
        boxSize + pad * 2,
        Math.round(boxSize * 0.24)
      );
      ctx.fill();
      ctx.restore();

      const drewImage = await new Promise<boolean>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(x, y, boxSize, boxSize, Math.round(boxSize * 0.18));
            ctx.clip();
            ctx.drawImage(img, x, y, boxSize, boxSize);
            ctx.restore();
            canvas.toDataURL('image/png');
            resolve(true);
          } catch {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        img.src = options.logoUrl!;
      });

      if (!drewImage) {
        // Clean monogram badge fallback if external image blocks CORS canvas export
        ctx.save();
        ctx.fillStyle = options.fgColor;
        ctx.beginPath();
        ctx.roundRect(x, y, boxSize, boxSize, Math.round(boxSize * 0.18));
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `800 ${Math.round(boxSize * 0.46)}px "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          (options.businessName || 'M').trim().charAt(0).toUpperCase(),
          x + boxSize / 2,
          y + boxSize / 2 + 2
        );
        ctx.restore();
      }
    }
  }

  return canvas.toDataURL('image/png');
}

async function renderQrSvgString(options: {
  url: string;
  fgColor: string;
  bgColor: string;
}): Promise<string> {
  return QRCode.toString(options.url, {
    type: 'svg',
    margin: 2,
    errorCorrectionLevel: 'H',
    color: {
      dark: options.fgColor,
      light: options.bgColor,
    },
  });
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function triggerDataUrlDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const SingleQrPreviewCard: React.FC<{
  title: string;
  subtitle?: string;
  badgeText?: string;
  targetUrl: string;
  testPath: string;
  fileBaseName: string;
  fgColor: string;
  primaryColor: string;
  logoUrl?: string;
  businessName: string;
  lang: Language;
}> = ({
  title,
  subtitle,
  badgeText,
  targetUrl,
  testPath,
  fileBaseName,
  fgColor,
  primaryColor,
  logoUrl,
  businessName,
  lang,
}) => {
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const txt = STUDIO_TEXT[lang];

  useEffect(() => {
    let active = true;
    renderQrPngDataUrl({
      url: targetUrl,
      size: 320,
      fgColor,
      bgColor: '#FFFFFF',
      logoUrl,
      businessName,
    })
      .then((url) => {
        if (active) setPreviewDataUrl(url);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [targetUrl, fgColor, logoUrl, businessName]);

  const handleDownloadPng = async () => {
    const hiRes = await renderQrPngDataUrl({
      url: targetUrl,
      size: 1024,
      fgColor,
      bgColor: '#FFFFFF',
      logoUrl,
      businessName,
    });
    triggerDataUrlDownload(hiRes, `${fileBaseName}.png`);
  };

  const handleDownloadSvg = async () => {
    const svg = await renderQrSvgString({
      url: targetUrl,
      fgColor,
      bgColor: '#FFFFFF',
    });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerBlobDownload(blob, `${fileBaseName}.svg`);
  };

  return (
    <div className="rounded-2xl bg-white border border-neutral-200/90 p-4 flex flex-col justify-between gap-3 shadow-2xs hover:border-neutral-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold text-neutral-950 truncate">
              {title}
            </h4>
            {badgeText && (
              <span
                className="px-2 py-0.5 rounded-md text-[11px] font-extrabold text-white shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          to={testPath}
          target="_blank"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[11px] font-bold text-neutral-700 shrink-0"
        >
          <span>{txt.testLinkBtn}</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* QR Image */}
      <div className="bg-neutral-50 rounded-xl p-3 flex items-center justify-center border border-neutral-100">
        {previewDataUrl ? (
          <img
            src={previewDataUrl}
            alt={title}
            className="w-36 h-36 object-contain rounded-lg"
          />
        ) : (
          <div className="w-36 h-36 flex items-center justify-center text-neutral-300">
            <QrCode className="w-10 h-10 animate-pulse" />
          </div>
        )}
      </div>

      <p
        dir="ltr"
        className="text-[10px] font-mono text-neutral-400 truncate text-center"
        title={targetUrl}
      >
        {targetUrl}
      </p>

      {/* PNG & SVG Download Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleDownloadPng}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold text-white shadow-2xs hover:opacity-95 cursor-pointer"
          style={{ backgroundColor: primaryColor }}
        >
          <Download className="w-3.5 h-3.5" />
          <span>{txt.pngBtn}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadSvg}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-extrabold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{txt.svgBtn}</span>
        </button>
      </div>
    </div>
  );
};

export const TableQrStudio: React.FC<{
  menu: ClientMenu;
  lang: Language;
  onUpdateTableSettings?: (tableCount: number, extraTables: string[]) => void;
}> = ({ menu, lang, onUpdateTableSettings }) => {
  const txt = STUDIO_TEXT[lang];
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const [tableCount, setTableCount] = useState<number>(menu.tableCount ?? 12);
  const [extraTables, setExtraTables] = useState<string[]>(
    menu.extraTables ?? []
  );
  const [newExtraInput, setNewExtraInput] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [useBrandColor, setUseBrandColor] = useState(true);
  const [busyZip, setBusyZip] = useState(false);
  const [busyPdf, setBusyPdf] = useState<'a6' | 'a4' | null>(null);

  useEffect(() => {
    setTableCount(menu.tableCount ?? 12);
    setExtraTables(menu.extraTables ?? []);
  }, [menu.slug, menu.tableCount, menu.extraTables]);

  const tableLabels = useMemo(
    () => deriveTableLabels(tableCount, extraTables),
    [tableCount, extraTables]
  );

  const baseUrl = getBaseUrl().replace(/\/+$/, '');
  const mainMenuUrl = `${baseUrl}/m/${menu.slug}`;
  const fgColor = useBrandColor
    ? menu.colors.primary || config.colors.primary
    : menu.colors.accent || '#18181B';
  const primaryColor = menu.colors.primary || config.colors.primary;

  const commitTableSettings = (nextCount: number, nextExtras: string[]) => {
    const clamped = Math.max(0, Math.min(500, Math.floor(Number(nextCount) || 0)));
    setTableCount(clamped);
    setExtraTables(nextExtras);
    if (onUpdateTableSettings) {
      onUpdateTableSettings(clamped, nextExtras);
    }
  };

  const handleAddExtraTable = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newExtraInput.trim();
    if (!clean) return;
    if (!extraTables.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      const updated = [...extraTables, clean];
      commitTableSettings(tableCount, updated);
    }
    setNewExtraInput('');
  };

  const handleRemoveExtraTable = (labelToRemove: string) => {
    const updated = extraTables.filter((t) => t !== labelToRemove);
    commitTableSettings(tableCount, updated);
  };

  // Download ALL table QR codes as a ZIP of PNGs (table-1.png, table-5.png, etc.)
  const handleDownloadAllZip = async () => {
    setBusyZip(true);
    try {
      const zip = new JSZip();

      // Main menu QR without table
      const mainDataUrl = await renderQrPngDataUrl({
        url: mainMenuUrl,
        size: 1024,
        fgColor,
        bgColor: '#FFFFFF',
        logoUrl: showLogo ? menu.logo : undefined,
        businessName: menu.name,
      });
      zip.file(
        'menu-principal.png',
        mainDataUrl.replace(/^data:image\/png;base64,/, ''),
        { base64: true }
      );

      // Every derived table QR: table-1.png, table-2.png, ..., table-5.png
      for (const label of tableLabels) {
        const tableUrl = `${mainMenuUrl}?t=${encodeURIComponent(label)}`;
        const pngDataUrl = await renderQrPngDataUrl({
          url: tableUrl,
          size: 1024,
          fgColor,
          bgColor: '#FFFFFF',
          logoUrl: showLogo ? menu.logo : undefined,
          businessName: menu.name,
        });
        const fileName = `table-${sanitizeFileSlug(label) || label}.png`;
        zip.file(
          fileName,
          pngDataUrl.replace(/^data:image\/png;base64,/, ''),
          { base64: true }
        );
      }

      const content = await zip.generateAsync({ type: 'blob' });
      triggerBlobDownload(content, `${menu.slug}-tables-qr.zip`);
    } finally {
      setBusyZip(false);
    }
  };

  // Generate Printable PDF: One A6 Table Tent per Table (105mm x 148mm)
  const handleDownloadA6TableTentsPdf = async () => {
    setBusyPdf('a6');
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a6',
      });
      const [r, g, b] = hexToRgbTuple(primaryColor);
      const targets = tableLabels.length > 0 ? tableLabels : ['1'];

      for (let i = 0; i < targets.length; i++) {
        if (i > 0) doc.addPage('a6', 'portrait');
        const label = targets[i];
        const tableUrl = `${mainMenuUrl}?t=${encodeURIComponent(label)}`;
        const qrDataUrl = await renderQrPngDataUrl({
          url: tableUrl,
          size: 800,
          fgColor,
          bgColor: '#FFFFFF',
          logoUrl: showLogo ? menu.logo : undefined,
          businessName: menu.name,
        });

        // Outer card border
        doc.setFillColor(250, 248, 245);
        doc.rect(0, 0, 105, 148, 'F');

        // Top accent band
        doc.setFillColor(r, g, b);
        doc.rect(0, 0, 105, 18, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(menu.name.toUpperCase(), 52.5, 11.5, { align: 'center' });

        // Big Table Number Pill
        doc.setFillColor(24, 24, 27);
        doc.roundedRect(25, 24, 55, 16, 4, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(`TABLE ${label}`, 52.5, 34.5, { align: 'center' });

        // Trilingual Scan Prompt
        doc.setTextColor(24, 24, 27);
        doc.setFontSize(11);
        doc.text('Scannez pour commander', 52.5, 49, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(90, 90, 95);
        doc.text('Scan to order • Digital Menu', 52.5, 54.5, { align: 'center' });

        // White QR frame + Centered QR code
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.8);
        doc.roundedRect(21.5, 59, 62, 62, 4, 4, 'FD');
        doc.addImage(qrDataUrl, 'PNG', 24.5, 62, 56, 56);

        // City / WiFi or URL hint
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(r, g, b);
        doc.text(`${menu.city} • Sans application`, 52.5, 129, {
          align: 'center',
        });

        // Discreet footer credit: "Menu by My Menu"
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(140, 140, 145);
        doc.text('Menu by My Menu', 52.5, 141, { align: 'center' });
      }

      doc.save(`${menu.slug}-table-tents-A6.pdf`);
    } finally {
      setBusyPdf(null);
    }
  };

  // Generate Printable A4 Sheet with 6 Tents per Page (2 columns x 3 rows)
  const handleDownloadA4SixUpPdf = async () => {
    setBusyPdf('a4');
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const [r, g, b] = hexToRgbTuple(primaryColor);
      const targets = tableLabels.length > 0 ? tableLabels : ['1'];

      const marginX = 10;
      const marginY = 9;
      const cellW = 95; // 2 * 95 = 190mm (+ 20mm margins = 210mm)
      const cellH = 93; // 3 * 93 = 279mm (+ 18mm margins = 297mm)

      for (let i = 0; i < targets.length; i++) {
        const slotIndex = i % 6;
        if (i > 0 && slotIndex === 0) {
          doc.addPage('a4', 'portrait');
        }

        const col = slotIndex % 2;
        const row = Math.floor(slotIndex / 2);
        const x = marginX + col * cellW;
        const y = marginY + row * cellH;

        const label = targets[i];
        const tableUrl = `${mainMenuUrl}?t=${encodeURIComponent(label)}`;
        const qrDataUrl = await renderQrPngDataUrl({
          url: tableUrl,
          size: 600,
          fgColor,
          bgColor: '#FFFFFF',
          logoUrl: showLogo ? menu.logo : undefined,
          businessName: menu.name,
        });

        // Dashed cut border around tent cell
        doc.setDrawColor(210, 210, 215);
        doc.setLineWidth(0.3);
        doc.rect(x, y, cellW, cellH);

        // Top color header inside cell
        doc.setFillColor(r, g, b);
        doc.rect(x + 2, y + 2, cellW - 4, 11, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.text(menu.name.toUpperCase(), x + cellW / 2, y + 9, {
          align: 'center',
        });

        // Big Table Badge
        doc.setFillColor(24, 24, 27);
        doc.roundedRect(x + 22, y + 15.5, cellW - 44, 11, 2.5, 2.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.text(`TABLE ${label}`, x + cellW / 2, y + 22.8, {
          align: 'center',
        });

        // CTA
        doc.setTextColor(24, 24, 27);
        doc.setFontSize(8.5);
        doc.text('Scannez pour commander • Scan to order', x + cellW / 2, y + 32, {
          align: 'center',
        });

        // QR Code
        const qrSize = 44;
        doc.addImage(
          qrDataUrl,
          'PNG',
          x + (cellW - qrSize) / 2,
          y + 35,
          qrSize,
          qrSize
        );

        // Footer credit
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(130, 130, 135);
        doc.text('Menu by My Menu', x + cellW / 2, y + cellH - 4, {
          align: 'center',
        });
      }

      doc.save(`${menu.slug}-planche-A4-6up.pdf`);
    } finally {
      setBusyPdf(null);
    }
  };

  return (
    <div dir={dir} className="space-y-6">
      {/* Configuration Header Card */}
      <div className="rounded-3xl bg-white border border-neutral-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <QrCode className="w-4 h-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-neutral-950">
                {txt.title}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600">
              {txt.subtitle}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-neutral-100 text-xs font-extrabold text-neutral-800 self-start lg:self-auto">
            <Sparkles className="w-4 h-4" style={{ color: primaryColor }} />
            <span>
              {txt.totalQrCount}:{' '}
              <strong dir="ltr" className="text-neutral-950">
                {tableLabels.length}
              </strong>
            </span>
          </div>
        </div>

        {/* Controls Grid: Table Count + Extra Table Labels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Number of tables (1..table_count) */}
          <div className="lg:col-span-5 space-y-2">
            <label className="block text-xs font-extrabold text-neutral-800">
              {txt.tableCountLabel}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => commitTableSettings(Math.max(1, tableCount - 1), extraTables)}
                className="w-10 h-10 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center font-bold text-neutral-800 cursor-pointer"
                aria-label="Decrease table count"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min={0}
                max={500}
                dir="ltr"
                value={tableCount}
                onChange={(e) =>
                  commitTableSettings(Number(e.target.value || 0), extraTables)
                }
                className="w-28 text-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-base font-extrabold text-neutral-950 focus:outline-none focus:ring-2"
                style={
                  { '--tw-ring-color': primaryColor } as React.CSSProperties
                }
              />

              <button
                type="button"
                onClick={() => commitTableSettings(tableCount + 1, extraTables)}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-2xs hover:opacity-95 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
                aria-label="Increase table count"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">{txt.tableCountHint}</p>
          </div>

          {/* Extra Tables (e.g. Terrasse 1, VIP) */}
          <div className="lg:col-span-7 space-y-2">
            <label className="block text-xs font-extrabold text-neutral-800">
              {txt.extraTablesLabel}
            </label>
            <form onSubmit={handleAddExtraTable} className="flex gap-2">
              <input
                type="text"
                value={newExtraInput}
                onChange={(e) => setNewExtraInput(e.target.value)}
                placeholder={txt.extraTablesPlaceholder}
                className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:outline-none focus:ring-2"
                style={
                  { '--tw-ring-color': primaryColor } as React.CSSProperties
                }
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shrink-0 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
              >
                + {txt.addExtraBtn}
              </button>
            </form>

            {extraTables.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {extraTables.map((extra) => (
                  <span
                    key={extra}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-neutral-100 text-xs font-bold text-neutral-800 border border-neutral-200"
                  >
                    <span>{extra}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExtraTable(extra)}
                      className="text-neutral-400 hover:text-rose-600 cursor-pointer"
                      aria-label={`Remove ${extra}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Style Checkboxes + Bulk Export Buttons */}
        <div className="pt-3 border-t border-neutral-100 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="rounded border-neutral-300 text-[#6BBF3A] focus:ring-[#6BBF3A]"
              />
              <span>{txt.showLogoLabel}</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
              <input
                type="checkbox"
                checked={useBrandColor}
                onChange={(e) => setUseBrandColor(e.target.checked)}
                className="rounded border-neutral-300 text-[#6BBF3A] focus:ring-[#6BBF3A]"
              />
              <span>{txt.useBrandColorLabel}</span>
            </label>
          </div>

          {/* Bulk Export Action Buttons: ZIP, A6 PDF, A4 6-up PDF */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={busyZip}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-xs hover:opacity-95 disabled:opacity-60 cursor-pointer"
              style={{ backgroundColor: primaryColor }}
            >
              <FolderArchive className="w-4 h-4 shrink-0" />
              <span>{busyZip ? txt.downloadingZip : txt.downloadZipBtn}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadA6TableTentsPdf}
              disabled={busyPdf !== null}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-60 cursor-pointer"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>
                {busyPdf === 'a6' ? txt.generatingPdf : txt.downloadA6PdfBtn}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadA4SixUpPdf}
              disabled={busyPdf !== null}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 disabled:opacity-60 cursor-pointer"
            >
              <Grid className="w-4 h-4 shrink-0" />
              <span>
                {busyPdf === 'a4' ? txt.generatingPdf : txt.downloadA4SheetBtn}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Menu QR (without table parameter) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <SingleQrPreviewCard
            title={txt.mainMenuCardTitle}
            subtitle={txt.mainMenuCardSubtitle}
            targetUrl={mainMenuUrl}
            testPath={`/m/${menu.slug}`}
            fileBaseName={`${menu.slug}-menu-principal`}
            fgColor={fgColor}
            primaryColor={primaryColor}
            logoUrl={showLogo ? menu.logo : undefined}
            businessName={menu.name}
            lang={lang}
          />
        </div>

        {/* Printable Table Tent Live Mockup Preview */}
        <div className="md:col-span-2 rounded-3xl bg-neutral-900 text-white p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-md">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-extrabold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A6 & A4 (6/page) Prêts à imprimer</span>
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white">
              Chevalets de table avec numéro automatique
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Chaque client qui scanne le QR de sa table (ex:{' '}
              <code className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
                /m/{menu.slug}?t=5
              </code>
              ) a le mode <strong>Sur place — Table 5</strong> pré-rempli et
              verrouillé automatiquement dans son panier et sur WhatsApp.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to={`/m/${menu.slug}?t=5`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold text-white shadow-xs"
                style={{ backgroundColor: primaryColor }}
              >
                <span>Tester Table 5 (/m/{menu.slug}?t=5)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Mini A6 Tent Visual */}
          <div className="w-40 rounded-2xl bg-white text-neutral-900 overflow-hidden shadow-xl border border-white/20 shrink-0 text-center">
            <div
              className="py-1.5 px-2 text-[10px] font-extrabold text-white truncate"
              style={{ backgroundColor: primaryColor }}
            >
              {menu.name}
            </div>
            <div className="p-3 space-y-1.5">
              <div className="inline-block px-3 py-0.5 rounded-md bg-neutral-900 text-white text-xs font-extrabold">
                TABLE 5
              </div>
              <p className="text-[9px] font-bold text-neutral-700">
                Scannez pour commander
              </p>
              <div className="w-20 h-20 mx-auto rounded-lg border border-neutral-200 flex items-center justify-center bg-neutral-50">
                <QrCode className="w-12 h-12" style={{ color: fgColor }} />
              </div>
              <p className="text-[8px] text-neutral-400">Menu by My Menu</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automatic Per-Table QR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tableLabels.map((label) => {
          const tableUrl = `${mainMenuUrl}?t=${encodeURIComponent(label)}`;
          const slugified = sanitizeFileSlug(label) || label;
          return (
            <SingleQrPreviewCard
              key={label}
              title={`${txt.tablePrefix} ${label}`}
              badgeText={`#${label}`}
              targetUrl={tableUrl}
              testPath={`/m/${menu.slug}?t=${encodeURIComponent(label)}`}
              fileBaseName={`table-${slugified}`}
              fgColor={fgColor}
              primaryColor={primaryColor}
              logoUrl={showLogo ? menu.logo : undefined}
              businessName={menu.name}
              lang={lang}
            />
          );
        })}
      </div>
    </div>
  );
};
