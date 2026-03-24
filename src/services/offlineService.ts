// Offline support and data synchronization
export interface OfflineData {
  id: string;
  type: "observation" | "species" | "report" | "comment";
  data: any;
  timestamp: number;
  synced: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingItems: number;
  syncInProgress: boolean;
}

const STORAGE_KEY = "ion_offline_data";
const SYNC_STATUS_KEY = "ion_sync_status";

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Save data offline
export function saveOffline(type: OfflineData["type"], data: any): string {
  const id = `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  const offlineItem: OfflineData = {
    id,
    type,
    data,
    timestamp: Date.now(),
    synced: false,
  };

  const existing = getOfflineData();
  existing.push(offlineItem);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  updateSyncStatus();

  return id;
}

// Get all offline data
export function getOfflineData(): OfflineData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Get pending (unsynced) data
export function getPendingData(): OfflineData[] {
  return getOfflineData().filter((item) => !item.synced);
}

// Mark item as synced
export function markAsSynced(id: string): void {
  const data = getOfflineData();
  const item = data.find((d) => d.id === id);

  if (item) {
    item.synced = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    updateSyncStatus();
  }
}

// Remove synced items older than 7 days
export function cleanupSyncedData(): void {
  const data = getOfflineData();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const filtered = data.filter(
    (item) => !item.synced || item.timestamp > sevenDaysAgo,
  );

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  updateSyncStatus();
}

// Get sync status
export function getSyncStatus(): SyncStatus {
  const statusData = localStorage.getItem(SYNC_STATUS_KEY);
  const defaultStatus: SyncStatus = {
    isOnline: isOnline(),
    lastSync: null,
    pendingItems: 0,
    syncInProgress: false,
  };

  if (!statusData) return defaultStatus;

  const status = JSON.parse(statusData);
  return {
    ...status,
    lastSync: status.lastSync ? new Date(status.lastSync) : null,
    isOnline: isOnline(),
  };
}

// Update sync status
function updateSyncStatus(): void {
  const status = getSyncStatus();
  status.pendingItems = getPendingData().length;
  status.isOnline = isOnline();

  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));
}

// Sync all pending data
export async function syncPendingData(
  uploadFunction: (type: string, data: any) => Promise<void>,
): Promise<{ success: number; failed: number }> {
  const pending = getPendingData();

  if (pending.length === 0) {
    return { success: 0, failed: 0 };
  }

  // Update sync status
  const status = getSyncStatus();
  status.syncInProgress = true;
  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));

  let success = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await uploadFunction(item.type, item.data);
      markAsSynced(item.id);
      success++;
    } catch (error) {
      console.error(`Failed to sync item ${item.id}:`, error);
      failed++;
    }
  }

  // Update sync status
  status.syncInProgress = false;
  status.lastSync = new Date();
  status.pendingItems = getPendingData().length;
  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(status));

  // Cleanup old synced data
  cleanupSyncedData();

  return { success, failed };
}

// Cache data for offline access
export function cacheData(
  key: string,
  data: any,
  expiryHours: number = 24,
): void {
  const cacheItem = {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + expiryHours * 60 * 60 * 1000,
  };

  localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
}

// Get cached data
export function getCachedData<T>(key: string): T | null {
  const cached = localStorage.getItem(`cache_${key}`);

  if (!cached) return null;

  const cacheItem = JSON.parse(cached);

  // Check if expired
  if (Date.now() > cacheItem.expiry) {
    localStorage.removeItem(`cache_${key}`);
    return null;
  }

  return cacheItem.data as T;
}

// Clear all cached data
export function clearCache(): void {
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.startsWith("cache_")) {
      localStorage.removeItem(key);
    }
  });
}

// Setup online/offline event listeners
export function setupOfflineListeners(
  onOnline: () => void,
  onOffline: () => void,
): () => void {
  const handleOnline = () => {
    updateSyncStatus();
    onOnline();
  };

  const handleOffline = () => {
    updateSyncStatus();
    onOffline();
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// Estimate storage usage
export function getStorageInfo(): {
  used: number;
  available: number;
  percentage: number;
} {
  let used = 0;

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += localStorage[key].length + key.length;
    }
  }

  // LocalStorage typically has 5-10MB limit
  const available = 5 * 1024 * 1024; // 5MB in bytes
  const percentage = (used / available) * 100;

  return {
    used: Math.round(used / 1024), // KB
    available: Math.round(available / 1024), // KB
    percentage: Math.round(percentage),
  };
}
