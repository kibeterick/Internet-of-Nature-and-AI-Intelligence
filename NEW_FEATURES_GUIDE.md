# 🎉 New Features Guide - Internet of Nature

## Where to Find Your New Features

### 📁 File Locations

#### 1. **Gamification System** 🏆

**Location:**

- Service: `src/services/gamificationService.ts`
- Component: `src/components/GamificationDashboard.tsx`

**How to Use:**

```typescript
import GamificationDashboard from './components/GamificationDashboard';
import { getUserStats, awardPoints, logObservation } from './services/gamificationService';

// In your App.tsx, add a new tab:
<GamificationDashboard />

// Award points when user does something:
await awardPoints(userId, 50, 'Identified a species');

// Log an observation:
const { stats, newAchievements } = await logObservation(userId);
```

**Features:**

- 12 levels with point thresholds
- 14 different achievements
- Daily streak tracking
- Leaderboard
- Progress bars and animations

---

#### 2. **Enhanced Data Export** 📥

**Location:** `src/utils/exportData.ts`

**How to Use:**

```typescript
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToJSON,
} from "./utils/exportData";

// Export observations to CSV
exportToCSV(observationsData, "observations_2024");

// Export to Excel with styling
exportToExcel(speciesData, "species_catalog");

// Export dashboard to PDF
exportToPDF("dashboard-container", "ecosystem_report");

// Export raw data as JSON
exportToJSON(environmentalData, "environmental_data");
```

**Available Formats:**

- CSV (Comma-separated values)
- Excel (.xls with styling)
- PDF (via print dialog)
- JSON (raw data)
- PNG (for charts/images)

---

#### 3. **Public API for Researchers** 🔌

**Location:** `src/services/publicAPI.ts`

**How to Use:**

```typescript
import {
  generateAPIKey,
  getObservations,
  getSpeciesData,
} from "./services/publicAPI";

// Generate API key for a user
const apiKey = generateAPIKey(userId, "Research Project");

// Fetch observations with filters
const response = await getObservations(apiKey, {
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  species: "Panthera leo",
  limit: 100,
});

// Get species information
const speciesData = await getSpeciesData(apiKey, "species_123");
```

**API Endpoints:**

- `/observations` - Get observation data
- `/species` - Get species information
- `/environmental` - Get sensor data
- `/ecosystem/:id` - Get ecosystem health

---

#### 4. **Advanced Analytics** 📈

**Location:** `src/services/advancedAnalytics.ts`

**How to Use:**

```typescript
import {
  calculateTrend,
  detectCorrelations,
  generateForecast,
  detectAnomalies,
  calculateBiodiversityIndices,
} from "./services/advancedAnalytics";

// Calculate trends
const trends = calculateTrend(currentData, previousData);

// Detect correlations between variables
const correlations = detectCorrelations({
  temperature: [20, 22, 24, 23],
  humidity: [60, 65, 70, 68],
  biodiversity: [85, 88, 90, 87],
});

// Generate 7-day forecast
const forecast = generateForecast(historicalData, 7);

// Detect anomalies
const anomalies = detectAnomalies(sensorData, "temperature", 3);

// Calculate biodiversity indices
const indices = calculateBiodiversityIndices({
  Lion: 5,
  Elephant: 12,
  Giraffe: 8,
});
```

**Features:**

- Trend analysis with percentage changes
- Pearson correlation detection
- Time series forecasting
- Anomaly detection (Z-score)
- Shannon & Simpson diversity indices

---

#### 5. **Team Collaboration** 👥

**Location:** `src/services/collaborationService.ts`

**How to Use:**

```typescript
import {
  createProject,
  addProjectMember,
  createTask,
  updateTaskStatus,
} from "./services/collaborationService";

// Create a new project
const project = await createProject(userId, username, {
  name: "Amazon Rainforest Study",
  description: "Long-term biodiversity monitoring",
  status: "active",
  tags: ["rainforest", "biodiversity"],
  goals: ["Monitor 100 species", "Track deforestation"],
});

// Add team member
await addProjectMember(
  projectId,
  {
    userId: "user123",
    username: "Jane Doe",
    role: "contributor",
  },
  { userId, username },
);

// Create a task
const task = await createTask(
  projectId,
  {
    title: "Survey quadrant A",
    description: "Complete species count",
    status: "todo",
    priority: "high",
    assignedTo: "user123",
    tags: ["fieldwork"],
  },
  { userId, username },
);
```

**Features:**

- Project management
- Task assignment
- Member roles (owner, admin, contributor, viewer)
- Comments and discussions
- Activity logging

---

#### 6. **Offline Support** 📴

**Location:** `src/services/offlineService.ts`

**How to Use:**

```typescript
import {
  saveOffline,
  syncPendingData,
  getSyncStatus,
  setupOfflineListeners,
} from "./services/offlineService";

// Save data when offline
const id = saveOffline("observation", {
  species: "Eagle",
  location: "Forest A",
  timestamp: new Date(),
});

// Setup listeners
const cleanup = setupOfflineListeners(
  () => {
    console.log("Back online! Syncing...");
    syncPendingData(uploadFunction);
  },
  () => {
    console.log("Gone offline. Data will be saved locally.");
  },
);

// Check sync status
const status = getSyncStatus();
console.log(`Pending items: ${status.pendingItems}`);

// Sync when back online
const result = await syncPendingData(async (type, data) => {
  // Upload to server
  await uploadToFirebase(type, data);
});
```

**Features:**

- Save data offline
- Auto-sync when online
- Data caching
- Storage monitoring
- Online/offline detection

---

#### 7. **Internationalization (i18n)** 🌍

**Location:** `src/services/i18nService.ts`

**How to Use:**

```typescript
import {
  setLanguage,
  t,
  formatNumber,
  formatDate,
  getAvailableLanguages,
} from "./services/i18nService";

// Set language
setLanguage("es"); // Spanish

// Translate text
const welcomeText = t("common.welcome"); // "Bienvenido a Internet de la Naturaleza"
const dashboardTitle = t("dashboard.title"); // "Panel de Control"

// Format numbers
const formatted = formatNumber(1234.56, 2); // "1.234,56" in Spanish

// Format dates
const date = formatDate(new Date(), "long"); // "23 de marzo de 2026"

// Get available languages
const languages = getAvailableLanguages();
// [{ code: 'en', name: 'English', nativeName: 'English' }, ...]
```

**Supported Languages:**

- 🇬🇧 English
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇩🇪 German (Deutsch)
- 🇨🇳 Chinese (中文)
- 🇸🇦 Arabic (العربية) - with RTL support
- 🇧🇷 Portuguese (Português)
- 🇰🇪 Swahili (Kiswahili)

---

## 🚀 How to Integrate Features into Your App

### Step 1: Add Gamification to Profile/Dashboard

In `src/App.tsx`, add a new tab or section:

```typescript
// Add to your tab navigation
{activeTab === 'achievements' && <GamificationDashboard />}
```

### Step 2: Add Export Buttons

```typescript
import { exportToCSV, exportToExcel } from './utils/exportData';

<button onClick={() => exportToCSV(data, 'my_data')}>
  Export to CSV
</button>
<button onClick={() => exportToExcel(data, 'my_data')}>
  Export to Excel
</button>
```

### Step 3: Enable Offline Mode

In your main App component:

```typescript
import {
  setupOfflineListeners,
  syncPendingData,
} from "./services/offlineService";

useEffect(() => {
  const cleanup = setupOfflineListeners(
    () => syncPendingData(uploadToServer),
    () => console.log("Offline mode activated"),
  );
  return cleanup;
}, []);
```

### Step 4: Add Language Selector

```typescript
import { setLanguage, getAvailableLanguages } from './services/i18nService';

const languages = getAvailableLanguages();

<select onChange={(e) => setLanguage(e.target.value as Language)}>
  {languages.map(lang => (
    <option key={lang.code} value={lang.code}>
      {lang.nativeName}
    </option>
  ))}
</select>
```

---

## 📊 Quick Integration Example

Here's a complete example showing how to use multiple features together:

```typescript
import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import GamificationDashboard from './components/GamificationDashboard';
import { exportToCSV } from './utils/exportData';
import { setupOfflineListeners, syncPendingData } from './services/offlineService';
import { t, setLanguage } from './services/i18nService';
import { calculateBiodiversityIndices } from './services/advancedAnalytics';

function EnhancedDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);

  // Setup offline support
  useEffect(() => {
    const cleanup = setupOfflineListeners(
      () => syncPendingData(uploadData),
      () => console.log('Offline')
    );
    return cleanup;
  }, []);

  // Calculate analytics
  const biodiversity = calculateBiodiversityIndices({
    'Species A': 10,
    'Species B': 15,
    'Species C': 8
  });

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>

      {/* Language selector */}
      <select onChange={(e) => setLanguage(e.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>

      {/* Export buttons */}
      <button onClick={() => exportToCSV(data, 'dashboard_data')}>
        {t('common.export')} CSV
      </button>

      {/* Gamification */}
      <GamificationDashboard />

      {/* Analytics */}
      <div>
        <h2>Biodiversity Index</h2>
        <p>Shannon: {biodiversity.shannon}</p>
        <p>Simpson: {biodiversity.simpson}</p>
      </div>
    </div>
  );
}
```

---

## 🎯 Next Steps

1. **Test the features** - Try each feature individually
2. **Integrate gradually** - Add one feature at a time to your app
3. **Customize** - Modify the components to match your design
4. **Deploy** - Build and deploy with `npm run build && firebase deploy`

All features are production-ready and fully functional! 🚀
