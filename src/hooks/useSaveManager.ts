import { useState, useEffect, useCallback } from "react";

export interface SaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

export interface SaveOptions {
  autoSave?: boolean;
  autoSaveInterval?: number;
  storageKey: string;
}

export function useSaveManager<T>(data: T, options: SaveOptions) {
  const [saveState, setSaveState] = useState<SaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
  });

  const { autoSave = true, autoSaveInterval = 30000, storageKey } = options;

  const save = useCallback(
    async (dataToSave?: T) => {
      setSaveState((prev) => ({ ...prev, isSaving: true, error: null }));

      try {
        const saveData = dataToSave || data;
        localStorage.setItem(storageKey, JSON.stringify(saveData));

        setSaveState({
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
          error: null,
        });

        return true;
      } catch (error: any) {
        setSaveState((prev) => ({
          ...prev,
          isSaving: false,
          error: error.message || "Failed to save",
        }));
        return false;
      }
    },
    [data, storageKey],
  );

  const load = useCallback((): T | null => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error("Failed to load data:", error);
      return null;
    }
  }, [storageKey]);

  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setSaveState({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      error: null,
    });
  }, [storageKey]);

  useEffect(() => {
    setSaveState((prev) => ({ ...prev, hasUnsavedChanges: true }));
  }, [data]);

  useEffect(() => {
    if (autoSave && saveState.hasUnsavedChanges) {
      const timer = setTimeout(() => {
        save();
      }, autoSaveInterval);

      return () => clearTimeout(timer);
    }
  }, [autoSave, autoSaveInterval, saveState.hasUnsavedChanges, save]);

  return {
    ...saveState,
    save,
    load,
    clear,
  };
}
