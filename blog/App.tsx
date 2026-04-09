import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import BlogHeader from './components/BlogHeader';
import BlogFooter from './components/BlogFooter';
import BlogHomePage from './pages/BlogHomePage';
import BlogPostPage from './pages/BlogPostPage';
import SearchPage from './pages/SearchPage';
import TagPage from './pages/TagPage';
import SitemapPage from './pages/SitemapPage';
import RSSFeedPage from './pages/RSSFeedPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* ── XML / Feed routes — no header/footer ── */}
            <Route path="/sitemap.xml" element={<SitemapPage />} />
            <Route path="/rss.xml" element={<RSSFeedPage />} />

            {/* ── Normal routes — with layout ── */}
            <Route path="*" element={
              <>
                <BlogHeader />
                <main className="min-h-screen">
                  <Routes>
                    <Route path="/" element={<BlogHomePage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/category/:category" element={<BlogHomePage />} />
                    <Route path="/tags/:tag" element={<TagPage />} />
                    <Route path="/:slug" element={<BlogPostPage />} />
                  </Routes>
                </main>
                <BlogFooter />
              </>
            } />
          </Routes>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
