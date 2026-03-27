import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  /** Optioneel: vervang de standaard foutmelding met iets eigens */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Vangt alle onverwachte React-fouten op zodat de rest van de app
 * gewoon blijft draaien. Gebruik als wrapper in main.tsx.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hier kun je de fout naar een logging service sturen (bijv. Sentry)
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  private handleReload = () => window.location.reload();

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
        <div className="bg-[#141414] border border-rose-500/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Er is iets misgegaan
          </h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            {this.state.error?.message ?? 'Een onverwachte fout heeft plaatsgevonden.'}
          </p>

          {/* Stack trace in dev mode */}
          {import.meta.env.DEV && (
            <pre className="text-left text-[10px] text-gray-600 bg-black/40 rounded-lg p-3 mb-6 overflow-x-auto max-h-32 border border-white/5">
              {this.state.error?.stack}
            </pre>
          )}

          <button
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold rounded-xl transition-all"
          >
            <RefreshCw size={16} />
            Pagina herladen
          </button>
        </div>
      </div>
    );
  }
}
