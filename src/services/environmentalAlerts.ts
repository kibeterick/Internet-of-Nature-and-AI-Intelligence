import { db } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export type AlertCondition = "above" | "below" | "equals" | "between";
export type AlertMetric =
  | "temperature"
  | "humidity"
  | "airQuality"
  | "soilMoisture"
  | "co2"
  | "pm25";
export type AlertSeverity = "info" | "warning" | "critical";

export interface EnvironmentalAlert {
  id: string;
  userId: string;
  name: string;
  description?: string;
  metric: AlertMetric;
  condition: AlertCondition;
  threshold: number;
  thresholdMax?: number; // For 'between' condition
  severity: AlertSeverity;
  enabled: boolean;
  nodeIds?: string[]; // Specific nodes to monitor, empty = all nodes
  notificationChannels: ("email" | "push" | "sms" | "inApp")[];
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertTrigger {
  id: string;
  alertId: string;
  nodeId: string;
  nodeName: string;
  metric: AlertMetric;
  value: number;
  threshold: number;
  condition: AlertCondition;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// Create or update an alert
export async function saveEnvironmentalAlert(
  userId: string,
  alert: Omit<
    EnvironmentalAlert,
    "id" | "userId" | "createdAt" | "updatedAt" | "triggerCount"
  >,
): Promise<string> {
  try {
    const alertId = alert.id || doc(collection(db, "environmentalAlerts")).id;
    const alertRef = doc(db, "environmentalAlerts", alertId);

    const existingAlert = await getDoc(alertRef);
    const now = new Date();

    const alertData: EnvironmentalAlert = {
      ...alert,
      id: alertId,
      userId,
      createdAt: existingAlert.exists()
        ? existingAlert.data().createdAt.toDate()
        : now,
      updatedAt: now,
      triggerCount: existingAlert.exists()
        ? existingAlert.data().triggerCount
        : 0,
    };

    await setDoc(alertRef, {
      ...alertData,
      createdAt: Timestamp.fromDate(alertData.createdAt),
      updatedAt: Timestamp.fromDate(alertData.updatedAt),
      lastTriggered: alertData.lastTriggered
        ? Timestamp.fromDate(alertData.lastTriggered)
        : null,
    });

    return alertId;
  } catch (error) {
    console.error("Error saving environmental alert:", error);
    throw error;
  }
}

// Get all alerts for a user
export async function getUserAlerts(
  userId: string,
): Promise<EnvironmentalAlert[]> {
  try {
    const alertsRef = collection(db, "environmentalAlerts");
    const q = query(alertsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        lastTriggered: data.lastTriggered?.toDate(),
      } as EnvironmentalAlert;
    });
  } catch (error) {
    console.error("Error getting user alerts:", error);
    return [];
  }
}

// Get a specific alert
export async function getAlert(
  alertId: string,
): Promise<EnvironmentalAlert | null> {
  try {
    const alertRef = doc(db, "environmentalAlerts", alertId);
    const alertDoc = await getDoc(alertRef);

    if (!alertDoc.exists()) {
      return null;
    }

    const data = alertDoc.data();
    return {
      ...data,
      id: alertDoc.id,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      lastTriggered: data.lastTriggered?.toDate(),
    } as EnvironmentalAlert;
  } catch (error) {
    console.error("Error getting alert:", error);
    return null;
  }
}

// Delete an alert
export async function deleteAlert(alertId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "environmentalAlerts", alertId));
  } catch (error) {
    console.error("Error deleting alert:", error);
    throw error;
  }
}

// Toggle alert enabled status
export async function toggleAlertStatus(
  alertId: string,
  enabled: boolean,
): Promise<void> {
  try {
    const alertRef = doc(db, "environmentalAlerts", alertId);
    await setDoc(
      alertRef,
      {
        enabled,
        updatedAt: Timestamp.fromDate(new Date()),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error toggling alert status:", error);
    throw error;
  }
}

// Check if a value triggers an alert
export function checkAlertCondition(
  value: number,
  condition: AlertCondition,
  threshold: number,
  thresholdMax?: number,
): boolean {
  switch (condition) {
    case "above":
      return value > threshold;
    case "below":
      return value < threshold;
    case "equals":
      return Math.abs(value - threshold) < 0.01; // Allow small floating point differences
    case "between":
      return (
        thresholdMax !== undefined &&
        value >= threshold &&
        value <= thresholdMax
      );
    default:
      return false;
  }
}

// Evaluate sensor data against alerts
export async function evaluateAlerts(
  userId: string,
  nodeId: string,
  nodeName: string,
  sensorData: Record<AlertMetric, number>,
): Promise<AlertTrigger[]> {
  try {
    const alerts = await getUserAlerts(userId);
    const triggers: AlertTrigger[] = [];

    for (const alert of alerts) {
      // Skip disabled alerts
      if (!alert.enabled) continue;

      // Check if alert applies to this node
      if (
        alert.nodeIds &&
        alert.nodeIds.length > 0 &&
        !alert.nodeIds.includes(nodeId)
      ) {
        continue;
      }

      // Get the sensor value for this metric
      const value = sensorData[alert.metric];
      if (value === undefined) continue;

      // Check if condition is met
      if (
        checkAlertCondition(
          value,
          alert.condition,
          alert.threshold,
          alert.thresholdMax,
        )
      ) {
        const trigger: AlertTrigger = {
          id: doc(collection(db, "alertTriggers")).id,
          alertId: alert.id,
          nodeId,
          nodeName,
          metric: alert.metric,
          value,
          threshold: alert.threshold,
          condition: alert.condition,
          severity: alert.severity,
          message: generateAlertMessage(alert, value, nodeName),
          timestamp: new Date(),
          acknowledged: false,
        };

        triggers.push(trigger);

        // Update alert trigger count and last triggered time
        await setDoc(
          doc(db, "environmentalAlerts", alert.id),
          {
            lastTriggered: Timestamp.fromDate(new Date()),
            triggerCount: alert.triggerCount + 1,
          },
          { merge: true },
        );

        // Save trigger to database
        await setDoc(doc(db, "alertTriggers", trigger.id), {
          ...trigger,
          timestamp: Timestamp.fromDate(trigger.timestamp),
        });
      }
    }

    return triggers;
  } catch (error) {
    console.error("Error evaluating alerts:", error);
    return [];
  }
}

// Generate human-readable alert message
function generateAlertMessage(
  alert: EnvironmentalAlert,
  value: number,
  nodeName: string,
): string {
  const metricNames: Record<AlertMetric, string> = {
    temperature: "Temperature",
    humidity: "Humidity",
    airQuality: "Air Quality Index",
    soilMoisture: "Soil Moisture",
    co2: "CO2 Level",
    pm25: "PM2.5",
  };

  const units: Record<AlertMetric, string> = {
    temperature: "°C",
    humidity: "%",
    airQuality: "AQI",
    soilMoisture: "%",
    co2: "ppm",
    pm25: "μg/m³",
  };

  const metricName = metricNames[alert.metric];
  const unit = units[alert.metric];

  let conditionText = "";
  switch (alert.condition) {
    case "above":
      conditionText = `exceeded ${alert.threshold}${unit}`;
      break;
    case "below":
      conditionText = `dropped below ${alert.threshold}${unit}`;
      break;
    case "equals":
      conditionText = `reached ${alert.threshold}${unit}`;
      break;
    case "between":
      conditionText = `is between ${alert.threshold}${unit} and ${alert.thresholdMax}${unit}`;
      break;
  }

  return `${metricName} at ${nodeName} ${conditionText}. Current value: ${value.toFixed(2)}${unit}`;
}

// Get recent alert triggers
export async function getRecentTriggers(
  userId: string,
  limit: number = 50,
): Promise<AlertTrigger[]> {
  try {
    const triggersRef = collection(db, "alertTriggers");
    const snapshot = await getDocs(triggersRef);

    const triggers = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp.toDate(),
        } as AlertTrigger;
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return triggers;
  } catch (error) {
    console.error("Error getting recent triggers:", error);
    return [];
  }
}

// Acknowledge an alert trigger
export async function acknowledgeAlertTrigger(
  triggerId: string,
): Promise<void> {
  try {
    const triggerRef = doc(db, "alertTriggers", triggerId);
    await setDoc(
      triggerRef,
      {
        acknowledged: true,
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Error acknowledging alert trigger:", error);
    throw error;
  }
}

// Get alert statistics
export async function getAlertStatistics(userId: string): Promise<{
  totalAlerts: number;
  enabledAlerts: number;
  totalTriggers: number;
  criticalTriggers: number;
  warningTriggers: number;
  infoTriggers: number;
}> {
  try {
    const alerts = await getUserAlerts(userId);
    const triggers = await getRecentTriggers(userId, 1000);

    return {
      totalAlerts: alerts.length,
      enabledAlerts: alerts.filter((a) => a.enabled).length,
      totalTriggers: triggers.length,
      criticalTriggers: triggers.filter((t) => t.severity === "critical")
        .length,
      warningTriggers: triggers.filter((t) => t.severity === "warning").length,
      infoTriggers: triggers.filter((t) => t.severity === "info").length,
    };
  } catch (error) {
    console.error("Error getting alert statistics:", error);
    return {
      totalAlerts: 0,
      enabledAlerts: 0,
      totalTriggers: 0,
      criticalTriggers: 0,
      warningTriggers: 0,
      infoTriggers: 0,
    };
  }
}
