# Integration Guide - Internet of Nature

This guide shows you how to integrate all the new features into your main App.tsx.

## Step 1: Import All Components

Add these imports to the top of your App.tsx:

```typescript
// New Feature Imports
import { useDarkMode } from "./hooks/useDarkMode";
import { useAnalytics } from "./hooks/useAnalytics";
import {
  useKeyboardShortcuts,
  DEFAULT_SHORTCUTS,
} from "./hooks/useKeyboardShortcuts";
import { useSaveManager } from "./hooks/useSaveManager";
import { usePredictiveAnalytics } from "./hooks/usePredictiveAnalytics";

import DarkModeToggle from "./components/DarkModeToggle";
import UserTutorial from "./components/UserTutorial";
import EnhancedSearch from "./components/EnhancedSearch";
import GlobalAIChat from "./components/GlobalAIChat";
import CommandPalette, {
  createDefaultCommands,
} from "./components/CommandPalette";
import SettingsPanel from "./components/SettingsPanel";
import NotificationCenter, {
  Notification,
} from "./components/NotificationCenter";
import SaveStatusIndicator from "./components/SaveStatusIndicator";
import PredictiveAnalytics from "./components/PredictiveAnalytics";
import PredictionAlerts from "./components/PredictionAlerts";
import AIInsightsDashboard from "./components/AIInsightsDashboard";
import VersionControl from "./components/VersionControl";
import ContributionHistory from "./components/ContributionHistory";
import {
  LoadingSpinner,
  LoadingOverlay,
} from "./components/EnhancedLoadingStates";
```

## Step 2: Add State Management

Add these state variables to your AppContent component:

```typescript
function AppContent() {
  // Existing state...

  // New feature states
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Hooks
  const { isDarkMode, toggle: toggleDarkMode } = useDarkMode();
  const analytics = useAnalytics();
  const saveManager = useSaveManager(/* your data */, {
    autoSave: true,
    autoSaveInterval: 30000,
    storageKey: 'app-data'
  });

  const { predictions, alerts, isLoading: predictionsLoading, refresh: refreshPredictions } =
    usePredictiveAnalytics(
      import.meta.env.VITE_GEMINI_API_KEY,
      sensorData,
      300000 // 5 minutes
    );

  // ... rest of your component
}
```

## Step 3: Setup Keyboard Shortcuts

```typescript
// Define keyboard shortcuts
const shortcuts = [
  {
    key: "k",
    ctrl: true,
    description: "Open search",
    category: "Navigation",
    action: () => setIsSearchOpen(true),
  },
  {
    key: "p",
    ctrl: true,
    shift: true,
    description: "Open command palette",
    category: "Navigation",
    action: () => setIsCommandPaletteOpen(true),
  },
  {
    key: "d",
    ctrl: true,
    description: "Toggle dark mode",
    category: "Appearance",
    action: toggleDarkMode,
  },
  {
    key: "g",
    ctrl: true,
    description: "Open Genie AI",
    category: "AI",
    action: () => (window as any).openGenie?.(),
  },
  {
    key: "s",
    ctrl: true,
    description: "Save",
    category: "Actions",
    action: () => saveManager.save(),
  },
  {
    key: ",",
    ctrl: true,
    description: "Open settings",
    category: "Navigation",
    action: () => setIsSettingsOpen(true),
  },
];

useKeyboardShortcuts(shortcuts);
```

## Step 4: Create Command Palette Actions

```typescript
const commands = createDefaultCommands({
  openSearch: () => setIsSearchOpen(true),
  toggleDarkMode: toggleDarkMode,
  openGenie: () => (window as any).openGenie?.(),
  exportData: () => {
    // Your export logic
    analytics.trackFeatureUse("Export Data");
  },
  openSettings: () => setIsSettingsOpen(true),
  showShortcuts: () => {
    // Show shortcuts modal
  },
  newProject: () => {
    // New project logic
  },
  openDocs: () => {
    window.open("/docs/DEVELOPER_GUIDE.md", "_blank");
  },
});
```

## Step 5: Add Components to Header

Update your header/navigation to include the new components:

```typescript
<header className="flex items-center justify-between p-6">
  <div className="flex items-center gap-4">
    <h1>Internet of Nature</h1>

    {/* Enhanced Search */}
    <EnhancedSearch
      data={sensorData}
      onSelect={(result) => {
        analytics.trackSearch(result.title, 1);
        // Handle selection
      }}
    />
  </div>

  <div className="flex items-center gap-3">
    {/* Save Status */}
    <SaveStatusIndicator {...saveManager} onSave={saveManager.save} />

    {/* Notifications */}
    <NotificationCenter
      notifications={notifications}
      onMarkAsRead={(id) => {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }}
      onMarkAllAsRead={() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }}
      onDelete={(id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }}
      onClearAll={() => setNotifications([])}
    />

    {/* Dark Mode Toggle */}
    <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggleDarkMode} />

    {/* Settings Button */}
    <button
      onClick={() => setIsSettingsOpen(true)}
      className="p-3 hover:bg-nature-100 rounded-xl"
    >
      <Settings size={20} />
    </button>
  </div>
</header>
```

## Step 6: Add Dashboard Components

Add these to your dashboard view:

```typescript
{activeTab === 'dashboard' && (
  <div className="space-y-8">
    {/* Prediction Alerts */}
    <PredictionAlerts alerts={alerts} />

    {/* AI Insights */}
    <AIInsightsDashboard
      apiKey={import.meta.env.VITE_GEMINI_API_KEY}
      sensorData={sensorData}
      onExport={(data) => {
        analytics.trackFeatureUse('Export AI Insights');
        // Export logic
      }}
    />

    {/* Predictive Analytics */}
    <PredictiveAnalytics
      predictions={predictions}
      isLoading={predictionsLoading}
      onRefresh={refreshPredictions}
    />

    {/* Your existing dashboard content */}
  </div>
)}
```

## Step 7: Add Modals and Overlays

Add these at the end of your component, before the closing tag:

```typescript
return (
  <div className={isDarkMode ? 'dark' : ''}>
    {/* Your main content */}

    {/* Tutorial */}
    <UserTutorial
      onComplete={() => {
        setShowTutorial(false);
        analytics.trackFeatureUse('Complete Tutorial');
      }}
    />

    {/* Command Palette */}
    <CommandPalette
      isOpen={isCommandPaletteOpen}
      onClose={() => setIsCommandPaletteOpen(false)}
      commands={commands}
    />

    {/* Settings Panel */}
    <SettingsPanel
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      isDarkMode={isDarkMode}
      onToggleDarkMode={toggleDarkMode}
      onRestartTutorial={() => {
        localStorage.removeItem('hasSeenTutorial');
        setShowTutorial(true);
        setIsSettingsOpen(false);
      }}
      onClearData={() => {
        if (confirm('Clear all data? This cannot be undone.')) {
          localStorage.clear();
          window.location.reload();
        }
      }}
      onExportSettings={() => {
        const settings = {
          darkMode: isDarkMode,
          // Add other settings
        };
        const blob = new Blob([JSON.stringify(settings, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ion-settings.json';
        a.click();
      }}
    />

    {/* Global AI Chat */}
    <GlobalAIChat meshData={meshData} />
  </div>
);
```

## Step 8: Add Analytics Tracking

Track user interactions throughout your app:

```typescript
// Track page views
useEffect(() => {
  analytics.trackPageView({
    path: activeTab,
    title: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} - Internet of Nature`
  });
}, [activeTab]);

// Track button clicks
<button onClick={() => {
  analytics.trackClick('Export Button', 'Dashboard');
  // Your export logic
}}>
  Export
</button>

// Track feature usage
const handleFeature = () => {
  analytics.trackFeatureUse('Predictive Analytics');
  // Feature logic
};

// Track errors
try {
  // Some operation
} catch (error) {
  analytics.trackError(error.message, 'Data Loading');
}
```

## Step 9: Add Loading States

Replace your loading indicators with enhanced versions:

```typescript
{isLoading ? (
  <LoadingSpinner type="nature" message="Loading ecosystem data..." size="lg" />
) : (
  // Your content
)}

// For overlays
{isProcessing && (
  <LoadingOverlay message="Processing predictions..." />
)}
```

## Step 10: Add Notification System

Create notifications for important events:

```typescript
const addNotification = (
  notification: Omit<Notification, "id" | "timestamp" | "read">,
) => {
  setNotifications((prev) => [
    {
      ...notification,
      id: `notif_${Date.now()}`,
      timestamp: new Date(),
      read: false,
    },
    ...prev,
  ]);
};

// Usage examples
addNotification({
  type: "success",
  title: "Data Saved",
  message: "Your changes have been saved successfully",
});

addNotification({
  type: "warning",
  title: "High Temperature Alert",
  message: "Temperature exceeds threshold in Zone A",
  action: {
    label: "View Details",
    onClick: () => setActiveTab("analytics"),
  },
});

addNotification({
  type: "ai",
  title: "New AI Insight",
  message: "Genie has detected a pattern in your ecosystem data",
  action: {
    label: "View Insight",
    onClick: () => (window as any).openGenie?.(),
  },
});
```

## Complete Example

Here's a minimal complete example:

```typescript
import React, { useState } from 'react';
import { useDarkMode } from './hooks/useDarkMode';
import { useAnalytics } from './hooks/useAnalytics';
import DarkModeToggle from './components/DarkModeToggle';
import UserTutorial from './components/UserTutorial';
import GlobalAIChat from './components/GlobalAIChat';
import CommandPalette, { createDefaultCommands } from './components/CommandPalette';

function App() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { isDarkMode, toggle } = useDarkMode();
  const analytics = useAnalytics();

  const commands = createDefaultCommands({
    openSearch: () => {},
    toggleDarkMode: toggle,
    openGenie: () => (window as any).openGenie?.(),
    exportData: () => analytics.trackFeatureUse('Export'),
    openSettings: () => {},
    showShortcuts: () => {},
    newProject: () => {},
    openDocs: () => {}
  });

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <header>
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={toggle} />
      </header>

      <main>
        {/* Your content */}
      </main>

      <UserTutorial onComplete={() => {}} />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />
      <GlobalAIChat meshData={[]} />
    </div>
  );
}

export default App;
```

## Testing

After integration, test these features:

1. ✅ Press `Ctrl+K` to open search
2. ✅ Press `Ctrl+Shift+P` to open command palette
3. ✅ Press `Ctrl+D` to toggle dark mode
4. ✅ Press `Ctrl+G` to open Genie AI
5. ✅ Click notification bell to see notifications
6. ✅ Check auto-save indicator in header
7. ✅ View predictive analytics on dashboard
8. ✅ Complete the tutorial on first visit

## Troubleshooting

**Dark mode not working?**

- Check that Tailwind config has `darkMode: 'class'`
- Ensure `dark:` classes are used in your CSS

**Keyboard shortcuts not working?**

- Check browser console for conflicts
- Ensure shortcuts are registered before component mount

**Analytics not tracking?**

- Check browser console for analytics logs
- Verify localStorage is enabled

**AI features not working?**

- Verify `VITE_GEMINI_API_KEY` is set in `.env`
- Check API key is valid and has quota

## Next Steps

- Customize keyboard shortcuts
- Add more commands to command palette
- Create custom notification types
- Extend analytics tracking
- Add more AI features

For more details, see:

- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Features Complete](../FEATURES_COMPLETE.md)
