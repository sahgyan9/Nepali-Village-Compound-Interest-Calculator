import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        {
          className: 'min-h-screen flex items-center justify-center bg-gray-100 p-4',
        },
        React.createElement(
          'div',
          { className: 'bg-white rounded-xl shadow-lg p-8 max-w-md text-center' },
          React.createElement(
            'h1',
            { className: 'text-2xl font-bold text-red-600 mb-4' },
            'Something went wrong'
          ),
          React.createElement(
            'p',
            { className: 'text-gray-600 mb-6' },
            'The application encountered an unexpected error. Please try refreshing the page.'
          ),
          React.createElement(
            'button',
            {
              onClick: () => window.location.reload(),
              className:
                'px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors',
            },
            'Refresh Page'
          )
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
