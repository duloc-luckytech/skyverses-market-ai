import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X, Coins, Check, Loader2, Clock, Info, CheckCircle,
  Copy, Landmark, QrCode, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { skytokenApi } from '../../apis/skytoken';
import { API_BASE_URL } from '../../apis/config';
import type { SkyTokenPackage } from '../../types';

interface BankingConfig {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrTemplate: string;
  isEnabled: boolean;
}

interface PendingTx {
  _id: string;
  memo: string;
  amount: number;
  packageName: string;
  tokens: number;
  status: string;
  expiresAt: string;
}

interface Props {
  pkg: SkyTokenPackage;
  onClose: () => void;
  onSuccess: () => void;
}

const SkyTokenPurchaseModal: React.FC<Props> = ({ pkg, onClose, onSuccess }) => {
  const { lang } = useLanguage();
  const loc = (obj: Record<string, string>) => obj[lang] || obj.en || '';
  const { refreshUserInfo } = useAuth();

  const [status, setStatus] = useState<'CREATING' | 'WAITING' | 'POLLING' | 'SUCCESS' | 'EXPIRED' | 'ERROR'>('CREATING');
  const [bankingConfig, setBankingConfig] = useState<BankingConfig | null>(null);
  const [pendingTx, setPendingTx] = useState<PendingTx | null>(null);
  const [timer, setTimer] = useState(900);
  const [copied, setCopied] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [tokensAdded, setTokensAdded] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBankingConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/banking`);
      const data = await res.json();
      if (data.success) setBankingConfig(data.data);
    } catch {}
  };

  const createPurchase = async () => {
    setStatus('CREATING');
    try {
      const res = await skytokenApi.purchaseCreate(pkg.code);
      if (res.success && res.transaction) {
        setPendingTx(res.transaction);
        setStatus('WAITING');
        setTimer(900);
      } else {
        setStatus('ERROR');
      }
    } catch {
      setStatus('ERROR');
    }
  };

  const pollPayment = useCallback(async () => {
    if (!pendingTx) return;
    try {
      const res = await skytokenApi.purchaseCheck(pendingTx._id);
      if (res.status === 'success') {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        setTokensAdded(res.tokensAdded || pkg.totalTokens);
        setStatus('SUCCESS');
        await refreshUserInfo();
      } else if (res.status === 'expired' || res.status === 'failed') {
        clearInterval(pollRef.current!);
        clearInterval(timerRef.current!);
        setStatus('EXPIRED');
      }
      setPollCount(c => c + 1);
    } catch {}
  }, [pendingTx, pkg.totalTokens, refreshUserInfo]);

  const handleConfirmPaid = () => {
    setStatus('POLLING');
    setPollCount(0);
    pollRef.current = setInterval(pollPayment, 5000);
    pollPayment();
  };

  // Timer countdown
  useEffect(() => {
    if (status === 'WAITING' || status === 'POLLING') {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            clearInterval(pollRef.current!);
            setStatus('EXPIRED');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // Init
  useEffect(() => {
    fetchBankingConfig();
    createPurchase();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (status === 'SUCCESS') onSuccess();
    else onClose();
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const qrUrl = bankingConfig && pendingTx
    ? `https://img.vietqr.io/image/${bankingConfig.bankCode}-${bankingConfig.accountNumber}-${bankingConfig.qrTemplate || 'compact2'}.png?amount=${pendingTx.amount}&addInfo=${encodeURIComponent(pendingTx.memo)}&accountName=${encodeURIComponent(bankingConfig.accountName)}`
    : null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/[0.08] rounded-none md:rounded-lg shadow-atlas-lg overflow-hidden flex flex-col h-full md:h-auto md:max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-atlas-purple/10 text-atlas-purple flex items-center justify-center">
              <Coins size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {status === 'SUCCESS'
                  ? loc({ en: 'Success!', vi: 'Thành công!', ko: '성공!', ja: '成功!' })
                  : loc({ en: 'Purchase SkyToken', vi: 'Nạp SkyToken', ko: 'SkyToken 구매', ja: 'SkyToken購入' })}
              </h3>
              <p className="text-[10px] text-white/40">{pkg.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-red-500 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* SUCCESS */}
          {status === 'SUCCESS' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}>
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {loc({ en: 'Top-up successful!', vi: 'Nạp thành công!', ko: '충전 성공!', ja: 'チャージ成功!' })}
                </p>
                <p className="text-sm text-white/40 mt-1">+{tokensAdded.toLocaleString()} SKT</p>
              </div>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all"
              >
                {loc({ en: 'Close', vi: 'Đóng', ko: '닫기', ja: '閉じる' })}
              </button>
            </div>
          )}

          {/* EXPIRED */}
          {status === 'EXPIRED' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertCircle size={32} className="text-amber-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {loc({ en: 'Transaction expired', vi: 'Giao dịch hết hạn', ko: '거래 만료', ja: '取引期限切れ' })}
                </p>
                <p className="text-xs text-white/40 mt-1">
                  {loc({ en: 'Please try again.', vi: 'Vui lòng thử lại.', ko: '다시 시도해주세요.', ja: 'もう一度お試しください。' })}
                </p>
              </div>
              <button
                onClick={() => { createPurchase(); }}
                className="mt-2 px-6 py-2.5 bg-atlas-purple text-white rounded-xl text-xs font-bold"
              >
                {loc({ en: 'Retry', vi: 'Thử lại', ko: '다시 시도', ja: '再試行' })}
              </button>
            </div>
          )}

          {/* CREATING */}
          {status === 'CREATING' && (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-atlas-purple" size={28} />
              <p className="text-xs font-bold text-white/40">
                {loc({ en: 'Creating transaction...', vi: 'Đang tạo giao dịch...', ko: '거래 생성 중...', ja: '取引作成中...' })}
              </p>
            </div>
          )}

          {/* ERROR */}
          {status === 'ERROR' && (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <p className="text-sm font-bold text-red-500">
                {loc({ en: 'Transaction error.', vi: 'Lỗi tạo giao dịch.', ko: '거래 오류.', ja: '取引エラー。' })}
              </p>
              <button
                onClick={createPurchase}
                className="px-6 py-2.5 bg-atlas-purple text-white rounded-xl text-xs font-bold"
              >
                {loc({ en: 'Retry', vi: 'Thử lại', ko: '다시 시도', ja: '再試行' })}
              </button>
            </div>
          )}

          {/* WAITING / POLLING */}
          {(status === 'WAITING' || status === 'POLLING') && pendingTx && (
            <div className="space-y-5">
              {/* Order Summary */}
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    {loc({ en: 'Amount VND', vi: 'Số tiền VND', ko: '금액 VND', ja: '金額 VND' })}
                  </p>
                  <p className="text-2xl font-bold text-white tracking-tight">
                    {pendingTx.amount.toLocaleString('vi-VN')}₫
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    {loc({ en: 'You receive', vi: 'Nhận được', ko: '받는 양', ja: '受取' })}
                  </p>
                  <p className="text-xl font-bold text-atlas-purple">
                    {pkg.totalTokens.toLocaleString()} <span className="text-sm text-atlas-purple/50">SKT</span>
                  </p>
                </div>
              </div>

              {/* Bank Transfer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {bankingConfig && (
                    <div className="p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Landmark size={14} className="text-atlas-purple" />
                        <span className="text-[10px] font-bold text-white/40">{bankingConfig.bankName}</span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold text-white tracking-wider font-mono">
                            {bankingConfig.accountNumber}
                          </p>
                          <button
                            onClick={() => copyText(bankingConfig.accountNumber, 'acc')}
                            className="p-1.5 rounded-md hover:bg-white/[0.04] text-white/40"
                          >
                            {copied === 'acc' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                        <p className="text-[10px] font-bold text-white/40">{bankingConfig.accountName}</p>
                      </div>
                    </div>
                  )}

                  {/* Memo */}
                  <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Info size={12} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-400">
                        {loc({ en: 'Transfer note (required)', vi: 'Nội dung CK (bắt buộc)', ko: '이체 메모 (필수)', ja: '振込メモ（必須）' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-black/30 px-3 py-2.5 rounded-lg border border-amber-500/10">
                      <p className="text-sm font-bold text-amber-300 tracking-wider select-all font-mono">
                        {pendingTx.memo}
                      </p>
                      <button
                        onClick={() => copyText(pendingTx.memo, 'memo')}
                        className="p-1 text-amber-500"
                      >
                        {copied === 'memo' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="flex items-center gap-2 px-1 text-white/30">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold">
                      {loc({ en: 'Expires in', vi: 'Hết hạn trong', ko: '만료까지', ja: '有効期限' })}{' '}
                      <span className={timer < 120 ? 'text-red-500' : 'text-amber-500'}>
                        {formatTime(timer)}
                      </span>
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="relative w-full max-w-[200px] p-3 bg-white border border-white/10 rounded-xl shadow-sm">
                    {status === 'POLLING' && (
                      <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl">
                        <Loader2 className="animate-spin text-atlas-purple" size={24} />
                        <p className="text-[10px] font-bold text-atlas-purple text-center">
                          {loc({ en: 'Checking...', vi: 'Đang kiểm tra...', ko: '확인 중...', ja: '確認中...' })}
                        </p>
                        <p className="text-[8px] text-white/40">#{pollCount}</p>
                      </div>
                    )}
                    {qrUrl ? (
                      <>
                        <img
                          src={qrUrl}
                          className="w-full rounded-lg"
                          alt="VietQR"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pendingTx.memo)}`;
                          }}
                        />
                        <div className="flex items-center justify-center gap-1.5 mt-2">
                          <QrCode size={10} className="text-atlas-purple" />
                          <p className="text-[9px] font-bold text-white/40">
                            {loc({ en: 'Scan with bank app', vi: 'Quét bằng app ngân hàng', ko: '은행 앱으로 스캔', ja: '銀行アプリでスキャン' })}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="w-full aspect-square flex items-center justify-center">
                        <Loader2 size={24} className="animate-spin text-white/30" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {status === 'WAITING' && (
                <button
                  onClick={handleConfirmPaid}
                  className="w-full py-4 bg-atlas-purple text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-atlas-purple/20"
                >
                  <CheckCircle size={16} />
                  {loc({ en: "I've paid", vi: 'Tôi đã thanh toán', ko: '결제 완료', ja: '支払い済み' })}
                </button>
              )}
              {status === 'POLLING' && (
                <div className="w-full py-4 bg-atlas-purple/10 border border-atlas-purple/20 text-atlas-purple rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {loc({ en: 'Waiting for confirmation...', vi: 'Đang chờ xác nhận...', ko: '확인 대기 중...', ja: '確認待ち...' })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SkyTokenPurchaseModal;
