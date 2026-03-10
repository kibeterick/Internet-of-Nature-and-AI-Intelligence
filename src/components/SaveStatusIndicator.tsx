import React from "react";
import { Save, Check, AlertCircle, Loader } from "lucide-react";

interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  onSave?: () => void;
}

export default function SaveStatusIndicator({
  isSaving,
  lastSaved,
  hasUnsavedChanges,
  error,
  onSave,
}: SaveStatusIndicatorProps) {
  const getStatusColor = () => {
    if (error) return "text-red-600 bg-red-50 border-red-200";
    if (isSaving) return "text-blue-600 bg-blue-50 border-blue-200";
    if (hasUnsavedChanges)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle size={16} />;
    if (isSaving) return <Loader size={16} className="animate-spin" />;
    if (hasUnsavedChanges) return <Save size={16} />;
    return <Check size={16} />;
  };

  const getStatusText = () => {
    if (error) return "Save failed";
    if (isSaving) return "Saving...";
    if (hasUnsavedChanges) return "Unsaved changes";
    if (lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 60) return "Saved just now";
      if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)}m ago`;
      return `Saved ${Math.floor(seconds / 3600)}h ago`;
    }
    return "All changes saved";
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${getStatusColor()} transition-all`}
    >
      {getStatusIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
      {hasUnsavedChanges && onSave && (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="ml-2 px-3 py-1 bg-white rounded-lg text-xs font-bold hover:bg-opacity-80 transition-all disabled:opacity-50"
        >
          Save Now
        </button>
      )}
      {error && (
        <button
          onClick={onSave}
          className="ml-2 px-3 py-1 bg-white rounded-lg text-xs font-bold hover:bg-opacity-80 transition-all"
        >
          Retry
        </button>
      )}
    </div>
  );
}
