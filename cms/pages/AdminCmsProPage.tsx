
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Cloud, DollarSign,
  Package, Users, Banknote,
  Compass, Bot, Key, Zap, Inbox, Sparkles,
  ShieldCheck, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Plus, CreditCard, FileText, Webhook, Cpu,
  Search, LayoutGrid, Settings2, RefreshCw, Megaphone, ArrowDownToLine
} from 'lucide-react';

import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { Solution, HomeBlock } from '../types';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const DashboardTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/DashboardTab')).DashboardTab }));
const NodeRegistryTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/NodeRegistryTab')).NodeRegistryTab }));
const PricingTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/PricingTab')).PricingTab }));
const CreditPacksTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/CreditPacksTab')).CreditPacksTab }));
const UsersTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/UsersTab')).UsersTab }));
const LogsTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/LogsTab')).LogsTab }));
const ExplorerTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/ExplorerTab')).ExplorerTab }));
const AIModelsTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/AIModelsTab')).AIModelsTab }));
const OllamaSettingsTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/OllamaSettingsTab')).OllamaSettingsTab }));
const MarketFiltersTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/MarketFiltersTab')).MarketFiltersTab }));
const ConfigurationTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/ConfigurationTab')).ConfigurationTab }));
const ProviderTokensTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/ProviderTokensTab')).ProviderTokensTab }));
const BankingTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/BankingTab')).BankingTab }));
const PaymentHistoryTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/PaymentHistoryTab')).PaymentHistoryTab }));
const WebhookLogsTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/WebhookLogsTab')).WebhookLogsTab }));
const FxflowTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/FxflowTab')).FxflowTab }));
const ApiClientsTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/ApiClientsTab')).ApiClientsTab }));
const SolutionDrawer = React.lazy(async () => ({ default: (await import('../components/admin-pro/solution-drawer/SolutionDrawer')).SolutionDrawer }));
const SubmissionsTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/SubmissionsTab')).SubmissionsTab }));
const AdminDepositTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/AdminDepositTab')).AdminDepositTab }));
const BlogTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/BlogTab')).BlogTab }));
const TasksPendingTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/TasksPendingTab')).TasksPendingTab }));
const PromoBannersTab = React.lazy(async () => ({ default: (await import('../components/admin-pro/PromoBannersTab')).PromoBannersTab }));
const SktWithdrawalTab = React.lazy(() => import('../components/admin-pro/SktWithdrawalTab'));

type ProAdminTab = 'DASHBOARD' | 'CLOUD' | 'PRICING' | 'CREDIT_PACKS' | 'BANKING' | 'PAYMENT_HISTORY' | 'WEBHOOK_LOGS' | 'USERS' | 'LOGS' | 'EXPLORER' | 'AI_MODELS' | 'OLLAMA_SETTINGS' | 'MARKET_FILTERS' | 'CONFIG' | 'PROVIDER_TOKENS' | 'FXFLOW' | 'API_CLIENTS' | 'SUBMISSIONS' | 'ADMIN_DEPOSIT' | 'BLOG' | 'TASKS_PENDING' | 'PROMO_BANNERS' | 'SKT_WITHDRAWALS';
type AdminGroup = 'MAIN' | 'MARKET' | 'CONTENT' | 'FINANCE' | 'OPERATIONS' | 'INFRA' | 'SYSTEM';

interface SidebarItem {
  id: ProAdminTab;
  label: string;
  description: string;
  icon: React.ReactNode;
  group: AdminGroup;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { id: 'DASHBOARD',       label: 'Command Center', icon: <BarChart3 size={16} />,  group: 'MAIN',       description: 'Tổng quan vận hành' },

  { id: 'CLOUD',           label: 'Market Products', icon: <Cloud size={16} />,     group: 'MARKET',     description: 'CRUD, active, featured, home blocks' },
  { id: 'MARKET_FILTERS',  label: 'Home Blocks',     icon: <LayoutGrid size={16} />, group: 'MARKET',    description: 'Sắp xếp section marketplace' },
  { id: 'SUBMISSIONS',     label: 'Submissions',     icon: <Inbox size={16} />,     group: 'MARKET',     description: 'Duyệt đề xuất sản phẩm' },

  { id: 'BLOG',            label: 'Blog CMS',        icon: <FileText size={16} />,  group: 'CONTENT',    description: 'Bài viết, SEO, publish' },
  { id: 'PROMO_BANNERS',   label: 'Promo Banners',   icon: <Megaphone size={16} />, group: 'CONTENT',    description: 'Hero banners trang Marketplace' },
  { id: 'EXPLORER',        label: 'Explorer',        icon: <Compass size={16} />,   group: 'CONTENT',    description: 'Gallery công khai' },

  { id: 'PRICING',         label: 'Model Pricing',   icon: <DollarSign size={16} />, group: 'FINANCE',   description: 'Matrix credits theo model' },
  { id: 'CREDIT_PACKS',    label: 'Credit Packs',    icon: <Package size={16} />,   group: 'FINANCE',    description: 'Gói bán credits' },
  { id: 'BANKING',         label: 'Banking & QR',    icon: <CreditCard size={16} />, group: 'FINANCE',   description: 'Tài khoản bank, VietQR' },
  { id: 'PAYMENT_HISTORY', label: 'Payments',        icon: <Banknote size={16} />,  group: 'FINANCE',    description: 'Lịch sử nạp tiền' },
  { id: 'ADMIN_DEPOSIT',   label: 'Manual Credits',  icon: <Sparkles size={16} />,  group: 'FINANCE',    description: 'Cộng/trừ credit thủ công' },
  { id: 'SKT_WITHDRAWALS', label: 'SKT Withdrawals', icon: <ArrowDownToLine size={16} />, group: 'FINANCE', description: 'Duyệt yêu cầu rút SKT' },

  { id: 'USERS',           label: 'Users',           icon: <Users size={16} />,     group: 'OPERATIONS', description: 'Khách hàng và tài khoản' },
  { id: 'TASKS_PENDING',   label: 'Tasks',           icon: <Cpu size={16} />,       group: 'OPERATIONS', description: 'Image/video/edit job queue', badge: 'LIVE' },
  { id: 'API_CLIENTS',     label: 'API Clients',     icon: <Key size={16} />,       group: 'OPERATIONS', description: 'External API keys và usage' },

  { id: 'FXFLOW',          label: 'FXFlow Engine',   icon: <Zap size={16} />,       group: 'INFRA',      description: 'Worker owner pool' },
  { id: 'OLLAMA_SETTINGS', label: 'AI Provider',     icon: <Bot size={16} />,       group: 'INFRA',      description: 'LLM provider settings' },
  { id: 'AI_MODELS',       label: 'AI Models',       icon: <Cpu size={16} />,       group: 'INFRA',      description: 'Model registry' },
  { id: 'PROVIDER_TOKENS', label: 'Provider Tokens', icon: <ShieldCheck size={16} />, group: 'INFRA',    description: 'Token pool và cooldown' },

  { id: 'CONFIG',          label: 'System Config',   icon: <Settings2 size={16} />, group: 'SYSTEM',     description: 'SystemSetting JSON' },
  { id: 'LOGS',            label: 'Deploy Logs',     icon: <FileText size={16} />,  group: 'SYSTEM',     description: 'Nhật ký deploy/runtime' },
  { id: 'WEBHOOK_LOGS',    label: 'Webhook Logs',    icon: <Webhook size={16} />,   group: 'SYSTEM',     description: 'Webhook payment raw logs' },
];

const GROUP_LABELS: Record<AdminGroup, string> = {
  MAIN:    '',
  MARKET:  'Marketplace',
  CONTENT: 'Content',
  FINANCE: 'Tài chính',
  OPERATIONS: 'Operations',
  INFRA:   'Infrastructure',
  SYSTEM:  'System',
};


const createLocalizedString = () => ({ en: '', vi: '', ko: '', ja: '' });

const createDraftSolution = (): Solution => ({
  id: `NODE_${Date.now()}`,
  slug: '',
  name: createLocalizedString(),
  category: createLocalizedString(),
  description: createLocalizedString(),
  problems: [],
  industries: [],
  models: [],
  priceCredits: 0,
  isFree: false,
  imageUrl: '',
  demoType: 'text',
  tags: [],
  features: [],
  complexity: 'Standard',
  priceReference: '',
  isActive: true,
  featured: false,
  order: 0,
  status: 'active',
  neuralStack: [],
  homeBlocks: [],
});

const TabLoadingFallback = () => (
  <div className="flex min-h-[320px] items-center justify-center p-8">
    <div className="flex items-center gap-2 rounded-lg border border-black/[0.04] bg-white px-3 py-2 text-[11px] font-bold text-slate-400 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <RefreshCw size={12} className="animate-spin text-brand-blue" />
      Loading panel
    </div>
  </div>
);

const AdminCmsProPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!user) navigate('/login', { replace: true });
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const [activeTab, setActiveTab] = useState<ProAdminTab>('DASHBOARD');
  const [remoteSolutions, setRemoteSolutions] = useState<Solution[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tabQuery, setTabQuery] = useState('');

  // Solution Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<Solution | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [solRes, configRes] = await Promise.all([
        marketApi.getSolutions(),
        systemConfigApi.getSystemConfig()
      ]);
      if (solRes?.data) setRemoteSolutions(solRes.data);
      if (configRes?.success && configRes.data.marketHomeBlock) setHomeBlocks(configRes.data.marketHomeBlock);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isSyncedOnCloud = (slug: string) => remoteSolutions.some(r => r.slug.toLowerCase().trim() === slug.toLowerCase().trim());

  const handleEdit = (sol: Solution) => {
    setEditingId(sol._id || sol.id);
    setEditedItem({
      ...sol,
      name: sol.name || { en: '', vi: '', ko: '', ja: '' },
      category: sol.category || { en: '', vi: '', ko: '', ja: '' },
      description: sol.description || { en: '', vi: '', ko: '', ja: '' },
      problems: sol.problems || [], industries: sol.industries || [], tags: sol.tags || [],
      models: sol.models || [], homeBlocks: sol.homeBlocks || [], features: sol.features || [],
      neuralStack: sol.neuralStack || [], priceCredits: sol.priceCredits || 0,
      isFree: sol.isFree ?? false, featured: sol.featured ?? false, isActive: sol.isActive ?? true,
      order: sol.order ?? 0, status: sol.status || 'active', complexity: sol.complexity || 'Standard',
      demoType: sol.demoType || 'text',
      imageUrl: sol.imageUrl || '',
      priceReference: sol.priceReference || '',
    });
  };

  const handleToggleActive = async (sol: Solution) => {
    const targetId = sol._id || sol.id;
    if (togglingId) return;
    setTogglingId(targetId);
    try {
      const newStatus = !sol.isActive;
      const res = await marketApi.toggleActive(targetId, newStatus);
      if (res.success) {
        setRemoteSolutions(prev => prev.map(item => (item._id === targetId || item.id === targetId) ? { ...item, isActive: newStatus } : item));
        showToast(`${sol.name.en} → ${newStatus ? 'Active' : 'Hidden'}`, 'success');
      }
    } catch (err) { showToast('Lỗi cập nhật trạng thái', 'error'); }
    finally { setTogglingId(null); }
  };

  const handleQuickUpdateHomeBlocks = async (sol: Solution, newBlocks: string[]) => {
    const targetId = sol._id || sol.id;
    setTogglingId(targetId);
    try {
      const res = await marketApi.updateSolution(targetId, { homeBlocks: newBlocks });
      if (res.success) {
        setRemoteSolutions(prev => prev.map(item => (item._id === targetId || item.id === targetId) ? { ...item, homeBlocks: newBlocks } : item));
        showToast('Đã cập nhật vị trí hiển thị', 'success');
      }
    } catch (err) { showToast('Lỗi cập nhật home blocks', 'error'); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async (sol: Solution) => {
    const targetId = sol._id || sol.id;
    const confirm = window.confirm(`Xoá sản phẩm "${sol.name.en}"? Hành động này không thể hoàn tác.`);
    if (!confirm) return;
    try {
      const res = await marketApi.deleteSolution(targetId);
      if (res.success) {
        setRemoteSolutions(prev => prev.filter(item => item._id !== targetId && item.id !== targetId));
        showToast(`Đã xoá "${sol.name.en}"`, 'success');
      } else {
        showToast(res.message || 'Xoá thất bại', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối server khi xoá', 'error');
    }
  };

  const handleSaveSolution = async () => {
    if (!editedItem) return;
    setIsSaving(true);
    try {
      const normalizedSlug = editedItem.slug.toLowerCase().trim();
      const existingRemote = remoteSolutions.find(r =>
        r._id === editingId ||
        r.id === editingId ||
        r.slug.toLowerCase().trim() === normalizedSlug
      );
      const isNew = !existingRemote || editingId === 'NEW';
      const res = isNew
        ? await marketApi.createSolution(editedItem)
        : await marketApi.updateSolution(existingRemote._id || existingRemote.id, editedItem);
      if (res.success) {
        await fetchData();
        setEditingId(null);
        setEditedItem(null);
        showToast(isNew ? `Đã tạo sản phẩm "${editedItem.name.en}"` : `Đã cập nhật "${editedItem.name.en}"`, 'success');
      } else {
        showToast('Lưu thất bại, kiểm tra lại dữ liệu', 'error');
      }
    } catch (err) {
      showToast('Lỗi kết nối server', 'error');
    }
    setIsSaving(false);
  };

  const filteredSidebarItems = useMemo(() => {
    const q = tabQuery.trim().toLowerCase();
    if (!q) return sidebarItems;
    return sidebarItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  }, [tabQuery]);

  // Group sidebar items
  const groupedItems = useMemo(() => filteredSidebarItems.reduce((acc: { group: AdminGroup; items: SidebarItem[] }[], item) => {
    const last = acc[acc.length - 1];
    if (last && last.group === item.group) last.items.push(item);
    else acc.push({ group: item.group, items: [item] });
    return acc;
  }, []), [filteredSidebarItems]);

  const currentTab = sidebarItems.find(i => i.id === activeTab);
  const currentLabel = currentTab?.label || '';
  const activeSolutions = remoteSolutions.filter(sol => sol.isActive).length;

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      {/* ======= SIDEBAR ======= */}
      <aside className={`relative z-10 shrink-0 flex flex-col bg-white/60 dark:bg-[#0a0a0c]/60 backdrop-blur-2xl border-r border-black/[0.04] dark:border-white/[0.04] transition-all duration-300 ${sidebarCollapsed ? 'w-[64px]' : 'w-64'}`}>
        {/* Logo */}
        <div className={`shrink-0 h-16 flex items-center border-b border-black/[0.04] dark:border-white/[0.04] ${sidebarCollapsed ? 'justify-center px-2' : 'px-5 gap-3'}`}>
          <div className="w-7 h-7 bg-brand-blue rounded-lg flex items-center justify-center text-white shrink-0">
            <ShieldCheck size={14} />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Skyverses CMS</p>
              <p className="text-[9px] text-slate-400 font-medium">Control Center</p>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="shrink-0 px-3 py-3 border-b border-black/[0.04] dark:border-white/[0.04]">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={tabQuery}
                onChange={e => setTabQuery(e.target.value)}
                placeholder="Search tabs..."
                className="w-full h-9 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] pl-9 pr-3 text-[11px] font-semibold text-slate-700 dark:text-white outline-none focus:border-brand-blue/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-brand-blue/[0.06] border border-brand-blue/10 px-3 py-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Products</p>
                <p className="text-sm font-black text-brand-blue">{activeSolutions}/{remoteSolutions.length}</p>
              </div>
              <div className="rounded-xl bg-emerald-500/[0.06] border border-emerald-500/10 px-3 py-2">
                <p className="text-[9px] font-bold uppercase text-slate-400">Blocks</p>
                <p className="text-sm font-black text-emerald-500">{homeBlocks.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-grow overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {groupedItems.map((group) => (
            <div key={group.group}>
              {group.group && GROUP_LABELS[group.group] && !sidebarCollapsed && (
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider px-2.5 pt-4 pb-1.5">{GROUP_LABELS[group.group]}</p>
              )}
              {group.group && GROUP_LABELS[group.group] && sidebarCollapsed && (
                <div className="h-px bg-black/[0.02] dark:bg-white/[0.02] mx-2 my-2"></div>
              )}
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 rounded-xl transition-all text-left ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'} ${activeTab === item.id
                      ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                      : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                    }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[11px] font-bold truncate">{item.label}</span>
                        {item.badge && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black">{item.badge}</span>}
                      </span>
                      <span className={`block text-[9px] truncate ${activeTab === item.id ? 'text-white/70' : 'text-slate-400 dark:text-gray-500'}`}>{item.description}</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className={`shrink-0 border-t border-black/[0.04] dark:border-white/[0.04] p-3 space-y-1`}>
          <button onClick={toggleTheme} title="Toggle theme" className={`w-full flex items-center gap-3 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}`}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {!sidebarCollapsed && <span className="text-[11px] font-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle sidebar" className={`w-full flex items-center gap-3 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}`}>
            {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
            {!sidebarCollapsed && <span className="text-[12px] font-semibold">Thu gọn</span>}
          </button>
          {user && (
            <button onClick={handleLogout} title="Đăng xuất" className={`w-full flex items-center gap-3 rounded-xl text-slate-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all ${sidebarCollapsed ? 'justify-center p-3' : 'px-3 py-2.5'}`}>
              <LogOut size={15} />
              {!sidebarCollapsed && <span className="text-[12px] font-semibold">Đăng xuất</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ======= MAIN ======= */}
      <main className="relative z-10 flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-16 flex items-center justify-between px-5 lg:px-8 bg-white/70 dark:bg-[#0a0a0c]/70 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.04]">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentLabel}</h1>
              <span className="text-[9px] text-slate-400 font-medium bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">{activeTab}</span>
            </div>
            {currentTab?.description && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{currentTab.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {(activeTab === 'CLOUD' || activeTab === 'LOGS') && (
              <button
                onClick={fetchData}
                disabled={loading}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-[10px] font-bold text-slate-500 dark:text-gray-300 hover:text-brand-blue transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Sync
              </button>
            )}
            {activeTab === 'CLOUD' && (
              <button
                onClick={() => handleEdit(createDraftSolution())}
                className="flex items-center gap-2 px-4 py-1.5 bg-brand-blue text-white rounded-lg text-[10px] font-bold hover:brightness-110 transition-colors shadow-sm"
              >
                <Plus size={12} /> New Product
              </button>
            )}
            {user && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-6 h-6 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[10px] font-bold">
                  {user.email?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="text-[10px] font-medium hidden lg:block">{user.email}</span>
              </div>
            )}
            <button onClick={handleLogout} title="Đăng xuất"
              className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all text-[10px] font-bold">
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto no-scrollbar">
          <React.Suspense fallback={<TabLoadingFallback />}>
            <AnimatePresence mode="wait">
              {activeTab === 'DASHBOARD' && <DashboardTab key="dashboard" />}
              {activeTab === 'EXPLORER' && <ExplorerTab key="explorer" />}
              {activeTab === 'MARKET_FILTERS' && <MarketFiltersTab key="market_filters" />}
              {activeTab === 'CREDIT_PACKS' && <CreditPacksTab key="packs" />}
              {activeTab === 'BANKING' && <BankingTab key="banking" />}
              {activeTab === 'PRICING' && <PricingTab key="pricing" />}
              {activeTab === 'AI_MODELS' && <AIModelsTab key="ai_models" />}
              {activeTab === 'OLLAMA_SETTINGS' && <OllamaSettingsTab key="ollama_settings" />}
              {activeTab === 'PROVIDER_TOKENS' && <ProviderTokensTab key="provider_tokens" />}
              {activeTab === 'LOGS' && <LogsTab key="logs" remoteSolutions={remoteSolutions} />}
              {activeTab === 'USERS' && <UsersTab key="users" loading={loading} response={null} onParamsChange={() => { }} />}
              {activeTab === 'PAYMENT_HISTORY' && <PaymentHistoryTab key="payment_history" />}
              {activeTab === 'WEBHOOK_LOGS' && <WebhookLogsTab key="webhook_logs" />}
              {activeTab === 'CONFIG' && <ConfigurationTab key="config" />}
              {activeTab === 'FXFLOW' && <FxflowTab key="fxflow" />}
              {activeTab === 'API_CLIENTS' && <ApiClientsTab key="api_clients" />}
              {activeTab === 'SUBMISSIONS' && <SubmissionsTab key="submissions" />}
              {activeTab === 'ADMIN_DEPOSIT' && <AdminDepositTab key="admin_deposit" />}
              {activeTab === 'BLOG' && <BlogTab key="blog" />}
              {activeTab === 'TASKS_PENDING' && <TasksPendingTab key="tasks_pending" />}
              {activeTab === 'PROMO_BANNERS' && <PromoBannersTab key="promo_banners" />}
              {activeTab === 'SKT_WITHDRAWALS' && <SktWithdrawalTab key="skt_withdrawals" />}
              {activeTab === 'CLOUD' && (
                <NodeRegistryTab
                  key={activeTab}
                  activeTab={activeTab}
                  solutions={remoteSolutions}
                  onEdit={handleEdit} onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onUpdateHomeBlocks={handleQuickUpdateHomeBlocks}
                  isSyncedOnCloud={isSyncedOnCloud}
                  onRefresh={fetchData}
                />
              )}
            </AnimatePresence>
          </React.Suspense>
        </div>
      </main>

      {/* ======= SOLUTION DRAWER ======= */}
      <AnimatePresence>
        {editedItem && (
          <React.Suspense fallback={null}>
            <SolutionDrawer
              editingId={editingId} editedItem={editedItem} setEditedItem={setEditedItem}
              isSaving={isSaving} onClose={() => setEditedItem(null)} onSave={handleSaveSolution}
            />
          </React.Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCmsProPage;
