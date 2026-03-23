
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, Check, 
  Loader2, ShieldCheck, 
  Clock, Info, CheckCircle,
  ChevronLeft, Landmark, Copy,
  Globe, Zap, QrCode,
  AlertCircle, Wallet, ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { creditsApi, CreditPackage } from '../apis/credits';
import WalletConnectModal from './WalletConnectModal';

const USD_TO_VND = 26000;
const formatVND = (usd: number) => Math.round(usd * USD_TO_VND).toLocaleString('vi-VN');

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3221';

// USDT ERC-20 transfer ABI (only transfer function)
const ERC20_TRANSFER_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)'
];

// Network configs for MetaMask
const NETWORK_CONFIG: Record<string, { chainId: string; chainName: string; rpcUrl: string; symbol: string; explorer: string; decimals: number }> = {
  bsc: {
    chainId: '0x38', // 56
    chainName: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    symbol: 'BNB',
    explorer: 'https://bscscan.com/tx/',
    decimals: 18,
  },
  eth: {
    chainId: '0x1', // 1
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    symbol: 'ETH',
    explorer: 'https://etherscan.io/tx/',
    decimals: 6,
  },
};

interface BankingConfig {
  bankName: string; bankCode: string; accountNumber: string;
  accountName: string; qrTemplate: string; isEnabled: boolean;
}
interface CryptoConfig {
  walletAddress: string; networks: string[];
  usdtContractBSC: string; usdtContractETH: string; isEnabled: boolean;
}
interface PendingTx {
  _id: string; memo: string; amount: number;
  packageName: string; credits: number; status: string; expiresAt: string;
}
interface CreditPurchaseModalProps {
  isOpen: boolean; onClose: () => void; initialPack?: CreditPackage | null;
}

type PaymentMethod = 'bank' | 'crypto';

const CreditPurchaseModal: React.FC<CreditPurchaseModalProps> = ({ isOpen, onClose, initialPack }) => {
  const { refreshUserInfo, user, credits } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(initialPack ? 2 : 1);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(false);
  const [selectedPack, setSelectedPack] = useState<CreditPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  
  const [status, setStatus] = useState<'IDLE' | 'CREATING' | 'WAITING' | 'POLLING' | 'SUCCESS' | 'EXPIRED' | 'ERROR' | 'CRYPTO_SENDING'>('IDLE');
  const [timer, setTimer] = useState(900);
  const [copied, setCopied] = useState<string | null>(null);
  const [bankingConfig, setBankingConfig] = useState<BankingConfig | null>(null);
  const [cryptoConfig, setCryptoConfig] = useState<CryptoConfig | null>(null);
  const [pendingTx, setPendingTx] = useState<PendingTx | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [creditsAdded, setCreditsAdded] = useState(0);
  
  // Crypto states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletProvider, setWalletProvider] = useState<any>(null);
  const [walletName, setWalletName] = useState('');
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('bsc');
  const [cryptoTxHash, setCryptoTxHash] = useState('');
  const [cryptoError, setCryptoError] = useState('');
  const [manualTxHash, setManualTxHash] = useState('');
  const [verifyingManual, setVerifyingManual] = useState(false);
  
  const pollRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('skyverses_auth_token');
    return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const fetchBankingConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/banking`);
      const data = await res.json();
      if (data.success) setBankingConfig(data.data);
    } catch { }
  };

  const fetchCryptoConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/crypto`);
      const data = await res.json();
      if (data.success) setCryptoConfig(data.data);
    } catch { }
  };

  const fetchPackages = async () => {
    setLoadingPacks(true);
    try {
      const res = await creditsApi.getAdminPackages();
      if (res.data) setPackages(res.data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch { }
    setLoadingPacks(false);
  };

  const createPurchase = async (pack: CreditPackage) => {
    setStatus('CREATING');
    try {
      const res = await fetch(`${API_BASE_URL}/credits/purchase/create`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({ packageCode: pack.code }),
      });
      const data = await res.json();
      if (data.success && data.transaction) {
        setPendingTx(data.transaction);
        setStatus('WAITING');
        setTimer(900);
      } else setStatus('ERROR');
    } catch { setStatus('ERROR'); }
  };

  const pollPayment = useCallback(async () => {
    if (!pendingTx) return;
    try {
      const res = await fetch(`${API_BASE_URL}/credits/purchase/check/${pendingTx._id}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.status === 'success') {
        clearInterval(pollRef.current); clearInterval(timerRef.current);
        setCreditsAdded(data.creditsAdded || pendingTx.credits);
        setStatus('SUCCESS'); await refreshUserInfo();
      } else if (data.status === 'expired' || data.status === 'failed') {
        clearInterval(pollRef.current); clearInterval(timerRef.current);
        setStatus('EXPIRED');
      }
      setPollCount(c => c + 1);
    } catch { }
  }, [pendingTx, refreshUserInfo]);

  const handleConfirmPaid = () => {
    setStatus('POLLING'); setPollCount(0);
    pollRef.current = setInterval(pollPayment, 5000);
    pollPayment();
  };

  // ═══════ MULTI-WALLET CONNECT ═══════
  const handleWalletConnect = (provider: any, address: string, name: string) => {
    setWalletProvider(provider);
    setWalletAddress(address);
    setWalletName(name);
    setWalletConnected(true);
    setCryptoError('');
  };

  const switchNetwork = async (network: string) => {
    const ethereum = walletProvider || (window as any).ethereum;
    if (!ethereum) return;
    const config = NETWORK_CONFIG[network];
    try {
      await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: config.chainId }] });
      setSelectedNetwork(network);
    } catch (switchError: any) {
      if (switchError.code === 4902 && network === 'bsc') {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: config.chainId, chainName: config.chainName,
              nativeCurrency: { name: config.symbol, symbol: config.symbol, decimals: 18 },
              rpcUrls: [config.rpcUrl], blockExplorerUrls: [config.explorer.replace('/tx/', '')],
            }],
          });
          setSelectedNetwork(network);
        } catch { setCryptoError('Không thể thêm mạng BSC'); }
      } else {
        setCryptoError('Không thể chuyển mạng');
      }
    }
  };

  const sendUSDT = async () => {
    if (!pendingTx || !selectedPack || !cryptoConfig) return;
    const ethereum = walletProvider || (window as any).ethereum;
    if (!ethereum || !walletConnected) { setCryptoError('Vui lòng kết nối ví'); return; }

    setStatus('CRYPTO_SENDING');
    setCryptoError('');

    try {
      await switchNetwork(selectedNetwork);
      
      const usdtContract = selectedNetwork === 'bsc' ? cryptoConfig.usdtContractBSC : cryptoConfig.usdtContractETH;
      const decimals = selectedNetwork === 'bsc' ? 18 : 6;
      const amountUSDT = selectedPack.price;
      
      // Convert to wei/smallest unit
      const amountBN = BigInt(Math.round(amountUSDT * (10 ** decimals)));
      const amountHex = '0x' + amountBN.toString(16);

      // Encode transfer(address, uint256) function call
      const transferSelector = '0xa9059cbb'; // keccak256("transfer(address,uint256)") first 4 bytes
      const toAddress = cryptoConfig.walletAddress.toLowerCase().replace('0x', '').padStart(64, '0');
      const amountPadded = amountBN.toString(16).padStart(64, '0');
      const txData = transferSelector + toAddress + amountPadded;

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: walletAddress,
          to: usdtContract,
          data: txData,
          value: '0x0', // USDT is token transfer, no native value
        }],
      });

      setCryptoTxHash(txHash);

      // Report to backend
      const confirmRes = await fetch(`${API_BASE_URL}/credits/purchase/crypto`, {
        method: 'POST', headers: getAuthHeaders(),
        body: JSON.stringify({
          txId: pendingTx._id,
          txHash,
          network: selectedNetwork,
          walletAddress,
        }),
      });
      const confirmData = await confirmRes.json();

      if (confirmData.status === 'success' || confirmData.status === 'already_confirmed') {
        setCreditsAdded(confirmData.creditsAdded || pendingTx.credits);
        setStatus('SUCCESS');
        await refreshUserInfo();
      } else if (confirmData.status === 'pending_verification') {
        // Tx not mined yet — auto-retry after 10s
        setCryptoError('Giao dịch đang được xác nhận trên blockchain...');
        setStatus('WAITING');
        setTimeout(() => {
          // Re-call verify
          fetch(`${API_BASE_URL}/credits/purchase/crypto`, {
            method: 'POST', headers: getAuthHeaders(),
            body: JSON.stringify({ txId: pendingTx._id, txHash, network: selectedNetwork, walletAddress }),
          }).then(r => r.json()).then(retryData => {
            if (retryData.status === 'success') {
              setCreditsAdded(retryData.creditsAdded || pendingTx.credits);
              setStatus('SUCCESS');
              refreshUserInfo();
              setCryptoError('');
            } else if (retryData.status === 'pending_verification') {
              setCryptoError('Blockchain đang xử lý. Vui lòng đợi và thử lại.');
            } else {
              setCryptoError(retryData.message || 'Xác thực thất bại');
            }
          }).catch(() => setCryptoError('Lỗi kết nối server'));
        }, 10000);
      } else if (confirmData.status === 'verification_failed') {
        setCryptoError(confirmData.message || 'Xác thực giao dịch thất bại');
        setStatus('WAITING');
      } else {
        setCryptoError(confirmData.message || 'Giao dịch đã gửi nhưng chưa xác nhận. Vui lòng chờ.');
        setStatus('WAITING');
      }
    } catch (err: any) {
      console.error('USDT Transfer Error:', err);
      if (err.code === 4001) {
        setCryptoError('Bạn đã từ chối giao dịch');
      } else {
        setCryptoError(err.message || 'Lỗi gửi USDT');
      }
      setStatus('WAITING');
    }
  };

  // Timer
  useEffect(() => {
    if (status === 'WAITING' || status === 'POLLING') {
      timerRef.current = setInterval(() => {
        setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); clearInterval(pollRef.current); setStatus('EXPIRED'); return 0; } return t - 1; });
      }, 1000);
    }
    return () => { clearInterval(timerRef.current); };
  }, [status]);

  // Init
  useEffect(() => {
    if (isOpen) {
      fetchPackages(); fetchBankingConfig(); fetchCryptoConfig();
      if (initialPack) { setSelectedPack(initialPack); setStep(2); } else { setStep(1); setSelectedPack(null); }
      setStatus('IDLE'); setPendingTx(null); setTimer(900);
      setPaymentMethod('bank'); setCryptoTxHash(''); setCryptoError('');
      setWalletConnected(false); setWalletAddress(''); setWalletProvider(null); setWalletName('');
    }
    return () => { clearInterval(pollRef.current); clearInterval(timerRef.current); };
  }, [isOpen, initialPack]);

  useEffect(() => {
    if (step === 2 && selectedPack && status === 'IDLE') createPurchase(selectedPack);
  }, [step, selectedPack]);

  const handleSelectPack = (pack: CreditPackage) => {
    setSelectedPack(pack); setStep(2); setStatus('IDLE'); setPendingTx(null);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text); setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => { clearInterval(pollRef.current); clearInterval(timerRef.current); onClose(); };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  
  const qrUrl = bankingConfig && pendingTx
    ? `https://img.vietqr.io/image/${bankingConfig.bankCode}-${bankingConfig.accountNumber}-${bankingConfig.qrTemplate || 'compact2'}.png?amount=${pendingTx.amount}&addInfo=${encodeURIComponent(pendingTx.memo)}&accountName=${encodeURIComponent(bankingConfig.accountName)}`
    : null;

  const explorerUrl = cryptoTxHash ? (NETWORK_CONFIG[selectedNetwork]?.explorer || '') + cryptoTxHash : '';

  return (
    <>
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <motion.div initial={{ scale: 0.96, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-white dark:bg-[#0c0c10] border border-black/[0.06] dark:border-white/[0.06] rounded-none md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 md:px-6 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {step === 2 && !initialPack && status !== 'POLLING' && status !== 'SUCCESS' && status !== 'CRYPTO_SENDING' && (
              <button onClick={() => { setStep(1); setStatus('IDLE'); setPendingTx(null); clearInterval(pollRef.current); }} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 transition-all">
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
              <Sparkles size={16} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {step === 1 ? 'Nạp Credits' : status === 'SUCCESS' ? 'Thành công!' : 'Thanh toán'}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-gray-500">
                {step === 1 ? 'Chọn gói phù hợp' : selectedPack?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg">
              <Sparkles size={12} className="text-brand-blue" fill="currentColor" />
              <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{(credits || 0).toLocaleString()}</span>
            </div>
            <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="px-5 md:px-6 py-3 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center gap-3 shrink-0">
          {[{ s: 1, label: 'Chọn gói' }, { s: 2, label: 'Thanh toán' }].map((item, idx) => (
            <React.Fragment key={item.s}>
              <div className={`flex items-center gap-2 ${step >= item.s ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  (step > item.s || (item.s === 2 && status === 'SUCCESS')) ? 'bg-emerald-500 text-white' : step === item.s ? 'bg-brand-blue text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                }`}>
                  {(step > item.s || (item.s === 2 && status === 'SUCCESS')) ? <Check size={12} strokeWidth={3} /> : item.s}
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
              /* ═══════ STEP 1: SELECT PACKAGE ═══════ */
              <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 md:p-6 space-y-3">
                {loadingPacks ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-brand-blue" size={28} />
                    <p className="text-xs font-bold text-slate-400">Đang tải gói credits...</p>
                  </div>
                ) : (
                  packages.map((pack) => (
                    <button key={pack._id} onClick={() => handleSelectPack(pack)}
                      className={`group w-full flex items-center justify-between p-4 md:p-5 border rounded-xl text-left transition-all active:scale-[0.99] ${
                        pack.popular ? 'bg-brand-blue/[0.03] border-brand-blue/25 hover:border-brand-blue/50 hover:shadow-lg' : 'bg-white dark:bg-white/[0.02] border-black/[0.05] dark:border-white/[0.05] hover:border-brand-blue/30 hover:shadow-md'
                      }`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center ${pack.popular ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-50 dark:bg-white/[0.03] text-slate-400 group-hover:text-brand-blue'} transition-colors`}>
                          <Sparkles size={18} fill="currentColor" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white">{pack.name}</h4>
                            {pack.popular && <span className="px-1.5 py-0.5 bg-brand-blue text-white text-[7px] font-bold rounded">HOT</span>}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-gray-500 line-clamp-1">{pack.description}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-lg font-black text-brand-blue tracking-tight">{(pack.totalCredits || pack.credits).toLocaleString()}</p>
                        <div className="flex flex-col">
                          <p className="text-xs font-bold text-slate-700 dark:text-gray-300">{formatVND(pack.price)}₫</p>
                          <p className="text-[9px] text-slate-400">${pack.price} USDT</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
                <div className="flex items-center justify-center gap-4 pt-3 text-slate-300 dark:text-gray-600">
                  <div className="flex items-center gap-1"><ShieldCheck size={12} /> <span className="text-[9px] font-bold">An toàn</span></div>
                  <div className="flex items-center gap-1"><Clock size={12} /> <span className="text-[9px] font-bold">Tự động</span></div>
                  <div className="flex items-center gap-1"><Zap size={12} /> <span className="text-[9px] font-bold">Tức thì</span></div>
                </div>
              </motion.div>
            ) : (
              /* ═══════ STEP 2: PAYMENT ═══════ */
              <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-5 md:p-6">
                
                {/* SUCCESS */}
                {status === 'SUCCESS' && (
                  <div className="py-16 flex flex-col items-center justify-center gap-4">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle size={32} className="text-emerald-500" />
                      </div>
                    </motion.div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">Nạp thành công!</p>
                      <p className="text-sm text-slate-400 mt-1">+{creditsAdded.toLocaleString()} credits đã được cộng</p>
                    </div>
                    {cryptoTxHash && (
                      <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[10px] font-bold text-brand-blue hover:underline">
                        <ExternalLink size={12} /> Xem trên {selectedNetwork.toUpperCase()} Explorer
                      </a>
                    )}
                    <button onClick={handleClose} className="mt-4 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all">Đóng</button>
                  </div>
                )}

                {/* EXPIRED */}
                {status === 'EXPIRED' && (
                  <div className="py-16 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center"><AlertCircle size={32} className="text-amber-500" /></div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">Giao dịch hết hạn</p>
                      <p className="text-xs text-slate-400 mt-1">Vui lòng thử lại.</p>
                    </div>
                    <button onClick={() => { setStatus('IDLE'); setStep(1); setPendingTx(null); }} className="mt-2 px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold">Thử lại</button>
                  </div>
                )}

                {/* CREATING */}
                {status === 'CREATING' && (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                    <Loader2 className="animate-spin text-brand-blue" size={28} />
                    <p className="text-xs font-bold text-slate-400">Đang tạo giao dịch...</p>
                  </div>
                )}

                {/* ERROR */}
                {status === 'ERROR' && (
                  <div className="py-16 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"><AlertCircle size={32} className="text-red-500" /></div>
                    <p className="text-sm font-bold text-red-500">Lỗi tạo giao dịch.</p>
                    <button onClick={() => { if (selectedPack) createPurchase(selectedPack); }} className="px-6 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold">Thử lại</button>
                  </div>
                )}

                {/* WAITING / POLLING / CRYPTO_SENDING */}
                {(status === 'WAITING' || status === 'POLLING' || status === 'CRYPTO_SENDING') && pendingTx && (
                  <div className="space-y-5">
                    {/* Payment Method Tabs */}
                    <div className="flex bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl p-1 gap-1">
                      <button onClick={() => setPaymentMethod('bank')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                          paymentMethod === 'bank' ? 'bg-white dark:bg-white/10 text-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        }`}>
                        <Landmark size={14} /> Chuyển khoản
                      </button>
                      <button onClick={() => setPaymentMethod('crypto')}
                        disabled={!cryptoConfig?.isEnabled}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                          paymentMethod === 'crypto' ? 'bg-white dark:bg-white/10 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                        } ${!cryptoConfig?.isEnabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
                        <Wallet size={14} /> Crypto USDT
                      </button>
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          {paymentMethod === 'bank' ? 'Số tiền VND' : 'Số tiền USDT'}
                        </p>
                        <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {paymentMethod === 'bank' ? `${pendingTx.amount.toLocaleString('vi-VN')}₫` : `$${selectedPack?.price || 0}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nhận được</p>
                        <p className="text-xl md:text-2xl font-black text-brand-blue">{pendingTx.credits.toLocaleString()} <span className="text-sm font-bold text-brand-blue/50">CR</span></p>
                      </div>
                    </div>

                    {/* ═══════ BANK TRANSFER TAB ═══════ */}
                    {paymentMethod === 'bank' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            {bankingConfig && (
                              <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-3">
                                <div className="flex items-center gap-2">
                                  <Landmark size={14} className="text-brand-blue" />
                                  <span className="text-[10px] font-bold text-slate-400">{bankingConfig.bankName}</span>
                                </div>
                                <div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-base font-black text-slate-900 dark:text-white tracking-wider font-mono">{bankingConfig.accountNumber}</p>
                                    <button onClick={() => copyText(bankingConfig.accountNumber, 'acc')} className="p-1.5 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-slate-400">
                                      {copied === 'acc' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                  <p className="text-[10px] font-bold text-slate-400">{bankingConfig.accountName}</p>
                                </div>
                              </div>
                            )}
                            <div className="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 rounded-xl">
                              <div className="flex items-center gap-1.5 mb-2">
                                <Info size={12} className="text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Nội dung CK (bắt buộc)</span>
                              </div>
                              <div className="flex items-center justify-between bg-white dark:bg-black/30 px-3 py-2.5 rounded-lg border border-amber-200 dark:border-amber-500/10">
                                <p className="text-sm font-black text-amber-700 dark:text-amber-300 tracking-wider select-all font-mono">{pendingTx.memo}</p>
                                <button onClick={() => copyText(pendingTx.memo, 'memo')} className="p-1 text-amber-500">
                                  {copied === 'memo' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 text-slate-300 dark:text-gray-600">
                              <Clock size={12} />
                              <span className="text-[10px] font-bold">Hết hạn trong <span className={timer < 120 ? 'text-red-500' : 'text-amber-500'}>{formatTime(timer)}</span></span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="relative w-full max-w-[220px] p-3 bg-white border border-black/[0.06] rounded-xl shadow-sm">
                              {status === 'POLLING' && (
                                <div className="absolute inset-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl">
                                  <Loader2 className="animate-spin text-brand-blue" size={24} />
                                  <p className="text-[10px] font-bold text-brand-blue text-center">Đang kiểm tra...</p>
                                  <p className="text-[8px] text-slate-400">#{pollCount}</p>
                                </div>
                              )}
                              {qrUrl ? (
                                <>
                                  <img src={qrUrl} className="w-full rounded-lg" alt="VietQR" onError={(e) => { (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pendingTx.memo)}`; }} />
                                  <div className="flex items-center justify-center gap-1.5 mt-2">
                                    <QrCode size={10} className="text-brand-blue" />
                                    <p className="text-[9px] font-bold text-slate-400">Quét bằng app ngân hàng</p>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full aspect-square flex items-center justify-center"><Loader2 size={24} className="animate-spin text-slate-300" /></div>
                              )}
                            </div>
                          </div>
                        </div>
                        {status === 'WAITING' && (
                          <button onClick={handleConfirmPaid} className="w-full py-4 bg-brand-blue text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-brand-blue/20">
                            <CheckCircle size={16} /> Tôi đã thanh toán
                          </button>
                        )}
                        {status === 'POLLING' && (
                          <div className="w-full py-4 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Đang chờ xác nhận...
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═══════ CRYPTO USDT TAB ═══════ */}
                    {paymentMethod === 'crypto' && cryptoConfig?.isEnabled && (
                      <div className="space-y-4">
                        {/* Network Selector */}
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Chọn mạng blockchain</p>
                          <div className="flex gap-2">
                            {cryptoConfig.networks.map(net => (
                              <button key={net} onClick={() => setSelectedNetwork(net)}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-bold transition-all ${
                                  selectedNetwork === net 
                                    ? 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400 shadow-sm' 
                                    : 'border-black/[0.06] dark:border-white/[0.06] text-slate-500 hover:border-amber-500/30'
                                }`}>
                                {net === 'bsc' && <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none"><path d="M16 2L9.5 8.5l2.4 2.4L16 6.8l4.1 4.1 2.4-2.4L16 2zm-8.5 8.5L5.1 13l2.4 2.4L10 13l-2.5-2.5zM16 12.8L11.9 17l2.4 2.4L16 17.6l1.7 1.8 2.4-2.4L16 12.8zm8.5 0L22 15.3l2.4 2.4 2.4-2.4-2.3-2.5zM16 19.2l-4.1 4.1 2.4 2.4L16 24l1.7 1.7 2.4-2.4L16 19.2z" fill="#F3BA2F"/><path d="M16 30l6.5-6.5-2.4-2.4L16 25.2l-4.1-4.1-2.4 2.4L16 30z" fill="#F3BA2F"/></svg>}
                                {net === 'eth' && <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none"><path d="M16 2v10.9l9.2 4.1L16 2z" fill="#627EEA" fillOpacity=".6"/><path d="M16 2L6.8 17l9.2-4.1V2z" fill="#627EEA"/><path d="M16 23.5v6.5l9.2-12.8L16 23.5z" fill="#627EEA" fillOpacity=".6"/><path d="M16 30v-6.5L6.8 17.2 16 30z" fill="#627EEA"/><path d="M16 21.8l9.2-4.8L16 12.9v8.9z" fill="#627EEA" fillOpacity=".2"/><path d="M6.8 17l9.2 4.8V12.9L6.8 17z" fill="#627EEA" fillOpacity=".6"/></svg>}
                                <div className="text-left">
                                  <p className="font-black">{net.toUpperCase()}</p>
                                  <p className="text-[8px] opacity-60">{net === 'bsc' ? 'BEP-20' : 'ERC-20'}</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment Info - Always visible */}
                        {cryptoConfig.walletAddress && (
                          <div className="p-4 bg-white dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/[0.04] rounded-xl space-y-4">
                            {/* Address + QR grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                              {/* Left: Address & info */}
                              <div className="space-y-3">
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Địa chỉ ví nhận USDT</span>
                                  <div className="flex items-center justify-between bg-slate-50 dark:bg-white/[0.03] px-3 py-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
                                    <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-gray-200 break-all">{cryptoConfig.walletAddress}</span>
                                    <button onClick={() => copyText(cryptoConfig.walletAddress, 'wallet')} className="p-1.5 ml-2 shrink-0 rounded-md hover:bg-black/[0.04] dark:hover:bg-white/[0.04] text-slate-400">
                                      {copied === 'wallet' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                                  <span className="text-[10px] font-bold text-slate-400">Số USDT</span>
                                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">{selectedPack?.price || 0} USDT</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-slate-400">Mạng</span>
                                  <span className="text-xs font-bold text-slate-600 dark:text-gray-300">{selectedNetwork.toUpperCase()} ({selectedNetwork === 'bsc' ? 'BEP-20' : 'ERC-20'})</span>
                                </div>
                              </div>

                              {/* Right: QR Code (EIP-681 format) */}
                              {(() => {
                                // EIP-681: ethereum:<token_contract>@<chainId>/transfer?address=<recipient>&uint256=<amount_in_smallest_unit>
                                const chainId = selectedNetwork === 'bsc' ? 56 : 1;
                                const tokenContract = selectedNetwork === 'bsc' ? cryptoConfig.usdtContractBSC : cryptoConfig.usdtContractETH;
                                const decimals = selectedNetwork === 'bsc' ? 18 : 6;
                                const amountSmallest = BigInt(Math.round((selectedPack?.price || 0) * (10 ** decimals))).toString();
                                const eip681Uri = `ethereum:${tokenContract}@${chainId}/transfer?address=${cryptoConfig.walletAddress}&uint256=${amountSmallest}`;
                                
                                return (
                                  <div className="flex flex-col items-center">
                                    <div className="w-[140px] p-2 bg-white border border-black/[0.06] rounded-xl shadow-sm">
                                      <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(eip681Uri)}&bgcolor=ffffff&color=000000&margin=8`}
                                        className="w-full rounded-lg" 
                                        alt="Wallet QR"
                                      />
                                    </div>
                                    <div className="flex items-center justify-center gap-1.5 mt-2">
                                      <QrCode size={10} className="text-amber-500" />
                                      <p className="text-[9px] font-bold text-slate-400">Quét bằng ví di động</p>
                                    </div>
                                    <p className="text-[8px] text-slate-300 dark:text-gray-700 mt-0.5">Trust Wallet · MetaMask · Coinbase</p>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Warning */}
                        <div className="flex items-start gap-2 px-1">
                          <AlertCircle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[9px] text-slate-400 leading-relaxed">
                            Chỉ gửi <strong>USDT</strong> trên mạng <strong>{selectedNetwork.toUpperCase()}</strong>. 
                            Gửi sai token hoặc mạng sẽ mất tiền vĩnh viễn.
                          </p>
                        </div>

                        {/* Wallet Connect Section */}
                        {!walletConnected ? (
                          <button onClick={() => setShowWalletModal(true)}
                            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20">
                            <Wallet size={20} />
                            Kết nối ví để gửi tự động
                          </button>
                        ) : (
                          <div className="space-y-3">
                            {/* Connected Wallet */}
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/15 rounded-xl">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{walletName || 'Ví'} đã kết nối</span>
                                </div>
                                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                              </div>
                            </div>

                            {/* Send Button */}
                            <button onClick={sendUSDT} disabled={status === 'CRYPTO_SENDING'}
                              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                              {status === 'CRYPTO_SENDING' ? (
                                <><Loader2 size={16} className="animate-spin" /> Đang gửi USDT...</>
                              ) : (
                                <><Wallet size={16} /> Gửi {selectedPack?.price || 0} USDT</>
                              )}
                            </button>
                          </div>
                        )}

                        {/* ═══ Manual TxHash for QR scan payments ═══ */}
                        <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
                          <p className="text-[10px] font-bold text-slate-400 mb-2">Đã quét QR và gửi từ ví di động?</p>
                          <div className="flex gap-2">
                            <input type="text" value={manualTxHash} onChange={e => setManualTxHash(e.target.value.trim())}
                              placeholder="Dán Transaction Hash (0x...) tại đây"
                              className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-lg text-[11px] font-mono text-slate-700 dark:text-gray-300 placeholder:text-slate-300 dark:placeholder:text-gray-700 focus:outline-none focus:border-amber-500/30" />
                            <button onClick={async () => {
                              if (!manualTxHash || !pendingTx || manualTxHash.length < 60) {
                                setCryptoError('Vui lòng nhập đúng transaction hash (bắt đầu bằng 0x...)');
                                return;
                              }
                              setVerifyingManual(true); setCryptoError('');
                              try {
                                const res = await fetch(`${API_BASE_URL}/credits/purchase/crypto`, {
                                  method: 'POST', headers: getAuthHeaders(),
                                  body: JSON.stringify({ txId: pendingTx._id, txHash: manualTxHash, network: selectedNetwork, walletAddress: 'manual' }),
                                });
                                const data = await res.json();
                                if (data.status === 'success' || data.status === 'already_confirmed') {
                                  setCryptoTxHash(manualTxHash);
                                  setCreditsAdded(data.creditsAdded || pendingTx.credits);
                                  setStatus('SUCCESS'); await refreshUserInfo();
                                } else if (data.status === 'pending_verification') {
                                  setCryptoError('Giao dịch chưa được mine. Vui lòng đợi 1-2 phút và thử lại.');
                                } else {
                                  setCryptoError(data.message || 'Xác thực thất bại');
                                }
                              } catch { setCryptoError('Lỗi kết nối server'); }
                              setVerifyingManual(false);
                            }}
                              disabled={verifyingManual || !manualTxHash}
                              className="px-4 py-2.5 bg-amber-500 text-white rounded-lg text-[11px] font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30 shrink-0">
                              {verifyingManual ? <Loader2 size={14} className="animate-spin" /> : 'Xác nhận'}
                            </button>
                          </div>
                        </div>

                        {/* Crypto Error */}
                        {cryptoError && (
                          <div className="p-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/15 rounded-xl">
                            <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{cryptoError}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
    <WalletConnectModal
      isOpen={showWalletModal}
      onClose={() => setShowWalletModal(false)}
      onConnect={handleWalletConnect}
    />
    </>
  );
};

export default CreditPurchaseModal;
