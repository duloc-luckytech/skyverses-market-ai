import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'blog.title': 'Insights',
    'blog.subtitle': 'Insights, tutorials & news from the Skyverses ecosystem',
    'blog.search': 'Search articles...',
    'blog.all': 'All',
    'blog.featured': 'Featured',
    'blog.read_more': 'Read More',
    'blog.min_read': 'min read',
    'blog.views': 'views',
    'blog.share': 'Share',
    'blog.related': 'Related Articles',
    'blog.back': 'Back to Insights',
    'blog.toc': 'Table of Contents',
    'blog.no_posts': 'No articles found',
    'blog.load_more': 'Load More',
    'blog.categories': 'Categories',
    'blog.latest': 'Latest Articles',
    'blog.by': 'by',
    'blog.published': 'Published',
    'blog.copy_link': 'Copy Link',
    'blog.copied': 'Copied!',
    'blog.home': 'Home',
    'blog.newsletter_title': 'Stay Updated',
    'blog.newsletter_desc': 'Get the latest AI insights delivered to your inbox.',
    'blog.newsletter_btn': 'Subscribe',
    'blog.newsletter_placeholder': 'your@email.com',
    'footer.copyright': '© 2026 SKYVERSES ECOSYSTEM.',
    'footer.description': 'Leading AI production studio for work and creativity.',
    'footer.privacy': 'Privacy Policy',
  },
  vi: {
    'blog.title': 'Insights',
    'blog.subtitle': 'Kiến thức, hướng dẫn & tin tức từ hệ sinh thái Skyverses',
    'blog.search': 'Tìm kiếm bài viết...',
    'blog.all': 'Tất cả',
    'blog.featured': 'Nổi bật',
    'blog.read_more': 'Đọc thêm',
    'blog.min_read': 'phút đọc',
    'blog.views': 'lượt xem',
    'blog.share': 'Chia sẻ',
    'blog.related': 'Bài viết liên quan',
    'blog.back': 'Quay lại Insights',
    'blog.toc': 'Mục lục',
    'blog.no_posts': 'Không tìm thấy bài viết',
    'blog.load_more': 'Xem thêm',
    'blog.categories': 'Danh mục',
    'blog.latest': 'Bài viết mới nhất',
    'blog.by': 'bởi',
    'blog.published': 'Đăng ngày',
    'blog.copy_link': 'Sao chép link',
    'blog.copied': 'Đã sao chép!',
    'blog.home': 'Trang chủ',
    'blog.newsletter_title': 'Cập nhật tin tức',
    'blog.newsletter_desc': 'Nhận các bài viết AI mới nhất qua email.',
    'blog.newsletter_btn': 'Đăng ký',
    'blog.newsletter_placeholder': 'email@example.com',
    'footer.copyright': '© 2026 HỆ SINH THÁI SKYVERSES.',
    'footer.description': 'Studio sản xuất AI hàng đầu cho công việc và sáng tạo.',
    'footer.privacy': 'Chính sách Bảo mật',
  },
  ko: {
    'blog.title': 'Insights',
    'blog.subtitle': 'Skyverses 생태계의 인사이트, 튜토리얼 및 뉴스',
    'blog.search': '기사 검색...',
    'blog.all': '전체',
    'blog.featured': '추천',
    'blog.read_more': '더 읽기',
    'blog.min_read': '분 읽기',
    'blog.views': '조회수',
    'blog.share': '공유',
    'blog.related': '관련 기사',
    'blog.back': 'Insights로 돌아가기',
    'blog.toc': '목차',
    'blog.no_posts': '기사를 찾을 수 없습니다',
    'blog.load_more': '더 보기',
    'blog.categories': '카테고리',
    'blog.latest': '최신 기사',
    'blog.by': '작성자',
    'blog.published': '게시일',
    'blog.copy_link': '링크 복사',
    'blog.copied': '복사됨!',
    'blog.home': '홈',
    'blog.newsletter_title': '최신 소식 받기',
    'blog.newsletter_desc': '최신 AI 인사이트를 이메일로 받으세요.',
    'blog.newsletter_btn': '구독',
    'blog.newsletter_placeholder': 'your@email.com',
    'footer.copyright': '© 2026 SKYVERSES 생태계.',
    'footer.description': '업무와 창작을 위한 최고의 AI 제작 스튜디오.',
    'footer.privacy': '개인정보 처리방침',
  },
  ja: {
    'blog.title': 'Insights',
    'blog.subtitle': 'Skyversesエコシステムからのインサイト、チュートリアル、ニュース',
    'blog.search': '記事を検索...',
    'blog.all': 'すべて',
    'blog.featured': '注目',
    'blog.read_more': '続きを読む',
    'blog.min_read': '分で読める',
    'blog.views': '閲覧数',
    'blog.share': '共有',
    'blog.related': '関連記事',
    'blog.back': 'Insightsに戻る',
    'blog.toc': '目次',
    'blog.no_posts': '記事が見つかりません',
    'blog.load_more': 'もっと見る',
    'blog.categories': 'カテゴリー',
    'blog.latest': '最新記事',
    'blog.by': '著者',
    'blog.published': '公開日',
    'blog.copy_link': 'リンクをコピー',
    'blog.copied': 'コピーしました！',
    'blog.home': 'ホーム',
    'blog.newsletter_title': '最新情報を入手',
    'blog.newsletter_desc': '最新のAIインサイトをメールでお届けします。',
    'blog.newsletter_btn': '購読する',
    'blog.newsletter_placeholder': 'your@email.com',
    'footer.copyright': '© 2026 SKYVERSESエコシステム.',
    'footer.description': '仕事とクリエイティブのための最先端AIスタジオ.',
    'footer.privacy': 'プライバシーポリシー',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('skyverses_blog_lang') as Language;
      if (saved && ['en', 'vi', 'ko', 'ja'].includes(saved)) return saved;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('skyverses_blog_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);
  const t = (key: string) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
