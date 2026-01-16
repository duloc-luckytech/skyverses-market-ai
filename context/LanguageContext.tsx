
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.browse': 'Market',
    'nav.explorer': 'Explorer',
    'nav.apps': 'Apps',
    'nav.about': 'About',
    'nav.deploy': 'Contact',
    'nav.login': 'Sign In',
    'nav.lang_settings': 'Language Settings',
    'user.menu.signout': 'Sign Out',
    'user.menu.profile': 'View Profile',
    'user.menu.referral': 'Refer Friends',
    'user.menu.admin': 'Admin Pro Panel',
    'user.menu.favorites': 'Assets Vault',
    'user.menu.usage': 'Usage History',
    'user.menu.settings': 'System Settings',
    'user.menu.support': 'Support Center',
    'user.menu.credits_label': 'Total Credits',
    'animate.status.rendering': 'Rendering...',
    'animate.status.error': 'Video Error',
    'animate.input.identity': 'Identity',
    'animate.input.upload_img': 'Upload Identity',
    'animate.input.motion': 'Motion',
    'animate.input.original_vid': 'Original Video',
    'animate.input.upload_vid': 'Upload Motion',
    'animate.mode.motion': 'Motion',
    'animate.mode.swap': 'Swap',
    'animate.header.autodownload': 'Auto-download',
    'animate.header.download_all': 'Download All',
    'animate.config.source': 'Source',
    'animate.config.model': 'Neural Model',
    'animate.config.res': 'Resolution',
    'animate.config.ratio': 'Ratio',
    'animate.footer.est_cost': 'Estimated Cost',
    'animate.footer.launch': 'Launch Studio',
    'animate.footer.low_balance': 'Low Balance (Requires {cost} CR)',
    'animate.results.title': 'Current Products',
    'animate.results.template': 'Template',
    'animate.results.clear': 'Clear',
    'login.title': 'Welcome to Skyverses',
    'login.subtitle': 'Sign in and continue creating',
    'login.back': 'Back to home',
    'login.google': 'Continue with Google',
    'login.apple': 'Continue with Apple',
    'login.x': 'Continue with X',
    'login.microsoft': 'Continue with Microsoft',
    'login.or': 'or',
    'login.email': 'Continue with Email',
  },
  vi: {
    'nav.browse': 'Thị trường',
    'nav.explorer': 'Khám phá',
    'nav.apps': 'Ứng dụng',
    'nav.about': 'Giới thiệu',
    'nav.deploy': 'Liên hệ',
    'nav.login': 'Đăng nhập',
    'nav.lang_settings': 'Cài đặt ngôn ngữ',
    'user.menu.signout': 'Đăng xuất',
    'user.menu.profile': 'Xem hồ sơ',
    'user.menu.referral': 'Giới thiệu bạn bè',
    'user.menu.admin': 'Quản trị Admin Pro',
    'user.menu.favorites': 'Kho lưu trữ',
    'user.menu.usage': 'Lịch sử sử dụng',
    'user.menu.settings': 'Cài đặt hệ thống',
    'user.menu.support': 'Trung tâm hỗ trợ',
    'user.menu.credits_label': 'Tổng Credits',
    'animate.status.rendering': 'Đang kết xuất...',
    'animate.status.error': 'Lỗi video',
    'animate.input.identity': 'Nhân vật',
    'animate.input.upload_img': 'Tải ảnh mẫu',
    'animate.input.motion': 'Chuyển động',
    'animate.input.original_vid': 'Video gốc',
    'animate.input.upload_vid': 'Tải video mẫu',
    'animate.mode.motion': 'Motion',
    'animate.mode.swap': 'Swap',
    'animate.header.autodownload': 'Tự động tải',
    'animate.header.download_all': 'Tải tất cả',
    'animate.config.source': 'Cơ sở hạ tầng',
    'animate.config.model': 'Model thần kinh',
    'animate.config.res': 'Độ phân giải',
    'animate.config.ratio': 'Tỉ lệ',
    'animate.footer.est_cost': 'Chi phí ước tính',
    'animate.footer.launch': 'Khởi chạy Studio',
    'animate.footer.low_balance': 'Số dư thấp (Cần {cost} CR)',
    'animate.results.title': 'Sản phẩm hiện tại',
    'animate.results.template': 'Template',
    'animate.results.clear': 'Dọn dẹp',
    'login.title': 'Chào mừng đến với Skyverses',
    'login.subtitle': 'Đăng nhập và tiếp tục sáng tạo',
    'login.back': 'Quay lại trang chủ',
    'login.google': 'Tiếp tục với Google',
    'login.apple': 'Tiếp tục với Apple',
    'login.x': 'Tiếp tục với X',
    'login.microsoft': 'Tiếp tục với Microsoft',
    'login.or': 'hoặc',
    'login.email': 'Tiếp tục với Email',
  },
  ko: {
    'nav.browse': '마켓',
    'nav.explorer': '탐색',
    'nav.apps': '앱',
    'nav.about': '소개',
    'nav.deploy': '문의하기',
    'nav.login': '로그인',
    'nav.lang_settings': '언어 설정',
    'user.menu.signout': '로그아웃',
    'animate.status.rendering': '렌더링 중...',
    'animate.status.error': '비디오 오류',
    'animate.input.identity': '아이덴티티',
    'animate.input.upload_img': '이미지 업로드',
    'animate.input.motion': '모션',
    'animate.input.original_vid': '원본 비디오',
    'animate.input.upload_vid': '비디오 업로드',
    'animate.mode.motion': '모션',
    'animate.mode.swap': '스왑',
    'animate.header.autodownload': '자동 다운로드',
    'animate.header.download_all': '모두 다운로드',
    'animate.config.source': '소스',
    'animate.config.model': '신경 모델',
    'animate.config.res': '해상도',
    'animate.config.ratio': '비율',
    'animate.footer.est_cost': '예상 비용',
    'animate.footer.launch': '스튜디오 시작',
    'animate.footer.low_balance': '잔액 부족 ({cost} CR 필요)',
    'animate.results.title': '현재 제품',
    'animate.results.template': '템플릿',
    'animate.results.clear': '삭제',
  },
  ja: {
    'nav.browse': 'マーケット',
    'nav.explorer': 'エクスプローラー',
    'nav.apps': 'アプリ',
    'nav.about': '会社概要',
    'nav.deploy': 'お問い合わせ',
    'nav.login': 'ログイン',
    'nav.lang_settings': '言語設定',
    'user.menu.signout': 'ログアウト',
    'animate.status.rendering': 'レンダリング中...',
    'animate.status.error': 'ビデオエラー',
    'animate.input.identity': 'アイデンティティ',
    'animate.input.upload_img': '画像をアップロード',
    'animate.input.motion': 'モーション',
    'animate.input.original_vid': '元のビデオ',
    'animate.input.upload_vid': 'ビデオをアップロード',
    'animate.mode.motion': 'モーション',
    'animate.mode.swap': 'スワップ',
    'animate.header.autodownload': '自動ダウンロード',
    'animate.header.download_all': 'すべてダウンロード',
    'animate.config.source': 'ソース',
    'animate.config.model': 'ニューラルモデル',
    'animate.config.res': '解像度',
    'animate.config.ratio': '比率',
    'animate.footer.est_cost': '推定コスト',
    'animate.footer.launch': 'スタジオを開始',
    'animate.footer.low_balance': '残高不足 ({cost} CRが必要)',
    'animate.results.title': '現在の製品',
    'animate.results.template': 'テンプレート',
    'animate.results.clear': 'クリア',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('skyversis_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('skyversis_lang', lang);
  }, [lang]);

  const t = (key: string, params?: Record<string, any>) => {
    let text = translations[lang][key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
