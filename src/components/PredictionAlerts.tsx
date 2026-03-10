import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface PredictionAlertsProps {
  alerts: string[];
  onDismiss?: (index: number) => void;
}

export default function PredictionAlerts({
  alerts,
  onDismiss,
}: PredictionAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {alerts.map((alert, index) => (
        <div
          key={index}
          className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg shadow-lg flex items-start gap-3 animate-slide-in"
        >
          <AlertTriangle
            size={20}
            className="text-orange-600 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-900">{alert}</p>
          </div>
          {onDismiss && (
            <button
              onClick={() => onDismiss(index)}
              className="text-orange-400 hover:text-orange-600 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
