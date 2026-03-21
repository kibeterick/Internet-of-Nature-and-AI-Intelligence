import React, { useState, useEffect } from "react";
import {
  AreaHealth,
  Alert,
  mockAreaHealth,
  analyzeEcosystemHealth,
  generateAlerts,
  getHealthStatus,
} from "../services/ecosystemHealthService";
import { AlertCircle, TrendingUp, TrendingDown, Zap } from "lucide-react";

interface HealthCardProps {
  label: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
}

const HealthCard: React.FC<HealthCardProps> = ({
  label,
  value,
  unit,
  status,
}) => {
  const statusColors = {
    healthy: "bg-green-100 border-green-300 text-green-800",
    warning: "bg-yellow-100 border-yellow-300 text-yellow-800",
    critical: "bg-red-100 border-red-300 text-red-800",
  };

  const progressColors = {
    healthy: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-sm">{label}</span>
        <span className="text-xs font-bold">{status.toUpperCase()}</span>
      </div>
      <div className="mb-3">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs opacity-75">{unit}</div>
      </div>
      <div className="w-full bg-gray-300 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${progressColors[status]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

interface AlertItemProps {
  alert: Alert;
  onResolve: (alertId: string) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onResolve }) => {
  const typeColors = {
    critical: "bg-red-50 border-l-4 border-red-500",
    warning: "bg-yellow-50 border-l-4 border-yellow-500",
    info: "bg-blue-50 border-l-4 border-blue-500",
  };

  const typeIcons = {
    critical: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div className={`p-4 rounded ${typeColors[alert.type]}`}>
      <div className="flex items-start gap-3">
        {typeIcons[alert.type]}
        <div className="flex-1">
          <p className="font-semibold text-sm">{alert.message}</p>
          <p className="text-xs opacity-75 mt-1">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        {!alert.resolved && (
          <button
            onClick={() => onResolve(alert.id)}
            className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-100 font-semibold"
          >
            Resolve
          </button>
        )}
      </div>
    </div>
  );
};

export const EcosystemHealthDashboard: React.FC = () => {
  const [areas, setAreas] = useState<AreaHealth[]>(mockAreaHealth);
  const [selectedArea, setSelectedArea] = useState<AreaHealth | null>(
    mockAreaHealth[0],
  );
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (selectedArea) {
      setAlerts(selectedArea.alerts);
    }
  }, [selectedArea]);

  const handleAnalyzeArea = async () => {
    if (!selectedArea) return;
    setLoadingAnalysis(true);
    try {
      const analysis = await analyzeEcosystemHealth(selectedArea);
      setAiAnalysis(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      setAiAnalysis("Failed to generate analysis. Please try again.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts(
      alerts.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
    );
  };

  const handleGenerateAlerts = async () => {
    if (!selectedArea) return;
    const newAlerts = await generateAlerts(selectedArea);
    setAlerts([...alerts, ...newAlerts]);
  };

  const healthStatus = selectedArea
    ? getHealthStatus(selectedArea.overallHealth)
    : "healthy";

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🌍 Ecosystem Health Monitor
        </h1>
        <p className="text-gray-600">
          Real-time monitoring of ecosystem health across multiple areas
        </p>
      </div>

      {/* Area Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          Select Monitoring Area
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {areas.map((area) => (
            <button
              key={area.id}
              onClick={() => setSelectedArea(area)}
              className={`p-4 rounded-lg text-left transition-all ${
                selectedArea?.id === area.id
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white text-gray-800 hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="font-semibold">{area.name}</div>
              <div className="text-sm opacity-75">
                Health: {area.overallHealth}/100
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedArea && (
        <>
          {/* Overall Health Status */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedArea.name}
              </h2>
              <div
                className={`px-4 py-2 rounded-full font-bold text-white ${
                  healthStatus === "healthy"
                    ? "bg-green-500"
                    : healthStatus === "warning"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              >
                {healthStatus.toUpperCase()}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">
                  Overall Health Score
                </span>
                <span className="text-3xl font-bold text-blue-600">
                  {selectedArea.overallHealth}
                </span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    healthStatus === "healthy"
                      ? "bg-green-500"
                      : healthStatus === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${selectedArea.overallHealth}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Last updated:{" "}
              {new Date(selectedArea.lastUpdated).toLocaleString()}
            </p>
          </div>

          {/* Health Metrics Grid */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Health Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <HealthCard
                label="Air Quality"
                value={selectedArea.airQuality}
                unit="AQI"
                status={getHealthStatus(selectedArea.airQuality)}
              />
              <HealthCard
                label="Water Quality"
                value={selectedArea.waterQuality}
                unit="pH"
                status={getHealthStatus(selectedArea.waterQuality)}
              />
              <HealthCard
                label="Soil Health"
                value={selectedArea.soilHealth}
                unit="Index"
                status={getHealthStatus(selectedArea.soilHealth)}
              />
              <HealthCard
                label="Biodiversity"
                value={selectedArea.biodiversity}
                unit="Species"
                status={getHealthStatus(selectedArea.biodiversity)}
              />
            </div>
          </div>

          {/* Active Alerts */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Active Alerts ({alerts.filter((a) => !a.resolved).length})
              </h2>
              <button
                onClick={handleGenerateAlerts}
                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm font-semibold"
              >
                Check for New Alerts
              </button>
            </div>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onResolve={handleResolveAlert}
                  />
                ))
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
                  ✓ No active alerts. Ecosystem is stable.
                </div>
              )}
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                AI Ecosystem Analysis
              </h2>
              <button
                onClick={handleAnalyzeArea}
                disabled={loadingAnalysis}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 font-semibold"
              >
                {loadingAnalysis ? "Analyzing..." : "Analyze Area"}
              </button>
            </div>

            {aiAnalysis && (
              <div className="p-4 bg-blue-50 rounded border border-blue-200 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                {aiAnalysis}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
