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
    console.error('Error Boundary caught an error:', {
      error: error.toString(),
      errorInfo,
      timestamp: new Date().toISOString(),
    });

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
        <div className="error-boundary-container">
          <div className="error-boundary-box">
            <h1 className="error-boundary-title">Oops! Something went wrong</h1>
            <p className="error-boundary-message">{this.state.errorMessage}</p>
            <button onClick={this.handleReset} className="error-boundary-button">
              Try Again
            </button>
            <p className="error-boundary-footer">
              If the problem persists, please refresh the page or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ErrorBoundary({ children }: { children: ReactNode }) {
  const toastContext = useContext(ToastContext);
  return <ErrorBoundaryComponent addToast={toastContext?.addToast} children={children} />;
}

export default ErrorBoundary;
