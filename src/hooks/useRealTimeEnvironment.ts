import { useState, useEffect, useCallback } from "react";
import {
  fetchEnvironmentalData,
  calculateEcosystemImpact,
  type EnvironmentalData,
  type EcosystemImpact,
} from "../services/realTimeEnvironmentalData";

export interface UseRealTimeEnvironmentOptions {
  lat?: number;
  lon?: number;
  locationName?: string;
  updateInterval?: number; // milliseconds
  autoUpdate?: boolean;
}

export interface UseRealTimeEnvironmentReturn {
  data: EnvironmentalData | null;
  impact: EcosystemImpact | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage real-time environmental data
 */
export function useRealTimeEnvironment(
  options: UseRealTimeEnvironmentOptions = {},
): UseRealTimeEnvironmentReturn {
  const {
    lat = 0,
    lon = 0,
    locationName = "Global",
    updateInterval = 300000, // 5 minutes default
    autoUpdate = true,
  } = options;

  const [data, setData] = useState<EnvironmentalData | null>(null);
  const [impact, setImpact] = useState<EcosystemImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const envData = await fetchEnvironmentalData(lat, lon, locationName);
      const ecosystemImpact = calculateEcosystemImpact(envData);

      setData(envData);
      setImpact(ecosystemImpact);
      setLastUpdated(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch environmental data";
      setError(errorMessage);
      console.error("Error fetching environmental data:", err);
    } finally {
      setLoading(false);
    }
  }, [lat, lon, locationName]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-update interval
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(refresh, updateInterval);
    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, refresh]);

  return {
    data,
    impact,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}
