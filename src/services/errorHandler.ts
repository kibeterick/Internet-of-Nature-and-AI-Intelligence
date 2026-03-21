import toast from "react-hot-toast";

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ErrorLog {
  id: string;
  timestamp: string;
  message: string;
  severity: ErrorSeverity;
  component: string;
  stack?: string;
  context?: Record<string, any>;
  resolved: boolean;
}

export class ErrorHandler {
  private errorLogs: ErrorLog[] = [];
  private maxLogs: number = 100;
  private errorCallbacks: ((error: ErrorLog) => void)[] = [];

  constructor() {
    this.setupGlobalErrorHandler();
  }

  private setupGlobalErrorHandler(): void {
    if (typeof window !== "undefined") {
      window.addEventListener("error", (event) => {
        this.handleError(
          event.error?.message || "Unknown error",
          ErrorSeverity.HIGH,
          "Global",
          event.error?.stack,
        );
      });

      window.addEventListener("unhandledrejection", (event) => {
        this.handleError(
          event.reason?.message || "Unhandled promise rejection",
          ErrorSeverity.HIGH,
          "Promise",
          event.reason?.stack,
        );
      });
    }
  }

  handleError(
    message: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    component: string = "Unknown",
    stack?: string,
    context?: Record<string, any>,
  ): ErrorLog {
    const error: ErrorLog = {
      id: `error-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      message,
      severity,
      component,
      stack,
      context,
      resolved: false,
    };

    this.errorLogs.push(error);

    // Keep only recent logs
    if (this.errorLogs.length > this.maxLogs) {
      this.errorLogs = this.errorLogs.slice(-this.maxLogs);
    }

    // Show user notification based on severity
    this.notifyUser(error);

    // Call registered callbacks
    this.errorCallbacks.forEach((callback) => callback(error));

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[${severity.toUpperCase()}] ${component}: ${message}`, {
        stack,
        context,
      });
    }

    return error;
  }

  private notifyUser(error: ErrorLog): void {
    const messages = {
      [ErrorSeverity.LOW]: `⚠️ ${error.message}`,
      [ErrorSeverity.MEDIUM]: `⚠️ ${error.message}`,
      [ErrorSeverity.HIGH]: `❌ ${error.message}`,
      [ErrorSeverity.CRITICAL]: `🚨 Critical Error: ${error.message}`,
    };

    const toastFunctions = {
      [ErrorSeverity.LOW]: () => toast(messages[ErrorSeverity.LOW]),
      [ErrorSeverity.MEDIUM]: () => toast.error(messages[ErrorSeverity.MEDIUM]),
      [ErrorSeverity.HIGH]: () => toast.error(messages[ErrorSeverity.HIGH]),
      [ErrorSeverity.CRITICAL]: () =>
        toast.error(messages[ErrorSeverity.CRITICAL]),
    };

    toastFunctions[error.severity]?.();
  }

  resolveError(errorId: string): void {
    const error = this.errorLogs.find((e) => e.id === errorId);
    if (error) {
      error.resolved = true;
    }
  }

  getErrors(severity?: ErrorSeverity, component?: string): ErrorLog[] {
    return this.errorLogs.filter((error) => {
      if (severity && error.severity !== severity) return false;
      if (component && error.component !== component) return false;
      return true;
    });
  }

  getUnresolvedErrors(): ErrorLog[] {
    return this.errorLogs.filter((e) => !e.resolved);
  }

  clearErrors(): void {
    this.errorLogs = [];
  }

  onError(callback: (error: ErrorLog) => void): () => void {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter((cb) => cb !== callback);
    };
  }

  getErrorStats(): {
    total: number;
    unresolved: number;
    bySeverity: Record<ErrorSeverity, number>;
  } {
    const stats = {
      total: this.errorLogs.length,
      unresolved: this.errorLogs.filter((e) => !e.resolved).length,
      bySeverity: {
        [ErrorSeverity.LOW]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.CRITICAL]: 0,
      },
    };

    this.errorLogs.forEach((error) => {
      stats.bySeverity[error.severity]++;
    });

    return stats;
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();
