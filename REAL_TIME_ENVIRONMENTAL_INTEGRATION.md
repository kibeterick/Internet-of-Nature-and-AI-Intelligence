# 🌍 Real-Time Environmental Data Integration

## Overview

Your Internet of Nature system now integrates real-time environmental data from public APIs to dynamically affect the simulated ecosystem. The system fetches live weather and air quality data and uses it to influence plant growth, animal behavior, and overall ecosystem health.

## Features Implemented

### 1. Real-Time Data Fetching

**Weather Data:**

- Temperature
- Humidity
- Precipitation
- Wind speed and direction
- Cloud cover
- UV index
- Atmospheric pressure
- Visibility

**Air Quality Data:**

- Air Quality Index (AQI)
- CO2 levels
- PM2.5 and PM10 (particulate matter)
- O3 (ozone)
- NO2 (nitrogen dioxide)
- SO2 (sulfur dioxide)
- CO (carbon monoxide)

### 2. Ecosystem Impact Calculation

The system calculates how environmental conditions affect:

- **Plant Growth Rate** (0-200%): Affected by temperature, light, water, CO2, and pollution
- **Animal Activity Level** (0-200%): Affected by temperature, weather conditions, and pollution
- **Water Availability** (0-100%): Based on precipitation and humidity
- **Soil Moisture** (0-100%): Based on water availability and temperature
- **Photosynthesis Rate** (0-200%): Affected by light, temperature, CO2, and pollution
- **Pollution Stress** (0-100%): Based on air quality index
- **Temperature Stress** (0-100%): Based on deviation from optimal temperature
- **Ecosystem Health** (0-100%): Overall health score

### 3. Dynamic Simulation

The ecosystem simulation responds in real-time to environmental data:

- **Plants:** Grow faster or slower based on conditions, health affected by pollution
- **Animals:** Movement speed and energy levels change with environmental conditions
- **Population Dynamics:** New organisms spawn when conditions are favorable
- **Visual Effects:** Rain, clouds, and other weather effects displayed

## Components Created

### 1. `realTimeEnvironmentalData.ts`

Core service that handles:

- Fetching data from weather APIs (OpenWeatherMap)
- Fetching data from air quality APIs (OpenAQ)
- Calculating ecosystem impacts
- Generating simulated data as fallback

### 2. `useRealTimeEnvironment.ts`

React hook that provides:

- Automatic data fetching
- Auto-refresh every 5 minutes
- Loading and error states
- Manual refresh capability

### 3. `RealTimeEnvironmentalDashboard.tsx`

Comprehensive dashboard displaying:

- Current weather conditions
- Air quality metrics with color-coded AQI
- Ecosystem impact analysis
- Plant growth and animal activity indicators
- Detailed environmental data view

### 4. `DynamicEcosystemSimulation.tsx`

Interactive canvas-based simulation showing:

- Plants (trees, bushes, grass, flowers)
- Animals (birds, mammals, insects)
- Real-time environmental effects (rain, clouds)
- Population dynamics
- Play/pause and reset controls

## API Configuration

### OpenWeatherMap API (Weather Data)

1. **Get API Key:**
   - Go to: https://openweathermap.org/api
   - Sign up for free account
   - Get API key

2. **Add to .env:**

   ```
   VITE_OPENWEATHER_API_KEY=your_api_key_here
   ```

3. **Free Tier Limits:**
   - 60 calls/minute
   - 1,000,000 calls/month

### OpenAQ API (Air Quality Data)

- **No API key required!**
- Free and open data
- Global coverage
- Real-time measurements

## Usage

### Basic Usage

```tsx
import { RealTimeEnvironmentalDashboard } from "./components/RealTimeEnvironmentalDashboard";
import { DynamicEcosystemSimulation } from "./components/DynamicEcosystemSimulation";

function App() {
  return (
    <div>
      <RealTimeEnvironmentalDashboard
        lat={40.7128}
        lon={-74.006}
        locationName="New York City"
      />

      <DynamicEcosystemSimulation
        lat={40.7128}
        lon={-74.006}
        locationName="New York City"
        width={800}
        height={600}
      />
    </div>
  );
}
```

### Advanced Usage with Hook

```tsx
import { useRealTimeEnvironment } from "./hooks/useRealTimeEnvironment";

function MyComponent() {
  const { data, impact, loading, error, refresh } = useRealTimeEnvironment({
    lat: 40.7128,
    lon: -74.006,
    locationName: "New York City",
    updateInterval: 300000, // 5 minutes
    autoUpdate: true,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Temperature: {data.weather.temperature}°C</h2>
      <h2>AQI: {data.airQuality.aqi}</h2>
      <h2>Ecosystem Health: {impact.ecosystemHealth}%</h2>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Ecosystem Impact Formulas

### Plant Growth Rate

```
plantGrowthRate = lightFactor × tempFactor × co2Factor × pollutionFactor × waterFactor

where:
- lightFactor = (100 - cloudCover) / 100
- tempFactor = 1 - temperatureStress
- co2Factor = min(CO2 / 400, 1.5)  // CO2 fertilization
- pollutionFactor = 1 - pollutionStress × 0.5
- waterFactor = waterAvailability / 100
```

### Animal Activity Level

```
animalActivityLevel = (1 - tempStress) × weatherFactor × (1 - pollutionStress × 0.4)

where:
- weatherFactor = 1 - (precipitation / 50 + windSpeed / 100)
```

### Ecosystem Health

```
ecosystemHealth = 100 × (1 - tempStress × 0.3) × (1 - pollutionStress × 0.4) × (waterAvailability / 100) × 0.8 + 20
```

## Fallback Behavior

If API keys are not configured or APIs are unavailable, the system automatically generates realistic simulated data based on:

- Time of day (diurnal temperature variation)
- Season (seasonal temperature variation)
- Latitude (climate zones)
- Random variations

This ensures the system always works, even without API access.

## Performance Considerations

- **Data Caching:** Environmental data is cached and updated every 5 minutes
- **Efficient Rendering:** Canvas-based simulation for smooth 60 FPS
- **Lazy Loading:** Components only fetch data when mounted
- **Error Handling:** Graceful fallback to simulated data

## Future Enhancements

### Planned Features:

1. **Historical Data Analysis:**
   - Track environmental trends over time
   - Compare current vs. historical conditions
   - Predict future ecosystem changes

2. **Multiple Locations:**
   - Compare ecosystems across different locations
   - Global environmental monitoring
   - Regional impact analysis

3. **Custom Sensors:**
   - Integrate with IoT sensors
   - Real-time sensor data streaming
   - Custom environmental parameters

4. **Machine Learning:**
   - Predict ecosystem responses
   - Anomaly detection
   - Optimization recommendations

5. **Advanced Visualizations:**
   - 3D ecosystem rendering
   - Time-lapse animations
   - Interactive data exploration

## API Endpoints Used

### OpenWeatherMap

```
GET https://api.openweathermap.org/data/2.5/weather
Parameters:
- lat: Latitude
- lon: Longitude
- appid: API key
- units: metric
```

### OpenAQ

```
GET https://api.openaq.org/v2/latest
Parameters:
- coordinates: lat,lon
- radius: Search radius in meters
- limit: Max results
```

## Testing

### Test with Different Locations

```tsx
// Tropical rainforest
<RealTimeEnvironmentalDashboard lat={-3.4653} lon={-62.2159} locationName="Amazon Rainforest" />

// Desert
<RealTimeEnvironmentalDashboard lat={25.2048} lon={55.2708} locationName="Dubai Desert" />

// Arctic
<RealTimeEnvironmentalDashboard lat={78.2232} lon={15.6267} locationName="Svalbard" />

// Urban
<RealTimeEnvironmentalDashboard lat={40.7128} lon={-74.0060} locationName="New York City" />
```

### Test Without API Keys

The system will automatically use simulated data that still provides realistic ecosystem dynamics.

## Troubleshooting

### Issue: "Failed to fetch environmental data"

**Solutions:**

1. Check internet connection
2. Verify API keys in `.env`
3. Check API rate limits
4. System will use simulated data as fallback

### Issue: Simulation is slow

**Solutions:**

1. Reduce canvas size
2. Decrease number of organisms
3. Lower update frequency
4. Use hardware acceleration

### Issue: Data not updating

**Solutions:**

1. Check `autoUpdate` prop is true
2. Verify `updateInterval` is set
3. Check browser console for errors
4. Try manual refresh

## Documentation Files

- `REAL_TIME_ENVIRONMENTAL_INTEGRATION.md` - This file
- `src/services/realTimeEnvironmentalData.ts` - Core service
- `src/hooks/useRealTimeEnvironment.ts` - React hook
- `src/components/RealTimeEnvironmentalDashboard.tsx` - Dashboard component
- `src/components/DynamicEcosystemSimulation.tsx` - Simulation component

## Quick Start

1. **Add OpenWeatherMap API key to `.env`:**

   ```
   VITE_OPENWEATHER_API_KEY=your_key_here
   ```

2. **Import components:**

   ```tsx
   import { RealTimeEnvironmentalDashboard } from "./components/RealTimeEnvironmentalDashboard";
   import { DynamicEcosystemSimulation } from "./components/DynamicEcosystemSimulation";
   ```

3. **Use in your app:**

   ```tsx
   <RealTimeEnvironmentalDashboard lat={0} lon={0} locationName="Global" />
   <DynamicEcosystemSimulation lat={0} lon={0} locationName="Global" />
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Success!

Your Internet of Nature system now has real-time environmental data integration! The ecosystem simulation responds dynamically to actual weather and air quality conditions, creating a living, breathing digital representation of nature.

🌍 **Live environmental data**  
🌱 **Dynamic plant growth**  
🦅 **Responsive animal behavior**  
📊 **Real-time impact analysis**  
🎨 **Beautiful visualizations**

---

**Status:** ✅ Complete and Ready  
**APIs:** OpenWeatherMap (weather), OpenAQ (air quality)  
**Components:** 4 new files created  
**Features:** Real-time data, ecosystem simulation, impact analysis
