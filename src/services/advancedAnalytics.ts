// Advanced Analytics for Research & Conservation
export interface BiodiversityIndex {
  shannonIndex: number; // Species diversity
  simpsonIndex: number; // Dominance
  evenness: number; // Distribution
  richness: number; // Total species count
}

export interface TrendAnalysis {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "increasing" | "decreasing" | "stable";
  forecast: number[];
}

export interface EcosystemHealth {
  overall: number; // 0-100
  indicators: {
    biodiversity: number;
    waterQuality: number;
    airQuality: number;
    soilHealth: number;
    vegetation: number;
  };
  threats: Array<{
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  }>;
  recommendations: string[];
}

export interface SpeciesPopulation {
  speciesId: string;
  name: string;
  count: number;
  trend: "increasing" | "decreasing" | "stable";
  status: "healthy" | "threatened" | "endangered" | "critical";
  lastSeen: Date;
  locations: Array<{ lat: number; lng: number; count: number }>;
}

// Biodiversity Calculations
export function calculateBiodiversityIndex(
  speciesCounts: Record<string, number>,
): BiodiversityIndex {
  const species = Object.values(speciesCounts);
  const total = species.reduce((sum, count) => sum + count, 0);
  const richness = species.length;

  if (total === 0 || richness === 0) {
    return { shannonIndex: 0, simpsonIndex: 0, evenness: 0, richness: 0 };
  }

  // Shannon Diversity Index: H = -Σ(pi * ln(pi))
  let shannon = 0;
  let simpson = 0;

  for (const count of species) {
    const proportion = count / total;
    if (proportion > 0) {
      shannon -= proportion * Math.log(proportion);
      simpson += proportion * proportion;
    }
  }

  // Simpson's Index: D = 1 - Σ(pi²)
  simpson = 1 - simpson;

  // Evenness: E = H / ln(S)
  const evenness = richness > 1 ? shannon / Math.log(richness) : 1;

  return {
    shannonIndex: Number(shannon.toFixed(3)),
    simpsonIndex: Number(simpson.toFixed(3)),
    evenness: Number(evenness.toFixed(3)),
    richness,
  };
}

// Trend Analysis with Forecasting
export function analyzeTrend(
  data: Array<{ date: Date; value: number }>,
  metric: string,
): TrendAnalysis {
  if (data.length < 2) {
    return {
      metric,
      current: data[0]?.value || 0,
      previous: 0,
      change: 0,
      changePercent: 0,
      trend: "stable",
      forecast: [],
    };
  }

  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const current = sorted[sorted.length - 1].value;
  const previous = sorted[sorted.length - 2].value;
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

  // Simple linear regression for forecasting
  const n = sorted.length;
  const sumX = sorted.reduce((sum, _, i) => sum + i, 0);
  const sumY = sorted.reduce((sum, d) => sum + d.value, 0);
  const sumXY = sorted.reduce((sum, d, i) => sum + i * d.value, 0);
  const sumX2 = sorted.reduce((sum, _, i) => sum + i * i, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Forecast next 6 periods
  const forecast = Array.from({ length: 6 }, (_, i) => {
    const x = n + i;
    return Number((slope * x + intercept).toFixed(2));
  });

  const trend =
    Math.abs(changePercent) < 5
      ? "stable"
      : changePercent > 0
        ? "increasing"
        : "decreasing";

  return {
    metric,
    current: Number(current.toFixed(2)),
    previous: Number(previous.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    trend,
    forecast,
  };
}

// Ecosystem Health Assessment
export function assessEcosystemHealth(data: {
  speciesCount: number;
  waterQuality: number;
  airQuality: number;
  soilPH: number;
  vegetationCover: number;
  temperature: number;
  pollution: number;
}): EcosystemHealth {
  const indicators = {
    biodiversity: Math.min(100, (data.speciesCount / 50) * 100),
    waterQuality: data.waterQuality,
    airQuality: data.airQuality,
    soilHealth: calculateSoilHealth(data.soilPH),
    vegetation: data.vegetationCover,
  };

  const overall =
    Object.values(indicators).reduce((sum, val) => sum + val, 0) / 5;

  const threats: EcosystemHealth["threats"] = [];

  if (indicators.biodiversity < 40) {
    threats.push({
      type: "Low Biodiversity",
      severity: "high",
      description: "Species diversity is below healthy levels",
    });
  }

  if (data.pollution > 70) {
    threats.push({
      type: "High Pollution",
      severity: "critical",
      description: "Pollution levels exceed safe thresholds",
    });
  }

  if (data.temperature > 30) {
    threats.push({
      type: "Heat Stress",
      severity: "medium",
      description: "Elevated temperatures may stress ecosystem",
    });
  }

  if (indicators.waterQuality < 50) {
    threats.push({
      type: "Water Quality",
      severity: "high",
      description: "Water quality is degraded",
    });
  }

  const recommendations: string[] = [];

  if (indicators.biodiversity < 60) {
    recommendations.push("Implement habitat restoration programs");
    recommendations.push("Create wildlife corridors");
  }

  if (indicators.vegetation < 50) {
    recommendations.push("Increase native plant coverage");
    recommendations.push("Reduce soil erosion");
  }

  if (threats.length > 0) {
    recommendations.push("Conduct detailed environmental impact assessment");
    recommendations.push("Establish monitoring stations");
  }

  return {
    overall: Number(overall.toFixed(1)),
    indicators,
    threats,
    recommendations,
  };
}

function calculateSoilHealth(pH: number): number {
  // Optimal pH range: 6.0-7.5
  const optimal = 6.75;
  const deviation = Math.abs(pH - optimal);
  return Math.max(0, 100 - deviation * 20);
}

// Species Population Analysis
export function analyzeSpeciesPopulation(
  observations: Array<{
    speciesId: string;
    name: string;
    date: Date;
    location: { lat: number; lng: number };
  }>,
): SpeciesPopulation[] {
  const speciesMap = new Map<
    string,
    {
      name: string;
      observations: Array<{
        date: Date;
        location: { lat: number; lng: number };
      }>;
    }
  >();

  for (const obs of observations) {
    if (!speciesMap.has(obs.speciesId)) {
      speciesMap.set(obs.speciesId, { name: obs.name, observations: [] });
    }
    speciesMap.get(obs.speciesId)!.observations.push({
      date: obs.date,
      location: obs.location,
    });
  }

  const populations: SpeciesPopulation[] = [];

  for (const [speciesId, data] of speciesMap) {
    const sorted = data.observations.sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
    const count = sorted.length;
    const lastSeen = sorted[sorted.length - 1].date;

    // Calculate trend (simple: compare first half vs second half)
    const midpoint = Math.floor(count / 2);
    const firstHalf = midpoint;
    const secondHalf = count - midpoint;
    const change = secondHalf - firstHalf;
    const trend =
      Math.abs(change) < 2
        ? "stable"
        : change > 0
          ? "increasing"
          : "decreasing";

    // Determine status based on count and trend
    let status: SpeciesPopulation["status"] = "healthy";
    if (count < 5 && trend === "decreasing") status = "critical";
    else if (count < 10 && trend === "decreasing") status = "endangered";
    else if (count < 20 || trend === "decreasing") status = "threatened";

    // Aggregate locations
    const locationMap = new Map<string, number>();
    for (const obs of sorted) {
      const key = `${obs.location.lat.toFixed(2)},${obs.location.lng.toFixed(2)}`;
      locationMap.set(key, (locationMap.get(key) || 0) + 1);
    }

    const locations = Array.from(locationMap.entries()).map(([key, count]) => {
      const [lat, lng] = key.split(",").map(Number);
      return { lat, lng, count };
    });

    populations.push({
      speciesId,
      name: data.name,
      count,
      trend,
      status,
      lastSeen,
      locations,
    });
  }

  return populations.sort((a, b) => b.count - a.count);
}

// Carbon Footprint Calculator
export function calculateCarbonImpact(data: {
  treeCount: number;
  forestArea: number; // hectares
  soilCarbon: number; // tons
  activities: Array<{ type: string; amount: number }>;
}): {
  sequestration: number; // tons CO2/year
  emissions: number; // tons CO2/year
  netImpact: number; // tons CO2/year
  breakdown: Record<string, number>;
} {
  // Average tree sequesters ~22 kg CO2/year
  const treeSequestration = (data.treeCount * 22) / 1000;

  // Forest sequesters ~2.5 tons CO2/hectare/year
  const forestSequestration = data.forestArea * 2.5;

  const totalSequestration =
    treeSequestration + forestSequestration + data.soilCarbon;

  // Calculate emissions from activities
  const emissionFactors: Record<string, number> = {
    transport: 0.2, // kg CO2 per km
    energy: 0.5, // kg CO2 per kWh
    waste: 0.1, // kg CO2 per kg
  };

  let totalEmissions = 0;
  const breakdown: Record<string, number> = {};

  for (const activity of data.activities) {
    const factor = emissionFactors[activity.type] || 0;
    const emission = (activity.amount * factor) / 1000; // Convert to tons
    totalEmissions += emission;
    breakdown[activity.type] = emission;
  }

  return {
    sequestration: Number(totalSequestration.toFixed(2)),
    emissions: Number(totalEmissions.toFixed(2)),
    netImpact: Number((totalSequestration - totalEmissions).toFixed(2)),
    breakdown,
  };
}
