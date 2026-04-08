import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import BlogHeader from './components/BlogHeader';
import BlogFooter from './components/BlogFooter';
import BlogHomePage from './pages/BlogHomePage';
import BlogPostPage from './pages/BlogPostPage';
import SearchPage from './pages/SearchPage';

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
          <BlogHeader />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<BlogHomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/category/:category" element={<BlogHomePage />} />
              <Route path="/:slug" element={<BlogPostPage />} />
            </Routes>
          </main>
          <BlogFooter />
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
