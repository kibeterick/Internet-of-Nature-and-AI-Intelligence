import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Cloud,
  Droplets,
  Wind,
  Sun,
  Thermometer,
  Activity,
  AlertTriangle,
  RefreshCw,
  MapPin,
  TrendingUp,
  TrendingDown,
  Leaf,
  Bird,
} from "lucide-react";
import { useRealTimeEnvironment } from "../hooks/useRealTimeEnvironment";
import { getEnvironmentalDescription } from "../services/realTimeEnvironmentalData";

interface RealTimeEnvironmentalDashboardProps {
  lat?: number;
  lon?: number;
  locationName?: string;
  onImpactChange?: (impact: any) => void;
}

export function RealTimeEnvironmentalDashboard({
  lat = 0,
  lon = 0,
  locationName = "Global",
  onImpactChange,
}: RealTimeEnvironmentalDashboardProps) {
  const { data, impact, loading, error, lastUpdated, refresh } =
    useRealTimeEnvironment({
      lat,
      lon,
      locationName,
      updateInterval: 300000, // 5 minutes
      autoUpdate: true,
    });

  const [showDetails, setShowDetails] = useState(false);

  // Notify parent component of impact changes
  React.useEffect(() => {
    if (impact && onImpactChange) {
      onImpactChange(impact);
    }
  }, [impact, onImpactChange]);

  if (loading && !data) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-nature-600" />
          <span className="text-nature-600">Loading environmental data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 shadow-lg border border-red-200">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data || !impact) return null;

  const { weather, airQuality } = data;

  // Get AQI level and color
  const getAQIInfo = (aqi: number) => {
    if (aqi <= 50)
      return { level: "Good", color: "text-green-600", bg: "bg-green-50" };
    if (aqi <= 100)
      return {
        level: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    if (aqi <= 150)
      return {
        level: "Unhealthy for Sensitive",
        color: "text-orange-600",
        bg: "bg-orange-50",
      };
    if (aqi <= 200)
      return { level: "Unhealthy", color: "text-red-600", bg: "bg-red-50" };
    if (aqi <= 300)
      return {
        level: "Very Unhealthy",
        color: "text-purple-600",
        bg: "bg-purple-50",
      };
    return { level: "Hazardous", color: "text-red-800", bg: "bg-red-100" };
  };

  const aqiInfo = getAQIInfo(airQuality.aqi);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-nature-600 to-nature-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6" />
            <div>
              <h3 className="text-xl font-bold">
                Real-Time Environmental Data
              </h3>
              <div className="flex items-center space-x-2 text-nature-100 text-sm mt-1">
                <MapPin className="w-4 h-4" />
                <span>{locationName}</span>
                {lastUpdated && (
                  <span className="ml-2">
                    • Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={refresh}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperature */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <Thermometer className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold text-gray-800">
              {weather.temperature.toFixed(1)}°C
            </span>
          </div>
          <div className="text-sm text-gray-600">Temperature</div>
          <div className="mt-2 text-xs text-gray-500">
            Humidity: {weather.humidity.toFixed(0)}%
          </div>
        </motion.div>

        {/* Air Quality */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-xl p-4 shadow-md ${aqiInfo.bg}`}
        >
          <div className="flex items-center justify-between mb-2">
            <Wind className={`w-5 h-5 ${aqiInfo.color}`} />
            <span className={`text-2xl font-bold ${aqiInfo.color}`}>
              {airQuality.aqi.toFixed(0)}
            </span>
          </div>
          <div className={`text-sm ${aqiInfo.color} font-medium`}>
            {aqiInfo.level}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            PM2.5: {airQuality.pm25.toFixed(1)} μg/m³
          </div>
        </motion.div>

        {/* Precipitation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-bold text-gray-800">
              {weather.precipitation.toFixed(1)}mm
            </span>
          </div>
          <div className="text-sm text-gray-600">Precipitation</div>
          <div className="mt-2 text-xs text-gray-500">
            Clouds: {weather.cloudCover.toFixed(0)}%
          </div>
        </motion.div>

        {/* Wind */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <Wind className="w-5 h-5 text-gray-500" />
            <span className="text-2xl font-bold text-gray-800">
              {weather.windSpeed.toFixed(1)}
            </span>
          </div>
          <div className="text-sm text-gray-600">Wind Speed (km/h)</div>
          <div className="mt-2 text-xs text-gray-500">
            Direction: {weather.windDirection.toFixed(0)}°
          </div>
        </motion.div>
      </div>

      {/* Ecosystem Impact */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-200">
        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
          <Leaf className="w-5 h-5 mr-2 text-green-600" />
          Ecosystem Impact Analysis
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ecosystem Health */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Ecosystem Health</span>
              <span className="text-2xl font-bold text-green-600">
                {impact.ecosystemHealth.toFixed(0)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${impact.ecosystemHealth}%` }}
              />
            </div>
          </div>

          {/* Plant Growth */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center">
                <Leaf className="w-4 h-4 mr-1" />
                Plant Growth
              </span>
              <span className="text-2xl font-bold text-emerald-600">
                {(impact.plantGrowthRate * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              {impact.plantGrowthRate > 1 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              )}
              <span>
                {impact.plantGrowthRate > 1 ? "Above" : "Below"} normal
              </span>
            </div>
          </div>

          {/* Animal Activity */}
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 flex items-center">
                <Bird className="w-4 h-4 mr-1" />
                Animal Activity
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {(impact.animalActivityLevel * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              {impact.animalActivityLevel > 1 ? (
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
              )}
              <span>
                {impact.animalActivityLevel > 1 ? "High" : "Low"} activity
              </span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Water Availability</div>
            <div className="text-lg font-bold text-blue-600">
              {impact.waterAvailability.toFixed(0)}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Soil Moisture</div>
            <div className="text-lg font-bold text-brown-600">
              {impact.soilMoisture.toFixed(0)}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Photosynthesis</div>
            <div className="text-lg font-bold text-green-600">
              {(impact.photosynthesisRate * 100).toFixed(0)}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Pollution Stress</div>
            <div className="text-lg font-bold text-red-600">
              {(impact.pollutionStress * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Detailed View Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-left"
      >
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-800">
            {showDetails ? "Hide" : "Show"} Detailed Environmental Data
          </span>
          <Sun
            className={`w-5 h-5 text-nature-600 transition-transform ${showDetails ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Detailed Data */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
            {getEnvironmentalDescription(data)}
          </pre>
        </motion.div>
      )}
    </div>
  );
}
