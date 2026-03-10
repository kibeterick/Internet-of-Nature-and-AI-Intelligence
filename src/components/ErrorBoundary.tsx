import React, { ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-red-200 p-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-red-900 mb-2">
              Oops! Something went wrong
            </h1>

            <p className="text-center text-red-700 mb-4">
              The application encountered an unexpected error. Don't worry,
              we'll help you get back on track.
            </p>

            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs font-mono text-red-900 break-words">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
              </div>
            )}

            {this.state.errorInfo && (
              <details className="mb-4">
                <summary className="text-xs font-bold text-red-700 cursor-pointer hover:text-red-900">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-40 text-red-900">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
              >
                <RefreshCw size={18} />
                Reload Application
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-bold"
              >
                Go to Home
              </button>

              <button
                onClick={() => {
                  const errorMessage = `Error: ${this.state.error?.toString()}\n\nStack: ${this.state.errorInfo?.componentStack}`;
                  navigator.clipboard.writeText(errorMessage);
                  alert("Error details copied to clipboard");
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold"
              >
                Copy Error Details
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              If the problem persists, please check the browser console (F12)
              for more details or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
