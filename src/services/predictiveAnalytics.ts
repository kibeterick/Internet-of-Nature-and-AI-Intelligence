import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Prediction {
  id: string;
  type:
    | "plant_stress"
    | "disease_outbreak"
    | "weather_shift"
    | "biodiversity_change";
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  timeframe: string;
  description: string;
  affectedAreas: string[];
  recommendations: string[];
  timestamp: Date;
}

export interface SensorData {
  id: string;
  type: string;
  value: number;
  unit: string;
  location: string;
  timestamp: Date;
}

export class PredictiveAnalyticsService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async predictPlantStress(
    sensorData: SensorData[],
  ): Promise<Prediction | null> {
    const moistureSensors = sensorData.filter(
      (s) => s.type === "soil_moisture",
    );
    const tempSensors = sensorData.filter((s) => s.type === "temperature");

    const lowMoisture = moistureSensors.filter((s) => s.value < 30);
    const highTemp = tempSensors.filter((s) => s.value > 32);

    if (lowMoisture.length > 0 || highTemp.length > 0) {
      const severity = lowMoisture.length > 3 ? "high" : "medium";
      const affectedAreas = [
        ...new Set([...lowMoisture, ...highTemp].map((s) => s.location)),
      ];

      const prompt = `Based on these conditions: ${lowMoisture.length} sensors showing low soil moisture (<30%) and ${highTemp.length} sensors showing high temperature (>32°C) in areas: ${affectedAreas.join(", ")}. Provide 3 specific recommendations to prevent plant stress.`;

      const recommendations = await this.generateRecommendations(prompt);

      return {
        id: `pred_${Date.now()}_stress`,
        type: "plant_stress",
        severity,
        confidence: 0.85,
        timeframe: "24-48 hours",
        description: `Plant stress detected in ${affectedAreas.length} areas due to low moisture and high temperature`,
        affectedAreas,
        recommendations,
        timestamp: new Date(),
      };
    }
    return null;
  }

  async predictDiseaseOutbreak(
    sensorData: SensorData[],
  ): Promise<Prediction | null> {
    const humiditySensors = sensorData.filter((s) => s.type === "humidity");
    const airQualitySensors = sensorData.filter(
      (s) => s.type === "air_quality",
    );

    const highHumidity = humiditySensors.filter((s) => s.value > 80);
    const poorAirQuality = airQualitySensors.filter((s) => s.value < 50);

    if (highHumidity.length > 2) {
      const affectedAreas = [...new Set(highHumidity.map((s) => s.location))];

      const prompt = `High humidity (>80%) detected in ${affectedAreas.length} areas: ${affectedAreas.join(", ")}. This creates conditions favorable for fungal diseases. Provide 3 preventive measures.`;

      const recommendations = await this.generateRecommendations(prompt);

      return {
        id: `pred_${Date.now()}_disease`,
        type: "disease_outbreak",
        severity: "medium",
        confidence: 0.72,
        timeframe: "3-7 days",
        description: `Conditions favorable for fungal disease development in ${affectedAreas.length} areas`,
        affectedAreas,
        recommendations,
        timestamp: new Date(),
      };
    }
    return null;
  }

  async predictWeatherShift(
    sensorData: SensorData[],
  ): Promise<Prediction | null> {
    const tempSensors = sensorData.filter((s) => s.type === "temperature");
    const humiditySensors = sensorData.filter((s) => s.type === "humidity");

    if (tempSensors.length < 2) return null;

    const tempChange = Math.abs(
      tempSensors[0].value - tempSensors[tempSensors.length - 1].value,
    );

    if (tempChange > 5) {
      const affectedAreas = [...new Set(tempSensors.map((s) => s.location))];

      const prompt = `Rapid temperature change of ${tempChange.toFixed(1)}°C detected across ${affectedAreas.length} monitoring areas. Provide 3 actions to protect sensitive species.`;

      const recommendations = await this.generateRecommendations(prompt);

      return {
        id: `pred_${Date.now()}_weather`,
        type: "weather_shift",
        severity: tempChange > 8 ? "high" : "medium",
        confidence: 0.78,
        timeframe: "12-24 hours",
        description: `Rapid temperature shift of ${tempChange.toFixed(1)}°C detected`,
        affectedAreas,
        recommendations,
        timestamp: new Date(),
      };
    }
    return null;
  }

  private async generateRecommendations(prompt: string): Promise<string[]> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const lines = text.split("\n").filter((line) => line.trim().length > 0);
      return lines
        .slice(0, 3)
        .map((line) => line.replace(/^[\d\.\-\*]\s*/, "").trim());
    } catch (error) {
      console.error("Error generating recommendations:", error);
      return [
        "Monitor affected areas closely",
        "Implement standard mitigation protocols",
        "Consult with ecological specialists",
      ];
    }
  }

  async runPredictions(sensorData: SensorData[]): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    const [stressPred, diseasePred, weatherPred] = await Promise.all([
      this.predictPlantStress(sensorData),
      this.predictDiseaseOutbreak(sensorData),
      this.predictWeatherShift(sensorData),
    ]);

    if (stressPred) predictions.push(stressPred);
    if (diseasePred) predictions.push(diseasePred);
    if (weatherPred) predictions.push(weatherPred);

    return predictions;
  }

  generateAlerts(predictions: Prediction[]): string[] {
    return predictions
      .filter((p) => p.severity === "high" || p.severity === "critical")
      .map(
        (p) => `${p.type.replace("_", " ").toUpperCase()}: ${p.description}`,
      );
  }
}
