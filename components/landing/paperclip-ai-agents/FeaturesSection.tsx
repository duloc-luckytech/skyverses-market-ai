import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, DollarSign, ShieldCheck, Globe,
  Zap, GitBranch, Eye, RefreshCw,
} from 'lucide-react';
import { FadeInUp, StaggerChildren, HoverCard, SectionLabel } from '../_shared/SectionAnimations';
import { PAPERCLIP_CDN } from '../../../src/constants/paperclip-cdn';

const FEATURES = [
  {
    icon: Network,
    title: 'Multi-Agent Orchestration',
    desc: 'CEO Agent tự phân công tasks cho department agents. Marketing AI viết copy & chạy ads, DevOps AI deploy code, Sales AI outreach khách hàng — đồng thời, autonomous.',
    featured: true,
    img: PAPERCLIP_CDN.featMultiAgent,
  },
  {
    icon: DollarSign,
    title: 'Budget Guard',
    desc: 'Hard spend limits per agent, per department, per project. Khi agent sắp hết budget — tự động pause, alert và chờ approval. Zero surprise billing.',
    featured: true,
    img: PAPERCLIP_CDN.featBudgetGuard,
  },
  {
    icon: ShieldCheck,
    title: 'Governance & Audit',
    desc: 'Human-in-the-loop cho decisions quan trọng. Toàn bộ agent actions, prompts, outputs được log với timestamp.',
    featured: false,
    img: undefined,
  },
  {
    icon: Globe,
    title: 'Self-hosted / Cloud',
    desc: 'Deploy trên server của bạn hoặc dùng managed cloud. Data không bao giờ rời khỏi infrastructure của bạn.',
    featured: false,
    img: undefined,
  },
  {
    icon: Zap,
    title: 'Real-time Dashboard',
    desc: 'Xem toàn bộ org hoạt động live: agent nào đang chạy, task nào đang process, cost theo giờ.',
    featured: false,
    img: undefined,
  },
  {
    icon: GitBranch,
    title: 'Workflow Builder',
    desc: 'Kéo-thả để tạo multi-step automation. Agents tự pass output cho nhau, tự retry khi fail.',
    featured: false,
    img: undefined,
  },
  {
    icon: Eye,
    title: 'Prompt Inspector',
    desc: 'Xem chính xác prompt nào agent đang gửi tới LLM. Debug và optimize từng node trong workflow.',
    featured: false,
    img: undefined,
  },
  {
    icon: RefreshCw,
    title: 'Auto Failover',
    desc: 'Nếu một LLM provider down — tự động failover sang provider khác. Zero downtime cho org của bạn.',
    featured: false,
    img: undefined,
  },
];

export const FeaturesSection: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section className="py-20 px-6 lg:px-12 border-t border-black/[0.06] dark:border-white/[0.04]">
      <div className="max-w-[1400px] mx-auto">
        <FadeInUp className="mb-10">
          <SectionLabel>TÍNH NĂNG</SectionLabel>
          <h2 className="text-3xl font-bold mt-2">Platform đủ mạnh để chạy cả công ty</h2>
          <p className="text-sm text-slate-500 dark:text-[#666] mt-2 max-w-lg">
            Mọi thứ bạn cần để orchestrate AI agents ở quy mô enterprise — mà vẫn open source, miễn phí.
          </p>
        </FadeInUp>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={f.featured ? 'col-span-2' : 'col-span-1'}
            >
            <HoverCard
              className={`bg-black/[0.01] dark:bg-white/[0.015] cursor-pointer h-full overflow-hidden`}
            >
              <div onClick={() => setExpanded(expanded === f.title ? null : f.title)} className="h-full flex flex-col">
              {/* Featured header accent */}
              {f.featured && (
                <div
                  className="h-1 w-full flex-none"
                  style={{
                    background: 'linear-gradient(90deg, #0090ff 0%, #3b82f6 100%)',
                    opacity: 0.6,
                  }}
                />
              )}
              {/* Featured image */}
              {f.featured && f.img && (
                <div className="w-full flex-none overflow-hidden" style={{ height: '180px' }}>
                  <img
                    src={f.img}
                    alt={f.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-5 flex-1">
                <motion.div
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <f.icon size={22} className="text-brand-blue mb-3" />
                </motion.div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                  {f.featured && (
                    <span className="shrink-0 text-[8px] font-bold px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue border border-brand-blue/20 uppercase tracking-wider">
                      Core
                    </span>
                  )}
                </div>

                <AnimatePresence initial={false}>
                  <motion.p
                    key="desc"
                    initial={false}
                    className="text-[12px] text-slate-500 dark:text-[#666] leading-relaxed"
                  >
                    {f.desc}
                  </motion.p>
                </AnimatePresence>
              </div>
              </div>
            </HoverCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
