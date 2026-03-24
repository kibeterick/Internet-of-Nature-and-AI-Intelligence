import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  Power,
  AlertTriangle,
  Info,
  AlertCircle,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserAlerts,
  saveEnvironmentalAlert,
  deleteAlert,
  toggleAlertStatus,
  getAlertStatistics,
  type EnvironmentalAlert,
  type AlertCondition,
  type AlertMetric,
  type AlertSeverity,
} from "../services/environmentalAlerts";

export function EnvironmentalAlertsConfig() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<EnvironmentalAlert | null>(
    null,
  );
  const [statistics, setStatistics] = useState({
    totalAlerts: 0,
    enabledAlerts: 0,
    totalTriggers: 0,
    criticalTriggers: 0,
    warningTriggers: 0,
    infoTriggers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAlerts();
      loadStatistics();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const userAlerts = await getUserAlerts(user.uid);
    setAlerts(userAlerts);
    setLoading(false);
  };

  const loadStatistics = async () => {
    if (!user) return;
    const stats = await getAlertStatistics(user.uid);
    setStatistics(stats);
  };

  const handleToggleAlert = async (alertId: string, enabled: boolean) => {
    await toggleAlertStatus(alertId, enabled);
    await loadAlerts();
    await loadStatistics();
  };

  const handleDeleteAlert = async (alertId: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      await deleteAlert(alertId);
      await loadAlerts();
      await loadStatistics();
    }
  };

  const handleEditAlert = (alert: EnvironmentalAlert) => {
    setEditingAlert(alert);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingAlert(null);
  };

  const handleSaveAlert = async () => {
    await loadAlerts();
    await loadStatistics();
    handleCloseModal();
  };

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4" />;
      case "info":
        return <Info className="w-4 h-4" />;
    }
  };

  const getConditionIcon = (condition: AlertCondition) => {
    switch (condition) {
      case "above":
        return <TrendingUp className="w-4 h-4" />;
      case "below":
        return <TrendingDown className="w-4 h-4" />;
      case "equals":
        return <Minus className="w-4 h-4" />;
      case "between":
        return <ArrowUpDown className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">
          Please sign in to configure environmental alerts
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Environmental Alerts
        </h1>
        <p className="text-gray-600">
          Configure custom alerts for temperature, humidity, air quality, and
          more
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Alerts</div>
          <div className="text-2xl font-bold text-gray-900">
            {statistics.totalAlerts}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Enabled</div>
          <div className="text-2xl font-bold text-green-600">
            {statistics.enabledAlerts}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Triggers</div>
          <div className="text-2xl font-bold text-gray-900">
            {statistics.totalTriggers}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-red-600 mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-600">
            {statistics.criticalTriggers}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-yellow-600 mb-1">Warning</div>
          <div className="text-2xl font-bold text-yellow-600">
            {statistics.warningTriggers}
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="text-sm text-blue-600 mb-1">Info</div>
          <div className="text-2xl font-bold text-blue-600">
            {statistics.infoTriggers}
          </div>
        </div>
      </div>

      {/* Create Alert Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create New Alert
        </button>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nature-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-4">No alerts configured yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-nature-600 hover:text-nature-700 font-medium"
          >
            Create your first alert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}
                  >
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {alert.name}
                    </h3>
                    {alert.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {alert.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getConditionIcon(alert.condition)}
                      <span className="capitalize">
                        {alert.metric.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="capitalize">{alert.condition}</span>
                      <span className="font-medium">{alert.threshold}</span>
                      {alert.condition === "between" && alert.thresholdMax && (
                        <>
                          <span>and</span>
                          <span className="font-medium">
                            {alert.thresholdMax}
                          </span>
                        </>
                      )}
                    </div>
                    {alert.nodeIds && alert.nodeIds.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        Monitoring {alert.nodeIds.length} specific node(s)
                      </div>
                    )}
                    {alert.lastTriggered && (
                      <div className="mt-2 text-xs text-gray-500">
                        Last triggered:{" "}
                        {new Date(alert.lastTriggered).toLocaleString()}
                        {alert.triggerCount > 0 &&
                          ` (${alert.triggerCount} times)`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAlert(alert.id, !alert.enabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      alert.enabled
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={alert.enabled ? "Disable alert" : "Enable alert"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditAlert(alert)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                    title="Edit alert"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    title="Delete alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <AlertConfigModal
            alert={editingAlert}
            onClose={handleCloseModal}
            onSave={handleSaveAlert}
            userId={user.uid}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Alert Configuration Modal Component
function AlertConfigModal({
  alert,
  onClose,
  onSave,
  userId,
}: {
  alert: EnvironmentalAlert | null;
  onClose: () => void;
  onSave: () => void;
  userId: string;
}) {
  const [formData, setFormData] = useState({
    name: alert?.name || "",
    description: alert?.description || "",
    metric: alert?.metric || ("temperature" as AlertMetric),
    condition: alert?.condition || ("above" as AlertCondition),
    threshold: alert?.threshold || 0,
    thresholdMax: alert?.thresholdMax || 0,
    severity: alert?.severity || ("warning" as AlertSeverity),
    enabled: alert?.enabled ?? true,
    nodeIds: alert?.nodeIds || [],
    notificationChannels: alert?.notificationChannels || ["inApp"],
  });
  const [saving, setSaving] = useState(false);

  const metricOptions: { value: AlertMetric; label: string; unit: string }[] = [
    { value: "temperature", label: "Temperature", unit: "°C" },
    { value: "humidity", label: "Humidity", unit: "%" },
    { value: "airQuality", label: "Air Quality Index", unit: "AQI" },
    { value: "soilMoisture", label: "Soil Moisture", unit: "%" },
    { value: "co2", label: "CO2 Level", unit: "ppm" },
    { value: "pm25", label: "PM2.5", unit: "μg/m³" },
  ];

  const conditionOptions: { value: AlertCondition; label: string }[] = [
    { value: "above", label: "Above" },
    { value: "below", label: "Below" },
    { value: "equals", label: "Equals" },
    { value: "between", label: "Between" },
  ];

  const severityOptions: {
    value: AlertSeverity;
    label: string;
    color: string;
  }[] = [
    { value: "info", label: "Info", color: "blue" },
    { value: "warning", label: "Warning", color: "yellow" },
    { value: "critical", label: "Critical", color: "red" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await saveEnvironmentalAlert(userId, {
        ...formData,
        id: alert?.id,
      } as any);
      onSave();
    } catch (error) {
      console.error("Error saving alert:", error);
      alert("Failed to save alert. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedMetric = metricOptions.find((m) => m.value === formData.metric);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {alert ? "Edit Alert" : "Create New Alert"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
                placeholder="e.g., High Temperature Alert"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
                placeholder="Optional description"
                rows={2}
              />
            </div>

            {/* Metric */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric to Monitor *
              </label>
              <select
                value={formData.metric}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    metric: e.target.value as AlertMetric,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
                required
              >
                {metricOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    condition: e.target.value as AlertCondition,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
                required
              >
                {conditionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Threshold */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold * ({selectedMetric?.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      threshold: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
                  required
                />
              </div>
              {formData.condition === "between" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Threshold * ({selectedMetric?.unit})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.thresholdMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        thresholdMax: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nature-500 focus:border-transparent"
                    required
                  />
                </div>
              )}
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, severity: option.value })
                    }
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      formData.severity === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Enabled */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) =>
                  setFormData({ ...formData, enabled: e.target.checked })
                }
                className="w-4 h-4 text-nature-600 border-gray-300 rounded focus:ring-nature-500"
              />
              <label
                htmlFor="enabled"
                className="text-sm font-medium text-gray-700"
              >
                Enable alert immediately
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Alert
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
