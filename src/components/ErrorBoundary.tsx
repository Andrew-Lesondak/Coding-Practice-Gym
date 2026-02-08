import React from 'react';

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-ink-950 text-mist-100">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-16">
          <h1 className="text-2xl font-semibold text-ember-200">Something went wrong</h1>
          <p className="text-sm text-mist-200">
            The app hit an unexpected error. Try reloading. If it keeps happening, check the console for
            details.
          </p>
          {this.state.message && (
            <pre className="rounded-xl border border-ink-700 bg-ink-900 px-4 py-3 text-xs text-ember-100">
              {this.state.message}
            </pre>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            className="w-fit rounded-xl bg-ember-500 px-4 py-2 text-sm font-semibold text-ink-950"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
