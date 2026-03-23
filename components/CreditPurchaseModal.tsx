
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Check, ArrowRight, 
  CreditCard, Loader2, ShieldCheck, 
  Clock, Info, CheckCircle,
  ChevronLeft, Landmark, Copy,
  Globe, SmartphoneNfc, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { creditsApi, CreditPackage } from '../apis/credits';

const USD_TO_VND = 26000;
const formatVND = (usd: number) => Math.round(usd * USD_TO_VND).toLocaleString('vi-VN');

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
  const [timer, setTimer] = useState(900);
  const [copied, setCopied] = useState<string | null>(null);

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
      vndPrice: `${formatVND(pack.price)}₫`,
      rawUsdPrice: pack.price,
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

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c10] border border-black/[0.06] dark:border-white/[0.06] rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 md:px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && !initialPack && (
              <button onClick={() => setStep(1)} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 transition-all">
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {step === 1 ? 'Nạp Credits' : 'Thanh toán'}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-500">
                {step === 1 ? 'Chọn gói phù hợp với nhu cầu' : selectedPack?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Credits Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg">
              <Sparkles size={12} className="text-brand-blue" fill="currentColor" />
              <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{(credits || 0).toLocaleString()}</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="px-5 md:px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-3 shrink-0">
          {[
            { s: 1, label: 'Chọn gói' },
            { s: 2, label: 'Thanh toán' },
          ].map((item, idx) => (
            <React.Fragment key={item.s}>
              <div className={`flex items-center gap-2 ${step >= item.s ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step > item.s ? 'bg-emerald-500 text-white' : step === item.s ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}>
                  {step > item.s ? <Check size={12} strokeWidth={3} /> : item.s}
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{item.label}</span>
              </div>
              {idx === 0 && <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" />}
            </React.Fragment>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 md:p-6 space-y-3">
                {loadingPacks ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-brand-blue" size={28} />
                    <p className="text-xs font-bold text-slate-400">Đang tải gói credits...</p>
                  </div>
                ) : (
                  packages.map((pack, idx) => {
                    const isPopular = pack.popular;
                    return (
                      <button 
                        key={pack._id} 
                        onClick={() => handleSelectPack(pack)}
                        className={`group w-full flex items-center justify-between p-4 md:p-5 border rounded-xl text-left transition-all active:scale-[0.99] ${
                          isPopular 
                            ? 'bg-brand-blue/[0.03] border-brand-blue/25 hover:border-brand-blue/50 hover:shadow-lg' 
                            : 'bg-white dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] hover:border-brand-blue/30 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center ${
                            isPopular ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-50 dark:bg-white/[0.03] text-slate-400 group-hover:text-brand-blue'
                          } transition-colors`}>
                            <Sparkles size={18} fill="currentColor" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-white">{pack.name}</h4>
                              {isPopular && <span className="px-1.5 py-0.5 bg-brand-blue text-white text-[7px] font-bold rounded">HOT</span>}
                              {pack.badge && <span className="px-1.5 py-0.5 bg-pink-500/10 text-pink-500 text-[7px] font-bold rounded border border-pink-500/20">{pack.badge}</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-gray-500 line-clamp-1">{pack.description}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-lg font-black text-brand-blue tracking-tight">{(pack.totalCredits || pack.credits).toLocaleString()}</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-gray-300">{formatVND(pack.price)}₫</p>
                          <p className="text-[9px] text-slate-400">${pack.price}</p>
                        </div>
                      </button>
                    );
                  })
                )}

                {/* Trust */}
                <div className="flex items-center justify-center gap-4 pt-3 text-slate-300 dark:text-gray-600">
                  <div className="flex items-center gap-1"><ShieldCheck size={12} /> <span className="text-[9px] font-bold">An toàn</span></div>
                  <div className="flex items-center gap-1"><Clock size={12} /> <span className="text-[9px] font-bold">Tự động</span></div>
                  <div className="flex items-center gap-1"><Zap size={12} /> <span className="text-[9px] font-bold">Tức thì</span></div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 md:p-6">
                {status === 'SUCCESS' ? (
                  <div className="py-16 flex flex-col items-center justify-center gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle size={32} className="text-emerald-500" />
                      </div>
                    </motion.div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">Nạp thành công!</p>
                      <p className="text-sm text-slate-400 mt-1">+{selectedPack?.credits.toLocaleString()} credits</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Payment Method Tabs */}
                    <div className="flex p-1 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
                      {[
                        { id: 'BANK' as const, label: 'Chuyển khoản', icon: <Landmark size={14} />, disabled: false },
                        { id: 'MOMO' as const, label: 'MoMo', icon: <SmartphoneNfc size={14} />, disabled: true },
                        { id: 'PAYPAL' as const, label: 'PayPal', icon: <Globe size={14} />, disabled: true },
                      ].map(method => (
                        <button 
                          key={method.id}
                          onClick={() => !method.disabled && setPaymentMethod(method.id)}
                          disabled={method.disabled}
                          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                            method.disabled
                              ? 'opacity-30 cursor-not-allowed'
                              : paymentMethod === method.id 
                                ? 'bg-white dark:bg-[#1a1a1e] text-slate-900 dark:text-white shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">{method.icon} {method.label}</span>
                          {method.disabled && <span className="text-[8px] font-medium text-slate-400">Sắp ra mắt</span>}
                        </button>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Số tiền thanh toán</p>
                        {paymentMethod === 'PAYPAL' ? (
                          <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{selectedPack?.usdPrice}</p>
                        ) : (
                          <>
                            <p className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{selectedPack?.vndPrice}</p>
                            <p className="text-xs text-slate-400 mt-1">≈ {selectedPack?.usdPrice} • Tỷ giá 1$ = {USD_TO_VND.toLocaleString()}₫</p>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nhận được</p>
                        <p className="text-2xl md:text-3xl font-black text-brand-blue">{selectedPack?.credits.toLocaleString()} <span className="text-sm font-bold text-brand-blue/50">CR</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left: Bank Info + Memo */}
                      <div className="space-y-3">
                        {paymentMethod === 'BANK' && (
                          <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-400">{selectedBank.fullName}</span>
                              <button onClick={() => setSelectedBank(selectedBank.id === 'mb' ? BANK_OPTIONS[1] : BANK_OPTIONS[0])} className="text-[10px] font-bold text-brand-blue hover:underline">Đổi NH</button>
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <p className="text-base font-black text-slate-900 dark:text-white tracking-wider">{selectedBank.accountNumber}</p>
                                <button onClick={() => copyText(selectedBank.accountNumber.replace(/\s/g, ''), 'acc')} className="p-1.5 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-slate-400 transition-all">
                                  {copied === 'acc' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                              </div>
                              <p className="text-[10px] font-bold text-slate-400">{selectedBank.accountName}</p>
                            </div>
                          </div>
                        )}

                        {paymentMethod === 'MOMO' && (
                          <div className="p-4 bg-pink-50 dark:bg-pink-500/5 border border-pink-200 dark:border-pink-500/15 rounded-xl space-y-2">
                            <span className="text-[10px] font-bold text-pink-500">Ví MoMo</span>
                            <div className="flex items-center justify-between">
                              <p className="text-base font-black text-pink-600 tracking-wider">0987 654 321</p>
                              <button onClick={() => copyText('0987654321', 'momo')} className="p-1.5 rounded-md hover:bg-pink-100 dark:hover:bg-pink-500/10 text-pink-400 transition-all">
                                {copied === 'momo' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                            <p className="text-[10px] font-bold text-pink-400">SKYVERSES TECHNOLOGY</p>
                          </div>
                        )}

                        {/* Memo */}
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Info size={12} className="text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Nội dung chuyển khoản (bắt buộc)</span>
                          </div>
                          <div className="flex items-center justify-between bg-white dark:bg-black/30 px-3 py-2.5 rounded-lg border border-amber-200 dark:border-amber-500/10">
                            <p className="text-sm font-black text-amber-700 dark:text-amber-300 tracking-tight select-all">{paymentMemo}</p>
                            <button onClick={() => copyText(paymentMemo, 'memo')} className="p-1 text-amber-500 hover:scale-110 transition-transform">
                              {copied === 'memo' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-2 px-1 text-slate-300 dark:text-gray-600">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold">Hết hạn trong <span className="text-amber-500">{formatTime(timer)}</span></span>
                        </div>
                      </div>

                      {/* Right: QR Code */}
                      <div className="flex flex-col items-center">
                        {paymentMethod !== 'PAYPAL' ? (
                          <div className="relative w-full max-w-[220px] p-3 bg-white border border-black/[0.06] rounded-xl shadow-sm">
                            {status === 'VERIFYING' && (
                              <div className="absolute inset-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl">
                                <Loader2 className="animate-spin text-brand-blue" size={24} />
                                <p className="text-[10px] font-bold text-brand-blue">Đang xác minh...</p>
                              </div>
                            )}
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=SKYPEVERS_PAYMENT_${paymentMethod}_${selectedPack?.id}_${Date.now()}`} 
                              className="w-full aspect-square rounded-lg" 
                              alt="QR Code" 
                            />
                            <p className="text-center text-[9px] font-bold text-slate-300 mt-2">Quét mã để thanh toán</p>
                          </div>
                        ) : (
                          <div className="w-full flex flex-col items-center justify-center gap-4 p-8 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
                            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                              <Globe size={28} />
                            </div>
                            <p className="text-xs text-center text-slate-500 leading-relaxed">
                              Thanh toán <strong className="text-blue-600">{selectedPack?.usdPrice}</strong> qua PayPal và đính kèm Memo.
                            </p>
                            <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-xs font-bold hover:brightness-110 transition-all">
                              PayPal Checkout
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button 
                      onClick={handlePaid} 
                      disabled={status === 'VERIFYING'} 
                      className="w-full py-4 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-brand-blue/20"
                    >
                      {status === 'VERIFYING' ? (
                        <><Loader2 className="animate-spin" size={16} /> Đang xác minh...</>
                      ) : (
                        <><CheckCircle size={16} /> Xác nhận đã thanh toán</>
                      )}
                    </button>
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
