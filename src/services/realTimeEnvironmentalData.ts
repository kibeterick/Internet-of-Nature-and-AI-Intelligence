/**
 * Real-Time Environmental Data Service
 * Fetches live weather and air quality data from public APIs
 */

export interface WeatherData {
  temperature: number; // Celsius
  humidity: number; // Percentage
  precipitation: number; // mm
  windSpeed: number; // km/h
  windDirection: number; // Degrees
  pressure: number; // hPa
  cloudCover: number; // Percentage
  uvIndex: number;
  visibility: number; // km
  timestamp: Date;
}

export interface AirQualityData {
  aqi: number; // Air Quality Index (0-500)
  co2: number; // ppm
  pm25: number; // μg/m³
  pm10: number; // μg/m³
  o3: number; // μg/m³
  no2: number; // μg/m³
  so2: number; // μg/m³
  co: number; // μg/m³
  timestamp: Date;
}

export interface EnvironmentalData {
  weather: WeatherData;
  airQuality: AirQualityData;
  location: {
    lat: number;
    lon: number;
    name: string;
  };
}

export interface EcosystemImpact {
  plantGrowthRate: number; // Multiplier (0-2)
  animalActivityLevel: number; // Multiplier (0-2)
  waterAvailability: number; // Percentage (0-100)
  soilMoisture: number; // Percentage (0-100)
  photosynthesisRate: number; // Multiplier (0-2)
  pollutionStress: number; // 0-1 (0 = no stress, 1 = severe)
  temperatureStress: number; // 0-1
  ecosystemHealth: number; // 0-100
}

// Free weather API - OpenWeatherMap (requires API key)
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "";

// Free air quality API - OpenAQ
const OPENAQ_API_URL = "https://api.openaq.org/v2";

/**
 * Fetch real-time weather data
 */
export async function fetchWeatherData(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  try {
    // If no API key, return simulated data
    if (!OPENWEATHER_API_KEY) {
      return generateSimulatedWeatherData(lat, lon);
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      precipitation: data.rain?.["1h"] || 0,
      windSpeed: data.wind.speed * 3.6, // Convert m/s to km/h
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      cloudCover: data.clouds.all,
      uvIndex: data.uvi || 5,
      visibility: data.visibility / 1000, // Convert m to km
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return generateSimulatedWeatherData(lat, lon);
  }
}

/**
 * Fetch real-time air quality data
 */
export async function fetchAirQualityData(
  lat: number,
  lon: number,
): Promise<AirQualityData> {
  try {
    // OpenAQ API - free, no key required
    const radius = 25000; // 25km radius
    const url = `${OPENAQ_API_URL}/latest?coordinates=${lat},${lon}&radius=${radius}&limit=100`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Air quality API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse measurements
    const measurements: { [key: string]: number } = {};
    if (data.results && data.results.length > 0) {
      data.results.forEach((result: any) => {
        result.measurements?.forEach((m: any) => {
          if (
            !measurements[m.parameter] ||
            m.lastUpdated > measurements[m.parameter + "_time"]
          ) {
            measurements[m.parameter] = m.value;
            measurements[m.parameter + "_time"] = m.lastUpdated;
          }
        });
      });
    }

    // Calculate AQI from PM2.5 (simplified)
    const pm25 = measurements.pm25 || 15;
    const aqi = calculateAQI(pm25);

    return {
      aqi,
      co2: measurements.co2 || 400 + Math.random() * 50, // Typical outdoor CO2
      pm25: measurements.pm25 || 15,
      pm10: measurements.pm10 || 25,
      o3: measurements.o3 || 50,
      no2: measurements.no2 || 20,
      so2: measurements.so2 || 10,
      co: measurements.co || 500,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("Error fetching air quality data:", error);
    return generateSimulatedAirQualityData();
  }
}

/**
 * Fetch complete environmental data
 */
export async function fetchEnvironmentalData(
  lat: number = 0,
  lon: number = 0,
  locationName: string = "Global",
): Promise<EnvironmentalData> {
  const [weather, airQuality] = await Promise.all([
    fetchWeatherData(lat, lon),
    fetchAirQualityData(lat, lon),
  ]);

  return {
    weather,
    airQuality,
    location: { lat, lon, name: locationName },
  };
}

/**
 * Calculate ecosystem impact from environmental data
 */
export function calculateEcosystemImpact(
  data: EnvironmentalData,
): EcosystemImpact {
  const { weather, airQuality } = data;

  // Temperature stress (optimal: 15-25°C)
  const tempStress = calculateTemperatureStress(weather.temperature);

  // Pollution stress (based on AQI)
  const pollutionStress = Math.min(airQuality.aqi / 200, 1);

  // Water availability (based on precipitation and humidity)
  const waterAvailability = Math.min(
    (weather.precipitation * 10 + weather.humidity) / 2,
    100,
  );

  // Soil moisture (based on precipitation, humidity, temperature)
  const soilMoisture = Math.max(
    0,
    Math.min(100, waterAvailability - (weather.temperature - 20) * 2),
  );

  // Photosynthesis rate (affected by light, temperature, CO2, pollution)
  const lightFactor = (100 - weather.cloudCover) / 100;
  const tempFactor = 1 - tempStress;
  const co2Factor = Math.min(airQuality.co2 / 400, 1.5); // CO2 fertilization effect
  const pollutionFactor = 1 - pollutionStress * 0.5;

  const photosynthesisRate =
    lightFactor * tempFactor * co2Factor * pollutionFactor;

  // Plant growth rate (affected by all factors)
  const plantGrowthRate = Math.max(
    0.1,
    photosynthesisRate *
      (waterAvailability / 100) *
      (1 - pollutionStress * 0.3),
  );

  // Animal activity level (affected by temperature, weather, pollution)
  const weatherFactor =
    1 - (weather.precipitation / 50 + weather.windSpeed / 100);
  const animalActivityLevel = Math.max(
    0.2,
    Math.min(2, (1 - tempStress) * weatherFactor * (1 - pollutionStress * 0.4)),
  );

  // Overall ecosystem health (0-100)
  const ecosystemHealth = Math.max(
    0,
    Math.min(
      100,
      100 *
        (1 - tempStress * 0.3) *
        (1 - pollutionStress * 0.4) *
        (waterAvailability / 100) *
        0.8 +
        20,
    ),
  );

  return {
    plantGrowthRate,
    animalActivityLevel,
    waterAvailability,
    soilMoisture,
    photosynthesisRate,
    pollutionStress,
    temperatureStress: tempStress,
    ecosystemHealth,
  };
}

/**
 * Calculate temperature stress (0 = optimal, 1 = severe stress)
 */
function calculateTemperatureStress(temp: number): number {
  const optimal = 20; // Optimal temperature
  const tolerance = 15; // Temperature tolerance range

  const deviation = Math.abs(temp - optimal);
  return Math.min(deviation / tolerance, 1);
}

/**
 * Calculate AQI from PM2.5 (simplified US EPA formula)
 */
function calculateAQI(pm25: number): number {
  if (pm25 <= 12) return (50 / 12) * pm25;
  if (pm25 <= 35.4) return 50 + ((100 - 50) / (35.4 - 12)) * (pm25 - 12);
  if (pm25 <= 55.4) return 100 + ((150 - 100) / (55.4 - 35.4)) * (pm25 - 35.4);
  if (pm25 <= 150.4)
    return 150 + ((200 - 150) / (150.4 - 55.4)) * (pm25 - 55.4);
  if (pm25 <= 250.4)
    return 200 + ((300 - 200) / (250.4 - 150.4)) * (pm25 - 150.4);
  return 300 + ((500 - 300) / (500.4 - 250.4)) * (pm25 - 250.4);
}

/**
 * Generate simulated weather data (fallback)
 */
function generateSimulatedWeatherData(lat: number, lon: number): WeatherData {
  const hour = new Date().getHours();
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000,
  );

  // Simulate seasonal temperature variation
  const seasonalTemp =
    15 + 10 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2);
  // Simulate daily temperature variation
  const dailyTemp = 5 * Math.sin(((hour - 6) / 24) * 2 * Math.PI);
  // Add latitude effect
  const latitudeEffect = -Math.abs(lat) / 10;

  const temperature =
    seasonalTemp + dailyTemp + latitudeEffect + (Math.random() - 0.5) * 3;

  return {
    temperature,
    humidity: 50 + Math.random() * 40,
    precipitation: Math.random() < 0.2 ? Math.random() * 10 : 0,
    windSpeed: 5 + Math.random() * 20,
    windDirection: Math.random() * 360,
    pressure: 1013 + (Math.random() - 0.5) * 20,
    cloudCover: Math.random() * 100,
    uvIndex: Math.max(0, 5 + (hour - 12) * -0.5 + Math.random() * 3),
    visibility: 10 + Math.random() * 10,
    timestamp: new Date(),
  };
}

/**
 * Generate simulated air quality data (fallback)
 */
function generateSimulatedAirQualityData(): AirQualityData {
  const pm25 = 10 + Math.random() * 30;
  const aqi = calculateAQI(pm25);

  return {
    aqi,
    co2: 400 + Math.random() * 50,
    pm25,
    pm10: pm25 * 1.5 + Math.random() * 10,
    o3: 40 + Math.random() * 40,
    no2: 15 + Math.random() * 25,
    so2: 5 + Math.random() * 15,
    co: 400 + Math.random() * 200,
    timestamp: new Date(),
  };
}

/**
 * Get environmental data description for AI/display
 */
export function getEnvironmentalDescription(data: EnvironmentalData): string {
  const { weather, airQuality } = data;
  const impact = calculateEcosystemImpact(data);

  const aqiLevel =
    airQuality.aqi <= 50
      ? "Good"
      : airQuality.aqi <= 100
        ? "Moderate"
        : airQuality.aqi <= 150
          ? "Unhealthy for Sensitive Groups"
          : airQuality.aqi <= 200
            ? "Unhealthy"
            : airQuality.aqi <= 300
              ? "Very Unhealthy"
              : "Hazardous";

  return `
Environmental Conditions at ${data.location.name}:

Weather:
- Temperature: ${weather.temperature.toFixed(1)}°C
- Humidity: ${weather.humidity.toFixed(0)}%
- Precipitation: ${weather.precipitation.toFixed(1)}mm
- Wind: ${weather.windSpeed.toFixed(1)} km/h
- Cloud Cover: ${weather.cloudCover.toFixed(0)}%

Air Quality:
- AQI: ${airQuality.aqi.toFixed(0)} (${aqiLevel})
- CO2: ${airQuality.co2.toFixed(0)} ppm
- PM2.5: ${airQuality.pm25.toFixed(1)} μg/m³
- PM10: ${airQuality.pm10.toFixed(1)} μg/m³

Ecosystem Impact:
- Ecosystem Health: ${impact.ecosystemHealth.toFixed(0)}%
- Plant Growth Rate: ${(impact.plantGrowthRate * 100).toFixed(0)}%
- Animal Activity: ${(impact.animalActivityLevel * 100).toFixed(0)}%
- Water Availability: ${impact.waterAvailability.toFixed(0)}%
- Pollution Stress: ${(impact.pollutionStress * 100).toFixed(0)}%
  `.trim();
}
