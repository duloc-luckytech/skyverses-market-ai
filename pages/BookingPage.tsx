
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BookingPage = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    type: 'Project Type',
    industry: 'Industry',
    budget: 'Estimated Budget',
    timeline: 'Target Timeline',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Cấu trúc nội dung Email
    const recipient = "support@skyverses.com";
    const subject = `[Project Inquiry] ${formData.type} - ${formData.company}`;
    
    const emailBody = `
Dear Skyverses Soul Production Team,

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
Submitted via Skyverses Portal.
`.trim();

    // 2. Tạo mailto link và kích hoạt mở App Email
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Mở ứng dụng email trên máy tính
    window.location.href = mailtoLink;
  };

  const inputClasses = "w-full bg-neutral-100 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-brand-blue/50 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-black dark:text-white";

  return (
    <main className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white transition-colors duration-500 pt-32 pb-40">
      <section className="max-w-7xl mx-auto px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">

        {/* LEFT COLUMN – STUDIO INTRO */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          {/* Headline */}
          <header className="space-y-8">
            <h1 className="text-6xl lg:text-7xl font-black leading-[0.9] uppercase tracking-tighter italic">
              {t('booking.title.1')} <br />
              <span className="text-brand-blue">{t('booking.title.2')}</span>
            </h1>

            <div className="space-y-6 max-w-xl">
              <p className="text-xl text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed italic">
                “{t('booking.intro')}”
              </p>
              <p className="text-base text-neutral-500 dark:text-neutral-500 font-medium leading-relaxed uppercase tracking-wider">
                {t('booking.partner')}
              </p>
            </div>
          </header>

          {/* Services */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-400 dark:text-neutral-600">
              {t('booking.services.title')}
            </h3>

            <ul className="space-y-8">
              {[
                { title: t('booking.service.1.title'), desc: t('booking.service.1.desc') },
                { title: t('booking.service.2.title'), desc: t('booking.service.2.desc') },
                { title: t('booking.service.3.title'), desc: t('booking.service.3.desc') }
              ].map((service, idx) => (
                <li key={idx} className="group space-y-2 border-l-2 border-transparent hover:border-brand-blue pl-6 transition-all">
                  <h4 className="font-black text-xl uppercase italic tracking-tight group-hover:text-brand-blue transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium leading-relaxed">
                    {service.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Process */}
          <div className="space-y-10">
            <h3 className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-400 dark:text-neutral-600">
              {t('booking.process.title')}
            </h3>

            <div className="space-y-6">
              {[
                t('booking.process.1'),
                t('booking.process.2'),
                t('booking.process.3')
              ].map((p, i) => {
                const parts = p.split('—');
                const bold = parts[0];
                const rest = parts.slice(1).join('—');
                return (
                  <div key={i} className="flex gap-4 items-start text-neutral-700 dark:text-neutral-300">
                    <span className="text-brand-blue font-black italic">0{i+1}</span>
                    <p className="text-sm font-medium leading-relaxed uppercase tracking-tight">
                      <strong className="text-black dark:text-white">{bold}</strong> — {rest}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery */}
          <div className="pt-10 border-t border-neutral-100 dark:border-white/5 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-neutral-400 dark:text-neutral-600 italic">
            <ShieldCheck size={16} className="text-brand-blue" />
            <span>{t('booking.footer.tags')}</span>
          </div>
        </motion.div>

        {/* RIGHT COLUMN – PROJECT FORM */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-neutral-50 dark:bg-[#080808] rounded-2xl p-8 lg:p-12 shadow-2xl border border-neutral-100 dark:border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue"></div>
          
          <div className="space-y-12 relative z-10">
            <header className="space-y-4">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                {t('booking.form.title')}
              </h2>
              <p className="text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-widest text-xs">
                {t('booking.form.subtitle')}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.name')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    className={inputClasses}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.company')}</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Void Studios"
                    className={inputClasses}
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.email')}</label>
                <input
                  required
                  type="email"
                  placeholder="alex@voidstudios.com"
                  className={inputClasses}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.type')}</label>
                   <select 
                     className={inputClasses}
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value})}
                   >
                    <option disabled>{t('booking.form.type')}</option>
                    <option>Game Development</option>
                    <option>Art & Design</option>
                    <option>AI Tools & Automation</option>
                    <option>Full Production</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.industry')}</label>
                   <select 
                     className={inputClasses}
                     value={formData.industry}
                     onChange={e => setFormData({...formData, industry: e.target.value})}
                   >
                    <option disabled>{t('booking.form.industry')}</option>
                    <option>Game Studio</option>
                    <option>Brand / Marketing</option>
                    <option>Startup</option>
                    <option>Enterprise</option>
                    <option>Other</option>
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.budget')}</label>
                   <select 
                     className={inputClasses}
                     value={formData.budget}
                     onChange={e => setFormData({...formData, budget: e.target.value})}
                   >
                    <option disabled>{t('booking.form.budget')}</option>
                    <option>&lt; $10k</option>
                    <option>$10k – $30k</option>
                    <option>$30k – $60k</option>
                    <option>$60k+</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.timeline')}</label>
                   <select 
                     className={inputClasses}
                     value={formData.timeline}
                     onChange={e => setFormData({...formData, timeline: e.target.value})}
                   >
                    <option disabled>{t('booking.form.timeline')}</option>
                    <option>ASAP</option>
                    <option>1–2 Months</option>
                    <option>3–6 Months</option>
                    <option>Flexible</option>
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 ml-2 tracking-widest">{t('booking.form.desc')}</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tell us about the scope, timeline, and goals..."
                  className={`${inputClasses} resize-none`}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="pt-4 space-y-6">
                <button
                  type="submit"
                  className="w-full py-6 rounded-xl bg-brand-blue text-white font-black uppercase tracking-[0.3em] hover:brightness-110 shadow-2xl shadow-brand-blue/20 transition-all flex items-center justify-center gap-4 group"
                >
                  {t('booking.form.submit')}
                  <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>

                <p className="text-[10px] text-neutral-500 text-center font-black uppercase tracking-widest italic">
                  {t('booking.form.footer')}
                </p>
              </div>

            </form>
          </div>
        </motion.div>

      </section>
    </main>
  );
};

export default BookingPage;
