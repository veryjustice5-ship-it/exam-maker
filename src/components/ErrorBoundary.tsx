import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ExamCraft Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold">Something went wrong</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected error occurred while rendering the examination platform.
              You can reload the page or clear cached exam session data below.
            </p>

            {this.state.error && (
              <pre className="text-[11px] bg-slate-950 p-3 rounded-lg text-rose-300 font-mono text-left overflow-x-auto max-h-32 border border-slate-800">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset &amp; Start Fresh</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
