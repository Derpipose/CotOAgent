import React, { useContext, type ReactNode } from 'react';
import type { ToastContextType } from '../context/ToastContext';
import { ToastContext } from '../context/ToastContext';

interface Props {
  children: ReactNode;
  addToast?: ToastContextType['addToast'];
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundaryComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', {
      error: error.toString(),
      errorInfo,
      timestamp: new Date().toISOString(),
    });

    // Trigger error toast notification
    if (this.props.addToast) {
      const errorMsg = error.message || 'An unexpected error occurred';
      this.props.addToast(errorMsg, 'error', 5000);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-violet-700 p-5">
          <div className="bg-white rounded-xl shadow-2xl p-10 max-w-md text-center">
            <h1 className="text-red-500 text-3xl m-0 mb-4 font-bold">Oops! Something went wrong</h1>
            <p className="text-gray-500 text-base leading-relaxed m-0 mb-6">{this.state.errorMessage}</p>
            <button onClick={this.handleReset} className="bg-indigo-600 text-white border-none px-8 py-3 rounded-lg font-bold cursor-pointer transition-colors mb-6 hover:bg-indigo-700 active:scale-98">
              Try Again
            </button>
            <p className="text-gray-400 text-sm m-0">
              If the problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-Order Component wrapper to provide addToast from context
function ErrorBoundary({ children }: { children: ReactNode }) {
  const toastContext = useContext(ToastContext);
  return <ErrorBoundaryComponent addToast={toastContext?.addToast} children={children} />;
}

export default ErrorBoundary;
