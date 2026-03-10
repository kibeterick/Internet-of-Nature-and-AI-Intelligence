import { useState, useEffect, useCallback } from "react";
import {
  PredictiveAnalyticsService,
  Prediction,
  SensorData,
} from "../services/predictiveAnalytics";

export function usePredictiveAnalytics(
  apiKey: string,
  sensorData: SensorData[],
  refreshInterval = 300000,
) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = useCallback(async () => {
    if (!apiKey || sensorData.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const service = new PredictiveAnalyticsService(apiKey);
      const newPredictions = await service.runPredictions(sensorData);
      const newAlerts = service.generateAlerts(newPredictions);

      setPredictions(newPredictions);
      setAlerts(newAlerts);
    } catch (err: any) {
      setError(err.message || "Failed to run predictive analysis");
      console.error("Predictive analytics error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, sensorData]);

  useEffect(() => {
    runAnalysis();
    const interval = setInterval(runAnalysis, refreshInterval);
    return () => clearInterval(interval);
  }, [runAnalysis, refreshInterval]);

  return {
    predictions,
    alerts,
    isLoading,
    error,
    refresh: runAnalysis,
  };
}
