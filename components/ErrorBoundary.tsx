
import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Detect chunk load failures (network issues, deploy mismatch)
    const isChunkError =
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch dynamically imported module') ||
      error.message?.includes('Importing a module script failed') ||
      error.name === 'ChunkLoadError';

    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.isChunkError) {
      // For chunk errors, hard reload to get fresh assets
      window.location.reload();
    } else {
      // For other errors, just reset the boundary
      this.setState({ hasError: false, error: null, isChunkError: false });
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#030304]">
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 400,
                height: 400,
                background: this.state.isChunkError
                  ? 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)',
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center max-w-md px-8">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8"
              style={{
                background: this.state.isChunkError
                  ? 'rgba(245,158,11,0.1)'
                  : 'rgba(239,68,68,0.1)',
                border: this.state.isChunkError
                  ? '1px solid rgba(245,158,11,0.15)'
                  : '1px solid rgba(239,68,68,0.15)',
              }}
            >
              <AlertTriangle
                size={28}
                style={{
                  color: this.state.isChunkError ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>

            {/* Title */}
            <h2 className="text-xl font-black tracking-tight text-white mb-3">
              {this.state.isChunkError
                ? 'Không thể tải trang'
                : 'Đã xảy ra lỗi'}
            </h2>

            {/* Description */}
            <p className="text-sm text-white/40 leading-relaxed mb-8">
              {this.state.isChunkError
                ? 'Kết nối mạng bị gián đoạn hoặc ứng dụng đã được cập nhật. Vui lòng tải lại trang.'
                : 'Một lỗi không mong muốn đã xảy ra. Vui lòng thử lại hoặc quay về trang chủ.'}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-lg"
              >
                <RefreshCw size={14} />
                {this.state.isChunkError ? 'Tải lại trang' : 'Thử lại'}
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-white/5 text-white/60 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 hover:text-white transition-all duration-200"
              >
                <Home size={14} />
                Trang chủ
              </button>
            </div>

            {/* Error details (dev only) */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 w-full text-left">
                <summary className="text-[10px] font-bold text-white/20 uppercase tracking-widest cursor-pointer hover:text-white/40 transition-colors">
                  Chi tiết lỗi
                </summary>
                <pre className="mt-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[11px] text-red-400/60 font-mono overflow-auto max-h-40">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
