export interface AlertThreshold {
  id: string;
  parameter: "temperature" | "humidity" | "airQuality" | "soilMoisture" | "co2";
  minValue?: number;
  maxValue?: number;
  enabled: boolean;
  notificationMethod: "browser" | "email" | "both";
}

export interface Alert {
  id: string;
  parameter: string;
  currentValue: number;
  thresholdValue: number;
  type: "above" | "below";
  timestamp: Date;
  severity: "low" | "medium" | "high";
  message: string;
}

class AlertService {
  private thresholds: AlertThreshold[] = [];
  private alerts: Alert[] = [];
  private listeners: ((alert: Alert) => void)[] = [];

  constructor() {
    this.loadThresholds();
    this.requestNotificationPermission();
  }

  private async requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  }

  private loadThresholds() {
    const saved = localStorage.getItem("alertThresholds");
    if (saved) {
      this.thresholds = JSON.parse(saved);
    } else {
      this.thresholds = this.getDefaultThresholds();
      this.saveThresholds();
    }
  }

  private getDefaultThresholds(): AlertThreshold[] {
    return [
      {
        id: "1",
        parameter: "temperature",
        minValue: 15,
        maxValue: 30,
        enabled: true,
        notificationMethod: "browser",
      },
      {
        id: "2",
        parameter: "humidity",
        minValue: 30,
        maxValue: 70,
        enabled: true,
        notificationMethod: "browser",
      },
      {
        id: "3",
        parameter: "airQuality",
        minValue: 0,
        maxValue: 100,
        enabled: true,
        notificationMethod: "browser",
      },
      {
        id: "4",
        parameter: "soilMoisture",
        minValue: 20,
        maxValue: 80,
        enabled: false,
        notificationMethod: "browser",
      },
      {
        id: "5",
        parameter: "co2",
        minValue: 0,
        maxValue: 1000,
        enabled: false,
        notificationMethod: "browser",
      },
    ];
  }

  private saveThresholds() {
    localStorage.setItem("alertThresholds", JSON.stringify(this.thresholds));
  }

  getThresholds(): AlertThreshold[] {
    return [...this.thresholds];
  }

  updateThreshold(id: string, updates: Partial<AlertThreshold>) {
    const index = this.thresholds.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.thresholds[index] = { ...this.thresholds[index], ...updates };
      this.saveThresholds();
    }
  }

  checkValue(parameter: string, value: number) {
    const threshold = this.thresholds.find(
      (t) => t.parameter === parameter && t.enabled,
    );
    if (!threshold) return;

    let alert: Alert | null = null;

    if (threshold.maxValue !== undefined && value > threshold.maxValue) {
      alert = {
        id: Date.now().toString(),
        parameter,
        currentValue: value,
        thresholdValue: threshold.maxValue,
        type: "above",
        timestamp: new Date(),
        severity: this.calculateSeverity(value, threshold.maxValue, "above"),
        message: `${parameter} is above threshold: ${value} > ${threshold.maxValue}`,
      };
    } else if (threshold.minValue !== undefined && value < threshold.minValue) {
      alert = {
        id: Date.now().toString(),
        parameter,
        currentValue: value,
        thresholdValue: threshold.minValue,
        type: "below",
        timestamp: new Date(),
        severity: this.calculateSeverity(value, threshold.minValue, "below"),
        message: `${parameter} is below threshold: ${value} < ${threshold.minValue}`,
      };
    }

    if (alert) {
      this.triggerAlert(alert, threshold.notificationMethod);
    }
  }

  checkThresholds(sensorData: any) {
    Object.entries(sensorData).forEach(([parameter, value]) => {
      this.checkValue(parameter, value as number);
    });
  }

  private calculateSeverity(
    value: number,
    threshold: number,
    type: "above" | "below",
  ): "low" | "medium" | "high" {
    const diff = Math.abs(value - threshold);
    const percentage = (diff / threshold) * 100;

    if (percentage > 30) return "high";
    if (percentage > 15) return "medium";
    return "low";
  }

  private triggerAlert(alert: Alert, method: "browser" | "email" | "both") {
    this.alerts.unshift(alert);
    if (this.alerts.length > 50) this.alerts = this.alerts.slice(0, 50);

    this.listeners.forEach((listener) => listener(alert));

    if (method === "browser" || method === "both") {
      this.sendBrowserNotification(alert);
    }

    if (method === "email" || method === "both") {
      this.sendEmailNotification(alert);
    }
  }

  private sendBrowserNotification(alert: Alert) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Environmental Alert", {
        body: alert.message,
        icon: "/icon.png",
        badge: "/badge.png",
        tag: alert.parameter,
        requireInteraction: alert.severity === "high",
      });
    }
  }

  private sendEmailNotification(alert: Alert) {
    console.log("Email notification would be sent:", alert);
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  clearAlerts() {
    this.alerts = [];
  }

  onAlert(callback: (alert: Alert) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export const alertService = new AlertService();
