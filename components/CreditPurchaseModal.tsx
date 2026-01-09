
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Zap, Check, ArrowRight, QrCode, 
  CreditCard, Loader2, ShieldCheck, 
  Clock, Smartphone, Info, BadgeCheck,
  ChevronLeft, Coins, Landmark, Copy,
  Globe, Wallet, Mail, User, Building2,
  SmartphoneNfc, Sparkles, Star, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { creditsApi, CreditPackage } from '../apis/credits';

interface BankOption {
  id: string;
  name: string;
  fullName: string;
  accountNumber: string;
  accountName: string;
  logo: string;
}

const BANK_OPTIONS: BankOption[] = [
  {
    id: 'mb',
    name: 'MB Bank',
    fullName: 'Ngân hàng Quân Đội',
    accountNumber: '0123 4567 8999',
    accountName: 'SKYVERSES TECHNOLOGY SOUL',
    logo: 'https://img.mservice.com.vn/app/v2/img/pay_checkout/mb_bank.png'
  },
  {
    id: 'vcb',
    name: 'Vietcombank',
    fullName: 'Ngân hàng Ngoại Thương',
    accountNumber: '1012345678',
    accountName: 'SKYVERSES TECHNOLOGY SOUL',
    logo: 'https://img.mservice.com.vn/app/v2/img/pay_checkout/vcb.png'
  }
];

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPack?: CreditPackage | null;
}

const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({ isOpen, onClose, initialPack }) => {
  const { addCredits, refreshUserInfo, user, credits } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(initialPack ? 2 : 1);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [selectedPack, setSelectedPack] = useState<any>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'MOMO' | 'PAYPAL'>('BANK');
  const [selectedBank, setSelectedBank] = useState<BankOption>(BANK_OPTIONS[0]);
  const [status, setStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS'>('IDLE');
  const [timer, setTimer] = useState(900); // 15:00

  // Fetch packages from API
  const fetchPackages = async () => {
    setLoadingPacks(true);
    try {
      const res = await creditsApi.getAdminPackages();
      if (res.data) {
        setPackages(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
      }
    } catch (error) {
      console.error("Failed to load credit packages:", error);
    }
    setLoadingPacks(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchPackages();
      if (initialPack) {
        setSelectedPack({
          id: initialPack._id,
          name: initialPack.name,
          credits: initialPack.totalCredits || initialPack.credits,
          price: `${initialPack.price.toLocaleString()} ${initialPack.currency}`,
          usdPrice: `$${initialPack.price}`, 
          description: initialPack.description || ''
        });
        setStep(2);
      } else {
        setStep(1);
        setSelectedPack(null);
      }
      setStatus('IDLE');
      setTimer(900);
    }
  }, [isOpen, initialPack]);

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0 && status === 'IDLE') {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer, status]);

  const handleSelectPack = (pack: CreditPackage) => {
    setSelectedPack({
      id: pack._id,
      name: pack.name,
      credits: pack.totalCredits || pack.credits,
      price: `${pack.price.toLocaleString()} ${pack.currency}`,
      usdPrice: `$${pack.price}`, 
      description: pack.description || ''
    });
    setStep(2);
    setTimer(900);
  };

  const handlePaid = async () => {
    setStatus('VERIFYING');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (selectedPack) {
      addCredits(selectedPack.credits);
      await refreshUserInfo();
      setStatus('SUCCESS');
      setTimeout(() => {
        onClose();
        setStep(1);
        setStatus('IDLE');
        setSelectedPack(null);
      }, 2000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const paymentMemo = `SKY ${user?.email?.split('@')[0] || 'USER'} ${selectedPack?.credits}CR`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-5xl bg-white dark:bg-[#0c0c0e] rounded-3xl md:rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-3xl overflow-hidden flex flex-col md:flex-row h-full md:h-auto max-h-full md:max-h-[90vh] md:min-h-[650px] transition-colors duration-500"
      >
        {/* Cột trái: Thông tin tài khoản & Tiến trình */}
        <div className="w-full md:w-[320px] bg-slate-50 dark:bg-black/40 p-4 md:p-10 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 flex flex-col shrink-0">
           <div className="space-y-4 md:space-y-10">
              <div className="flex items-center justify-between md:justify-start gap-3">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-blue rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-blue/20">
                       <Zap size={16} className="md:w-5 md:h-5" fill="currentColor" />
                    </div>
                    <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">Hệ thống Nạp</h2>
                 </div>
                 <button onClick={onClose} className="md:hidden p-2 text-gray-400 hover:text-red-500">
                    <X size={20} />
                 </button>
              </div>

              <div className="hidden md:block p-5 bg-white dark:bg-black/20 border border-black/5 dark:border-white/10 rounded-2xl space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center text-gray-500">
                       <User size={16} />
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-[8px] font-black uppercase text-gray-400">Node Authenticated</p>
                       <p className="text-[10px] font-bold truncate text-slate-700 dark:text-gray-300">{user?.email}</p>
                    </div>
                 </div>
                 <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-400">Credits khả dụng</span>
                    <span className="text-sm font-black text-brand-blue italic">{(credits || 0).toLocaleString()} CR</span>
                 </div>
              </div>

              <div className="flex md:flex-col gap-4 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar pb-1 md:pb-0">
                 {[
                   { s: 1, t: 'Gói giải pháp', d: 'Lựa chọn dung lượng Node.' },
                   { s: 2, t: 'Thanh toán', d: 'Xác thực lệnh nạp Uplink.' }
                 ].map(item => (
                   <div key={item.s} className={`flex gap-3 md:gap-4 items-center md:items-start shrink-0 transition-all duration-500 ${step === item.s ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-[11px] font-black border-2 ${step === item.s ? 'bg-brand-blue border-brand-blue text-white shadow-lg' : 'border-gray-400 text-gray-400'}`}>
                         {item.s}
                      </div>
                      <div className="space-y-0.5">
                         <h4 className="text-[11px] md:text-[12px] font-black uppercase tracking-widest">{item.t}</h4>
                         <p className="hidden md:block text-[9px] font-bold text-gray-500 uppercase">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="hidden md:block mt-auto p-6 bg-brand-blue/5 border border-brand-blue/20 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-brand-blue">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] font-black uppercase italic">Safe_Vault_v4.2</span>
              </div>
              <p className="text-[9px] text-gray-500 font-bold uppercase leading-relaxed italic">
                 "Giao dịch của bạn được mã hóa và xác thực tự động bởi hệ thống ngân hàng liên kết."
              </p>
           </div>
        </div>

        {/* Cột phải: Nội dung chính */}
        <div className="flex-grow flex flex-col relative overflow-hidden bg-white dark:bg-[#0c0c0e]">
           <button onClick={onClose} className="hidden md:flex absolute top-8 right-8 p-2 text-gray-400 hover:text-red-500 transition-colors z-[110]">
              <X size={24} />
           </button>

           <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 md:p-10 lg:p-16 space-y-4 md:space-y-10 flex flex-col h-full overflow-y-auto no-scrollbar">
                   <div className="space-y-1 md:space-y-2">
                      <h3 className="text-xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Nâng cấp <span className="text-brand-blue">Compute.</span></h3>
                      <p className="text-gray-500 text-[10px] md:text-sm font-medium">Lựa chọn gói nạp để duy trì hạ tầng sáng tạo AI của bạn.</p>
                   </div>

                   <div className="space-y-2 md:space-y-4 pr-1">
                      {loadingPacks ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                           <Loader2 className="animate-spin text-brand-blue" size={32} />
                           <p className="text-[10px] font-black uppercase tracking-[0.4em]">Đang nạp dữ liệu từ Registry...</p>
                        </div>
                      ) : (
                        packages.map(pack => (
                          <button 
                            key={pack._id} onClick={() => handleSelectPack(pack)}
                            className="group w-full flex items-center justify-between p-3 md:p-6 bg-white dark:bg-[#141416] border border-black/5 dark:border-white/5 hover:border-brand-blue/50 transition-all rounded-xl md:rounded-[1.5rem] text-left hover:shadow-2xl active:scale-[0.99] relative overflow-hidden"
                          >
                             {pack.popular && (
                               <div className="absolute top-0 right-0 px-2 md:px-4 py-0.5 md:py-1 bg-[#dfff1a] text-black text-[6px] md:text-[8px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">PHỔ BIẾN</div>
                             )}
                             <div className="flex items-center gap-3 md:gap-6 relative z-10">
                                <div className="w-8 h-8 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all shadow-inner">
                                   <Coins size={16} className="md:w-7 md:h-7" />
                                </div>
                                <div className="space-y-0.5 md:space-y-1">
                                   <div className="flex items-center gap-2 md:gap-3">
                                      <h4 className="text-xs md:text-xl font-black uppercase italic tracking-tighter leading-none">{pack.name}</h4>
                                      {pack.badge && <span className="bg-pink-600 text-white text-[6px] md:text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-lg">{pack.badge}</span>}
                                   </div>
                                   <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase italic line-clamp-1">{pack.description}</p>
                                </div>
                             </div>
                             <div className="text-right relative z-10 shrink-0 ml-2">
                                <div className="flex items-center justify-end gap-1 md:gap-2 text-brand-blue leading-none">
                                   <Sparkles size={10} fill="currentColor" className="md:w-3.5 md:h-3.5" />
                                   <p className="text-sm md:text-2xl font-black italic">{(pack.totalCredits || pack.credits).toLocaleString()}</p>
                                </div>
                                <p className="text-[8px] md:text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mt-0.5 md:mt-1 tracking-widest">{pack.price.toLocaleString()} {pack.currency}</p>
                             </div>
                          </button>
                        ))
                      )}
                   </div>

                   <div className="pt-4 md:pt-6 border-t border-black/5 dark:border-white/10 flex justify-between items-center text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest italic mt-auto pb-4 md:pb-0">
                      <span className="flex items-center gap-1.5 md:gap-2"><CheckCircle2 size={10} className="text-brand-blue md:w-3 md:h-3" /> Cloud_Sync_Uplink</span>
                      <span className="hidden sm:inline">Hỗ trợ 24/7 qua Live Agent</span>
                   </div>
                </motion.div>
              ) : (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-5 md:p-10 lg:p-16 flex flex-col items-center justify-center text-center h-full relative overflow-y-auto no-scrollbar">
                   {status === 'SUCCESS' ? (
                      <div className="space-y-8 animate-in zoom-in duration-500">
                         <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl dark:shadow-emerald-500/20">
                            <BadgeCheck size={36} className="md:w-14 md:h-14" strokeWidth={2.5} />
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-xl md:text-4xl font-black uppercase italic tracking-tighter">Nạp thành công</h3>
                            <p className="text-gray-500 font-medium text-[10px] md:text-sm">Credits đã được đồng bộ vào tài khoản Node của bạn.</p>
                         </div>
                      </div>
                   ) : (
                      <div className="w-full space-y-4 md:space-y-8">
                        {!initialPack && (
                          <button onClick={() => setStep(1)} className="absolute top-3 left-4 md:top-8 md:left-8 p-1 text-gray-400 hover:text-brand-blue transition-all flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest">
                             <ChevronLeft size={12} className="md:w-4 md:h-4" /> Quay lại
                          </button>
                        )}

                        <div className="flex bg-slate-100 dark:bg-black/40 p-1 rounded-lg border border-black/5 dark:border-white/10 w-full max-w-md mx-auto">
                           <button onClick={() => setPaymentMethod('BANK')} className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 rounded-lg text-[8px] md:text-[10px] font-black uppercase transition-all ${paymentMethod === 'BANK' ? 'bg-white dark:bg-[#1a1a1e] text-brand-blue shadow-lg' : 'text-gray-500'}`}><Landmark size={10} className="md:w-3.5 md:h-3.5" /> Chuyển khoản</button>
                           <button onClick={() => setPaymentMethod('MOMO')} className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 rounded-lg text-[8px] md:text-[10px] font-black uppercase transition-all ${paymentMethod === 'MOMO' ? 'bg-white dark:bg-[#1a1a1e] text-pink-600 shadow-lg' : 'text-gray-500'}`}><SmartphoneNfc size={10} className="md:w-3.5 md:h-3.5" /> Ví Momo</button>
                           <button onClick={() => setPaymentMethod('PAYPAL')} className={`flex-1 flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 rounded-lg text-[8px] md:text-[10px] font-black uppercase transition-all ${paymentMethod === 'PAYPAL' ? 'bg-white dark:bg-[#1a1a1e] text-blue-600 shadow-lg' : 'text-gray-500'}`}><Globe size={10} className="md:w-3.5 md:h-3.5" /> PayPal</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-10 w-full items-start">
                           <div className="space-y-3 md:space-y-6">
                              <div className="text-left p-4 md:p-6 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl space-y-0.5">
                                 <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Số tiền</p>
                                 <h3 className={`text-xl md:text-4xl font-black italic tracking-tighter ${paymentMethod === 'MOMO' ? 'text-pink-600' : 'text-brand-blue'}`}>
                                    {paymentMethod === 'PAYPAL' ? selectedPack?.usdPrice : selectedPack?.price}
                                 </h3>
                                 <div className="flex items-center gap-1.5 pt-1 text-gray-400">
                                    <Clock size={8} className="md:w-3 md:h-3" />
                                    <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">Hết hạn: <span className="text-orange-500">{formatTime(timer)}</span></span>
                                 </div>
                              </div>

                              <div className="space-y-2 md:space-y-4">
                                 {paymentMethod === 'BANK' && (
                                    <div className="p-3 md:p-6 bg-slate-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 rounded-xl text-left shadow-sm">
                                       <div className="flex items-center justify-between mb-1.5">
                                          <div className="flex items-center gap-1.5 text-slate-400">
                                             <Building2 size={10} />
                                             <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">{selectedBank.fullName}</span>
                                          </div>
                                          <button onClick={() => setSelectedBank(selectedBank.id === 'mb' ? BANK_OPTIONS[1] : BANK_OPTIONS[0])} className="text-[7px] font-black text-brand-blue uppercase hover:underline">Đổi</button>
                                       </div>
                                       <div className="space-y-0.5">
                                          <p className="text-xs md:text-[16px] font-black text-brand-blue tracking-widest select-all">{selectedBank.accountNumber}</p>
                                          <p className="text-[8px] md:text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase italic truncate">{selectedBank.accountName}</p>
                                       </div>
                                    </div>
                                 )}

                                 {paymentMethod === 'MOMO' && (
                                    <div className="p-3 md:p-6 bg-pink-500/5 border border-pink-500/20 rounded-xl space-y-1.5 text-left">
                                       <div className="flex items-center gap-1.5 text-pink-600 mb-0.5">
                                          <Smartphone size={10} />
                                          <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">Hệ thống ví MoMo</span>
                                       </div>
                                       <div className="space-y-0.5">
                                          <p className="text-xs md:text-[16px] font-black text-pink-600 tracking-widest">0987 654 321</p>
                                          <p className="text-[8px] md:text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase italic">SKYVERSES TECHNOLOGY</p>
                                       </div>
                                    </div>
                                 )}

                                 <div className="p-3 md:p-6 border border-orange-500/20 bg-orange-500/5 rounded-xl text-left space-y-0.5 relative group shadow-sm transition-all hover:bg-orange-500/10">
                                    <div className="flex items-center gap-1.5 text-orange-500">
                                       <Info size={10} />
                                       <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">Memo</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                       <p className="text-sm md:text-xl font-black text-orange-600 dark:text-orange-400 tracking-tight italic select-all cursor-copy">{paymentMemo}</p>
                                       <button onClick={() => copyToClipboard(paymentMemo)} className="p-1 text-orange-500 hover:scale-110 transition-transform bg-white/50 dark:bg-black/20 rounded-md"><Copy size={12} /></button>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col items-center gap-3">
                              {paymentMethod !== 'PAYPAL' ? (
                                 <div className="relative group p-3 md:p-6 bg-white border border-black/10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-3xl overflow-hidden transition-all hover:scale-102 w-full max-w-[180px] md:max-w-none">
                                    {status === 'VERIFYING' && (
                                      <div className="absolute inset-0 z-10 bg-white/95 dark:bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2 animate-in fade-in duration-300">
                                         <Loader2 className="animate-spin text-brand-blue" size={24} />
                                         <p className="text-[8px] font-black uppercase tracking-[0.4em] text-brand-blue animate-pulse">Checking...</p>
                                      </div>
                                    )}
                                    <img 
                                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SKYPEVERS_PAYMENT_${paymentMethod}_${selectedPack?.id}_${Date.now()}`} 
                                      className={`w-full aspect-square transition-all duration-700 ${status === 'VERIFYING' ? 'blur-md scale-95 opacity-20' : 'group-hover:scale-105'}`} 
                                      alt="Payment QR" 
                                    />
                                    <div className="mt-2 pt-2 border-t border-black/5 text-center">
                                       <p className="text-[6px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest">Quét mã để thanh toán</p>
                                    </div>
                                 </div>
                              ) : (
                                 <div className="w-full aspect-square flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-12 shadow-inner">
                                    <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl animate-pulse"><Globe size={24} className="md:w-10 md:h-10" /></div>
                                    <div className="space-y-2">
                                       <p className="text-[8px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">Vui lòng thanh toán số tiền <span className="text-blue-600 font-black">{selectedPack?.usdPrice}</span> và đính kèm Memo.</p>
                                       <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 transition-all">PayPal Checkout</button>
                                    </div>
                                 </div>
                              )}
                           </div>
                        </div>

                        <div className="w-full max-w-sm pt-2 mx-auto pb-6 md:pb-0">
                           <button 
                             onClick={handlePaid} 
                             disabled={status === 'VERIFYING'} 
                             className={`w-full py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 relative overflow-hidden text-white ${paymentMethod === 'MOMO' ? 'bg-pink-600 shadow-pink-600/20' : 'bg-brand-blue shadow-brand-blue/20'}`}
                           >
                              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                              {status === 'VERIFYING' ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" />}
                              XÁC NHẬN ĐÃ THANH TOÁN
                           </button>
                        </div>
                      </div>
                   )}
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreditPurchaseModal;
