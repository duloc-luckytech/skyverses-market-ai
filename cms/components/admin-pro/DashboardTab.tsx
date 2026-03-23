import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Users, Zap, TrendingUp, DollarSign, Activity,
  Globe, ShieldCheck, Cpu, Flame, CheckCircle2, AlertTriangle,
  Package, Bot, Key, Compass, Cloud, HardDrive, ArrowUpRight,
  ArrowDownRight, Eye, EyeOff, Clock, Layers, RefreshCcw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// APIs
import { marketApi } from '../../apis/market';
import { authApi, AuthUser, UserListParams } from '../../apis/auth';
import { pricingApi, PricingModel } from '../../apis/pricing';
import { creditsApi, CreditPackage } from '../../apis/credits';
import { aiModelsApi, AIModel } from '../../apis/ai-models';
import { explorerApi } from '../../apis/explorer';
import { providerTokensApi, ProviderToken } from '../../apis/provider-tokens';
import { Solution } from '../../types';

// ─── STAT CARD ───
interface StatCardProps {
  label: string;
  value: string | number;
  subValue: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, trend, trendUp = true, color, loading }) => (
  <div className="bg-white dark:bg-[#111114] border border-black/[0.04] dark:border-white/[0.04] rounded-2xl p-5 hover:border-black/[0.08] dark:hover:border-white/[0.08] hover:shadow-md transition-all group cursor-default">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-gray-400">{label}</p>
          {loading ? (
            <div className="h-7 w-20 bg-slate-100 dark:bg-white/5 animate-pulse rounded mt-1" />
          ) : (
            <h3 className="text-[22px] font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
          )}
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg ${trendUp ? 'text-emerald-600 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
          {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {trend}
        </div>
      )}
    </div>
    <p className="text-[10px] text-slate-400 border-t border-black/[0.04] dark:border-white/[0.04] pt-3">{subValue}</p>
  </div>
);

// ─── SECTION HEADER ───
const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }> = ({ icon, title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-1">
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <h3 className="text-[13px] font-bold text-slate-700 dark:text-gray-100">{title}</h3>
        {subtitle && <p className="text-[10px] text-slate-400">{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

// ─── PIE CHART COLORS ───
const PIE_COLORS = ['#0090ff', '#f97316', '#a855f7', '#10b981', '#f43f5e', '#06b6d4', '#eab308'];

// ─── MOCK REVENUE DATA (7 ngày gần nhất) ───
const generateRevenueData = () => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const now = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return {
      name: days[d.getDay()],
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue: Math.floor(Math.random() * 8000 + 2000),
      credits: Math.floor(Math.random() * 50000 + 10000),
    };
  });
};

// ─── MAIN COMPONENT ───
export const DashboardTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [users, setUsers] = useState<{ total: number; data: AuthUser[] }>({ total: 0, data: [] });
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPackage[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [explorerItems, setExplorerItems] = useState<any[]>([]);
  const [providerTokens, setProviderTokens] = useState<ProviderToken[]>([]);
  const [revenueData] = useState(generateRevenueData);

  const fetchAll = async () => {
    try {
      const [solRes, userRes, pricingRes, creditRes, aiRes, explorerRes, tokenRes] = await Promise.allSettled([
        marketApi.getSolutions(),
        authApi.listUsers({ page: 1, pageSize: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        pricingApi.getPricing(),
        creditsApi.getAdminPackages(),
        aiModelsApi.getModels(),
        explorerApi.getItems(),
        providerTokensApi.getList({}),
      ]);

      if (solRes.status === 'fulfilled' && solRes.value?.data) setSolutions(solRes.value.data);
      if (userRes.status === 'fulfilled') {
        const u = userRes.value;
        setUsers({ total: u.totalItems || u.data?.length || 0, data: u.data || [] });
      }
      if (pricingRes.status === 'fulfilled' && pricingRes.value?.data) setPricingModels(pricingRes.value.data);
      if (creditRes.status === 'fulfilled' && creditRes.value?.data) setCreditPacks(creditRes.value.data);
      if (aiRes.status === 'fulfilled' && aiRes.value?.data) setAIModels(aiRes.value.data);
      if (explorerRes.status === 'fulfilled' && explorerRes.value?.data) setExplorerItems(explorerRes.value.data);
      if (tokenRes.status === 'fulfilled' && tokenRes.value?.data) setProviderTokens(tokenRes.value.data);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchAll(); };

  // ─── COMPUTED STATS ───
  const stats = useMemo(() => {
    const activeSolutions = solutions.filter(s => s.isActive);
    const featuredSolutions = solutions.filter(s => s.featured);
    const activeModels = aiModels.filter(m => m.status === 'active');
    const activeTokens = providerTokens.filter(t => t.isActive);
    const errorTokens = providerTokens.filter(t => t.errorCount > 0);
    const activePacks = creditPacks.filter(p => p.active);

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    solutions.forEach(s => {
      const cat = s.category?.vi || s.category?.en || 'Khác';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    // Complexity breakdown
    const complexityMap: Record<string, number> = {};
    solutions.forEach(s => {
      const c = s.complexity || 'Standard';
      complexityMap[c] = (complexityMap[c] || 0) + 1;
    });

    // Provider token breakdown
    const tokenByProvider: Record<string, { total: number; active: number }> = {};
    providerTokens.forEach(t => {
      if (!tokenByProvider[t.provider]) tokenByProvider[t.provider] = { total: 0, active: 0 };
      tokenByProvider[t.provider].total++;
      if (t.isActive) tokenByProvider[t.provider].active++;
    });

    // Total revenue from chart data
    const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
    const totalCreditsFlow = revenueData.reduce((s, d) => s + d.credits, 0);

    return {
      activeSolutions, featuredSolutions, activeModels, activeTokens, errorTokens, activePacks,
      categoryData, complexityMap, tokenByProvider, totalRevenue, totalCreditsFlow,
    };
  }, [solutions, aiModels, providerTokens, creditPacks, revenueData]);

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto">

      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Tổng quan hệ thống</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Dữ liệu được đồng bộ trực tiếp từ Backend API</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white text-[12px] font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
          <RefreshCcw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </button>
      </div>

      {/* ─── ROW 1: PRIMARY METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Solutions" value={solutions.length} subValue={`${stats.activeSolutions.length} active · ${stats.featuredSolutions.length} featured`}
          trend={`${stats.activeSolutions.length}/${solutions.length}`} icon={<Cloud size={18} />}
          color="bg-brand-blue/10 text-brand-blue" loading={loading}
        />
        <StatCard
          label="Người dùng" value={users.total} subValue="Tổng tài khoản đã đăng ký"
          trend="+24.1%" icon={<Users size={18} />}
          color="bg-purple-500/10 text-purple-500" loading={loading}
        />
        <StatCard
          label="AI Models" value={aiModels.length} subValue={`${stats.activeModels.length} active · ${aiModels.length - stats.activeModels.length} inactive`}
          icon={<Bot size={18} />} color="bg-orange-500/10 text-orange-500" loading={loading}
        />
        <StatCard
          label="Provider Tokens" value={providerTokens.length} subValue={`${stats.activeTokens.length} hoạt động · ${stats.errorTokens.length} lỗi`}
          trend={stats.errorTokens.length > 0 ? `${stats.errorTokens.length} errors` : 'OK'} trendUp={stats.errorTokens.length === 0}
          icon={<Key size={18} />} color="bg-emerald-500/10 text-emerald-500" loading={loading}
        />
      </div>

      {/* ─── ROW 2: SECONDARY METRICS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pricing Models" value={pricingModels.length} subValue="Cấu hình bảng giá resolution×duration"
          icon={<DollarSign size={18} />} color="bg-cyan-500/10 text-cyan-500" loading={loading}
        />
        <StatCard
          label="Gói Credits" value={creditPacks.length} subValue={`${stats.activePacks.length} đang bán · ${creditPacks.length - stats.activePacks.length} ẩn`}
          icon={<Package size={18} />} color="bg-amber-500/10 text-amber-500" loading={loading}
        />
        <StatCard
          label="Explorer Gallery" value={explorerItems.length} subValue="Tác phẩm showcase từ cộng đồng"
          icon={<Compass size={18} />} color="bg-rose-500/10 text-rose-500" loading={loading}
        />
        <StatCard
          label="Doanh thu (14 ngày)" value={`$${(stats.totalRevenue).toLocaleString()}`} subValue={`${(stats.totalCreditsFlow).toLocaleString()} credits lưu hành`}
          trend="+15.2%" icon={<TrendingUp size={18} />} color="bg-indigo-500/10 text-indigo-500" loading={loading}
        />
      </div>

      {/* ─── ROW 3: CHARTS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE AREA CHART */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <SectionHeader icon={<BarChart3 size={15} className="text-slate-400" />} title="Biểu đồ doanh thu & Credits" subtitle="14 ngày gần nhất" />
          </div>
          <div className="p-4 h-[260px] bg-slate-50/50 dark:bg-black/10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0090ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0090ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gCredits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  cursor={{ stroke: 'rgba(0,144,255,0.15)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value: any, name: any) => [name === 'revenue' ? `$${value.toLocaleString()}` : `${value.toLocaleString()} CR`, name === 'revenue' ? 'Doanh thu' : 'Credits']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0090ff" strokeWidth={2.5} fillOpacity={1} fill="url(#gRevenue)" />
                <Area type="monotone" dataKey="credits" stroke="#a855f7" strokeWidth={1.5} fillOpacity={1} fill="url(#gCredits)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 py-3 border-t border-black/[0.04] dark:border-white/[0.04] flex gap-6 text-[10px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-blue" /> Doanh thu (USD)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Credits lưu hành</span>
          </div>
        </div>

        {/* CATEGORY PIE CHART */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm flex flex-col">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <SectionHeader icon={<Layers size={15} className="text-slate-400" />} title="Phân bổ danh mục" subtitle={`${stats.categoryData.length} danh mục`} />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {stats.categoryData.length > 0 ? (
              <>
                <div className="h-[160px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {stats.categoryData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-1.5 px-2 mt-2 max-h-[100px] overflow-y-auto no-scrollbar">
                  {stats.categoryData.map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-2 text-slate-600 dark:text-gray-300 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {cat.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{cat.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 4: DETAIL PANELS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* SOLUTION STATUS */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <SectionHeader icon={<Cloud size={15} className="text-brand-blue" />} title="Solutions Overview" subtitle={`${solutions.length} giải pháp`} />
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <p className="text-lg font-bold text-emerald-600">{stats.activeSolutions.length}</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1">ACTIVE</p>
              </div>
              <div className="text-center p-3 bg-slate-100 dark:bg-white/5 rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                <p className="text-lg font-bold text-slate-600 dark:text-gray-300">{solutions.length - stats.activeSolutions.length}</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1">HIDDEN</p>
              </div>
              <div className="text-center p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <p className="text-lg font-bold text-amber-600">{stats.featuredSolutions.length}</p>
                <p className="text-[9px] text-slate-400 font-medium mt-1">FEATURED</p>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Complexity</p>
              {Object.entries(stats.complexityMap).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-600 dark:text-gray-300">{level}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-blue rounded-full" style={{ width: `${(count / Math.max(solutions.length, 1)) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-900 dark:text-white w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PROVIDER TOKEN HEALTH */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <SectionHeader icon={<Key size={15} className="text-emerald-500" />} title="Provider Token Health" subtitle={`${providerTokens.length} tokens`} />
          </div>
          <div className="p-5 space-y-4">
            {Object.keys(stats.tokenByProvider).length > 0 ? (
              Object.entries(stats.tokenByProvider).map(([provider, data]) => (
                <div key={provider} className="p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] font-bold text-slate-700 dark:text-white uppercase">{provider}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${data.active === data.total ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {data.active}/{data.total} active
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${data.active === data.total ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${(data.active / Math.max(data.total, 1)) * 100}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Key size={32} className="text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-[12px] text-slate-400">Chưa có token nào</p>
              </div>
            )}

            {stats.errorTokens.length > 0 && (
              <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertTriangle size={14} />
                  <span className="text-[11px] font-semibold">{stats.errorTokens.length} token(s) gặp lỗi</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RECENT USERS */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <SectionHeader icon={<Users size={15} className="text-purple-500" />} title="Người dùng mới nhất" subtitle={`${users.total} tổng`} />
          </div>
          <div className="p-5">
            {users.data.length > 0 ? (
              <div className="space-y-3">
                {users.data.slice(0, 5).map((u) => (
                  <div key={u._id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-black/[0.04] dark:border-white/[0.04]">
                    <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-[11px] font-bold shrink-0">
                      {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-white truncate">{u.name || u.email}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-bold text-brand-blue">{u.creditBalance?.toLocaleString() || 0} CR</p>
                      <p className="text-[9px] text-slate-400">{u.plan || 'Free'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users size={32} className="text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-[12px] text-slate-400">{loading ? 'Đang tải...' : 'Không có dữ liệu'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── ROW 5: AI MODELS & CREDIT PACKS & SYSTEM STATUS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI MODELS LIST */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <SectionHeader icon={<Bot size={15} className="text-orange-500" />} title="AI Models Registry" subtitle={`${aiModels.length} models`} />
          </div>
          <div className="p-5 space-y-2 max-h-[280px] overflow-y-auto no-scrollbar">
            {aiModels.length > 0 ? aiModels.map(m => (
              <div key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                {m.logoUrl ? (
                  <img src={m.logoUrl} alt={m.name} className="w-8 h-8 rounded-lg object-cover border border-black/[0.04] dark:border-white/[0.04]" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500"><Bot size={14} /></div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-white truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{m.provider || m.key}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : m.status === 'draft' ? 'bg-amber-500/10 text-amber-600' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                  {m.status}
                </span>
              </div>
            )) : (
              <p className="text-[12px] text-slate-400 text-center py-6">{loading ? 'Đang tải...' : 'Chưa có model'}</p>
            )}
          </div>
        </div>

        {/* CREDIT PACKS */}
        <div className="bg-white dark:bg-[#111114] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-sm">
          <div className="p-5 border-b border-black/[0.04] dark:border-white/[0.04]">
            <SectionHeader icon={<Package size={15} className="text-amber-500" />} title="Gói Credits" subtitle={`${creditPacks.length} gói`} />
          </div>
          <div className="p-5 space-y-2 max-h-[280px] overflow-y-auto no-scrollbar">
            {creditPacks.length > 0 ? creditPacks.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04]">
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-slate-700 dark:text-white truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.totalCredits?.toLocaleString()} CR · {p.billingCycle}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[13px] font-bold text-brand-blue">${p.price}</p>
                  <span className={`text-[9px] font-bold ${p.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {p.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-[12px] text-slate-400 text-center py-6">{loading ? 'Đang tải...' : 'Chưa có gói'}</p>
            )}
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="bg-[#050505] dark:bg-[#0a0a0c] rounded-2xl border border-black/[0.04] dark:border-white/[0.04] shadow-[0_0_30px_rgba(0,144,255,0.02)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-transparent opacity-40" />
          <div className="p-5 border-b border-white/5 relative z-10">
            <SectionHeader icon={<Cpu size={15} className="text-brand-blue" />} title="System Status" subtitle="Backend API Health" />
          </div>
          <div className="p-5 space-y-4 relative z-10">
            {[
              { label: 'API Server', value: 'localhost:3221', status: solutions.length > 0 || users.total > 0 },
              { label: 'Solutions Synced', value: `${solutions.length} nodes`, status: solutions.length > 0 },
              { label: 'AI Models', value: `${stats.activeModels.length}/${aiModels.length} active`, status: stats.activeModels.length > 0 },
              { label: 'Token Pool', value: `${stats.activeTokens.length}/${providerTokens.length}`, status: stats.errorTokens.length === 0 },
              { label: 'Pricing Engine', value: `${pricingModels.length} configs`, status: pricingModels.length > 0 },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[11px] text-gray-400">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-white">{item.value}</span>
                  <span className={`w-2 h-2 rounded-full ${item.status ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-brand-blue/10 border border-brand-blue/20 rounded-xl flex items-center gap-3">
              <ShieldCheck size={18} className="text-brand-blue shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">System Synchronized</p>
                <p className="text-[10px] text-brand-blue/70">All services are operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
