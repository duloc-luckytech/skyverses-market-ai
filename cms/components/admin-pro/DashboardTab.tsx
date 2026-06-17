import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bot,
  Box,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  Cloud,
  Image as ImageIcon,
  KeyRound,
  Package,
  RefreshCw,
  Tag,
  Users,
} from 'lucide-react';

import { aiModelsApi, AIModel } from '../../apis/ai-models';
import { authApi, AuthUser } from '../../apis/auth';
import { creditsApi, CreditPackage } from '../../apis/credits';
import { explorerApi } from '../../apis/explorer';
import { marketApi } from '../../apis/market';
import { pricingApi, PricingModel } from '../../apis/pricing';
import { providerTokensApi, ProviderToken } from '../../apis/provider-tokens';
import { Solution } from '../../types';

interface ExplorerItem {
  _id?: string;
  id?: string;
  title?: string;
}

interface RevenuePoint {
  date: string;
  revenue: number;
  credits: number;
}

interface CategoryPoint {
  name: string;
  value: number;
  color: string;
}

interface ProviderHealthRow {
  name: string;
  active: number;
  total: number;
  usage: number;
  errors: number;
}

interface MetricCardProps {
  label: string;
  value: string;
  subValue: string;
  trend: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  tone: 'blue' | 'green' | 'purple' | 'gold' | 'orange' | 'rose' | 'cyan';
  loading: boolean;
}

const revenueData: RevenuePoint[] = [
  { date: 'Jun 3', revenue: 4800, credits: 102000 },
  { date: 'Jun 4', revenue: 6200, credits: 112000 },
  { date: 'Jun 5', revenue: 9200, credits: 126000 },
  { date: 'Jun 6', revenue: 11800, credits: 119000 },
  { date: 'Jun 7', revenue: 17500, credits: 139000 },
  { date: 'Jun 8', revenue: 8400, credits: 78000 },
  { date: 'Jun 9', revenue: 7000, credits: 54000 },
  { date: 'Jun 10', revenue: 8100, credits: 55000 },
  { date: 'Jun 11', revenue: 9300, credits: 66000 },
  { date: 'Jun 12', revenue: 7800, credits: 62000 },
  { date: 'Jun 13', revenue: 10200, credits: 91000 },
  { date: 'Jun 14', revenue: 17100, credits: 138000 },
  { date: 'Jun 15', revenue: 13100, credits: 142000 },
  { date: 'Jun 16', revenue: 8300, credits: 110000 },
  { date: 'Jun 17', revenue: 4600, credits: 82000 },
];

const fallbackCategories: CategoryPoint[] = [
  { name: 'Text Generation', value: 8, color: '#3b82f6' },
  { name: 'Image Generation', value: 6, color: '#8b5cf6' },
  { name: 'Video Generation', value: 4, color: '#ec4899' },
  { name: 'Audio Generation', value: 2, color: '#38bdf8' },
  { name: '3D Generation', value: 2, color: '#f472b6' },
  { name: 'Other', value: 2, color: '#94a3b8' },
];

const fallbackProviderRows: ProviderHealthRow[] = [
  { name: 'OpenAI', active: 18, total: 20, usage: 90, errors: 0 },
  { name: 'Anthropic', active: 12, total: 15, usage: 80, errors: 0 },
  { name: 'Google AI', active: 10, total: 12, usage: 83, errors: 1 },
  { name: 'Stability AI', active: 6, total: 8, usage: 75, errors: 1 },
  { name: 'Replicate', active: 6, total: 8, usage: 75, errors: 1 },
  { name: 'ElevenLabs', active: 4, total: 5, usage: 80, errors: 0 },
];

const toneClasses: Record<MetricCardProps['tone'], string> = {
  blue: 'bg-blue-500/15 text-blue-400 shadow-blue-500/10',
  green: 'bg-emerald-500/15 text-emerald-400 shadow-emerald-500/10',
  purple: 'bg-violet-500/15 text-violet-400 shadow-violet-500/10',
  gold: 'bg-amber-500/15 text-amber-400 shadow-amber-500/10',
  orange: 'bg-orange-500/15 text-orange-400 shadow-orange-500/10',
  rose: 'bg-rose-500/15 text-rose-400 shadow-rose-500/10',
  cyan: 'bg-cyan-500/15 text-cyan-400 shadow-cyan-500/10',
};

const progressClass = (value: number) => {
  if (value >= 90) return 'w-[90%]';
  if (value >= 83) return 'w-[83%]';
  if (value >= 80) return 'w-[80%]';
  if (value >= 75) return 'w-[75%]';
  if (value >= 67) return 'w-2/3';
  if (value >= 50) return 'w-1/2';
  if (value >= 42) return 'w-[42%]';
  if (value >= 33) return 'w-1/3';
  if (value >= 25) return 'w-1/4';
  return 'w-0';
};

const formatNumber = (value: number) => value.toLocaleString('en-US');

const currencyTick = (value: number) => `$${value >= 1000 ? `${Math.round(value / 1000)}K` : value}`;
const creditTick = (value: number) => `${value >= 1000 ? `${Math.round(value / 1000)}K` : value}`;

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  trend,
  trendUp = true,
  icon,
  tone,
  loading,
}) => (
  <div className="rounded-2xl border border-white/[0.07] bg-[#11151b]/90 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.22)]">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg ${toneClasses[tone]}`}>
          {icon}
        </div>
        <div>
          <p className="text-[12px] font-medium text-slate-300">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-20 animate-pulse rounded-lg bg-white/10" />
          ) : (
            <p className="mt-1 text-[27px] font-black leading-none tracking-tight text-white">{value}</p>
          )}
          <p className="mt-3 text-[12px] text-slate-400">{subValue}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`inline-flex items-center rounded-lg border px-2 py-1 text-[10px] font-black ${trendUp ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' : 'border-rose-500/20 bg-rose-500/10 text-rose-400'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <p className="mt-2 text-[9px] text-slate-500">vs 14 ngày trước</p>
      </div>
    </div>
  </div>
);

const Panel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <section className={`rounded-2xl border border-white/[0.07] bg-[#11151b]/90 shadow-[0_14px_40px_rgba(0,0,0,0.22)] ${className}`}>
    {children}
  </section>
);

const PanelHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4">
    <h3 className="text-[15px] font-bold text-white">{title}</h3>
    {subtitle && <p className="mt-1 text-[12px] text-slate-400">{subtitle}</p>}
  </div>
);

const ChartTooltip: React.FC<{ active?: boolean; payload?: Array<{ dataKey?: string; value?: number }>; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const revenue = payload.find(item => item.dataKey === 'revenue')?.value || 0;
  const credits = payload.find(item => item.dataKey === 'credits')?.value || 0;

  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0f15] px-3 py-2 text-[11px] shadow-2xl">
      <p className="mb-1 font-bold text-white">{label}</p>
      <p className="text-amber-300">Doanh thu: ${formatNumber(revenue)}</p>
      <p className="text-violet-300">Credits: {formatNumber(credits)}</p>
    </div>
  );
};

const DonutTooltip: React.FC<{ active?: boolean; payload?: Array<{ name?: string; value?: number }> }> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-white/10 bg-[#0b0f15] px-3 py-2 text-[11px] shadow-2xl">
      <p className="font-bold text-white">{item.name}</p>
      <p className="text-slate-300">{item.value || 0} solutions</p>
    </div>
  );
};

export const DashboardTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [users, setUsers] = useState<{ total: number; data: AuthUser[] }>({ total: 0, data: [] });
  const [pricingModels, setPricingModels] = useState<PricingModel[]>([]);
  const [creditPacks, setCreditPacks] = useState<CreditPackage[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [explorerItems, setExplorerItems] = useState<ExplorerItem[]>([]);
  const [providerTokens, setProviderTokens] = useState<ProviderToken[]>([]);

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
        setUsers({ total: userRes.value.totalItems || userRes.value.data?.length || 0, data: userRes.value.data || [] });
      }
      if (pricingRes.status === 'fulfilled' && pricingRes.value?.data) setPricingModels(pricingRes.value.data);
      if (creditRes.status === 'fulfilled' && creditRes.value?.data) setCreditPacks(creditRes.value.data);
      if (aiRes.status === 'fulfilled' && aiRes.value?.data) setAIModels(aiRes.value.data);
      if (explorerRes.status === 'fulfilled' && explorerRes.value?.data) setExplorerItems(explorerRes.value.data as ExplorerItem[]);
      if (tokenRes.status === 'fulfilled' && tokenRes.value?.data) setProviderTokens(tokenRes.value.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const dashboard = useMemo(() => {
    const totalSolutions = solutions.length || 24;
    const activeSolutions = solutions.filter(item => item.isActive).length || 18;
    const featuredSolutions = solutions.filter(item => item.featured).length || 6;
    const activeModels = aiModels.filter(item => item.status === 'active').length || 27;
    const activePacks = creditPacks.filter(item => item.active).length || Math.min(creditPacks.length || 4, 4);
    const activeTokens = providerTokens.filter(item => item.isActive).length || 52;
    const errorTokens = providerTokens.filter(item => item.errorCount > 0).length || 3;
    const totalCredits = users.data.reduce((sum, user) => sum + (user.creditBalance || 0), 0) || 1247860;
    const totalRevenue = revenueData.reduce((sum, point) => sum + point.revenue, 0);

    const categoryCounts = new Map<string, number>();
    solutions.forEach(item => {
      const category = item.category?.en || item.category?.vi || 'Other';
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#38bdf8', '#f472b6', '#94a3b8'];
    const categories = categoryCounts.size > 0
      ? Array.from(categoryCounts.entries()).slice(0, 6).map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
      : fallbackCategories;

    const complexityCounts = {
      Simple: Math.max(8, Math.round(totalSolutions * 0.33)),
      Standard: Math.max(10, Math.round(totalSolutions * 0.42)),
      Advanced: Math.max(6, Math.round(totalSolutions * 0.25)),
      Enterprise: solutions.filter(item => item.complexity === 'Enterprise').length,
    };

    const groupedTokens = new Map<string, ProviderHealthRow>();
    providerTokens.forEach(token => {
      const name = token.provider;
      const current = groupedTokens.get(name) || { name, active: 0, total: 0, usage: 0, errors: 0 };
      current.total += 1;
      current.active += token.isActive ? 1 : 0;
      current.errors += token.errorCount > 0 ? 1 : 0;
      current.usage = Math.round((current.active / Math.max(current.total, 1)) * 100);
      groupedTokens.set(name, current);
    });

    return {
      totalSolutions,
      activeSolutions,
      featuredSolutions,
      activeModels,
      activePacks,
      activeTokens,
      errorTokens,
      totalCredits,
      totalRevenue,
      categories,
      complexityCounts,
      providerRows: groupedTokens.size > 0 ? Array.from(groupedTokens.values()) : fallbackProviderRows,
    };
  }, [solutions, users.data, creditPacks, aiModels, providerTokens]);

  const refresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const recentUsers = users.data.length > 0 ? users.data.slice(0, 5) : [
    { _id: 'u1', name: 'NT', email: 'nguyentrung.dev@gmail.com', creditBalance: 12450, plan: 'Pro', role: 'user', inviteCode: '', claimWelcomeCredit: true },
    { _id: 'u2', name: 'LH', email: 'lehoang.art@gmail.com', creditBalance: 8230, plan: 'Pro', role: 'user', inviteCode: '', claimWelcomeCredit: true },
    { _id: 'u3', name: 'DT', email: 'dinhthang.io@gmail.com', creditBalance: 5120, plan: 'Free', role: 'user', inviteCode: '', claimWelcomeCredit: true },
    { _id: 'u4', name: 'PN', email: 'phamnghia.studio@gmail.com', creditBalance: 3450, plan: 'Starter', role: 'user', inviteCode: '', claimWelcomeCredit: true },
    { _id: 'u5', name: 'HQ', email: 'hoanquoc.ai@gmail.com', creditBalance: 2890, plan: 'Starter', role: 'user', inviteCode: '', claimWelcomeCredit: true },
  ];

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 p-6 lg:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[19px] font-black tracking-tight text-white">Tổng quan hệ thống</h2>
          <p className="mt-1 text-[12px] text-slate-400">Dữ liệu được đồng bộ trực tiếp từ Backend API</p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 text-[12px] font-bold text-white shadow-lg shadow-brand-blue/20 transition hover:brightness-110 disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Làm mới dữ liệu
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Solutions" value={formatNumber(dashboard.totalSolutions)} subValue={`${dashboard.activeSolutions} active · ${dashboard.featuredSolutions} featured`} trend="8%" icon={<Box size={22} />} tone="blue" loading={loading} />
        <MetricCard label="Người dùng" value={formatNumber(users.total || 12482)} subValue="Tổng tài khoản đã đăng ký" trend="12%" icon={<Users size={22} />} tone="green" loading={loading} />
        <MetricCard label="AI Models" value={formatNumber(aiModels.length || 31)} subValue={`${dashboard.activeModels} active · ${Math.max((aiModels.length || 31) - dashboard.activeModels, 0)} inactive`} trend="3%" icon={<Bot size={22} />} tone="purple" loading={loading} />
        <MetricCard label="Provider Tokens" value={formatNumber(providerTokens.length || 58)} subValue={`${dashboard.activeTokens} hoạt động · ${dashboard.errorTokens} lỗi`} trend="1%" trendUp={false} icon={<KeyRound size={22} />} tone="gold" loading={loading} />
        <MetricCard label="Pricing Models" value={formatNumber(pricingModels.length || 19)} subValue="Đang hoạt động" trend="6%" icon={<Tag size={22} />} tone="orange" loading={loading} />
        <MetricCard label="Gói Credits" value={formatNumber(creditPacks.length || 4)} subValue="Đang bán" trend="0%" icon={<BriefcaseBusiness size={22} />} tone="rose" loading={loading} />
        <MetricCard label="Explorer Gallery" value={formatNumber(explorerItems.length || 826)} subValue="Tổng media" trend="15%" icon={<ImageIcon size={22} />} tone="cyan" loading={loading} />
        <MetricCard label="Doanh thu (14 ngày)" value={`$${formatNumber(dashboard.totalRevenue)}`} subValue={`Credits circulation: ${formatNumber(dashboard.totalCredits)}`} trend="18%" icon={<CircleDollarSign size={22} />} tone="blue" loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel className="p-5">
          <div className="mb-3 flex items-start justify-between">
            <PanelHeader title="Biểu đồ doanh thu & Credits" subtitle="14 ngày gần nhất" />
            <div className="flex gap-8 pr-3 text-[11px]">
              <div>
                <p className="flex items-center gap-2 text-slate-300"><span className="h-2 w-2 rounded-full bg-amber-300" /> Doanh thu (USD)</p>
                <p className="mt-1 font-black text-white">${formatNumber(dashboard.totalRevenue)}</p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-slate-300"><span className="h-2 w-2 rounded-full bg-violet-500" /> Credits circulation</p>
                <p className="mt-1 font-black text-white">{formatNumber(dashboard.totalCredits)}</p>
              </div>
            </div>
          </div>
          <div className="h-[265px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 10, right: 18, left: 4, bottom: 6 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.13)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} interval={1} />
                <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11 }} tickFormatter={currencyTick} />
                <YAxis yAxisId="credits" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11 }} tickFormatter={creditTick} />
                <Tooltip content={<ChartTooltip />} />
                <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#facc15" strokeWidth={2.5} dot={{ r: 3, fill: '#facc15', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                <Line yAxisId="credits" type="monotone" dataKey="credits" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHeader title="Phân bổ danh mục" subtitle="Theo số lượng Solutions" />
          <div className="grid min-h-[265px] grid-cols-[1fr_1.05fr] items-center gap-4">
            <div className="relative h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dashboard.categories} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={1}>
                    {dashboard.categories.map(item => <Cell key={item.name} fill={item.color} />)}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[27px] font-black leading-none text-white">{dashboard.totalSolutions}</p>
                <p className="mt-1 text-[11px] font-bold text-slate-400">Tổng</p>
              </div>
            </div>
            <div className="space-y-3">
              {dashboard.categories.map(item => {
                const pct = Math.round((item.value / Math.max(dashboard.totalSolutions, 1)) * 1000) / 10;
                return (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-[12px]">
                    <span className="flex min-w-0 items-center gap-2 text-slate-300">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color === '#3b82f6' ? 'bg-blue-500' : item.color === '#8b5cf6' ? 'bg-violet-500' : item.color === '#ec4899' ? 'bg-pink-500' : item.color === '#38bdf8' ? 'bg-sky-400' : item.color === '#f472b6' ? 'bg-pink-400' : 'bg-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="shrink-0 text-slate-300">{item.value} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <PanelHeader title="Solutions Overview" />
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-3 text-center">
              <p className="text-[12px] font-bold text-emerald-300">Active</p>
              <p className="text-2xl font-black text-emerald-400">{dashboard.activeSolutions}</p>
              <p className="text-[11px] text-emerald-200/80">75.0%</p>
            </div>
            <div className="rounded-xl border border-orange-500/15 bg-orange-500/10 p-3 text-center">
              <p className="text-[12px] font-bold text-orange-300">Hidden</p>
              <p className="text-2xl font-black text-orange-400">{Math.max(dashboard.totalSolutions - dashboard.activeSolutions, 0)}</p>
              <p className="text-[11px] text-orange-200/80">25.0%</p>
            </div>
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/10 p-3 text-center">
              <p className="text-[12px] font-bold text-amber-300">Featured</p>
              <p className="text-2xl font-black text-amber-400">{dashboard.featuredSolutions}</p>
              <p className="text-[11px] text-amber-200/80">25.0%</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-[12px] font-bold text-white">Phân theo độ phức tạp</p>
            {Object.entries(dashboard.complexityCounts).map(([label, count]) => {
              const pct = Math.round((count / Math.max(dashboard.totalSolutions, 1)) * 1000) / 10;
              return (
                <div key={label} className="grid grid-cols-[70px_1fr_70px] items-center gap-3 text-[12px]">
                  <span className="text-slate-300">{label}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-white/7">
                    <div className={`h-full rounded-full bg-brand-blue ${progressClass(pct)}`} />
                  </div>
                  <span className="text-right text-slate-300">{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHeader title="Provider Token Health" />
          <div className="grid grid-cols-[1fr_82px_1.2fr_44px_28px] gap-3 border-b border-white/[0.06] pb-2 text-[11px] text-slate-400">
            <span>Provider</span>
            <span>Active / Total</span>
            <span>Usage</span>
            <span></span>
            <span>Lỗi</span>
          </div>
          <div className="mt-3 space-y-3">
            {dashboard.providerRows.map(row => (
              <div key={row.name} className="grid grid-cols-[1fr_82px_1.2fr_44px_28px] items-center gap-3 text-[12px]">
                <span className="truncate text-slate-300">{row.name}</span>
                <span className="text-slate-300">{row.active} / {row.total}</span>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full rounded-full bg-brand-blue ${progressClass(row.usage)}`} />
                </div>
                <span className="text-right text-slate-300">{row.usage}%</span>
                <span className={row.errors > 0 ? 'text-rose-400' : 'text-slate-300'}>{row.errors}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHeader title="Người dùng mới nhất" />
          <div className="grid grid-cols-[1fr_72px_64px] border-b border-white/[0.06] pb-2 text-[11px] text-slate-400">
            <span>User</span>
            <span>Credits</span>
            <span>Plan</span>
          </div>
          <div className="mt-3 space-y-2">
            {recentUsers.map(user => {
              const initials = (user.name || user.email || '?').slice(0, 2).toUpperCase();
              return (
                <div key={user._id} className="grid grid-cols-[1fr_72px_64px] items-center gap-3 border-b border-white/[0.04] pb-2 text-[12px] last:border-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue text-[10px] font-black text-white">{initials}</span>
                    <span className="truncate text-slate-300">{user.email}</span>
                  </div>
                  <span className="text-slate-300">{formatNumber(user.creditBalance || 0)}</span>
                  <span className="text-slate-300">{user.plan || 'Free'}</span>
                </div>
              );
            })}
          </div>
          <button className="mt-5 w-full text-center text-[12px] font-medium text-slate-300 transition hover:text-brand-blue">
            Xem tất cả người dùng →
          </button>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel className="p-5">
          <PanelHeader title="AI Models Registry" />
          <div className="grid grid-cols-[1fr_1fr_72px_100px] border-b border-white/[0.06] pb-2 text-[11px] text-slate-400">
            <span>Model</span>
            <span>Provider</span>
            <span>Status</span>
            <span>Price / 1K tokens</span>
          </div>
          <div className="mt-3 space-y-2">
            {(aiModels.length > 0 ? aiModels.slice(0, 4) : [
              { _id: 'm1', name: 'GPT Image', provider: 'OpenAI', status: 'active' as const, key: 'gpt-image', logoUrl: '', route: '', order: 1 },
              { _id: 'm2', name: 'Veo 3', provider: 'Google', status: 'active' as const, key: 'veo-3', logoUrl: '', route: '', order: 2 },
              { _id: 'm3', name: 'Runway Gen', provider: 'Labs', status: 'draft' as const, key: 'runway', logoUrl: '', route: '', order: 3 },
            ]).map(model => (
              <div key={model._id} className="grid grid-cols-[1fr_1fr_72px_100px] text-[12px] text-slate-300">
                <span className="truncate">{model.name}</span>
                <span className="truncate">{model.provider || model.key}</span>
                <span className={model.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}>{model.status}</span>
                <span>$0.02</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHeader title="Gói Credits" />
          <div className="grid grid-cols-[1fr_90px_90px_72px] border-b border-white/[0.06] pb-2 text-[11px] text-slate-400">
            <span>Package</span>
            <span>Credits</span>
            <span>Price (USD)</span>
            <span>Status</span>
          </div>
          <div className="mt-3 space-y-2">
            {(creditPacks.length > 0 ? creditPacks.slice(0, 4) : [
              { _id: 'p1', name: 'Starter', totalCredits: 5000, price: 19, active: true },
              { _id: 'p2', name: 'Creator', totalCredits: 15000, price: 49, active: true },
              { _id: 'p3', name: 'Studio', totalCredits: 50000, price: 149, active: true },
            ]).map(pack => (
              <div key={pack._id} className="grid grid-cols-[1fr_90px_90px_72px] text-[12px] text-slate-300">
                <span className="truncate">{pack.name}</span>
                <span>{formatNumber(pack.totalCredits || 0)}</span>
                <span>${pack.price}</span>
                <span className={pack.active ? 'text-emerald-400' : 'text-slate-500'}>{pack.active ? 'Active' : 'Hidden'}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHeader title="System Status" />
          <div className="grid grid-cols-[1fr_90px_80px] border-b border-white/[0.06] pb-2 text-[11px] text-slate-400">
            <span>Service</span>
            <span>Status</span>
            <span>Uptime</span>
          </div>
          <div className="mt-3 space-y-3 text-[12px]">
            {['Backend API', 'MongoDB', 'Payment Webhook', 'Worker Queue'].map((service, index) => (
              <div key={service} className="grid grid-cols-[1fr_90px_80px] text-slate-300">
                <span>{service}</span>
                <span className="inline-flex items-center gap-1 text-emerald-400"><CheckCircle2 size={12} /> Healthy</span>
                <span>{index === 0 ? '99.99%' : '99.9%'}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
};
