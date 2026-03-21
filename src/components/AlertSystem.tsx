import { useState, useEffect } from "react";
import {
  Bell,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { alertService, AlertThreshold, Alert } from "../services/alertService";

const AlertSystem = () => {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setThresholds(alertService.getThresholds());
    setAlerts(alertService.getAlerts());

    const unsubscribe = alertService.onAlert((alert) => {
      setAlerts(alertService.getAlerts());
    });

    return unsubscribe;
  }, []);

  const handleThresholdUpdate = (
    id: string,
    updates: Partial<AlertThreshold>,
  ) => {
    alertService.updateThreshold(id, updates);
    setThresholds(alertService.getThresholds());
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getParameterLabel = (param: string) => {
    const labels: Record<string, string> = {
      temperature: "Temperature (°C)",
      humidity: "Humidity (%)",
      airQuality: "Air Quality Index",
      soilMoisture: "Soil Moisture (%)",
      co2: "CO2 (ppm)",
    };
    return labels[param] || param;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Alert System</h2>
          <p className="text-gray-600">Monitor environmental parameters</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Settings size={20} />
          {showSettings ? "Hide" : "Show"} Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Threshold Settings</h3>
          <div className="space-y-4">
            {thresholds.map((threshold) => (
              <div key={threshold.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium text-gray-700">
                    {getParameterLabel(threshold.parameter)}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={threshold.enabled}
                      onChange={(e) =>
                        handleThresholdUpdate(threshold.id, {
                          enabled: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Min Value
                    </label>
                    <input
                      type="number"
                      value={threshold.minValue || ""}
                      onChange={(e) =>
                        handleThresholdUpdate(threshold.id, {
                          minValue: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={!threshold.enabled}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Value
                    </label>
                    <input
                      type="number"
                      value={threshold.maxValue || ""}
                      onChange={(e) =>
                        handleThresholdUpdate(threshold.id, {
                          maxValue: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      disabled={!threshold.enabled}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Notification Method
                  </label>
                  <select
                    value={threshold.notificationMethod}
                    onChange={(e) =>
                      handleThresholdUpdate(threshold.id, {
                        notificationMethod: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={!threshold.enabled}
                  >
                    <option value="browser">Browser Only</option>
                    <option value="email">Email Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Bell size={24} />
            Active Alerts ({alerts.length})
          </h3>
          {alerts.length > 0 && (
            <button
              onClick={() => {
                alertService.clearAlerts();
                setAlerts([]);
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear All
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
            <p>No active alerts. All parameters within thresholds.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={20} />
                      <span className="font-semibold capitalize">
                        {alert.parameter}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white">
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm mb-1">{alert.message}</p>
                    <p className="text-xs opacity-75">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <XCircle
                    size={20}
                    className="cursor-pointer opacity-50 hover:opacity-100"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertSystem;
