import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SensorReading {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  type: "air" | "water" | "soil" | "biodiversity";
  timestamp: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical";
  trend: "improving" | "stable" | "declining";
}

export interface AreaHealth {
  id: string;
  name: string;
  coordinates: [number, number];
  overallHealth: number; // 0-100
  airQuality: number;
  waterQuality: number;
  soilHealth: number;
  biodiversity: number;
  lastUpdated: string;
  sensors: SensorReading[];
  alerts: Alert[];
}

export interface Alert {
  id: string;
  areaId: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Mock sensor data
export const mockSensorData: SensorReading[] = [
  {
    id: "sensor-1",
    name: "Central Park Air Monitor",
    location: "Central Park, NYC",
    coordinates: [-73.9654, 40.7829],
    type: "air",
    timestamp: new Date().toISOString(),
    value: 45,
    unit: "AQI",
    status: "healthy",
    trend: "improving",
  },
  {
    id: "sensor-2",
    name: "Hudson River Water Quality",
    location: "Hudson River",
    coordinates: [-73.9733, 40.7394],
    type: "water",
    timestamp: new Date().toISOString(),
    value: 72,
    unit: "pH",
    status: "warning",
    trend: "stable",
  },
  {
    id: "sensor-3",
    name: "Soil Nutrient Analyzer",
    location: "Brooklyn Botanical Garden",
    coordinates: [-73.9969, 40.7061],
    type: "soil",
    timestamp: new Date().toISOString(),
    value: 85,
    unit: "NPK Index",
    status: "healthy",
    trend: "improving",
  },
  {
    id: "sensor-4",
    name: "Biodiversity Tracker",
    location: "Prospect Park",
    coordinates: [-73.9703, 40.6629],
    type: "biodiversity",
    timestamp: new Date().toISOString(),
    value: 78,
    unit: "Species Count",
    status: "healthy",
    trend: "improving",
  },
];

export const mockAreaHealth: AreaHealth[] = [
  {
    id: "area-1",
    name: "Central Park Ecosystem",
    coordinates: [-73.9654, 40.7829],
    overallHealth: 82,
    airQuality: 85,
    waterQuality: 75,
    soilHealth: 88,
    biodiversity: 80,
    lastUpdated: new Date().toISOString(),
    sensors: mockSensorData.slice(0, 2),
    alerts: [
      {
        id: "alert-1",
        areaId: "area-1",
        type: "warning",
        message: "Water quality slightly below optimal levels",
        timestamp: new Date().toISOString(),
        resolved: false,
      },
    ],
  },
  {
    id: "area-2",
    name: "Brooklyn Waterfront",
    coordinates: [-73.9969, 40.7061],
    overallHealth: 68,
    airQuality: 72,
    waterQuality: 65,
    soilHealth: 70,
    biodiversity: 65,
    lastUpdated: new Date().toISOString(),
    sensors: mockSensorData.slice(2, 4),
    alerts: [
      {
        id: "alert-2",
        areaId: "area-2",
        type: "critical",
        message: "Biodiversity index declining - investigate habitat loss",
        timestamp: new Date().toISOString(),
        resolved: false,
      },
    ],
  },
];

export async function analyzeEcosystemHealth(
  areaData: AreaHealth,
): Promise<string> {
  if (!genAI) {
    return "AI analysis unavailable. Please check your API key.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze this ecosystem health data and provide actionable insights:

Area: ${areaData.name}
Overall Health Score: ${areaData.overallHealth}/100
Air Quality: ${areaData.airQuality}/100
Water Quality: ${areaData.waterQuality}/100
Soil Health: ${areaData.soilHealth}/100
Biodiversity: ${areaData.biodiversity}/100

Provide:
1. Current ecosystem status
2. Key concerns
3. Recommendations for improvement
4. Predicted trends if no action taken`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("AI analysis error:", error);
    return "Unable to generate AI analysis at this time.";
  }
}

export async function generateAlerts(areaData: AreaHealth): Promise<Alert[]> {
  const alerts: Alert[] = [];

  if (areaData.airQuality < 50) {
    alerts.push({
      id: `alert-${Date.now()}-air`,
      areaId: areaData.id,
      type: "critical",
      message: "Critical air quality levels detected",
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  }

  if (areaData.waterQuality < 60) {
    alerts.push({
      id: `alert-${Date.now()}-water`,
      areaId: areaData.id,
      type: "warning",
      message: "Water quality below recommended levels",
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  }

  if (areaData.biodiversity < 70) {
    alerts.push({
      id: `alert-${Date.now()}-bio`,
      areaId: areaData.id,
      type: "warning",
      message: "Biodiversity index declining",
      timestamp: new Date().toISOString(),
      resolved: false,
    });
  }

  return alerts;
}

export function calculateHealthScore(
  airQuality: number,
  waterQuality: number,
  soilHealth: number,
  biodiversity: number,
): number {
  return Math.round(
    (airQuality + waterQuality + soilHealth + biodiversity) / 4,
  );
}

export function getHealthStatus(
  score: number,
): "healthy" | "warning" | "critical" {
  if (score >= 75) return "healthy";
  if (score >= 50) return "warning";
  return "critical";
}
