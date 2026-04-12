/**
 * ExportTab.tsx — Phase 6: Export Hub (nâng cấp toàn diện)
 *
 * 6 export modes:
 *  1. Overview       — danh sách cảnh & tải xuống (giữ lại)
 *  2. PDF Storyboard — grid layout đẹp dùng native print CSS
 *  3. EDL Export     — CMX 3600 Edit Decision List
 *  4. XML / FCPXML   — Premiere Pro · DaVinci · Final Cut Pro
 *  5. Animatic       — Canvas slideshow preview theo duration
 *  6. Share Link     — Public / Private share link UI
 *
 * No external libraries — native Canvas, Blob, URL.createObjectURL
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, FileJson, Upload, Film, Image as ImageIcon, Music,
  Play, CheckCircle, AlertCircle, Clock, Sparkles, FolderOpen,
  Plus, RefreshCw, FileText, Code2, Share2,
  Copy, Check, Link2, Loader2, Clapperboard, MonitorPlay,
  Lock, Globe, Crown, Zap,
  Pause, SkipBack, SkipForward,
  FileVideo, Printer, Layers,
} from 'lucide-react';
import type { Scene, ReferenceAsset } from '../../hooks/useStoryboardStudio';
import { SHOT_TYPE_LABELS } from '../../hooks/useStoryboardStudio';
import { useAuth } from '../../context/AuthContext';
import { UpgradeModal } from '../UpgradeModal';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExportTabProps {
  scenes: Scene[];
  assets: ReferenceAsset[];
  script: string;
  settings: any;
  totalDuration: number;
  onExportJSON: () => void;
  onImportJSON: (file: File) => void;
  onNewProject: () => void;
  onViewScene: (scene: Scene) => void;
  isProcessing: boolean;
}

type ExportMode = 'overview' | 'pdf' | 'edl' | 'xml' | 'animatic' | 'video' | 'share';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');

/** Seconds → SMPTE timecode HH:MM:SS:FF (24fps) */
const toTimecode = (seconds: number, fps = 24): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const f = Math.floor((seconds % 1) * fps);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}:${pad2(f)}`;
};

const completedScenes = (scenes: Scene[]) =>
  scenes.filter(s => s.status === 'done' || s.videoUrl || s.visualUrl);

const escapeXML = (s: string) =>
  s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c] ?? c));

// ─── Status icon ──────────────────────────────────────────────────────────────

const StatusIcon: React.FC<{ status: Scene['status'] }> = ({ status }) => {
  switch (status) {
    case 'done':       return <CheckCircle size={13} className="text-emerald-400" />;
    case 'generating': return <RefreshCw   size={13} className="text-brand-blue animate-spin" />;
    case 'error':      return <AlertCircle size={13} className="text-rose-400" />;
    default:           return <Clock       size={13} className="text-slate-300 dark:text-white/20" />;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT GENERATORS
// ─────────────────────────────────────────────────────────────────────────────

const generateEDL = (scenes: Scene[], projectName = 'Storyboard'): string => {
  const lines: string[] = [
    `TITLE: ${projectName.toUpperCase()}`,
    'FCM: NON-DROP FRAME',
    '',
  ];
  let timelinePos = 0;
  scenes.forEach((scene, i) => {
    const dur    = scene.duration ?? 8;
    const srcIn  = toTimecode(0);
    const srcOut = toTimecode(dur);
    const recIn  = toTimecode(timelinePos);
    const recOut = toTimecode(timelinePos + dur);
    lines.push(`${String(i + 1).padStart(3, '0')}  AX       AA/V  C        ${srcIn} ${srcOut} ${recIn} ${recOut}`);
    lines.push(`* FROM CLIP NAME: Scene_${String(scene.order).padStart(2, '0')}`);
    lines.push(`* COMMENT: ${scene.prompt.slice(0, 60).replace(/\n/g, ' ')}`);
    lines.push('');
    timelinePos += dur;
  });
  return lines.join('\n');
};

const generatePremierXML = (scenes: Scene[], projectName = 'Storyboard'): string => {
  const fps = 24;
  const clipItems = scenes.map((scene, i) => {
    const dur        = (scene.duration ?? 8) * fps;
    const startFrame = scenes.slice(0, i).reduce((a, s) => a + (s.duration ?? 8) * fps, 0);
    return `
    <clipitem id="clipitem-${i + 1}">
      <name>Scene ${String(scene.order).padStart(2, '0')}</name>
      <start>${startFrame}</start>
      <end>${startFrame + dur}</end>
      <in>0</in>
      <out>${dur}</out>
      <comments><comment>${escapeXML(scene.prompt.slice(0, 80))}</comment></comments>
      ${scene.visualUrl || scene.videoUrl ? `<file><pathurl>${escapeXML(scene.visualUrl ?? scene.videoUrl ?? '')}</pathurl></file>` : ''}
    </clipitem>`;
  }).join('');
  const totalFrames = scenes.reduce((a, s) => a + (s.duration ?? 8) * fps, 0);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence>
    <name>${escapeXML(projectName)}</name>
    <duration>${totalFrames}</duration>
    <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
    <media><video><track>${clipItems}</track></video></media>
  </sequence>
</xmeml>`;
};

const generateFCPXML = (scenes: Scene[], projectName = 'Storyboard'): string => {
  const assetElements = scenes.map((scene, i) =>
    `  <asset id="r${i + 2}" name="Scene_${String(scene.order).padStart(2, '0')}" start="0s" duration="${scene.duration ?? 8}s" hasVideo="1" hasAudio="0"/>`
  ).join('\n');
  let offset = 0;
  const clips = scenes.map((scene, i) => {
    const dur = scene.duration ?? 8;
    const xml = `    <asset-clip ref="r${i + 2}" offset="${offset}s" name="Scene ${String(scene.order).padStart(2, '0')}" duration="${dur}s" start="0s">
      <note>${escapeXML(scene.prompt.slice(0, 80))}</note>
    </asset-clip>`;
    offset += dur;
    return xml;
  }).join('\n');
  const totalDur = scenes.reduce((a, s) => a + (s.duration ?? 8), 0);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.9">
  <resources>
    <format id="r1" name="FFVideoFormat24p" frameDuration="1/24s" width="1920" height="1080"/>
${assetElements}
  </resources>
  <library>
    <event name="${escapeXML(projectName)}">
      <project name="${escapeXML(projectName)}">
        <sequence format="r1" duration="${totalDur}s" tcStart="0s" tcFormat="NDF" audioLayout="stereo">
          <spine>
${clips}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
};

const downloadText = (content: string, filename: string, mime = 'text/plain') => {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF STORYBOARD (print-to-PDF via native browser)
// ─────────────────────────────────────────────────────────────────────────────

const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress]         = useState(0);

  const generatePDF = useCallback(async (
    scenes: Scene[], projectName: string, script: string, settings: any,
  ) => {
    setIsGenerating(true);
    setProgress(10);
    try {
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (!printWindow) { alert('Vui lòng cho phép popup để tạo PDF.'); return; }

      const cols = 3;
      const rows: string[] = [];
      for (let i = 0; i < scenes.length; i += cols) {
        const rowScenes = scenes.slice(i, i + cols);
        const cells = rowScenes.map(scene => {
          const shot = SHOT_TYPE_LABELS[scene.shotType ?? 'WIDE'];
          const img  = scene.visualUrl
            ? `<img src="${scene.visualUrl}" style="width:100%;height:130px;object-fit:cover;display:block;" />`
            : `<div style="width:100%;height:130px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:11px;">No image</div>`;
          return `<td style="width:33%;padding:5px;vertical-align:top;">
            <div style="border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;page-break-inside:avoid;">
              ${img}
              <div style="padding:7px 9px;">
                <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
                  <b style="font-size:10px;color:#222;">SC.${String(scene.order).padStart(2,'0')}</b>
                  <span style="font-size:8px;background:#e8f0fe;color:#4285f4;padding:1px 5px;border-radius:3px;font-weight:700;">${shot}</span>
                  <span style="font-size:8px;color:#999;margin-left:auto;">${scene.duration ?? 8}s</span>
                </div>
                <p style="font-size:9px;color:#666;margin:0;line-height:1.5;overflow:hidden;max-height:48px;">${escapeXML(scene.prompt.slice(0, 110))}</p>
              </div>
            </div>
          </td>`;
        });
        while (cells.length < cols) cells.push('<td style="width:33%;padding:5px;"></td>');
        rows.push(`<tr>${cells.join('')}</tr>`);
        setProgress(10 + Math.round(((i + cols) / scenes.length) * 80));
      }

      const html = `<!DOCTYPE html><html><head>
        <meta charset="UTF-8"/>
        <title>${escapeXML(projectName)} — Storyboard</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;padding:20px}
          @page{size:A4 landscape;margin:12mm}
          @media print{.no-print{display:none!important}}
          .cover{margin-bottom:18px;padding-bottom:12px;border-bottom:2.5px solid #111}
          .cover h1{font-size:26px;font-weight:900;text-transform:uppercase;letter-spacing:-1px}
          .cover p{font-size:11px;color:#888;margin-top:3px}
          .script{background:#f7f7f7;border-left:3px solid #4285f4;padding:8px 12px;margin-bottom:16px;font-size:10px;line-height:1.6;color:#555;overflow:hidden;max-height:64px}
          table{width:100%;border-collapse:collapse}
          .btn{position:fixed;top:14px;right:14px;background:#111;color:#fff;border:none;padding:9px 18px;border-radius:7px;font-size:12px;font-weight:800;cursor:pointer;z-index:999;letter-spacing:0.5px}
          .btn:hover{background:#333}
        </style>
      </head><body>
        <button class="btn no-print" onclick="window.print()">🖨️ In / Lưu PDF</button>
        <div class="cover">
          <h1>${escapeXML(projectName)}</h1>
          <p>${scenes.length} phân cảnh · ${scenes.reduce((a,s) => a + (s.duration ?? 8), 0)}s · ${settings?.format || 'Storyboard'} · ${new Date().toLocaleDateString('vi-VN')}</p>
        </div>
        ${script ? `<div class="script"><b>Kịch bản:</b> ${escapeXML(script.slice(0, 280))}${script.length > 280 ? '…' : ''}</div>` : ''}
        <table>${rows.join('')}</table>
      </body></html>`;

      printWindow.document.write(html);
      printWindow.document.close();
      setProgress(100);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1500);
    }
  }, []);

  return { generatePDF, isGenerating, progress };
};

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATIC PREVIEW (Canvas-based slideshow)
// ─────────────────────────────────────────────────────────────────────────────

const AnimaticPreview: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const imgCache   = useRef<Map<string, HTMLImageElement>>(new Map());
  const rafRef     = useRef<number>(0);
  const startRef   = useRef<number>(0);

  const [isPlaying, setIsPlaying]   = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsed, setElapsed]       = useState(0);

  const withImages = scenes.filter(s => s.visualUrl);
  const totalDur   = withImages.reduce((a, s) => a + (s.duration ?? 8), 0);

  useEffect(() => {
    withImages.forEach(scene => {
      if (!scene.visualUrl || imgCache.current.has(scene.visualUrl)) return;
      const img       = new Image();
      img.crossOrigin = 'anonymous';
      img.src         = scene.visualUrl!;
      imgCache.current.set(scene.visualUrl!, img);
    });
  }, [withImages]);

  const drawFrame = useCallback((scene: Scene) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = scene.visualUrl ? imgCache.current.get(scene.visualUrl) : null;
    if (img?.complete && img.naturalWidth > 0) {
      const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    } else {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px -apple-system,sans-serif';
    ctx.fillText(`SC.${String(scene.order).padStart(2,'0')} · ${SHOT_TYPE_LABELS[scene.shotType ?? 'WIDE']} · ${scene.duration ?? 8}s`, 12, canvas.height - 30);
    ctx.font = '9px -apple-system,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText(scene.prompt.slice(0, 90), 12, canvas.height - 13);
  }, []);

  useEffect(() => {
    if (!isPlaying || withImages.length === 0) return;
    startRef.current = performance.now() - elapsed * 1000;
    const tick = (now: number) => {
      const t = (now - startRef.current) / 1000;
      setElapsed(t);
      let acc = 0, idx = 0;
      for (let i = 0; i < withImages.length; i++) {
        acc += withImages[i].duration ?? 8;
        if (t < acc) { idx = i; break; }
        if (i === withImages.length - 1) idx = i;
      }
      setCurrentIdx(idx);
      drawFrame(withImages[idx]);
      if (t >= totalDur) {
        setIsPlaying(false); setElapsed(0); setCurrentIdx(0);
        drawFrame(withImages[0]); return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  useEffect(() => {
    if (withImages.length > 0) drawFrame(withImages[0]);
  }, [withImages, drawFrame]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    setElapsed(t);
    let acc = 0, idx = 0;
    for (let i = 0; i < withImages.length; i++) {
      acc += withImages[i].duration ?? 8;
      if (t < acc) { idx = i; break; }
    }
    setCurrentIdx(idx);
    drawFrame(withImages[idx]);
  };

  const fmt = (s: number) => `${Math.floor(s)}s`;

  if (withImages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <MonitorPlay size={36} className="text-slate-200 dark:text-white/10" />
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
          Cần ít nhất 1 cảnh có hình ảnh
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/8 bg-black aspect-video relative">
        <canvas ref={canvasRef} width={960} height={540} className="w-full h-full" />
        {!isPlaying && elapsed === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => setIsPlaying(true)}
              className="w-16 h-16 rounded-full bg-brand-blue/90 backdrop-blur-sm text-white flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-brand-blue/40"
            >
              <Play size={26} className="ml-1" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input type="range" min={0} max={totalDur} step={0.1}
          value={Math.min(elapsed, totalDur)}
          onChange={handleSeek}
          className="w-full accent-brand-blue h-1.5 rounded-full cursor-pointer"
        />
        <div className="flex items-center gap-3">
          <button onClick={() => { setElapsed(0); setCurrentIdx(0); drawFrame(withImages[0]); setIsPlaying(false); }}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-400 dark:text-white/30 hover:text-brand-blue hover:border-brand-blue/30 transition-all">
            <SkipBack size={12} />
          </button>
          <button onClick={() => { if (elapsed >= totalDur) setElapsed(0); setIsPlaying(v => !v); }}
            className="w-9 h-9 rounded-xl bg-brand-blue text-white flex items-center justify-center hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-blue/20">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => { setElapsed(totalDur - 0.1); setIsPlaying(false); }}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/8 flex items-center justify-center text-slate-400 dark:text-white/30 hover:text-brand-blue hover:border-brand-blue/30 transition-all">
            <SkipForward size={12} />
          </button>
          <span className="tabular-nums text-[11px] text-slate-400 dark:text-white/30">
            {fmt(elapsed)} / {fmt(totalDur)}
          </span>
          <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">
            SC.{String(withImages[currentIdx]?.order ?? 1).padStart(2,'0')} · {currentIdx + 1}/{withImages.length}
          </span>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 px-4 py-3 flex items-center gap-4 text-[10px]">
        <span className="flex items-center gap-1.5 text-slate-400 dark:text-white/30"><Film size={11} /> {withImages.length} cảnh có hình</span>
        <span className="flex items-center gap-1.5 text-slate-400 dark:text-white/30"><Clock size={11} /> {fmt(totalDur)} tổng</span>
        <p className="ml-auto text-slate-300 dark:text-white/15 italic text-[9px]">Canvas 960×540 preview</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARE LINK PANEL
// ─────────────────────────────────────────────────────────────────────────────

const SharePanel: React.FC<{ projectName: string; scenes: Scene[] }> = ({ projectName, scenes }) => {
  const [visibility, setVisibility]   = useState<'private' | 'public'>('private');
  const [copied, setCopied]           = useState(false);
  const [generated, setGenerated]     = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareIdRef = useRef(Math.random().toString(36).slice(2, 10));
  const shareUrl   = `https://skyverses.ai/s/${shareIdRef.current}`;

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    setGenerated(true);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">Quyền truy cập</p>
        <div className="flex gap-2">
          {[
            { id: 'private', icon: <Lock size={12} />,  label: 'Private', desc: 'Chỉ bạn có thể xem' },
            { id: 'public',  icon: <Globe size={12} />, label: 'Public',  desc: 'Ai có link đều xem được' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setVisibility(opt.id as any)}
              className={`flex-1 flex items-center gap-2.5 p-3.5 rounded-xl border text-left transition-all ${
                visibility === opt.id
                  ? 'bg-brand-blue/10 border-brand-blue/40 text-brand-blue'
                  : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-white/40 hover:border-brand-blue/20'
              }`}
            >
              {opt.icon}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">{opt.label}</p>
                <p className="text-[9px] opacity-60 mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] p-4 space-y-2">
        {[
          { label: 'Dự án',     value: projectName },
          { label: 'Số cảnh',   value: String(scenes.length) },
          { label: 'Đã render', value: String(completedScenes(scenes).length), accent: 'text-emerald-500' },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between text-[10px]">
            <span className="font-black uppercase tracking-widest text-slate-400 dark:text-white/30">{row.label}</span>
            <span className={`font-bold ${row.accent ?? 'text-slate-600 dark:text-white/60'}`}>{row.value}</span>
          </div>
        ))}
      </div>

      {!generated ? (
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleGenerate} disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 disabled:opacity-50 transition-all">
          {isGenerating ? <><Loader2 size={14} className="animate-spin" /> Đang tạo link...</> : <><Share2 size={14} /> Tạo share link</>}
        </motion.button>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/8">
            <Link2 size={13} className="text-brand-blue shrink-0" />
            <span className="flex-1 text-[11px] text-slate-600 dark:text-white/60 truncate">{shareUrl}</span>
            <button onClick={handleCopy}
              className="shrink-0 w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center hover:bg-brand-blue hover:text-white transition-all">
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>
          </div>
          {copied && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-emerald-500 font-bold text-center">
              ✓ Đã copy link!
            </motion.p>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setGenerated(false); shareIdRef.current = Math.random().toString(36).slice(2, 10); }}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-white/8 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 hover:border-rose-400/30 hover:text-rose-400 transition-all">
              Xóa link
            </button>
            <button onClick={handleCopy}
              className="flex-1 py-2 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-md shadow-brand-blue/20">
              {copied ? '✓ Đã copy' : 'Copy link'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// VIDEO EXPORT PANEL (MediaRecorder + Canvas → WebM)
// ─────────────────────────────────────────────────────────────────────────────

const VideoExportPanel: React.FC<{ scenes: Scene[] }> = ({ scenes }) => {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imgCacheRef  = useRef<Map<string, HTMLImageElement>>(new Map());
  const recorderRef  = useRef<MediaRecorder | null>(null);
  const chunksRef    = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress]       = useState(0);   // 0-100
  const [error, setError]             = useState<string | null>(null);
  const [done, setDone]               = useState(false);

  const withImages = scenes.filter(s => s.visualUrl || s.videoUrl);

  // Detect support
  const supported = typeof MediaRecorder !== 'undefined' && (
    MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
    MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ||
    MediaRecorder.isTypeSupported('video/webm')
  );

  const mimeType = (() => {
    if (!supported) return '';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) return 'video/webm;codecs=vp9';
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) return 'video/webm;codecs=vp8';
    return 'video/webm';
  })();

  const preloadImages = async () => {
    await Promise.all(withImages.map(scene => {
      const url = scene.visualUrl;
      if (!url || imgCacheRef.current.has(url)) return Promise.resolve();
      return new Promise<void>(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { imgCacheRef.current.set(url, img); resolve(); };
        img.onerror = () => resolve();
        img.src = url;
      });
    }));
  };

  const drawScene = (scene: Scene, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const url = scene.visualUrl;
    const img = url ? imgCacheRef.current.get(url) : null;
    if (img?.complete && img.naturalWidth > 0) {
      const scale = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
    }
    // Overlay bar
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, canvas.height - 52, canvas.width, 52);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px -apple-system,sans-serif';
    ctx.fillText(`SC.${String(scene.order).padStart(2, '0')} · ${SHOT_TYPE_LABELS[scene.shotType ?? 'WIDE']} · ${scene.duration ?? 8}s`, 14, canvas.height - 30);
    ctx.font = '11px -apple-system,sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(scene.prompt.slice(0, 100), 14, canvas.height - 12);
  };

  const handleExport = async () => {
    setError(null);
    setDone(false);
    if (!supported) { setError('Trình duyệt không hỗ trợ. Vui lòng dùng Chrome hoặc Edge.'); return; }
    if (withImages.length === 0) { setError('Cần ít nhất 1 cảnh có hình ảnh.'); return; }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRecording(true);
    setProgress(2);

    try {
      await preloadImages();
      setProgress(10);

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
      recorderRef.current = recorder;
      chunksRef.current   = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };

      await new Promise<void>((resolve, reject) => {
        recorder.onstop  = () => resolve();
        recorder.onerror = (e) => reject(new Error((e as any)?.error?.message ?? 'MediaRecorder error'));
        recorder.start(100); // collect chunks every 100ms

        let sceneIdx = 0;
        let sceneElapsed = 0;
        let lastTime: number | null = null;
        const FPS = 30;
        const FRAME_MS = 1000 / FPS;
        const totalDur = withImages.reduce((a, s) => a + (s.duration ?? 8), 0);
        let globalElapsed = 0;

        const drawLoop = (ts: number) => {
          if (!lastTime) lastTime = ts;
          const dt = (ts - lastTime) / 1000;
          lastTime = ts;

          if (sceneIdx >= withImages.length) {
            recorder.stop();
            return;
          }

          const scene = withImages[sceneIdx];
          drawScene(scene, canvas);
          sceneElapsed += dt;
          globalElapsed += dt;

          setProgress(10 + Math.round((globalElapsed / totalDur) * 88));

          if (sceneElapsed >= (scene.duration ?? 8)) {
            sceneElapsed = 0;
            sceneIdx++;
          }

          requestAnimationFrame(drawLoop);
        };

        requestAnimationFrame(drawLoop);
      });

      // Build blob + download
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `storyboard-animatic-${Date.now()}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      setProgress(100);
      setDone(true);
    } catch (err: any) {
      setError(err?.message ?? 'Có lỗi khi xuất video.');
    } finally {
      setIsRecording(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-6 space-y-5">
      <div>
        <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-1 flex items-center gap-2">
          <FileVideo size={14} className="text-rose-500" /> Export Video WebM
        </h3>
        <p className="text-[10px] text-slate-400 dark:text-white/30">
          Xuất animatic dưới dạng file <code className="bg-slate-100 dark:bg-white/8 px-1 rounded text-[9px]">.webm</code> — chạy được trong Chrome, VLC, DaVinci Resolve.
        </p>
      </div>

      {/* Hidden canvas — 960×540 */}
      <canvas ref={canvasRef} width={960} height={540} className="hidden" />

      {!supported && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <p className="text-[10px] font-semibold leading-snug">
            Animatic preview chỉ hoạt động trên Chrome/Edge. Firefox và Safari không hỗ trợ đầy đủ MediaRecorder với video/webm.
          </p>
        </div>
      )}

      {/* Scene summary */}
      <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 px-4 py-3 flex flex-wrap items-center gap-4 text-[10px]">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-white/40"><Film size={11} /> {withImages.length} cảnh có hình</span>
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-white/40"><Clock size={11} /> {withImages.reduce((a, s) => a + (s.duration ?? 8), 0)}s tổng</span>
        <span className="text-slate-400 dark:text-white/25">· 960×540 · 30fps · VP9 WebM</span>
      </div>

      {/* Progress bar */}
      {isRecording && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30">
            <span>Đang ghi...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-white/8 overflow-hidden">
            <motion.div
              className="h-full bg-rose-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-semibold">
          <AlertCircle size={12} className="shrink-0" /> {error}
        </div>
      )}

      {/* Done */}
      {done && !isRecording && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
          <CheckCircle size={12} /> Video đã tải xuống thành công!
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleExport}
        disabled={isRecording || !supported || withImages.length === 0}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isRecording
          ? <><Loader2 size={14} className="animate-spin" /> Đang xuất {progress}%...</>
          : <><FileVideo size={14} /> Xuất Video WebM</>
        }
      </motion.button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT TAB
// ─────────────────────────────────────────────────────────────────────────────

export const ExportTab: React.FC<ExportTabProps> = ({
  scenes, assets, script, settings, totalDuration,
  onExportJSON, onImportJSON, onNewProject, onViewScene, isProcessing,
}) => {
  const importRef = useRef<HTMLInputElement>(null);
  const [activeMode, setActiveMode] = useState<ExportMode>('overview');
  const { generatePDF, isGenerating: isPDFGenerating, progress: pdfProgress } = usePDFExport();
  const { isPro } = useAuth();
  const { isUpgradeOpen, closeUpgrade, canAccess, requirePro } = useFeatureAccess();

  /** Map ExportMode → FeatureKey (undefined = free) */
  const modeFeature: Partial<Record<ExportMode, Parameters<typeof canAccess>[0]>> = {
    edl:     'export_edl',
    xml:     'export_xml',
    animatic:'export_animatic',
    share:   'share_link',
  };

  const handleTabClick = (modeId: ExportMode) => {
    const feat = modeFeature[modeId];
    if (feat) {
      requirePro(feat, () => setActiveMode(modeId));
    } else {
      setActiveMode(modeId);
    }
  };

  const done        = completedScenes(scenes);
  const hasVideo    = scenes.some(s => s.videoUrl);
  const hasImage    = scenes.some(s => s.visualUrl);
  const projectName = settings?.projectName || 'Skyverses Storyboard';

  const handleDownloadAll = () => {
    scenes.forEach((scene, i) => {
      const url = scene.videoUrl || scene.visualUrl;
      if (!url) return;
      const ext = scene.videoUrl ? 'mp4' : 'jpg';
      const a = document.createElement('a');
      a.href = url; a.download = `scene-${String(scene.order).padStart(2,'0')}.${ext}`;
      setTimeout(() => a.click(), i * 300);
    });
  };

  const MODES: { id: ExportMode; label: string; icon: React.ReactNode; desc: string; badge?: string; pro?: boolean }[] = [
    { id: 'overview',  label: 'Tổng quan',    icon: <Layers size={14} />,      desc: 'Danh sách cảnh & tải xuống',   pro: false },
    { id: 'pdf',       label: 'PDF Board',    icon: <Printer size={14} />,     desc: 'Storyboard grid đẹp để in',    badge: 'NEW',  pro: false },
    { id: 'edl',       label: 'EDL',          icon: <FileText size={14} />,    desc: 'CMX 3600 cho editors',         badge: 'PRO',  pro: true },
    { id: 'xml',       label: 'XML / FCPXML', icon: <Code2 size={14} />,       desc: 'Premiere · DaVinci · FCP',     badge: 'PRO',  pro: true },
    { id: 'animatic',  label: 'Animatic',     icon: <MonitorPlay size={14} />, desc: 'Canvas slideshow preview',     badge: 'PRO',  pro: true },
    { id: 'video',     label: 'Export Video', icon: <FileVideo size={14} />,   desc: 'WebM animatic download',       badge: 'NEW',  pro: false },
    { id: 'share',     label: 'Share Link',   icon: <Share2 size={14} />,      desc: 'Public / Private link',        badge: 'PRO',  pro: true },
  ];

  return (
    <motion.div
      key="tab-export"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 min-h-0 flex flex-col p-5 lg:p-10 overflow-y-auto no-scrollbar bg-[#fafafa] dark:bg-[#050506] transition-colors duration-500"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8 pb-32 lg:pb-10">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
              Export &amp; Chia sẻ
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-600 mt-1.5">
              {done.length}/{scenes.length} cảnh hoàn tất · {totalDuration}s · {settings?.format || 'Storyboard'}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/8 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
              <Plus size={12} /> New
            </button>
            <button onClick={() => importRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/8 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40 hover:border-brand-blue/30 hover:text-brand-blue transition-all">
              <Upload size={12} /> Import
            </button>
            <button onClick={onExportJSON}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-blue/20">
              <FileJson size={12} /> JSON
            </button>
          </div>
          <input ref={importRef} type="file" accept=".json" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { onImportJSON(f); e.target.value = ''; } }} />
        </div>

        {/* ── Stats grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Tổng cảnh',  value: scenes.length,                         color: 'text-white',        bg: 'from-brand-blue/20 to-brand-blue/5',     border: 'border-brand-blue/20' },
            { label: 'Có video',   value: scenes.filter(s => s.videoUrl).length,  color: 'text-purple-300',   bg: 'from-purple-500/20 to-purple-500/5',     border: 'border-purple-500/20' },
            { label: 'Có hình',    value: scenes.filter(s => s.visualUrl).length, color: 'text-emerald-300',  bg: 'from-emerald-500/20 to-emerald-500/5',   border: 'border-emerald-500/20' },
            { label: 'Tài nguyên', value: assets.filter(a => a.url).length,       color: 'text-amber-300',    bg: 'from-amber-500/20 to-amber-500/5',       border: 'border-amber-500/20' },
          ].map(stat => (
            <div key={stat.label} className={`bg-gradient-to-br ${stat.bg} border ${stat.border} rounded-2xl p-4`}>
              <p className={`text-2xl font-black tabular-nums leading-none ${stat.color}`}>{stat.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mt-1.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Mode tabs ────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          {MODES.map(mode => {
            const locked = !!(mode.pro && !isPro);
            const isActive = activeMode === mode.id;
            return (
              <button key={mode.id} onClick={() => handleTabClick(mode.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20'
                    : locked
                      ? 'border-slate-200 dark:border-white/5 text-slate-300 dark:text-white/20 bg-white dark:bg-white/[0.01] cursor-pointer'
                      : 'border-slate-200 dark:border-white/8 text-slate-500 dark:text-white/40 hover:border-brand-blue/30 hover:text-brand-blue bg-white dark:bg-transparent'
                }`}
              >
                {locked ? <Lock size={11} className="opacity-50" /> : mode.icon}
                {mode.label}
                {mode.badge && (
                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : locked
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-brand-blue/10 text-brand-blue'
                  }`}>
                    {mode.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Mode content ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeMode}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >

            {/* ══ OVERVIEW ══════════════════════════════════════════ */}
            {activeMode === 'overview' && (
              <div className="space-y-6">
                {(hasVideo || hasImage) && (
                  <button onClick={handleDownloadAll} disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all">
                    <Download size={15} /> Tải xuống tất cả ({done.length} file)
                  </button>
                )}

                {scenes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Clapperboard size={36} className="text-slate-200 dark:text-white/10" />
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20">Chưa có phân cảnh</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-white/30 flex items-center gap-1.5">
                      <FolderOpen size={10} /> Danh sách phân cảnh
                    </p>
                    {scenes.map((scene, index) => (
                      <motion.div key={scene.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.025 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:border-brand-blue/20 transition-all group"
                      >
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-white/5 shrink-0 cursor-pointer" onClick={() => onViewScene(scene)}>
                          {scene.videoUrl ? <video src={scene.videoUrl} className="w-full h-full object-cover" muted />
                            : scene.visualUrl ? <img src={scene.visualUrl} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-200 dark:text-white/10"><Clock size={12} /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <StatusIcon status={scene.status} />
                            <span className="text-[10px] font-black text-slate-700 dark:text-white/70">SC.{String(scene.order).padStart(2,'0')}</span>
                            {scene.videoUrl && <span className="text-[8px] font-bold bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">VIDEO</span>}
                            {scene.visualUrl && !scene.videoUrl && <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">IMG</span>}
                            {scene.audioUrl && <Music size={10} className="text-purple-400" />}
                            <span className="text-[8px] text-slate-300 dark:text-white/15 ml-auto tabular-nums">{scene.duration ?? 8}s</span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-white/30 truncate">{scene.prompt}</p>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(scene.videoUrl || scene.visualUrl) && (
                            <button onClick={() => {
                              const url = scene.videoUrl || scene.visualUrl;
                              if (!url) return;
                              const a = document.createElement('a');
                              a.href = url; a.download = `scene-${String(scene.order).padStart(2,'0')}.${scene.videoUrl ? 'mp4' : 'jpg'}`; a.click();
                            }} className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-brand-blue hover:text-white flex items-center justify-center text-slate-400 dark:text-white/30 transition-all">
                              <Download size={11} />
                            </button>
                          )}
                          <button onClick={() => onViewScene(scene)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-purple-500 hover:text-white flex items-center justify-center text-slate-400 dark:text-white/30 transition-all">
                            <Play size={11} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {script && (
                  <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02] p-5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-white/20 mb-2">Kịch bản gốc</p>
                    <p className="text-[11px] text-slate-500 dark:text-white/40 leading-relaxed line-clamp-4">{script}</p>
                  </div>
                )}
              </div>
            )}

            {/* ══ PDF ══════════════════════════════════════════════ */}
            {activeMode === 'pdf' && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-6 space-y-5">
                <div>
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-1">PDF Storyboard</h3>
                  <p className="text-[10px] text-slate-400 dark:text-white/30">Grid 3 cột, hình ảnh + prompt. Click "In / Lưu PDF" trong cửa sổ mới.</p>
                </div>

                {/* Preview mockup */}
                <div className="rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-100 dark:border-white/5 p-4">
                  <div className="grid grid-cols-3 gap-2 opacity-50">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden">
                        <div className="aspect-video bg-slate-200 dark:bg-white/10 flex items-center justify-center">
                          {scenes[i]?.visualUrl
                            ? <img src={scenes[i].visualUrl!} className="w-full h-full object-cover" alt="" />
                            : <ImageIcon size={14} className="text-slate-300 dark:text-white/10" />
                          }
                        </div>
                        <div className="p-1.5 space-y-1">
                          <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
                          <div className="h-1 bg-slate-100 dark:bg-white/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => generatePDF(scenes, projectName, script, settings)}
                  disabled={isPDFGenerating || scenes.length === 0}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isPDFGenerating
                    ? <><Loader2 size={14} className="animate-spin" /> Đang tạo... {pdfProgress}%</>
                    : <><Printer size={14} /> Tạo PDF Storyboard</>
                  }
                </motion.button>
              </div>
            )}

            {/* ══ EDL ══════════════════════════════════════════════ */}
            {activeMode === 'edl' && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-6 space-y-5">
                <div>
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-1">EDL — Edit Decision List</h3>
                  <p className="text-[10px] text-slate-400 dark:text-white/30">Định dạng CMX 3600 chuẩn. Import vào Premiere Pro, DaVinci Resolve, Avid.</p>
                </div>
                <pre className="bg-slate-900 dark:bg-black/60 rounded-xl p-4 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-52 no-scrollbar leading-relaxed">
                  {generateEDL(scenes.slice(0, 4), projectName)}
                </pre>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => downloadText(generateEDL(scenes, projectName), `${projectName.replace(/\s+/g,'-')}.edl`)}
                  disabled={scenes.length === 0}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:brightness-110 disabled:opacity-40 transition-all"
                >
                  <Download size={14} /> Download .EDL
                </motion.button>
              </div>
            )}

            {/* ══ XML ══════════════════════════════════════════════ */}
            {activeMode === 'xml' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: 'Premiere Pro XML', sub: 'XMEML format · Adobe Premiere Pro CC+',
                      color: 'text-blue-500', btnBg: 'bg-blue-600',
                      preview: generatePremierXML(scenes.slice(0, 2), projectName).slice(0, 380),
                      onDownload: () => downloadText(generatePremierXML(scenes, projectName), `${projectName.replace(/\s+/g,'-')}-premiere.xml`, 'application/xml'),
                      btnLabel: 'Download Premiere XML',
                    },
                    {
                      title: 'FCPXML', sub: 'Final Cut Pro X · DaVinci Resolve 18+',
                      color: 'text-purple-500', btnBg: 'bg-purple-600',
                      preview: generateFCPXML(scenes.slice(0, 2), projectName).slice(0, 380),
                      onDownload: () => downloadText(generateFCPXML(scenes, projectName), `${projectName.replace(/\s+/g,'-')}.fcpxml`, 'application/xml'),
                      btnLabel: 'Download FCPXML',
                    },
                  ].map(card => (
                    <div key={card.title} className="rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.02] p-5 space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <FileVideo size={14} className={card.color} />
                          <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-700 dark:text-white">{card.title}</h3>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-white/30">{card.sub}</p>
                      </div>
                      <pre className="bg-slate-50 dark:bg-black/40 rounded-xl p-3 text-[9px] font-mono text-slate-400 dark:text-white/25 overflow-x-auto max-h-32 no-scrollbar leading-relaxed">
                        {card.preview}…
                      </pre>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={card.onDownload} disabled={scenes.length === 0}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl ${card.btnBg} text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-40 transition-all`}>
                        <Download size={12} /> {card.btnLabel}
                      </motion.button>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-300 dark:text-white/20 text-center">
                  File XML chứa sequence metadata. Media paths link tới URL ảnh/video đã render.
                </p>
              </div>
            )}

            {/* ══ ANIMATIC ════════════════════════════════════════ */}
            {activeMode === 'animatic' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-1">Animatic Preview</h3>
                  <p className="text-[10px] text-slate-400 dark:text-white/30">Canvas slideshow theo duration từng cảnh. Review nhịp độ trước khi render.</p>
                </div>
                <AnimaticPreview scenes={scenes} />
              </div>
            )}

            {/* ══ VIDEO EXPORT ════════════════════════════════════ */}
            {activeMode === 'video' && (
              <VideoExportPanel scenes={scenes} />
            )}

            {/* ══ SHARE ═══════════════════════════════════════════ */}
            {activeMode === 'share' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-1">Share Link</h3>
                  <p className="text-[10px] text-slate-400 dark:text-white/30">Chia sẻ storyboard với client hoặc team.</p>
                </div>
                <SharePanel projectName={projectName} scenes={scenes} />
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* ── Upgrade Modal ────────────────────────────────────────── */}
      <UpgradeModal isOpen={isUpgradeOpen} onClose={closeUpgrade} />

    </motion.div>
  );
};

export default ExportTab;
