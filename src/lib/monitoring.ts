// Application monitoring and health check utilities

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  checks: {
    api: boolean;
    websocket: boolean;
    firebase: boolean;
    gemini: boolean;
  };
  metrics: {
    uptime: number;
    memoryUsage?: number;
    activeConnections?: number;
  };
}

export class HealthMonitor {
  private startTime: number = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private listeners: Array<(status: HealthStatus) => void> = [];

  constructor(private intervalMs: number = 60000) {
    // Default: check every minute
  }

  start() {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.intervalMs);

    // Perform initial check
    this.performHealthCheck();
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  onStatusChange(callback: (status: HealthStatus) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private async performHealthCheck() {
    const checks = {
      api: await this.checkAPI(),
      websocket: this.checkWebSocket(),
      firebase: this.checkFirebase(),
      gemini: this.checkGemini(),
    };

    const allHealthy = Object.values(checks).every((check) => check);
    const someHealthy = Object.values(checks).some((check) => check);

    const status: HealthStatus = {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      timestamp: Date.now(),
      checks,
      metrics: {
        uptime: Date.now() - this.startTime,
        memoryUsage: this.getMemoryUsage(),
      },
    };

    this.notifyListeners(status);
  }

  private async checkAPI(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private checkWebSocket(): boolean {
    // Check if WebSocket is available and not in CLOSED state
    if (typeof WebSocket === 'undefined') return false;
    // This is a basic check - in real implementation, you'd check actual connection
    return true;
  }

  private checkFirebase(): boolean {
    // Check if Firebase is initialized
    try {
      const { auth, db } = require('./firebase');
      return !!(auth && db);
    } catch {
      return false;
    }
  }

  private checkGemini(): boolean {
    // Check if Gemini API key is configured
    return !!(import.meta.env.VITE_GEMINI_API_KEY);
  }

  private getMemoryUsage(): number | undefined {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  private notifyListeners(status: HealthStatus) {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in health status listener:', error);
      }
    });
  }
}

// Error tracking
export class ErrorTracker {
  private errors: Array<{
    message: string;
    stack?: string;
    timestamp: number;
    context?: any;
  }> = [];
  private maxErrors: number = 100;

  track(error: Error, context?: any) {
    this.errors.unshift({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context,
    });

    if (this.errors.length > this.maxErrors) {
      this.errors.pop();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Tracked error:', error, context);
    }

    // In production, you'd send this to a service like Sentry
    this.reportToService(error, context);
  }

  getRecentErrors(count: number = 10) {
    return this.errors.slice(0, count);
  }

  clear() {
    this.errors = [];
  }

  private reportToService(error: Error, context?: any) {
    // Implement integration with error tracking service
    // Example: Sentry, Rollbar, etc.
    if (import.meta.env.PROD) {
      // Send to error tracking service
      console.log('Would report to error tracking service:', error.message);
    }
  }
}

// Performance tracking
export class PerformanceTracker {
  private metrics: Map<
    string,
    Array<{ duration: number; timestamp: number }>
  > = new Map();

  mark(name: string) {
    performance.mark(name);
  }

  measure(name: string, startMark: string, endMark?: string) {
    try {
      if (endMark) {
        performance.measure(name, startMark, endMark);
      } else {
        performance.measure(name, startMark);
      }

      const entries = performance.getEntriesByName(name, 'measure');
      const latest = entries[entries.length - 1];

      if (latest) {
        this.recordMetric(name, latest.duration);
      }

      // Clean up marks
      performance.clearMarks(startMark);
      if (endMark) performance.clearMarks(endMark);
      performance.clearMeasures(name);
    } catch (error) {
      console.error('Performance measurement error:', error);
    }
  }

  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push({ duration, timestamp: Date.now() });

    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getMetrics(name: string) {
    const metrics = this.metrics.get(name) || [];
    if (metrics.length === 0) return null;

    const durations = metrics.map((m) => m.duration);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      average: sum / metrics.length,
      min: Math.min(...durations),
      max: Math.max(...durations),
      latest: durations[durations.length - 1],
    };
  }

  getAllMetrics() {
    const result: Record<string, any> = {};
    this.metrics.forEach((_, name) => {
      result[name] = this.getMetrics(name);
    });
    return result;
  }

  clear() {
    this.metrics.clear();
  }
}

// Global instances
export const healthMonitor = new HealthMonitor();
export const errorTracker = new ErrorTracker();
export const performanceTracker = new PerformanceTracker();

// Setup global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.track(event.error, {
      type: 'uncaught',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.track(
      new Error(event.reason?.message || 'Unhandled Promise Rejection'),
      {
        type: 'unhandled-rejection',
        reason: event.reason,
      }
    );
  });
}
