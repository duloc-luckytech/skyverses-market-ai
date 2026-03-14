
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  BarChart3, Cloud, HardDrive, DollarSign,
  Package, History, Users,
  Filter, Compass, Bot, Cog, Key,
  ShieldCheck, ChevronLeft, ChevronRight,
  Sun, Moon, LogOut, Plus
} from 'lucide-react';
import { marketApi } from '../apis/market';
import { systemConfigApi } from '../apis/config';
import { Solution, HomeBlock } from '../types';
import { SOLUTIONS as LOCAL_SOLUTIONS } from '../data';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// Sub-components
import { DashboardTab } from '../components/admin-pro/DashboardTab';
import { NodeRegistryTab } from '../components/admin-pro/NodeRegistryTab';
import { PricingTab } from '../components/admin-pro/PricingTab';
import { CreditPacksTab } from '../components/admin-pro/CreditPacksTab';
import { UsersTab } from '../components/admin-pro/UsersTab';
import { LogsTab } from '../components/admin-pro/LogsTab';
import { ExplorerTab } from '../components/admin-pro/ExplorerTab';
import { AIModelsTab } from '../components/admin-pro/AIModelsTab';
import { MarketFiltersTab } from '../components/admin-pro/MarketFiltersTab';
import { ConfigurationTab } from '../components/admin-pro/ConfigurationTab';
import { ProviderTokensTab } from '../components/admin-pro/ProviderTokensTab';
import { SolutionDrawer } from '../components/admin-pro/solution-drawer/SolutionDrawer';

type ProAdminTab = 'DASHBOARD' | 'CLOUD' | 'LOCAL' | 'PRICING' | 'CREDIT_PACKS' | 'USERS' | 'LOGS' | 'EXPLORER' | 'AI_MODELS' | 'MARKET_FILTERS' | 'CONFIG' | 'PROVIDER_TOKENS';

const sidebarItems: { id: ProAdminTab; label: string; icon: React.ReactNode; group?: string }[] = [
  { id: 'DASHBOARD', label: 'Tổng quan', icon: <BarChart3 size={16} />, group: 'MAIN' },
  { id: 'CLOUD', label: 'Cloud Market', icon: <Cloud size={16} />, group: 'MARKET' },
  { id: 'LOCAL', label: 'Local Market', icon: <HardDrive size={16} />, group: 'MARKET' },
  { id: 'MARKET_FILTERS', label: 'Bộ lọc SP', icon: <Filter size={16} />, group: 'MARKET' },
  { id: 'EXPLORER', label: 'Thư viện mẫu', icon: <Compass size={16} />, group: 'CONTENT' },
  { id: 'AI_MODELS', label: 'AI Models', icon: <Bot size={16} />, group: 'CONTENT' },
  { id: 'PROVIDER_TOKENS', label: 'Provider Tokens', icon: <Key size={16} />, group: 'CONTENT' },
  { id: 'PRICING', label: 'Bảng giá', icon: <DollarSign size={16} />, group: 'FINANCE' },
  { id: 'CREDIT_PACKS', label: 'Gói Credits', icon: <Package size={16} />, group: 'FINANCE' },
  { id: 'USERS', label: 'Khách hàng', icon: <Users size={16} />, group: 'SYSTEM' },
  { id: 'LOGS', label: 'Nhật ký', icon: <History size={16} />, group: 'SYSTEM' },
  { id: 'CONFIG', label: 'Cấu hình', icon: <Cog size={16} />, group: 'SYSTEM' },
];

const GROUP_LABELS: Record<string, string> = {
  MAIN: '',
  MARKET: 'Thị trường',
  CONTENT: 'Nội dung',
  FINANCE: 'Tài chính',
  SYSTEM: 'Hệ thống',
};

const AdminCmsProPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<ProAdminTab>('DASHBOARD');
  const [remoteSolutions, setRemoteSolutions] = useState<Solution[]>([]);
  const [homeBlocks, setHomeBlocks] = useState<HomeBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Solution Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedItem, setEditedItem] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [solRes, configRes] = await Promise.all([
        marketApi.getSolutions(),
        systemConfigApi.getSystemConfig()
      ]);
      if (solRes?.data) setRemoteSolutions(solRes.data);
      if (configRes?.success && configRes.data.marketHomeBlock) setHomeBlocks(configRes.data.marketHomeBlock);
    } catch (error) { console.error("Fetch Error:", error); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const isSyncedOnCloud = (slug: string) => remoteSolutions.some(r => r.slug.toLowerCase().trim() === slug.toLowerCase().trim());

  const handleEdit = (sol: any) => {
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
      demoType: sol.demoType || 'text'
    });
  };

  const handleToggleActive = async (sol: Solution) => {
    const targetId = sol._id || sol.id;
    if (togglingId) return;
    setTogglingId(targetId);
    try {
      const newStatus = !sol.isActive;
      const res = await marketApi.toggleActive(targetId, newStatus);
      if (res.success) setRemoteSolutions(prev => prev.map(item => (item._id === targetId || item.id === targetId) ? { ...item, isActive: newStatus } : item));
    } catch (err) { }
    finally { setTogglingId(null); }
  };

  const handleQuickUpdateHomeBlocks = async (sol: Solution, newBlocks: string[]) => {
    const targetId = sol._id || sol.id;
    setTogglingId(targetId);
    try {
      const res = await marketApi.updateSolution(targetId, { homeBlocks: newBlocks });
      if (res.success) setRemoteSolutions(prev => prev.map(item => (item._id === targetId || item.id === targetId) ? { ...item, homeBlocks: newBlocks } : item));
    } catch (err) { console.error(err); }
    finally { setTogglingId(null); }
  };

  const handleSaveSolution = async () => {
    if (!editedItem) return;
    setIsSaving(true);
    const existingRemote = remoteSolutions.find(r => r.slug.toLowerCase().trim() === editedItem.slug.toLowerCase().trim());
    let res;
    if (existingRemote && editingId !== 'NEW') res = await marketApi.updateSolution(existingRemote._id || existingRemote.id, editedItem);
    else res = await marketApi.createSolution(editedItem);
    if (res.success || (res as any)?.data) { await fetchData(); setEditingId(null); setEditedItem(null); }
    setIsSaving(false);
  };

  // Group sidebar items
  const groupedItems = sidebarItems.reduce((acc: { group: string; items: typeof sidebarItems }[], item) => {
    const last = acc[acc.length - 1];
    if (last && last.group === (item.group || '')) last.items.push(item);
    else acc.push({ group: item.group || '', items: [item] });
    return acc;
  }, []);

  const currentLabel = sidebarItems.find(i => i.id === activeTab)?.label || '';

  return (
    <div className="h-screen flex bg-slate-50 dark:bg-[#0a0a0c] text-slate-900 dark:text-white font-sans overflow-hidden">
      {/* ======= SIDEBAR ======= */}
      <aside className={`shrink-0 flex flex-col bg-white dark:bg-[#0e0e11] border-r border-slate-200 dark:border-white/[0.06] transition-all duration-300 ${sidebarCollapsed ? 'w-[52px]' : 'w-56'}`}>
        {/* Logo */}
        <div className={`shrink-0 h-12 flex items-center border-b border-slate-200 dark:border-white/[0.06] ${sidebarCollapsed ? 'justify-center px-2' : 'px-4 gap-2.5'}`}>
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-white shrink-0">
            <ShieldCheck size={14} />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Skyverses CMS</p>
              <p className="text-[9px] text-slate-400 font-medium">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-grow overflow-y-auto py-2 px-1.5 space-y-0.5 no-scrollbar">
          {groupedItems.map((group, gi) => (
            <div key={gi}>
              {group.group && GROUP_LABELS[group.group] && !sidebarCollapsed && (
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider px-2.5 pt-4 pb-1.5">{GROUP_LABELS[group.group]}</p>
              )}
              {group.group && GROUP_LABELS[group.group] && sidebarCollapsed && (
                <div className="h-px bg-slate-100 dark:bg-white/[0.04] mx-2 my-2"></div>
              )}
              {group.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-lg transition-all text-left ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'} ${activeTab === item.id
                      ? 'bg-violet-600 text-white shadow-sm shadow-violet-600/20'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                    }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!sidebarCollapsed && <span className="text-[11px] font-semibold truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className={`shrink-0 border-t border-slate-200 dark:border-white/[0.06] p-1.5 space-y-0.5`}>
          <button onClick={toggleTheme} title="Toggle theme" className={`w-full flex items-center gap-2.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'}`}>
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {!sidebarCollapsed && <span className="text-[11px] font-semibold">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} title="Toggle sidebar" className={`w-full flex items-center gap-2.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'}`}>
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!sidebarCollapsed && <span className="text-[11px] font-semibold">Thu gọn</span>}
          </button>
          {user && (
            <button onClick={logout} title="Đăng xuất" className={`w-full flex items-center gap-2.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all ${sidebarCollapsed ? 'justify-center p-2.5' : 'px-2.5 py-2'}`}>
              <LogOut size={14} />
              {!sidebarCollapsed && <span className="text-[11px] font-semibold">Đăng xuất</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ======= MAIN ======= */}
      <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 h-12 flex items-center justify-between px-6 bg-white dark:bg-[#0e0e11] border-b border-slate-200 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white">{currentLabel}</h1>
            <span className="text-[9px] text-slate-400 font-medium bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">{activeTab}</span>
          </div>
          <div className="flex items-center gap-3">
            {(activeTab === 'CLOUD' || activeTab === 'LOCAL') && (
              <button
                onClick={() => handleEdit({ id: 'NODE_' + Date.now(), slug: '', name: { en: '', vi: '', ko: '', ja: '' }, category: { en: '', vi: '', ko: '', ja: '' }, description: { en: '', vi: '', ko: '', ja: '' }, problems: [], industries: [], models: [], priceCredits: 0, isFree: false, imageUrl: '', demoType: 'text', tags: [], features: [], complexity: 'Standard', priceReference: '', isActive: true, neuralStack: [], homeBlocks: [] })}
                className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 text-white rounded-md text-[10px] font-bold hover:bg-violet-700 transition-colors shadow-sm"
              >
                <Plus size={12} /> Thêm giải pháp
              </button>
            )}
            {user && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 text-[10px] font-bold">
                  {user.email?.[0]?.toUpperCase() || 'A'}
                </div>
                {!sidebarCollapsed && <span className="text-[10px] font-medium hidden lg:block">{user.email}</span>}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'DASHBOARD' && <DashboardTab key="dashboard" />}
            {activeTab === 'EXPLORER' && <ExplorerTab key="explorer" />}
            {activeTab === 'MARKET_FILTERS' && <MarketFiltersTab key="market_filters" />}
            {activeTab === 'CREDIT_PACKS' && <CreditPacksTab key="packs" />}
            {activeTab === 'PRICING' && <PricingTab key="pricing" />}
            {activeTab === 'AI_MODELS' && <AIModelsTab key="ai_models" />}
            {activeTab === 'PROVIDER_TOKENS' && <ProviderTokensTab key="provider_tokens" />}
            {activeTab === 'LOGS' && <LogsTab key="logs" remoteSolutions={remoteSolutions} />}
            {activeTab === 'USERS' && <UsersTab key="users" loading={loading} response={null} onParamsChange={() => { }} />}
            {activeTab === 'CONFIG' && <ConfigurationTab key="config" />}
            {(activeTab === 'CLOUD' || activeTab === 'LOCAL') && (
              <NodeRegistryTab
                key={activeTab}
                activeTab={activeTab}
                solutions={activeTab === 'CLOUD' ? remoteSolutions : LOCAL_SOLUTIONS}
                onEdit={handleEdit} onDelete={() => { }}
                onToggleActive={handleToggleActive}
                onUpdateHomeBlocks={handleQuickUpdateHomeBlocks}
                isSyncedOnCloud={isSyncedOnCloud}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ======= SOLUTION DRAWER ======= */}
      <AnimatePresence>
        {editedItem && (
          <SolutionDrawer
            editingId={editingId} editedItem={editedItem} setEditedItem={setEditedItem}
            isSaving={isSaving} onClose={() => setEditedItem(null)} onSave={handleSaveSolution}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCmsProPage;
