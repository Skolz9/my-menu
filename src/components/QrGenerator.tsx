import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import {
  Download,
  FileCode,
  FileText,
  FolderArchive,
  AlertTriangle,
  Printer,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { config } from '../config';
import { allMenus, getLocalized, type ClientMenu } from '../menus';
import { BrandLogo } from './BrandLogo';
import { SeoHead } from './SeoHead';

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

function loadCrossOriginImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function renderQrToCanvas(options: {
  canvas: HTMLCanvasElement;
  text: string;
  size: number;
  fgColor: string;
  bgColor: string;
  ecl: ErrorCorrectionLevel;
  includeLogo: boolean;
  logoUrl?: string;
  brandInitial?: string;
}): Promise<string> {
  const {
    canvas,
    text,
    size,
    fgColor,
    bgColor,
    ecl,
    includeLogo,
    logoUrl,
    brandInitial = 'M',
  } = options;

  await QRCode.toCanvas(canvas, text || config.baseUrl, {
    width: size,
    margin: 2,
    color: {
      dark: fgColor,
      light: bgColor,
    },
    errorCorrectionLevel: includeLogo ? 'H' : ecl,
  });

  if (includeLogo) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const boxSize = Math.round(size * 0.22);
      const boxX = Math.round((size - boxSize) / 2);
      const boxY = Math.round((size - boxSize) / 2);
      const radius = Math.round(boxSize * 0.22);

      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      // White outer cushion
      ctx.save();
      drawRoundedRect(boxX - 4, boxY - 4, boxSize + 8, boxSize + 8, radius + 3);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.restore();

      let drewImage = false;
      if (logoUrl) {
        const img = await loadCrossOriginImage(logoUrl);
        if (img) {
          try {
            ctx.save();
            drawRoundedRect(boxX, boxY, boxSize, boxSize, radius);
            ctx.clip();
            ctx.drawImage(img, boxX, boxY, boxSize, boxSize);
            ctx.restore();
            // Verify canvas is not tainted
            canvas.toDataURL('image/png');
            drewImage = true;
          } catch {
            drewImage = false;
          }
        }
      }

      if (!drewImage) {
        ctx.save();
        drawRoundedRect(boxX, boxY, boxSize, boxSize, radius);
        ctx.fillStyle = fgColor;
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(boxSize * 0.5)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(brandInitial.slice(0, 1).toUpperCase(), size / 2, size / 2 + 2);
        ctx.restore();
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export const QrGenerator: React.FC = () => {
  const defaultMenu = allMenus[0];

  const [selectedSlug, setSelectedSlug] = useState<string>(defaultMenu?.slug || 'custom');
  const [targetUrl, setTargetUrl] = useState<string>(
    defaultMenu ? `${config.baseUrl}/m/${defaultMenu.slug}` : config.baseUrl
  );
  const [fgColor, setFgColor] = useState<string>(
    defaultMenu?.colors.primary || config.colors.primary
  );
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [logoUrl, setLogoUrl] = useState<string>(defaultMenu?.logo || '');
  const [size, setSize] = useState<number>(512);
  const [ecl, setEcl] = useState<ErrorCorrectionLevel>('H');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [zipLoading, setZipLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const selectedMenu: ClientMenu | undefined = allMenus.find((m) => m.slug === selectedSlug);
  const displayName = selectedMenu ? selectedMenu.name : config.brandName;
  const displayCity = selectedMenu ? selectedMenu.city : 'Maroc';
  const displayTagline = selectedMenu
    ? getLocalized(selectedMenu.tagline, 'fr')
    : 'Scannez pour découvrir notre carte digitale';

  const handleSelectMenuChange = (slugOrCustom: string) => {
    setSelectedSlug(slugOrCustom);
    if (slugOrCustom === 'custom') {
      return;
    }
    const found = allMenus.find((m) => m.slug === slugOrCustom);
    if (found) {
      setTargetUrl(`${config.baseUrl}/m/${found.slug}`);
      setFgColor(found.colors.primary);
      setLogoUrl(found.logo);
      if (includeLogo) {
        setEcl('H');
      }
    }
  };

  useEffect(() => {
    let active = true;
    const generate = async () => {
      if (!canvasRef.current) return;
      try {
        const dataUrl = await renderQrToCanvas({
          canvas: canvasRef.current,
          text: targetUrl,
          size,
          fgColor,
          bgColor,
          ecl: includeLogo ? 'H' : ecl,
          includeLogo,
          logoUrl,
          brandInitial: displayName.charAt(0),
        });
        if (active) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('QR generation failed:', err);
      }
    };
    generate();
    return () => {
      active = false;
    };
  }, [targetUrl, size, fgColor, bgColor, ecl, includeLogo, logoUrl, displayName]);

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    const filename = selectedMenu ? `qr-${selectedMenu.slug}.png` : 'qr-custom.png';
    link.download = filename;
    link.href = qrDataUrl;
    link.click();
    showToast(`Downloaded ${filename}`);
  };

  const handleDownloadSvg = async () => {
    try {
      let svgString = await QRCode.toString(targetUrl || config.baseUrl, {
        type: 'svg',
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: includeLogo ? 'H' : ecl,
      });

      if (includeLogo) {
        const centerOverlay = `
          <g transform="translate(${size * 0.39}, ${size * 0.39})">
            <rect x="-4" y="-4" width="${size * 0.22 + 8}" height="${size * 0.22 + 8}" rx="16" fill="${bgColor}" />
            <rect x="0" y="0" width="${size * 0.22}" height="${size * 0.22}" rx="14" fill="${fgColor}" />
            <text x="${size * 0.11}" y="${size * 0.135}" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="${Math.round(size * 0.11)}">${displayName.charAt(0).toUpperCase()}</text>
          </g>
        </svg>`;
        svgString = svgString.replace('</svg>', centerOverlay);
      }

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = selectedMenu ? `qr-${selectedMenu.slug}.svg` : 'qr-custom.svg';
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded ${filename}`);
    } catch (err) {
      console.error('SVG export error:', err);
    }
  };

  const handleDownloadA5Pdf = () => {
    if (!qrDataUrl) return;
    // A5 portrait: 148mm x 210mm
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a5',
    });

    const pageW = 148;
    const pageH = 210;

    // Background
    doc.setFillColor('#FFFFFF');
    doc.rect(0, 0, pageW, pageH, 'F');

    // Top Accent Header Bar
    doc.setFillColor(fgColor);
    doc.rect(0, 0, pageW, 18, 'F');

    // Outer Border Frame
    doc.setDrawColor(fgColor);
    doc.setLineWidth(0.8);
    doc.roundedRect(8, 12, pageW - 16, pageH - 20, 6, 6, 'S');

    // Header Badge Circle
    doc.setFillColor('#FFFFFF');
    doc.circle(pageW / 2, 24, 11, 'F');
    doc.setFillColor(fgColor);
    doc.circle(pageW / 2, 24, 9.5, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(displayName.charAt(0).toUpperCase(), pageW / 2, 26, { align: 'center' });

    // Restaurant Name & City
    doc.setTextColor('#111827');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(displayName, pageW / 2, 46, { align: 'center' });

    doc.setTextColor('#6B7280');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(displayCity.toUpperCase(), pageW / 2, 53, { align: 'center' });

    // QR Code Frame
    const qrSizeMm = 76;
    const qrX = (pageW - qrSizeMm) / 2;
    const qrY = 62;

    doc.setDrawColor('#E5E7EB');
    doc.setLineWidth(0.5);
    doc.roundedRect(qrX - 4, qrY - 4, qrSizeMm + 8, qrSizeMm + 8, 5, 5, 'S');
    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSizeMm, qrSizeMm);

    // Call to action pill in FR / EN + Arabic transliteration/label
    doc.setFillColor(fgColor);
    doc.roundedRect(24, 148, pageW - 48, 12, 4, 4, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('SCANNEZ POUR VOIR LE MENU', pageW / 2, 155.5, { align: 'center' });

    doc.setTextColor('#111827');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Scan to view the digital menu', pageW / 2, 168, { align: 'center' });

    doc.setTextColor('#4B5563');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text('AR / FR / EN • Sans application • Wi-Fi & 4G', pageW / 2, 176, {
      align: 'center',
    });

    // URL & Footer
    doc.setTextColor('#9CA3AF');
    doc.setFontSize(8);
    doc.text(targetUrl, pageW / 2, 190, { align: 'center' });
    doc.text(`Menu by ${config.brandName}`, pageW / 2, 196, { align: 'center' });

    const filename = selectedMenu
      ? `chevalet-a5-${selectedMenu.slug}.pdf`
      : 'chevalet-a5-menu.pdf';
    doc.save(filename);
    showToast(`Downloaded A5 PDF (${filename})`);
  };

  const handlePrintA5 = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadAllZip = async () => {
    setZipLoading(true);
    try {
      const zip = new JSZip();
      const offscreenCanvas = document.createElement('canvas');

      for (const menu of allMenus) {
        const menuUrl = `${config.baseUrl}/m/${menu.slug}`;
        const dataUrl = await renderQrToCanvas({
          canvas: offscreenCanvas,
          text: menuUrl,
          size: 600,
          fgColor: menu.colors.primary || config.colors.primary,
          bgColor: '#FFFFFF',
          ecl: 'H',
          includeLogo: true,
          logoUrl: menu.logo,
          brandInitial: menu.name.charAt(0),
        });
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(`qr-${menu.slug}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.download = 'mymenu-qr-codes.zip';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${allMenus.length} menu QR code(s) as ZIP!`);
    } catch (err) {
      console.error('Failed to build ZIP:', err);
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <div dir="ltr" className="min-h-screen bg-neutral-100 text-neutral-900 pb-16">
      <SeoHead pathname="/admin/qr" lang="fr" />

      {/* Top Admin Header (hidden when printing A5 stand) */}
      <header className="bg-white border-b border-neutral-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <BrandLogo />
            </Link>
            <span className="text-xs font-bold text-neutral-500 border-l border-neutral-200 pl-4">
              QR Code Studio (Private Tool • noindex)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadAllZip}
              disabled={zipLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: config.colors.primary }}
            >
              <FolderArchive className="w-4 h-4" />
              <span>
                {zipLoading
                  ? 'Generating ZIP...'
                  : `Download all QR codes (${allMenus.length})`}
              </span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Site</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Mandatory Domain Warning Banner */}
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-300/90 px-4 py-3.5 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              Use the final domain before printing QR codes.{' '}
              <span className="font-normal text-amber-800">
                (Current baseUrl in <code className="font-mono">src/config.ts</code>:{' '}
                <strong className="font-mono">{config.baseUrl}</strong>)
              </span>
            </p>
          </div>
          {statusMessage && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold">
              <Check className="w-3.5 h-3.5" />
              <span>{statusMessage}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls (Hidden during browser print) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-neutral-200/90 p-6 space-y-5 shadow-xs print:hidden">
            <h1 className="text-lg font-extrabold text-neutral-950">
              QR Code & A5 Table Stand Generator
            </h1>

            {/* 1. Client Menu Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                1. Client Menu (`src/menus/*.ts`)
              </label>
              <select
                value={selectedSlug}
                onChange={(e) => handleSelectMenuChange(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-neutral-900 focus:outline-none focus:border-[#6BBF3A]"
              >
                {allMenus.map((m) => (
                  <option key={m.slug} value={m.slug}>
                    {m.name} ({m.city}) — /m/{m.slug}
                  </option>
                ))}
                <option value="custom">Custom URL...</option>
              </select>
            </div>

            {/* 2. Target URL (Editable) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700">
                2. Target URL (Editable)
              </label>
              <input
                type="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm font-mono text-neutral-900 focus:outline-none focus:border-[#6BBF3A]"
                placeholder="https://mymenu.ma/m/demo"
              />
            </div>

            {/* 3. Foreground & Background Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  QR Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-neutral-300 cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* 4. Centered Logo Toggle */}
            <div className="space-y-2 pt-1 border-t border-neutral-100">
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-xs font-bold text-neutral-800">
                  Include centered client logo (forces Error Correction H)
                </span>
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIncludeLogo(checked);
                    if (checked) setEcl('H');
                  }}
                  className="w-4 h-4 accent-[#6BBF3A] rounded cursor-pointer"
                />
              </label>

              {includeLogo && (
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Logo image URL"
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-700 focus:outline-none focus:bg-white"
                />
              )}
            </div>

            {/* 5. Size & Error Correction Level */}
            <div className="grid grid-cols-2 gap-4 pt-1 border-t border-neutral-100">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Resolution (px)
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold"
                >
                  <option value={256}>256 × 256 px</option>
                  <option value={512}>512 × 512 px</option>
                  <option value={768}>768 × 768 px</option>
                  <option value={1024}>1024 × 1024 px</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  Error Correction
                </label>
                <select
                  value={includeLogo ? 'H' : ecl}
                  disabled={includeLogo}
                  onChange={(e) => setEcl(e.target.value as ErrorCorrectionLevel)}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-bold disabled:bg-neutral-100 disabled:text-neutral-500"
                >
                  <option value="L">L (Low ~7%)</option>
                  <option value="M">M (Medium ~15%)</option>
                  <option value="Q">Q (Quartile ~25%)</option>
                  <option value="H">H (High ~30% — Logo Safe)</option>
                </select>
              </div>
            </div>

            {/* 6. Export / Download Action Buttons */}
            <div className="pt-3 border-t border-neutral-200 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
                  style={{ backgroundColor: config.colors.primary }}
                >
                  <Download className="w-4 h-4" />
                  <span>Download PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4" />
                  <span>Download SVG</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadA5Pdf}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download A5 PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintA5}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-neutral-800 border border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print A5 Sheet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable A5 Table-Stand Sheet Preview */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Hidden master canvas used for QR rendering */}
            <canvas ref={canvasRef} className="hidden" />

            <div className="w-full max-w-[420px] bg-white rounded-[28px] shadow-xl overflow-hidden border-2 border-neutral-200 print:shadow-none print:border print:max-w-full">
              {/* Top Color Accent Header */}
              <div
                className="h-5 w-full"
                style={{ backgroundColor: fgColor }}
              />

              <div className="p-7 sm:p-9 text-center space-y-5">
                {/* Client Logo & Restaurant Title */}
                <div className="flex flex-col items-center space-y-2.5">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-neutral-200 shadow-xs bg-neutral-100"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold"
                      style={{ backgroundColor: fgColor }}
                    >
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-extrabold text-neutral-950 tracking-tight">
                      {displayName}
                    </h2>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      {displayCity}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto line-clamp-1">
                      {displayTagline}
                    </p>
                  </div>
                </div>

                {/* Live QR Code Image */}
                <div className="inline-block p-3.5 rounded-3xl border-2 border-neutral-200/90 bg-white shadow-xs">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Generated Menu QR Code"
                      className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-xs text-neutral-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                {/* Trilingual Scan Call-to-Action (AR / FR / EN) */}
                <div className="space-y-2 pt-1">
                  <div
                    className="py-2.5 px-5 rounded-2xl text-white font-extrabold text-base shadow-xs"
                    style={{ backgroundColor: fgColor }}
                    dir="rtl"
                  >
                    امسح الرمز لعرض المنيو
                  </div>
                  <p className="text-sm font-extrabold text-neutral-900">
                    Scannez pour voir le menu
                  </p>
                  <p className="text-xs font-semibold text-neutral-500">
                    Scan to view the menu
                  </p>
                </div>

                {/* Bottom Branding */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-[11px] font-bold text-neutral-400">
                  <span>AR • FR • EN</span>
                  <span className="font-mono truncate max-w-[180px]">{targetUrl}</span>
                  <span>Menu by {config.brandName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
