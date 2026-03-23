
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building, CreditCard, QrCode, Save, Loader2, Eye,
  Hash, User, Power, FileText, RefreshCw, CheckCircle2,
  Wallet, Globe, Link
} from 'lucide-react';
import { API_BASE_URL, getHeaders } from '../../apis/config';
import { useToast } from '../../context/ToastContext';

interface BankingConfig {
  bankName: string; bankCode: string; accountNumber: string;
  accountName: string; qrTemplate: string; isEnabled: boolean; note: string;
}
interface CryptoConfig {
  walletAddress: string; networks: string[];
  usdtContractBSC: string; usdtContractETH: string;
  isEnabled: boolean; note: string;
}

const QR_TEMPLATES = ['compact', 'compact2', 'qr_only', 'print'];

const POPULAR_BANKS = [
  { code: 'ACB', name: 'ACB Bank' },
  { code: 'VCB', name: 'Vietcombank' },
  { code: 'TCB', name: 'Techcombank' },
  { code: 'MB', name: 'MB Bank' },
  { code: 'TPB', name: 'TPBank' },
  { code: 'VPB', name: 'VPBank' },
  { code: 'BIDV', name: 'BIDV' },
  { code: 'VTB', name: 'VietinBank' },
  { code: 'STB', name: 'Sacombank' },
  { code: 'MSB', name: 'MSB' },
  { code: 'SHB', name: 'SHB' },
  { code: 'OCB', name: 'OCB' },
];

export const BankingTab: React.FC = () => {
  const [config, setConfig] = useState<BankingConfig>({
    bankName: '', bankCode: '', accountNumber: '',
    accountName: '', qrTemplate: 'compact2', isEnabled: true, note: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<BankingConfig | null>(null);
  const { showToast } = useToast();

  // Crypto state
  const [cryptoConfig, setCryptoConfig] = useState<CryptoConfig>({
    walletAddress: '', networks: ['bsc', 'eth'],
    usdtContractBSC: '0x55d398326f99059fF775485246999027B3197955',
    usdtContractETH: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    isEnabled: true, note: ''
  });
  const [originalCrypto, setOriginalCrypto] = useState<CryptoConfig | null>(null);
  const [savingCrypto, setSavingCrypto] = useState(false);
  const hasCryptoChanges = JSON.stringify(cryptoConfig) !== JSON.stringify(originalCrypto);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const [bankRes, cryptoRes] = await Promise.all([
        fetch(`${API_BASE_URL}/config/banking`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/config/crypto`, { headers: getHeaders() })
      ]);
      const bankData = await bankRes.json();
      const cryptoData = await cryptoRes.json();
      if (bankData.success) { setConfig(bankData.data); setOriginalConfig(bankData.data); }
      if (cryptoData.success) { setCryptoConfig(cryptoData.data); setOriginalCrypto(cryptoData.data); }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchConfig(); }, []);

  const handleChange = (key: keyof BankingConfig, value: any) => {
    setConfig(prev => {
      const updated = { ...prev, [key]: value };
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalConfig));
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/config/banking`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setOriginalConfig(config);
        setHasChanges(false);
        showToast('Đã lưu cấu hình Banking', 'success');
      } else { showToast('Lưu thất bại', 'error'); }
    } catch (err) { showToast('Lỗi kết nối server', 'error'); }
    setSaving(false);
  };

  const qrPreviewUrl = config.bankCode && config.accountNumber
    ? `https://img.vietqr.io/image/${config.bankCode}-${config.accountNumber}-${config.qrTemplate}.png?amount=100000&addInfo=SKYVERSES+TEST`
    : null;

  const handleCryptoChange = (key: keyof CryptoConfig, value: any) => {
    setCryptoConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleCryptoNetwork = (net: string) => {
    setCryptoConfig(prev => ({
      ...prev,
      networks: prev.networks.includes(net)
        ? prev.networks.filter(n => n !== net)
        : [...prev.networks, net]
    }));
  };

  const handleSaveCrypto = async () => {
    setSavingCrypto(true);
    try {
      const res = await fetch(`${API_BASE_URL}/config/crypto`, {
        method: 'PUT', headers: getHeaders(), body: JSON.stringify(cryptoConfig)
      });
      const data = await res.json();
      if (data.success) {
        setOriginalCrypto(cryptoConfig);
        showToast('Đã lưu cấu hình Crypto', 'success');
      } else showToast('Lưu thất bại', 'error');
    } catch { showToast('Lỗi kết nối server', 'error'); }
    setSavingCrypto(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-brand-blue" size={24} />
    </div>
  );

  return (
    <>
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard size={16} className="text-brand-blue" /> Cấu hình Banking & QR
          </h2>
          <p className="text-[10px] text-slate-400">Quản lý thông tin ngân hàng cho thanh toán QR tự động</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchConfig} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-all">
            <RefreshCw size={14} />
          </button>
          <button onClick={handleSave} disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg text-[11px] font-bold shadow-sm shadow-brand-blue/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30">
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Lưu cấu hình
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Toggle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                <Power size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Thanh toán QR</p>
                <p className="text-[9px] text-slate-400">{config.isEnabled ? 'Đang hoạt động' : 'Đã tắt'}</p>
              </div>
            </div>
            <button onClick={() => handleChange('isEnabled', !config.isEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${config.isEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.isEnabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </motion.div>

          {/* Bank Selection */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building size={12} /> Thông tin ngân hàng
            </p>
            
            {/* Bank selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400">Ngân hàng</label>
              <select value={config.bankCode} onChange={e => {
                const bank = POPULAR_BANKS.find(b => b.code === e.target.value);
                handleChange('bankCode', e.target.value);
                if (bank) handleChange('bankName', bank.name);
              }}
                className="w-full px-3 py-2.5 text-[12px] font-medium bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 focus:ring-1 focus:ring-brand-blue/10 transition-all text-slate-900 dark:text-white">
                <option value="">-- Chọn ngân hàng --</option>
                {POPULAR_BANKS.map(b => (
                  <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                ))}
              </select>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1"><Hash size={10} /> Số tài khoản</label>
              <input type="text" value={config.accountNumber} onChange={e => handleChange('accountNumber', e.target.value)}
                placeholder="123456789"
                className="w-full px-3 py-2.5 text-[13px] font-bold tracking-wider bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 focus:ring-1 focus:ring-brand-blue/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-gray-700 font-mono"
              />
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1"><User size={10} /> Chủ tài khoản</label>
              <input type="text" value={config.accountName} onChange={e => handleChange('accountName', e.target.value.toUpperCase())}
                placeholder="NGUYEN VAN A"
                className="w-full px-3 py-2.5 text-[12px] font-bold bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 focus:ring-1 focus:ring-brand-blue/10 transition-all text-slate-900 dark:text-white uppercase placeholder:text-slate-300 dark:placeholder:text-gray-700"
              />
            </div>
          </motion.div>

          {/* QR Settings */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode size={12} /> Cài đặt QR Code
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400">Kiểu QR (VietQR template)</label>
              <div className="grid grid-cols-4 gap-2">
                {QR_TEMPLATES.map(tpl => (
                  <button key={tpl} onClick={() => handleChange('qrTemplate', tpl)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${config.qrTemplate === tpl
                      ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                      : 'border-black/[0.06] dark:border-white/[0.06] text-slate-500 hover:border-brand-blue/30'
                      }`}>
                    {tpl}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 flex items-center gap-1"><FileText size={10} /> Ghi chú nội bộ</label>
              <textarea value={config.note} onChange={e => handleChange('note', e.target.value)}
                rows={2} placeholder="Ghi chú cho đội ngũ quản trị..."
                className="w-full px-3 py-2.5 text-[12px] font-medium bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-brand-blue/30 focus:ring-1 focus:ring-brand-blue/10 transition-all text-slate-900 dark:text-white resize-none placeholder:text-slate-300 dark:placeholder:text-gray-700"
              />
            </div>
          </motion.div>
        </div>

        {/* Right: QR Preview */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={12} /> Xem trước QR
            </p>

            {qrPreviewUrl ? (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-black/[0.04]">
                  <img src={qrPreviewUrl} alt="QR Preview" className="w-full rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div className="space-y-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngân hàng</span>
                    <span className="font-bold text-slate-900 dark:text-white">{config.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">STK</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{config.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Chủ TK</span>
                    <span className="font-bold text-slate-900 dark:text-white">{config.accountName}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-300 dark:text-gray-700 space-y-2">
                <QrCode size={32} />
                <p className="text-[10px] font-medium">Nhập thông tin ngân hàng để xem QR</p>
              </div>
            )}
          </motion.div>

          {/* Quick Info */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-4 bg-brand-blue/[0.03] border border-brand-blue/10 rounded-xl space-y-2">
            <p className="text-[10px] font-bold text-brand-blue flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Tích hợp VietQR
            </p>
            <ul className="text-[9px] text-slate-500 dark:text-gray-500 space-y-1 leading-relaxed">
              <li>• QR tương thích tất cả app ngân hàng VN</li>
              <li>• Tự động điền STK, số tiền, nội dung CK</li>
              <li>• Webhook xác nhận thanh toán realtime</li>
              <li>• Format: <code className="text-brand-blue">img.vietqr.io</code></li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>

    {/* ═══════════ CRYPTO USDT CONFIG ═══════════ */}
    <div className="space-y-6 max-w-4xl mt-10 pt-8 border-t border-black/[0.06] dark:border-white/[0.06]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet size={16} className="text-amber-500" /> Cấu hình Crypto (USDT)
          </h2>
          <p className="text-[10px] text-slate-400">Thanh toán USDT qua MetaMask trên BSC / ETH</p>
        </div>
        <button onClick={handleSaveCrypto} disabled={savingCrypto || !hasCryptoChanges}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-30">
          {savingCrypto ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Lưu Crypto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          {/* Toggle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cryptoConfig.isEnabled ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}>
                <Power size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Thanh toán Crypto</p>
                <p className="text-[9px] text-slate-400">{cryptoConfig.isEnabled ? 'Đang hoạt động' : 'Đã tắt'}</p>
              </div>
            </div>
            <button onClick={() => handleCryptoChange('isEnabled', !cryptoConfig.isEnabled)}
              className={`relative w-10 h-5 rounded-full transition-colors ${cryptoConfig.isEnabled ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${cryptoConfig.isEnabled ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </motion.div>

          {/* Wallet Address */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet size={12} /> Địa chỉ ví nhận USDT
            </p>
            <input type="text" value={cryptoConfig.walletAddress}
              onChange={e => handleCryptoChange('walletAddress', e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2.5 text-[12px] font-bold tracking-wider bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 font-mono" />
          </motion.div>

          {/* Networks */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={12} /> Mạng hỗ trợ
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[{ key: 'bsc', label: 'BNB Smart Chain (BSC)', tag: 'BEP-20' }, { key: 'eth', label: 'Ethereum (ETH)', tag: 'ERC-20' }].map(net => (
                <button key={net.key} onClick={() => toggleCryptoNetwork(net.key)}
                  className={`p-3 border rounded-xl text-left transition-all ${cryptoConfig.networks.includes(net.key)
                    ? 'border-amber-500 bg-amber-500/5 text-amber-600 dark:text-amber-400'
                    : 'border-black/[0.06] dark:border-white/[0.06] text-slate-400 opacity-50'
                  }`}>
                  <p className="text-[11px] font-bold">{net.label}</p>
                  <p className="text-[9px] mt-0.5 opacity-60">{net.tag}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="space-y-5">
          {/* Contract Addresses */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="p-5 bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06] rounded-xl space-y-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Link size={12} /> Contract USDT
            </p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400">BSC (BEP-20)</label>
                <input type="text" value={cryptoConfig.usdtContractBSC}
                  onChange={e => handleCryptoChange('usdtContractBSC', e.target.value)}
                  className="w-full px-3 py-2 text-[10px] font-mono bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-slate-700 dark:text-gray-300" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-400">ETH (ERC-20)</label>
                <input type="text" value={cryptoConfig.usdtContractETH}
                  onChange={e => handleCryptoChange('usdtContractETH', e.target.value)}
                  className="w-full px-3 py-2 text-[10px] font-mono bg-slate-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] rounded-lg text-slate-700 dark:text-gray-300" />
              </div>
            </div>
          </motion.div>

          {/* Info Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-4 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl space-y-2">
            <p className="text-[10px] font-bold text-amber-500 flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Tích hợp MetaMask
            </p>
            <ul className="text-[9px] text-slate-500 dark:text-gray-500 space-y-1 leading-relaxed">
              <li>• User kết nối ví MetaMask từ FE</li>
              <li>• Gửi USDT (BEP-20 / ERC-20) trực tiếp</li>
              <li>• Backend xác nhận tx hash và cộng credits</li>
              <li>• Hỗ trợ BSC & Ethereum mainnet</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
};
