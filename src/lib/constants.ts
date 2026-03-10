// Application constants and configuration

export const APP_NAME = "Internet of Nature";
export const APP_VERSION = "1.0.0";

// WebSocket configuration
export const WS_RECONNECT_DELAY = 5000; // 5 seconds
export const WS_HEARTBEAT_INTERVAL = 30000; // 30 seconds

// API configuration
export const API_TIMEOUT = 30000; // 30 seconds
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  community: {
    name: 'Community',
    price: 0,
    features: ['Basic data access', 'Community chat', 'Limited AI queries'],
  },
  professional: {
    name: 'Professional',
    price: 2,
    features: [
      'Advanced analytics',
      'Unlimited AI queries',
      'Priority support',
      'API access',
    ],
  },
  industrial: {
    name: 'Industrial',
    price: 50,
    features: [
      'Full control',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
    ],
  },
} as const;

// Sensor thresholds
export const SENSOR_THRESHOLDS = {
  moisture: { optimal: [35, 60], warning: [25, 70], critical: [0, 100] },
  temperature: { optimal: [18, 28], warning: [10, 35], critical: [-10, 45] },
  aqi: { optimal: [0, 50], warning: [51, 100], critical: [101, 500] },
  humidity: { optimal: [40, 70], warning: [30, 80], critical: [0, 100] },
} as const;

// Chart colors
export const CHART_COLORS = {
  primary: '#10b981',
  secondary: '#3b82f6',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
} as const;

// Map configuration
export const MAP_CONFIG = {
  defaultCenter: [-74.006, 40.7128] as [number, number],
  defaultZoom: 10,
  geoUrl: 'https://raw.githubusercontent.com/lotusms/world-map-data/master/world.json',
} as const;

// AI model configuration
export const AI_CONFIG = {
  model: 'gemini-1.5-flash',
  maxTokens: 2048,
  temperature: 0.7,
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  AI: 'ai',
  ALERT: 'alert',
  SPECIES: 'species',
} as const;
