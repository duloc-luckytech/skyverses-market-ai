
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileImage, FileText, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Slide } from '../../hooks/useSlideStudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
}

type ExportFormat = 'pptx' | 'pdf' | 'png';

const SlideExportModal: React.FC<Props> = ({ isOpen, onClose, slides }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pptx');
  const [isExporting, setIsExporting] = useState(false);
  const [done, setDone] = useState(false);

  const formats = [
    {
      id: 'pptx' as const,
      label: 'PowerPoint',
      ext: '.pptx',
      desc: 'Mở được trong PowerPoint, Google Slides',
      icon: FileText,
      color: 'text-orange-500',
    },
    {
      id: 'pdf' as const,
      label: 'PDF',
      ext: '.pdf',
      desc: 'File PDF in ấn chất lượng cao',
      icon: FileImage,
      color: 'text-red-500',
    },
    {
      id: 'png' as const,
      label: 'PNG (zip)',
      ext: '.zip',
      desc: 'Từng slide riêng thành file PNG',
      icon: ImageIcon,
      color: 'text-green-500',
    },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (selectedFormat === 'pptx') {
        await exportPPTX(slides);
      } else if (selectedFormat === 'pdf') {
        await exportPDF(slides);
      } else {
        await exportPNG(slides);
      }
      setDone(true);
      setTimeout(() => { setDone(false); onClose(); }, 1800);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Download size={16} className="text-brand-blue" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Xuất Slide</h3>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.05]">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            {/* Format picker */}
            <div className="px-5 py-4 space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-white/30 mb-3">Chọn định dạng</p>
              {formats.map(fmt => {
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${selectedFormat === fmt.id
                        ? 'border-brand-blue bg-brand-blue/[0.06]'
                        : 'border-black/[0.06] dark:border-white/[0.06] hover:border-brand-blue/30'
                      }`}
                  >
                    <Icon size={20} className={fmt.color} />
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-slate-700 dark:text-white/80">{fmt.label} <span className="text-slate-400 font-normal">{fmt.ext}</span></p>
                      <p className="text-[10px] text-slate-400 dark:text-white/30">{fmt.desc}</p>
                    </div>
                    {selectedFormat === fmt.id && <CheckCircle2 size={14} className="text-brand-blue shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-slate-600 dark:text-white/60 hover:bg-black/[0.03] transition-colors"
              >
                Huỷ
              </button>
              <motion.button
                onClick={handleExport}
                disabled={isExporting || done}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-blue text-white text-[12px] font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90 transition-all disabled:opacity-60"
              >
                {done
                  ? <><CheckCircle2 size={13} /> Xong!</>
                  : isExporting
                    ? <><Loader2 size={13} className="animate-spin" /> Đang xuất...</>
                    : <><Download size={13} /> Xuất {slides.length} slides</>
                }
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Export functions ─────────────────────────────────────────────────────────

async function exportPPTX(slides: Slide[]) {
  // Dynamic import to keep bundle size small
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE'; // 16:9

  for (const slide of slides) {
    const pSlide = pptx.addSlide();

    // Background image
    if (slide.bgImageUrl) {
      pSlide.addImage({ path: slide.bgImageUrl, x: 0, y: 0, w: '100%', h: '100%' });
    } else {
      pSlide.background = { color: '1e1e2e' };
    }

    // Overlay (simulated with semi-transparent box)
    pSlide.addShape('rect', {
      x: 0, y: 0, w: '100%', h: '100%',
      fill: { color: slide.textColor === 'light' ? '000000' : 'ffffff', transparency: 60 },
      line: { color: 'transparent' },
    });

    const textColor = slide.textColor === 'light' ? 'FFFFFF' : '1a1a2e';

    // Title
    pSlide.addText(slide.title || '', {
      x: '8%', y: '30%', w: '84%', h: '20%',
      fontSize: 32,
      bold: true,
      color: textColor,
      align: slide.layout === 'title-center' ? 'center' : 'left',
      shadow: { type: 'outer', blur: 4, offset: 2, angle: 45, color: '000000', opacity: 0.4 },
    });

    // Body
    if (slide.body) {
      pSlide.addText(slide.body, {
        x: '8%', y: '55%', w: '84%', h: '35%',
        fontSize: 14,
        color: textColor,
        align: slide.layout === 'title-center' ? 'center' : 'left',
        valign: 'top',
      });
    }
  }

  await pptx.writeFile({ fileName: 'skyverses-presentation.pptx' });
}

async function exportPDF(slides: Slide[]) {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const W = 297, H = 210;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (i > 0) pdf.addPage();

    if (slide.bgImageUrl) {
      pdf.addImage(slide.bgImageUrl, 'JPEG', 0, 0, W, H);
    } else {
      pdf.setFillColor(30, 30, 46);
      pdf.rect(0, 0, W, H, 'F');
    }

    // Overlay
    pdf.setFillColor(0, 0, 0);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.4 }));
    pdf.rect(0, 0, W, H, 'F');
    pdf.setGState(new (pdf as any).GState({ opacity: 1 }));

    const color = slide.textColor === 'light' ? [255, 255, 255] : [26, 26, 46];
    pdf.setTextColor(...(color as [number, number, number]));

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(slide.title || '', W / 2, H * 0.42, { align: 'center', maxWidth: W * 0.84 });

    if (slide.body) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(slide.body.replace(/•\s*/g, '• '), W / 2, H * 0.58, { align: 'center', maxWidth: W * 0.76 });
    }
  }

  pdf.save('skyverses-presentation.pdf');
}

async function exportPNG(slides: Slide[]) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = zip.folder('slides');

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d')!;

    // Background
    if (slide.bgImageUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { ctx.drawImage(img, 0, 0, 1280, 720); resolve(); };
        img.onerror = () => { ctx.fillStyle = '#1e1e2e'; ctx.fillRect(0, 0, 1280, 720); resolve(); };
        img.src = slide.bgImageUrl!;
      });
    } else {
      ctx.fillStyle = '#1e1e2e';
      ctx.fillRect(0, 0, 1280, 720);
    }

    // Overlay
    ctx.fillStyle = slide.textColor === 'light' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)';
    ctx.fillRect(0, 0, 1280, 720);

    // Title
    ctx.fillStyle = slide.textColor === 'light' ? '#ffffff' : '#1a1a2e';
    ctx.font = 'bold 52px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(slide.title || '', 640, 280, 1000);

    // Body
    if (slide.body) {
      ctx.font = '24px Arial';
      const lines = slide.body.split('\n').slice(0, 5);
      lines.forEach((line, idx) => {
        ctx.fillText(line, 640, 380 + idx * 36, 900);
      });
    }

    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    folder?.file(`slide-${String(i + 1).padStart(2, '0')}.png`, base64, { base64: true });
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'skyverses-slides.zip';
  a.click();
  URL.revokeObjectURL(url);
}

export default SlideExportModal;
