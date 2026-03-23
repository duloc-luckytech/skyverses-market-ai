
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ExternalLink, Search, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

// ═══════════════════════════════════════════
// EIP-6963: Multi-Wallet Discovery Protocol
// Detects ALL installed browser wallets
// ═══════════════════════════════════════════

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;  // data URI or URL
  rdns: string;  // reverse DNS identifier
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any; // EIP-1193 provider
}

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  provider: any;
  installed: boolean;
  popular?: boolean;
}

// Well-known wallet install URLs
const WALLET_INSTALL_URLS: Record<string, string> = {
  'io.metamask': 'https://metamask.io/download/',
  'com.coinbase': 'https://www.coinbase.com/wallet',
  'app.phantom': 'https://phantom.app/download',
  'me.rainbow': 'https://rainbow.me/',
  'com.trustwallet.app': 'https://trustwallet.com/download',
  'com.okex.wallet': 'https://www.okx.com/web3',
  'io.rabby': 'https://rabby.io/',
  'fi.frame': 'https://frame.sh/',
};

// Fallback wallet list (shown when EIP-6963 not supported or for "Get Wallet" section)
const SUGGESTED_WALLETS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjRjY4NTFCIiBkPSJNNDcyLjkgMTY3LjFsLTQuNi0xMy45LTEzLjktNC42IDE0LjEtNC42IDQuNS0xMy44IDEzLjkgNC42LTEzLjkgNC42eiIvPjxyZWN0IGZpbGw9IiNFMjc2MUIiIHg9IjEyOCIgeT0iMTI4IiB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgcng9IjQyIi8+PHBhdGggZmlsbD0iI0ZGRiIgZD0iTTM2OC42IDE2OC40bC02Mi42IDEzNi4xIDM3LjMgNTMuMSAxOS4zLTUzLjEtMzEuMy05Mi40IDM3LjMtNDMuN3pNMjA2IDMwNC41bC0zNy4zIDUzLjEgNjIuNiAxMzYuMSAzNy4zLTQzLjctMzEuMy05Mi40LTE5LjMtNTMuMXoiLz48L3N2Zz4=',
    provider: null,
    installed: false,
    popular: true,
  },
  {
    id: 'trust',
    name: 'Trust Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiMwNTAwRkYiLz48cGF0aCBkPSJNMjQgOEMxNiAxMiAxMiAxNiAxMiAxNnM0IDIwIDEyIDI0YzgtNCAxMi0yNCAxMi0yNFMzMiAxMiAyNCA4eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
    provider: null,
    installed: false,
    popular: true,
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiMwMDUyRkYiLz48cmVjdCB4PSIxNCIgeT0iMTQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcng9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI4IiBoZWlnaHQ9IjgiIHJ4PSIxIiBmaWxsPSIjMDA1MkZGIi8+PC9zdmc+',
    provider: null,
    installed: false,
    popular: true,
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTAiIGZpbGw9IiMwMDAiLz48cmVjdCB4PSI4IiB5PSI4IiB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHJ4PSIyIiBmaWxsPSIjZmZmIi8+PHJlY3QgeD0iMjgiIHk9IjgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgcng9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSIxOCIgeT0iMTgiIHdpZHRoPSIxMiIgaGVpZ2h0PSIxMiIgcng9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB4PSI4IiB5PSIyOCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjI4IiB5PSIyOCIgd2lkdGg9IjEyIiBoZWlnaHQ9IjEyIiByeD0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==',
    provider: null,
    installed: false,
    popular: true,
  },
];

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: any, walletAddress: string, walletName: string) => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [detectedWallets, setDetectedWallets] = useState<WalletOption[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  // ═══════ EIP-6963: Discover installed wallets ═══════
  useEffect(() => {
    if (!isOpen) return;

    const wallets: WalletOption[] = [];

    const handleAnnounce = (event: any) => {
      const { info, provider } = event.detail as EIP6963ProviderDetail;
      // Avoid duplicates
      if (!wallets.find(w => w.id === info.uuid)) {
        wallets.push({
          id: info.uuid,
          name: info.name,
          icon: info.icon,
          provider,
          installed: true,
          popular: false,
        });
        setDetectedWallets([...wallets]);
      }
    };

    window.addEventListener('eip6963:announceProvider', handleAnnounce);
    // Request all providers to announce themselves
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    // Fallback: check window.ethereum (for wallets not supporting EIP-6963)
    setTimeout(() => {
      const ethereum = (window as any).ethereum;
      if (ethereum && wallets.length === 0) {
        // Single injected provider fallback
        const name = ethereum.isMetaMask ? 'MetaMask'
          : ethereum.isTrust ? 'Trust Wallet'
          : ethereum.isCoinbaseWallet ? 'Coinbase Wallet'
          : ethereum.isBraveWallet ? 'Brave Wallet'
          : ethereum.isTokenPocket ? 'TokenPocket'
          : 'Browser Wallet';

        wallets.push({
          id: 'injected-fallback',
          name,
          icon: '',
          provider: ethereum,
          installed: true,
          popular: true,
        });
        setDetectedWallets([...wallets]);
      }
    }, 300);

    return () => {
      window.removeEventListener('eip6963:announceProvider', handleAnnounce);
    };
  }, [isOpen]);

  // ═══════ Connect to wallet ═══════
  const handleConnect = useCallback(async (wallet: WalletOption) => {
    if (!wallet.installed || !wallet.provider) {
      // Open install page
      const rdns = Object.keys(WALLET_INSTALL_URLS).find(k => wallet.name.toLowerCase().includes(k.split('.')[1]));
      if (rdns) window.open(WALLET_INSTALL_URLS[rdns], '_blank');
      return;
    }

    setConnecting(wallet.id);
    setError('');

    try {
      const accounts = await wallet.provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        onConnect(wallet.provider, accounts[0], wallet.name);
        onClose();
      } else {
        setError('Không tìm thấy account nào');
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError('Bạn đã từ chối kết nối');
      } else {
        setError(err.message || 'Không thể kết nối ví');
      }
    } finally {
      setConnecting(null);
    }
  }, [onConnect, onClose]);

  // Merge detected + suggested (uninstalled)
  const allWallets = [...detectedWallets];
  SUGGESTED_WALLETS.forEach(sw => {
    const found = detectedWallets.find(dw => 
      dw.name.toLowerCase().includes(sw.name.toLowerCase().split(' ')[0])
    );
    if (!found) {
      allWallets.push(sw);
    }
  });

  const filteredWallets = search
    ? allWallets.filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
    : allWallets;

  const installedWallets = filteredWallets.filter(w => w.installed);
  const otherWallets = filteredWallets.filter(w => !w.installed);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#0c0c10] border border-black/[0.06] dark:border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-black/[0.04] dark:border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Kết nối ví</h3>
              <p className="text-[10px] text-slate-400">Chọn ví để thanh toán USDT</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-600" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm ví..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-700 focus:outline-none focus:border-amber-500/30" />
          </div>
        </div>

        {/* Wallet List */}
        <div className="px-5 pb-5 max-h-[400px] overflow-y-auto space-y-3">
          {/* Installed Wallets */}
          {installedWallets.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider px-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Đã cài đặt
              </p>
              {installedWallets.map(wallet => (
                <button key={wallet.id} onClick={() => handleConnect(wallet)}
                  disabled={connecting === wallet.id}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-white/[0.02] hover:border-amber-500/30 hover:bg-amber-500/[0.02] transition-all active:scale-[0.98] disabled:opacity-50">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/[0.05] flex items-center justify-center overflow-hidden shrink-0">
                    {wallet.icon ? (
                      <img src={wallet.icon} alt={wallet.name} className="w-7 h-7 rounded-lg" />
                    ) : (
                      <Wallet size={18} className="text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[12px] font-bold text-slate-900 dark:text-white">{wallet.name}</p>
                    <p className="text-[9px] text-emerald-500 font-medium">Sẵn sàng kết nối</p>
                  </div>
                  <div className="shrink-0">
                    {connecting === wallet.id ? (
                      <Loader2 size={16} className="animate-spin text-amber-500" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-300 dark:text-gray-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Not Installed / Get Wallet */}
          {otherWallets.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">Cài đặt ví</p>
              {otherWallets.map(wallet => (
                <a key={wallet.id}
                  href={Object.values(WALLET_INSTALL_URLS).find((_, i) =>
                    wallet.name.toLowerCase().includes(Object.keys(WALLET_INSTALL_URLS)[i]?.split('.')[1] || '___')
                  ) || `https://www.google.com/search?q=${encodeURIComponent(wallet.name + ' wallet download')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-black/[0.04] dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] hover:border-amber-500/20 transition-all opacity-60 hover:opacity-80">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center overflow-hidden shrink-0">
                    {wallet.icon ? (
                      <img src={wallet.icon} alt={wallet.name} className="w-7 h-7 rounded-lg" />
                    ) : (
                      <Wallet size={18} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-[12px] font-bold text-slate-700 dark:text-gray-300">{wallet.name}</p>
                    <p className="text-[9px] text-slate-400 font-medium">Chưa cài đặt</p>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 dark:text-gray-600 shrink-0" />
                </a>
              ))}
            </div>
          )}

          {/* No wallets found */}
          {installedWallets.length === 0 && otherWallets.length === 0 && (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <Wallet size={32} className="text-slate-200 dark:text-gray-700" />
              <p className="text-xs text-slate-400">Không tìm thấy ví nào</p>
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/15 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-black/[0.04] dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01]">
          <p className="text-[9px] text-center text-slate-400 leading-relaxed">
            Kết nối ví không chia sẻ private key. Chỉ cho phép xem địa chỉ và yêu cầu xác nhận giao dịch.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WalletConnectModal;
