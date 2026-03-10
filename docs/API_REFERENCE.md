# API Reference

## AI Features Service

### `AIFeaturesService`

AI-powered analysis and insights for ecosystem data.

#### Constructor

```typescript
new AIFeaturesService(apiKey: string)
```

#### Methods

##### `analyzeEcosystemHealth(sensorData: any[]): Promise<AIAnalysisResult>`

Analyzes ecosystem health based on sensor data.

**Parameters:**

- `sensorData`: Array of sensor readings

**Returns:**

```typescript
{
  summary: string;
  insights: string[];
  recommendations: string[];
  confidence: number;
}
```

**Example:**

```typescript
const analysis = await aiService.analyzeEcosystemHealth([
  { id: "1", type: "temperature", value: 25, location: "Zone A" },
  { id: "2", type: "humidity", value: 65, location: "Zone A" },
]);
```

##### `generateSpeciesReport(speciesName: string, observations: any[]): Promise<string>`

Generates detailed species report.

**Parameters:**

- `speciesName`: Name of the species
- `observations`: Array of observation data

**Returns:** Markdown formatted report

##### `analyzeCode(code: string): Promise<CodeAnalysis>`

Analyzes code quality and provides suggestions.

**Returns:**

```typescript
{
  quality: number;        // 0-100
  issues: string[];
  suggestions: string[];
  complexity: 'low' | 'medium' | 'high';
}
```

##### `generateDocumentation(code: string, context: string): Promise<string>`

Generates comprehensive documentation for code.

##### `suggestOptimizations(data: any): Promise<string[]>`

Suggests system optimizations.

---

## Predictive Analytics Service

### `PredictiveAnalyticsService`

Predicts ecological events based on sensor data.

#### Constructor

```typescript
new PredictiveAnalyticsService(apiKey: string)
```

#### Methods

##### `predictPlantStress(sensorData: SensorData[]): Promise<Prediction | null>`

Predicts plant stress conditions.

**Triggers:**

- Soil moisture < 30%
- Temperature > 32°C

##### `predictDiseaseOutbreak(sensorData: SensorData[]): Promise<Prediction | null>`

Predicts disease outbreak conditions.

**Triggers:**

- Humidity > 80%
- Poor air quality

##### `predictWeatherShift(sensorData: SensorData[]): Promise<Prediction | null>`

Predicts rapid weather changes.

**Triggers:**

- Temperature change > 5°C

##### `runPredictions(sensorData: SensorData[]): Promise<Prediction[]>`

Runs all prediction models.

##### `generateAlerts(predictions: Prediction[]): Promise<string[]>`

Generates alerts for high-severity predictions.

---

## Version Control Service

### `VersionControlService`

Manages data versioning and history.

#### Methods

##### `commit(data: any, message: string, author: string): Version`

Creates a new version.

**Returns:**

```typescript
{
  id: string;
  timestamp: Date;
  author: string;
  message: string;
  data: any;
  changes: string[];
}
```

##### `getHistory(): Version[]`

Returns all versions in reverse chronological order.

##### `getVersion(id: string): Version | null`

Retrieves specific version by ID.

##### `revert(id: string): any | null`

Reverts to a specific version.

##### `diff(id1: string, id2: string): VersionDiff | null`

Compares two versions.

**Returns:**

```typescript
{
  added: string[];
  removed: string[];
  modified: string[];
}
```

##### `getCurrentVersion(): Version | null`

Gets the current active version.

##### `clearHistory(): void`

Clears all version history.

---

## Hooks

### `usePredictiveAnalytics`

React hook for predictive analytics.

```typescript
usePredictiveAnalytics(
  apiKey: string,
  sensorData: SensorData[],
  refreshInterval?: number
)
```

**Returns:**

```typescript
{
  predictions: Prediction[];
  alerts: string[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

**Example:**

```typescript
const { predictions, alerts, isLoading, refresh } = usePredictiveAnalytics(
  apiKey,
  sensorData,
  300000, // 5 minutes
);
```

### `useSaveManager`

React hook for auto-save functionality.

```typescript
useSaveManager<T>(
  data: T,
  options: SaveOptions
)
```

**Options:**

```typescript
{
  autoSave?: boolean;           // Default: true
  autoSaveInterval?: number;    // Default: 30000ms
  storageKey: string;           // Required
}
```

**Returns:**

```typescript
{
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  save: (data?: T) => Promise<boolean>;
  load: () => T | null;
  clear: () => void;
}
```

---

## Type Definitions

### Core Types

```typescript
interface SensorData {
  id: string;
  type: string;
  value: number;
  unit: string;
  location: string;
  timestamp: Date;
}

interface Prediction {
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

interface Version {
  id: string;
  timestamp: Date;
  author: string;
  message: string;
  data: any;
  changes: string[];
}

interface Contribution {
  id: string;
  type: "data" | "observation" | "analysis" | "report";
  title: string;
  description: string;
  author: string;
  timestamp: Date;
  impact: number;
  status: "pending" | "approved" | "rejected";
}
```

---

## Error Handling

All async methods may throw errors. Always use try-catch:

```typescript
try {
  const analysis = await aiService.analyzeEcosystemHealth(data);
} catch (error) {
  console.error("Analysis failed:", error);
  // Handle error appropriately
}
```

---

## Rate Limits

- Google Gemini API: 60 requests/minute
- Predictive Analytics: Recommended 5-minute intervals
- Auto-save: Default 30-second intervals

---

## Best Practices

1. **Caching**: Cache AI responses to reduce API calls
2. **Batching**: Batch sensor data updates
3. **Error Recovery**: Implement retry logic with exponential backoff
4. **Validation**: Validate data before processing
5. **Monitoring**: Log errors and performance metrics
