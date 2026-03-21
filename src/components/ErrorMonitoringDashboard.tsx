import React, { useState, useEffect } from "react";
import {
  errorHandler,
  ErrorSeverity,
  ErrorLog,
} from "../services/errorHandler";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

export const ErrorMonitoringDashboard: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unresolved: 0,
    bySeverity: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
  });
  const [filter, setFilter] = useState<ErrorSeverity | "all">("all");

  useEffect(() => {
    // Subscribe to errors
    const unsubscribe = errorHandler.onError(() => {
      updateErrors();
    });

    // Initial load
    updateErrors();

    return unsubscribe;
  }, []);

  const updateErrors = () => {
    const allErrors = errorHandler.getErrors();
    setErrors(allErrors);
    setStats(errorHandler.getErrorStats());
  };

  const filteredErrors =
    filter === "all" ? errors : errors.filter((e) => e.severity === filter);

  const handleResolveError = (errorId: string) => {
    errorHandler.resolveError(errorId);
    updateErrors();
  };

  const handleClearAll = () => {
    errorHandler.clearErrors();
    updateErrors();
  };

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case ErrorSeverity.HIGH:
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case ErrorSeverity.CRITICAL:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.LOW:
        return "bg-blue-50 border-blue-200";
      case ErrorSeverity.MEDIUM:
        return "bg-yellow-50 border-yellow-200";
      case ErrorSeverity.HIGH:
        return "bg-orange-50 border-orange-200";
      case ErrorSeverity.CRITICAL:
        return "bg-red-50 border-red-200";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-8 h-8 text-red-600" />
          Error Monitoring Dashboard
        </h1>
        <p className="text-gray-600">
          Track and manage system errors in real-time
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-400">
          <p className="text-sm text-gray-600 mb-2">Total Errors</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-2">Unresolved</p>
          <p className="text-3xl font-bold text-red-600">{stats.unresolved}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-2">Low</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats.bySeverity.low}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600 mb-2">Medium</p>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.bySeverity.medium}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-600">
          <p className="text-sm text-gray-600 mb-2">Critical</p>
          <p className="text-3xl font-bold text-red-600">
            {stats.bySeverity.critical}
          </p>
        </div>
      </div>

      {/* Filter and Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {[
            "all",
            ErrorSeverity.LOW,
            ErrorSeverity.MEDIUM,
            ErrorSeverity.HIGH,
            ErrorSeverity.CRITICAL,
          ].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev as any)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                filter === sev
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {sev === "all"
                ? "All"
                : sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={updateErrors}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
        <button
          onClick={handleClearAll}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      {/* Error List */}
      <div className="space-y-3">
        {filteredErrors.length === 0 ? (
          <div className="bg-green-50 border-2 border-green-300 p-8 rounded-lg text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-green-800 font-semibold">No errors found</p>
            <p className="text-green-700 text-sm">System is running smoothly</p>
          </div>
        ) : (
          filteredErrors.map((error) => (
            <div
              key={error.id}
              className={`p-4 rounded-lg border-2 ${getSeverityColor(error.severity)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getSeverityIcon(error.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-gray-800">{error.message}</p>
                      {error.resolved && (
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded font-bold">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">Component:</span>{" "}
                      {error.component}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      <span className="font-semibold">Time:</span>{" "}
                      {new Date(error.timestamp).toLocaleString()}
                    </p>
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs font-semibold cursor-pointer text-gray-700 hover:text-gray-900">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32 text-gray-700">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                    {error.context && (
                      <details className="mt-2">
                        <summary className="text-xs font-semibold cursor-pointer text-gray-700 hover:text-gray-900">
                          Context
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32 text-gray-700">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                {!error.resolved && (
                  <button
                    onClick={() => handleResolveError(error.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold text-sm whitespace-nowrap"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
