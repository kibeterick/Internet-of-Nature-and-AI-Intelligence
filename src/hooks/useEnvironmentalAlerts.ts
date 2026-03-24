import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserAlerts,
  getRecentTriggers,
  evaluateAlerts,
  acknowledgeAlertTrigger,
  type EnvironmentalAlert,
  type AlertTrigger,
  type AlertMetric,
} from "../services/environmentalAlerts";

export function useEnvironmentalAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<EnvironmentalAlert[]>([]);
  const [triggers, setTriggers] = useState<AlertTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);

  // Load alerts
  const loadAlerts = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    try {
      const userAlerts = await getUserAlerts(user.uid);
      setAlerts(userAlerts);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load triggers
  const loadTriggers = useCallback(async () => {
    if (!user) {
      setTriggers([]);
      return;
    }

    try {
      const recentTriggers = await getRecentTriggers(user.uid);
      setTriggers(recentTriggers);
      setUnacknowledgedCount(
        recentTriggers.filter((t) => !t.acknowledged).length,
      );
    } catch (error) {
      console.error("Error loading triggers:", error);
    }
  }, [user]);

  // Evaluate sensor data against alerts
  const evaluateSensorData = useCallback(
    async (
      nodeId: string,
      nodeName: string,
      sensorData: Record<AlertMetric, number>,
    ) => {
      if (!user) return [];

      try {
        const newTriggers = await evaluateAlerts(
          user.uid,
          nodeId,
          nodeName,
          sensorData,
        );
        if (newTriggers.length > 0) {
          await loadTriggers();
        }
        return newTriggers;
      } catch (error) {
        console.error("Error evaluating sensor data:", error);
        return [];
      }
    },
    [user, loadTriggers],
  );

  // Acknowledge a trigger
  const acknowledgeTrigger = useCallback(
    async (triggerId: string) => {
      try {
        await acknowledgeAlertTrigger(triggerId);
        await loadTriggers();
      } catch (error) {
        console.error("Error acknowledging trigger:", error);
      }
    },
    [loadTriggers],
  );

  // Get enabled alerts
  const enabledAlerts = alerts.filter((alert) => alert.enabled);

  // Get alerts by severity
  const criticalAlerts = alerts.filter(
    (alert) => alert.severity === "critical" && alert.enabled,
  );
  const warningAlerts = alerts.filter(
    (alert) => alert.severity === "warning" && alert.enabled,
  );
  const infoAlerts = alerts.filter(
    (alert) => alert.severity === "info" && alert.enabled,
  );

  // Get recent triggers by severity
  const criticalTriggers = triggers.filter((t) => t.severity === "critical");
  const warningTriggers = triggers.filter((t) => t.severity === "warning");
  const infoTriggers = triggers.filter((t) => t.severity === "info");

  // Load data on mount and when user changes
  useEffect(() => {
    loadAlerts();
    loadTriggers();
  }, [loadAlerts, loadTriggers]);

  return {
    alerts,
    triggers,
    loading,
    unacknowledgedCount,
    enabledAlerts,
    criticalAlerts,
    warningAlerts,
    infoAlerts,
    criticalTriggers,
    warningTriggers,
    infoTriggers,
    loadAlerts,
    loadTriggers,
    evaluateSensorData,
    acknowledgeTrigger,
  };
}
