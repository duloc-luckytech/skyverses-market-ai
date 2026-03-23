
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, CheckCircle, Loader2, 
  User, Building2, Mail, Briefcase, Globe2, DollarSign, Clock,
  MessageSquare, Rocket, Code2, Palette, Bot, Shield,
  ArrowRight, Sparkles, Phone
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BookingPage = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    type: '',
    industry: '',
    budget: '',
    timeline: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate delay then open mailto
    await new Promise(resolve => setTimeout(resolve, 800));

    const recipient = "support@skyverses.com";
    const subject = `[Project Inquiry] ${formData.type || 'General'} - ${formData.company}`;
    const emailBody = `
Dear Skyverses Team,

A new project inquiry has been submitted.

--- PROJECT DETAILS ---
Full Name: ${formData.name}
Company/Studio: ${formData.company}
Work Email: ${formData.email}
Project Type: ${formData.type}
Industry: ${formData.industry}
Estimated Budget: ${formData.budget}
Target Timeline: ${formData.timeline}

--- DESCRIPTION & SCOPE ---
${formData.description}

-----------------------
Submitted via Skyverses Booking Portal.
`.trim();

    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;

    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 4000);
  };

  const services = [
    { icon: <Code2 size={20} />, title: t('booking.service.1.title'), desc: t('booking.service.1.desc'), color: 'text-brand-blue', bg: 'bg-brand-blue/8' },
    { icon: <Palette size={20} />, title: t('booking.service.2.title'), desc: t('booking.service.2.desc'), color: 'text-purple-500', bg: 'bg-purple-500/8' },
    { icon: <Bot size={20} />, title: t('booking.service.3.title'), desc: t('booking.service.3.desc'), color: 'text-emerald-500', bg: 'bg-emerald-500/8' },
  ];

  const processSteps = [
    t('booking.process.1'),
    t('booking.process.2'),
    t('booking.process.3'),
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] dark:bg-[#050507] text-slate-900 dark:text-white transition-colors duration-500 pt-28 pb-32">
      
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[30%] w-[800px] h-[500px] bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[500px] h-[500px] bg-purple-500/[0.02] dark:bg-purple-500/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1300px] mx-auto px-4 md:px-8 relative z-10">

        {/* ═══════════════ HERO ═══════════════ */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/8 dark:bg-brand-blue/15 border border-brand-blue/15 dark:border-brand-blue/25 rounded-full mb-6">
            <Rocket size={14} className="text-brand-blue" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-blue">Custom Solutions</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] mb-5">
            {t('booking.title.1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">
              {t('booking.title.2')}
            </span>
          </h1>
          
          <p className="text-base text-slate-400 dark:text-gray-500 leading-relaxed max-w-xl mx-auto mb-3">
            {t('booking.intro')}
          </p>
          <p className="text-xs text-slate-300 dark:text-gray-600 font-medium">
            {t('booking.partner')}
          </p>
        </motion.div>

        {/* ═══════════════ 2-COL LAYOUT ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* LEFT: Services + Process */}
          <motion.div 
            initial={{ opacity: 0, x: -15 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Services */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4 ml-1">Dịch vụ chúng tôi cung cấp</h3>
              <div className="space-y-3">
                {services.map((service, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] hover:border-brand-blue/20 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${service.bg} ${service.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      {service.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{service.title}</h4>
                      <p className="text-xs text-slate-400 dark:text-gray-500 leading-relaxed">{service.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-wider mb-4 ml-1">{t('booking.process.title')}</h3>
              <div className="space-y-4">
                {processSteps.map((step, i) => {
                  const parts = step.split('—');
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 text-xs font-black mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-gray-300">{parts[0]}</p>
                        {parts[1] && <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{parts.slice(1).join('—')}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
              {[
                { icon: <Shield size={14} />, text: 'NDA Available' },
                { icon: <Clock size={14} />, text: 'Phản hồi 24h' },
                { icon: <Sparkles size={14} />, text: '100+ Projects' },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-lg">
                  <span className="text-brand-blue">{badge.icon}</span>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-gray-500">{badge.text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="lg:col-span-3 bg-white dark:bg-[#0a0a0e] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden shadow-xl"
          >
            {/* Form Header */}
            <div className="px-6 md:px-8 py-6 border-b border-black/[0.04] dark:border-white/[0.04]">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('booking.form.title')}</h2>
              <p className="text-xs text-slate-400 dark:text-gray-500">{t('booking.form.subtitle')}</p>
            </div>

            {/* Success Banner */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-6 md:px-8 py-4 bg-emerald-500/5 border-b border-emerald-500/10">
                    <CheckCircle size={18} className="text-emerald-500" />
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Email client đã mở! Kiểm tra và gửi email.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
              {/* Row: Name + Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                    <User size={12} /> {t('booking.form.name')}
                  </label>
                  <input
                    required type="text" placeholder="VD: Nguyen Van A"
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                    <Building2 size={12} /> {t('booking.form.company')}
                  </label>
                  <input
                    required type="text" placeholder="VD: ABC Studio"
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600"
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                  <Mail size={12} /> {t('booking.form.email')}
                </label>
                <input
                  required type="email" placeholder="name@company.com"
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-600"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {/* Row: Type + Industry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                    <Briefcase size={12} /> {t('booking.form.type')}
                  </label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="" disabled>Chọn loại dự án</option>
                    <option>AI Tools & Automation</option>
                    <option>SaaS Application</option>
                    <option>Game Development</option>
                    <option>Art & Design</option>
                    <option>Full Production</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                    <Globe2 size={12} /> {t('booking.form.industry')}
                  </label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                  >
                    <option value="" disabled>Chọn lĩnh vực</option>
                    <option>Marketing / Agency</option>
                    <option>E-commerce</option>
                    <option>Game Studio</option>
                    <option>Startup</option>
                    <option>Enterprise</option>
                    <option>Education</option>
                    <option>Khác</option>
                  </select>
                </div>
              </div>

              {/* Row: Budget + Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                    <DollarSign size={12} /> {t('booking.form.budget')}
                  </label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                  >
                    <option value="" disabled>Chọn ngân sách</option>
                    <option>&lt; $5,000</option>
                    <option>$5,000 – $15,000</option>
                    <option>$15,000 – $30,000</option>
                    <option>$30,000+</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                    <Clock size={12} /> {t('booking.form.timeline')}
                  </label>
                  <select 
                    className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                    value={formData.timeline}
                    onChange={e => setFormData({...formData, timeline: e.target.value})}
                  >
                    <option value="" disabled>Chọn timeline</option>
                    <option>ASAP</option>
                    <option>1–2 tháng</option>
                    <option>3–6 tháng</option>
                    <option>Linh hoạt</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 ml-1">
                  <MessageSquare size={12} /> {t('booking.form.desc')}
                </label>
                <textarea
                  required rows={4}
                  placeholder="Mô tả chi tiết dự án: mục tiêu, phạm vi, kỹ thuật mong muốn..."
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-slate-800 dark:text-white resize-none placeholder:text-slate-300 dark:placeholder:text-gray-600"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 shadow-lg shadow-brand-blue/20"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Đang xử lý...</>
                  ) : (
                    <><Send size={16} /> {t('booking.form.submit')}</>
                  )}
                </button>
              </div>

              <p className="text-center text-[10px] text-slate-300 dark:text-gray-600">
                {t('booking.form.footer')}
              </p>
            </form>
          </motion.div>
        </div>

        {/* ═══════════════ CONTACT STRIP ═══════════════ */}
        <motion.div 
          initial={{ opacity: 0 }} 
          whileInView={{ opacity: 1 }} 
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-xs text-slate-400 dark:text-gray-500 mb-3">Hoặc liên hệ trực tiếp</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href="mailto:support@skyverses.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-brand-blue hover:border-brand-blue/20 transition-all">
              <Mail size={16} /> support@skyverses.com
            </a>
            <a href="tel:+84123456789" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-sm font-bold text-slate-600 dark:text-gray-400 hover:text-brand-blue hover:border-brand-blue/20 transition-all">
              <Phone size={16} /> Hotline
            </a>
          </div>
        </motion.div>

      </div>
    </main>
  );
};

export default BookingPage;
