
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../apis/config';
import {
  ShieldCheck, Lock, User, Loader2, Eye, EyeOff,
  Sun, Moon, AlertCircle
} from 'lucide-react';

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success && data.token) {
        // Save token & user to localStorage
        localStorage.setItem('skyverses_auth_token', data.token);
        localStorage.setItem('skyverses_auth', JSON.stringify({
          email: `${username}@skyverses.com`,
          name: username,
          role: 'admin',
        }));
        // Force reload to trigger AuthContext hydration
        window.location.href = '/';
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Theme toggle */}
      <button onClick={toggleTheme} className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white dark:bg-white/5 border border-black/[0.06] dark:border-white/[0.06] rounded-lg transition-all z-20">
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* Login form */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[380px] space-y-8">

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-14 h-14 bg-brand-blue rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-blue/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Skyverses CMS</h1>
              <p className="text-[12px] text-slate-400 mt-1">Đăng nhập vào hệ thống quản trị</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 tracking-wide">Tên đăng nhập</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text" value={username} onChange={e => { setUsername(e.target.value); setError(''); }}
                  placeholder="admin"
                  autoComplete="username" autoFocus
                  className="w-full pl-10 pr-4 py-3 text-[13px] font-medium bg-white dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] rounded-xl focus:outline-none focus:border-brand-blue/40 focus:ring-2 focus:ring-brand-blue/10 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-400 tracking-wide">Mật khẩu</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 text-[13px] font-medium bg-white dark:bg-white/[0.03] border border-black/[0.08] dark:border-white/[0.08] rounded-xl focus:outline-none focus:border-brand-blue/40 focus:ring-2 focus:ring-brand-blue/10 transition-all placeholder:text-slate-300 dark:placeholder:text-gray-700"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400">
                <AlertCircle size={14} />
                <span className="text-[11px] font-medium">{error}</span>
              </motion.div>
            )}

            {/* Submit */}
            <button type="submit" disabled={isLoading || !username || !password}
              className="w-full py-3 bg-brand-blue text-white rounded-xl text-[12px] font-bold shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2">
              {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} />}
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[10px] text-slate-300 dark:text-gray-700 pt-4">
            Skyverses CMS v2.0 · Admin Panel
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;