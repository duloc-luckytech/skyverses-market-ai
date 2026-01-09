import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'error': return <AlertCircle className="text-red-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      default: return <Info className="text-brand-blue" size={18} />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 left-8 z-[2000] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              className="pointer-events-auto min-w-[320px] max-w-md bg-white dark:bg-[#111114] border border-black/10 dark:border-white/10 shadow-2xl rounded-2xl overflow-hidden flex items-center p-4 gap-4"
            >
              <div className="shrink-0">{getIcon(toast.type)}</div>
              <div className="flex-grow">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500 mb-0.5">{toast.type}</p>
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-relaxed">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-400 transition-colors"
              >
                <X size={14} />
              </button>
              <div className="absolute bottom-0 left-0 h-0.5 bg-brand-blue/30 w-full overflow-hidden">
                 <motion.div 
                   initial={{ x: '-100%' }} 
                   animate={{ x: '0%' }} 
                   transition={{ duration: 4, ease: 'linear' }}
                   className={`h-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-brand-blue'}`}
                 />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
