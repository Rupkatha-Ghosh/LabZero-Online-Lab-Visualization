import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface FeedbackErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface FeedbackErrorBoundaryState {
  error: Error | null;
}

class FeedbackErrorBoundary extends React.Component<
  FeedbackErrorBoundaryProps,
  FeedbackErrorBoundaryState
> {
  state: FeedbackErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('Feedback module crashed:', error);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="feedback-module min-h-screen bg-slate-50 px-4 py-10 text-slate-950">
        <section className="mx-auto max-w-xl rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle size={24} />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-950">
            {this.props.fallbackTitle ?? 'Feedback module unavailable'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Something went wrong while rendering this page.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </section>
      </main>
    );
  }
}

export default FeedbackErrorBoundary;
