
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageLibraryModal from './ImageLibraryModal';
import ResourceAuthModal from './common/ResourceAuthModal';
import ProductImageWorkspace from './ProductImageWorkspace';
import { GeneratorSidebar } from './image-generator/GeneratorSidebar';
import { GeneratorViewport } from './image-generator/GeneratorViewport';
import { useImageGenerator, ImageResult } from '../hooks/useImageGenerator';
import { JobLogsModal } from './common/JobLogsModal';
import { extractImageFamily } from '../hooks/useImageModels';
import { upscaleApi } from '../apis/upscale';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AIImageGeneratorWorkspace: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const g = useImageGenerator();
  const { showToast } = useToast();
  const { user, refreshUserInfo } = useAuth();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [selectedLogTask, setSelectedLogTask] = useState<ImageResult | null>(null);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [upscaleMap, setUpscaleMap] = useState<Record<string, { resolution: string; status: 'processing' | 'done' | 'error'; resultUrl?: string }>>({});

  // ─── FAMILY GROUPING (uses shared extractImageFamily) ───
  const rawModels = useMemo(() => g.availableModels.map((m: any) => m.raw || m), [g.availableModels]);

  const families = useMemo(() => {
    const groups: Record<string, any[]> = {};
    rawModels.forEach((m: any) => {
      const fam = extractImageFamily(m.name);
      if (!groups[fam]) groups[fam] = [];
      groups[fam].push(m);
    });
    return groups;
  }, [rawModels]);

  const familyList = useMemo(() => Object.keys(families).sort(), [families]);
  const familyModels = useMemo(() => families[selectedFamily] || [], [families, selectedFamily]);
  const familyModes = useMemo(() => [...new Set(familyModels.flatMap((m: any) => m.modes || []))], [familyModels]);
  const familyResolutions = useMemo(() => [...new Set(familyModels.flatMap((m: any) => Object.keys(m.pricing || {})))], [familyModels]);
  const familyRatios = useMemo(() => [...new Set(familyModels.flatMap((m: any) => m.aspectRatios || []))].filter((r: string) => r && r !== 'auto'), [familyModels]);

  useEffect(() => {
    if (familyList.length > 0 && !selectedFamily) {
      const defaultFam = g.selectedModel?.raw ? extractImageFamily(g.selectedModel.raw.name) : familyList[0];
      setSelectedFamily(defaultFam || familyList[0]);
    }
  }, [familyList, g.selectedModel]);

  // Reset selectedFamily when engine changes to avoid stale data
  useEffect(() => {
    setSelectedFamily('');
  }, [g.selectedEngine]);

  useEffect(() => {
    if (familyModels.length === 0) return;
    const currentRaw = g.selectedModel?.raw || g.selectedModel;
    let best = familyModels.find((m: any) => (m.modes || []).includes(g.selectedMode) && m.pricing?.[g.selectedRes?.toLowerCase()]);
    if (!best) best = familyModels.find((m: any) => (m.modes || []).includes(g.selectedMode));
    if (!best) best = familyModels.find((m: any) => m.pricing?.[g.selectedRes?.toLowerCase()]);
    if (!best) best = familyModels[0];
    if (best && best._id !== currentRaw?._id) {
      const mapped = g.availableModels.find((m: any) => (m.raw?._id || m._id || m.id) === best._id);
      if (mapped) g.setSelectedModel(mapped);
    }
  }, [selectedFamily, g.selectedMode, g.selectedRes, familyModels]);

  // Guard: only reset when familyModels has data (avoids resetting during engine switch loading)
  useEffect(() => {
    if (familyModels.length === 0) return;
    if (familyModes.length > 0 && !familyModes.includes(g.selectedMode)) g.setSelectedMode(familyModes[0]);
    if (familyResolutions.length > 0 && !familyResolutions.includes(g.selectedRes)) g.setSelectedRes(familyResolutions[0]);
    if (familyRatios.length > 0 && !familyRatios.includes(g.selectedRatio)) g.setSelectedRatio(familyRatios[0]);
  }, [selectedFamily, familyModes, familyResolutions, familyRatios, familyModels]);

  // --- SAFE NAVIGATION ---
  const isAnyTaskProcessing = useMemo(() => g.results.some(r => r.status === 'processing'), [g.results]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAnyTaskProcessing) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAnyTaskProcessing]);

  const handleSafeClose = useCallback(() => {
    if (isAnyTaskProcessing) {
      if (window.confirm("Đang xử lý ảnh. Bạn có chắc muốn thoát?")) onClose();
    } else onClose();
  }, [isAnyTaskProcessing, onClose]);

  // ─── UPSCALE FROM IMAGE JOB ───
  const handleUpscaleFromJob = useCallback(async (imageJobId: string, resolution: string = '4K') => {
    try {
      // ⚠️ Check: user chưa từng nạp gói → cảnh báo
      if (!user?.plan) {
        showToast('⚠️ Bạn cần nạp gói lần đầu để sử dụng tính năng Upscale. Vui lòng nạp credits để tiếp tục.', 'error');
        return;
      }

      showToast(`Đang gửi yêu cầu upscale ${resolution}...`, 'info');
      setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'processing' } }));

      const res = await upscaleApi.upscaleFromJob(imageJobId, resolution);

      if (!res.success) {
        setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'error' } }));
        if (res.message === 'INSUFFICIENT_CREDITS') {
          g.setShowLowCreditAlert(true);
        } else {
          showToast(res.message || 'Upscale thất bại', 'error');
        }
        return;
      }

      const upscaleJobId = res.data?.jobs?.[0]?.jobId || (res.data as any)?.jobId;
      if (!upscaleJobId) {
        setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'error' } }));
        showToast('Không nhận được Job ID', 'error');
        return;
      }

      if (res.data?.creditsUsed) {
        refreshUserInfo();
      }

      showToast('Upscale đang xử lý...', 'success');

      let pollRetries = 0;
      const MAX_POLL_RETRIES = 30; // ~2.5 phút

      const pollUpscale = async () => {
        try {
          const status = await upscaleApi.getJobStatus(upscaleJobId);
          if (status.success && status.data) {
            if (status.data.status === 'done') {
              const upscaledUrl = status.data.resultUrl || '';
              setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'done', resultUrl: upscaledUrl } }));
              showToast('Upscale hoàn tất! ✅', 'success');
              refreshUserInfo();
              return;
            }
            if (status.data.status === 'error') {
              setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'error' } }));
              showToast('Upscale thất bại — credits đã hoàn lại', 'error');
              refreshUserInfo();
              // Auto-clear badge sau 5s để user có thể retry
              setTimeout(() => setUpscaleMap(prev => {
                const copy = { ...prev };
                if (copy[imageJobId]?.status === 'error') delete copy[imageJobId];
                return copy;
              }), 5000);
              return;
            }
          }
          pollRetries++;
          if (pollRetries >= MAX_POLL_RETRIES) {
            setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'error' } }));
            showToast('Upscale timeout — vui lòng thử lại', 'error');
            setTimeout(() => setUpscaleMap(prev => {
              const copy = { ...prev };
              if (copy[imageJobId]?.status === 'error') delete copy[imageJobId];
              return copy;
            }), 5000);
            return;
          }
          setTimeout(pollUpscale, 5000);
        } catch {
          pollRetries++;
          if (pollRetries >= MAX_POLL_RETRIES) {
            setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'error' } }));
            showToast('Mất kết nối khi kiểm tra upscale', 'error');
            setTimeout(() => setUpscaleMap(prev => {
              const copy = { ...prev };
              if (copy[imageJobId]?.status === 'error') delete copy[imageJobId];
              return copy;
            }), 5000);
            return;
          }
          setTimeout(pollUpscale, 10000);
        }
      };
      pollUpscale();
    } catch (err) {
      console.error('Upscale from job error:', err);
      setUpscaleMap(prev => ({ ...prev, [imageJobId]: { resolution, status: 'error' } }));
      showToast('Lỗi kết nối khi gửi upscale', 'error');
    }
  }, [g, showToast, refreshUserInfo, user]);

  return (
    <div className="h-full w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden transition-colors duration-500 relative">

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobileExpanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileExpanded(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-[140] backdrop-blur-sm" />
        )}
      </AnimatePresence>

      {/* ─── LEFT SIDEBAR ─── */}
      <GeneratorSidebar
        onClose={handleSafeClose}
        activeMode={g.activeMode} setActiveMode={g.setActiveMode}
        usagePreference={g.usagePreference} setShowResourceModal={g.setShowResourceModal}
        totalCost={g.totalCost}
        references={g.references} setReferences={g.setReferences}
        setIsLibraryOpen={g.setIsLibraryOpen}
        prompt={g.prompt} setPrompt={g.setPrompt}
        quantity={g.quantity} setQuantity={g.setQuantity}
        isBulkImporting={g.isBulkImporting} setIsBulkImporting={g.setIsBulkImporting}
        bulkText={g.bulkText} setBulkText={g.setBulkText}
        handleBulkImport={() => {
          if (!g.bulkText.trim()) { g.setIsBulkImporting(false); return; }
          g.setBatchPrompts(g.bulkText.split('\n').map(l => l.trim()).filter(l => l !== ''));
          g.setIsBulkImporting(false);
        }}
        batchPrompts={g.batchPrompts} setBatchPrompts={g.setBatchPrompts}
        availableModels={g.availableModels} selectedModel={g.selectedModel} setSelectedModel={g.setSelectedModel}
        selectedRatio={g.selectedRatio} setSelectedRatio={g.setSelectedRatio}
        selectedRes={g.selectedRes} setSelectedRes={g.setSelectedRes}
        isGenerating={g.isGenerating} handleLocalFileUpload={g.handleLocalFileUpload}
        handleGenerate={g.handleGenerate} generateTooltip={g.generateTooltip} isGenerateDisabled={g.isGenerateDisabled}
        isMobileExpanded={isMobileExpanded} setIsMobileExpanded={setIsMobileExpanded}
        selectedMode={g.selectedMode} setSelectedMode={g.setSelectedMode}
        selectedEngine={g.selectedEngine} setSelectedEngine={g.setSelectedEngine}
        familyList={familyList} selectedFamily={selectedFamily} setSelectedFamily={setSelectedFamily}
        familyModels={familyModels} familyModes={familyModes} familyRatios={familyRatios} familyResolutions={familyResolutions}
      />

      {/* ─── RIGHT VIEWPORT ─── */}
      <GeneratorViewport
        onClose={handleSafeClose}
        activePreviewUrl={g.activePreviewUrl} setActivePreviewUrl={g.setActivePreviewUrl}
        zoomLevel={g.zoomLevel} setZoomLevel={g.setZoomLevel}
        onApplyExample={(item) => { g.setPrompt(item.prompt); if (window.innerWidth < 1024) setIsMobileExpanded(true); }}
        onEdit={g.openEditor} onDownload={g.triggerDownload}
        results={g.results} serverResults={g.serverResults}
        isFetchingServer={g.isFetchingHistory} hasMoreServer={g.hasMoreHistory}
        onLoadMoreServer={() => g.fetchServerResults(g.historyPage + 1)}
        selectedIds={g.selectedIds} toggleSelect={g.toggleSelect}
        deleteResult={g.deleteResult} onRetry={g.handleRetry}
        onViewLogs={(res) => setSelectedLogTask(res)}
        onUpscale={handleUpscaleFromJob}
        upscaleMap={upscaleMap}
        onAddReference={(url) => {
          const newRef = { id: `ref-${Date.now()}`, url, name: 'Từ kết quả', file: null };
          g.setReferences((prev: any[]) => [...prev, newRef]);
          showToast('Đã thêm ảnh tham chiếu', 'success');
          if (window.innerWidth < 1024) setIsMobileExpanded(true);
        }}
      />

      {/* ─── MODALS ─── */}
      <ImageLibraryModal isOpen={g.isLibraryOpen} onClose={() => g.setIsLibraryOpen(false)} onConfirm={g.handleLibrarySelect} maxSelect={6} />

      <ResourceAuthModal
        isOpen={g.showResourceModal} onClose={() => g.setShowResourceModal(false)}
        onConfirm={(pref) => {
          g.setUsagePreference(pref);
          localStorage.setItem('skyverses_usage_preference', pref);
          g.setShowResourceModal(false);
          if (g.isResumingGenerate) { g.setIsResumingGenerate(false); g.handleGenerate(); }
        }}
        hasPersonalKey={g.hasPersonalKey} totalCost={g.totalCost}
      />

      {/* Low Credit Alert */}
      <AnimatePresence>
        {g.showLowCreditAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-white dark:bg-[#111114] p-10 border border-slate-200 dark:border-white/10 rounded-2xl text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <Coins size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hết credits</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Số dư không đủ để tạo ảnh. Nạp thêm để tiếp tục.</p>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/credits" className="bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white py-3.5 rounded-xl text-sm font-semibold shadow-lg hover:scale-[1.02] transition-all text-center">Nạp Credits</Link>
                <button onClick={() => g.setShowLowCreditAlert(false)} className="text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors">Bỏ qua</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Job Logs */}
      <AnimatePresence>
        {selectedLogTask && (
          <JobLogsModal isOpen={true} logs={selectedLogTask.logs || []} status={selectedLogTask.status}
            title="Image Production Trace" subtitle="Node Process Trace"
            jobId={selectedLogTask.id} onClose={() => setSelectedLogTask(null)} />
        )}
      </AnimatePresence>

      {/* Editor */}
      <ProductImageWorkspace isOpen={g.isEditorOpen} onClose={() => g.setIsEditorOpen(false)}
        initialImage={g.editorImage} onApply={g.handleEditorApply} />
    </div>
  );
};

export default AIImageGeneratorWorkspace;
