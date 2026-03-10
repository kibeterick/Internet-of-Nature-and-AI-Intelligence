import React from "react";
import {
  AlertTriangle,
  TrendingUp,
  Cloud,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Prediction } from "../services/predictiveAnalytics";

interface PredictiveAnalyticsProps {
  predictions: Prediction[];
  isLoading: boolean;
  onRefresh: () => void;
}

const PREDICTION_ICONS = {
  plant_stress: Activity,
  disease_outbreak: AlertTriangle,
  weather_shift: Cloud,
  biodiversity_change: TrendingUp,
};

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export default function PredictiveAnalytics({
  predictions,
  isLoading,
  onRefresh,
}: PredictiveAnalyticsProps) {
  return (
    <div className="glass p-8 rounded-[40px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-1">Predictive Analytics</h3>
          <p className="text-nature-600 text-sm">
            AI-powered ecological forecasting
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-3 rounded-xl bg-nature-100 hover:bg-nature-200 transition-all disabled:opacity-50"
        >
          <RefreshCw
            size={20}
            className={`text-nature-700 ${isLoading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {predictions.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <TrendingUp size={48} className="mx-auto text-nature-300 mb-4" />
          <p className="text-nature-600">
            No predictions available. System is monitoring...
          </p>
        </div>
      )}

      <div className="space-y-4">
        {predictions.map((prediction) => {
          const Icon = PREDICTION_ICONS[prediction.type];
          const severityClass = SEVERITY_COLORS[prediction.severity];

          return (
            <div
              key={prediction.id}
              className="bg-white rounded-2xl p-6 border border-nature-100"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-nature-100 rounded-xl">
                  <Icon size={24} className="text-nature-700" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg capitalize">
                      {prediction.type.replace("_", " ")}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${severityClass}`}
                    >
                      {prediction.severity}
                    </span>
                    <span className="text-xs text-nature-500">
                      {Math.round(prediction.confidence * 100)}% confidence
                    </span>
                  </div>

                  <p className="text-nature-700 mb-3">
                    {prediction.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-nature-600 mb-4">
                    <span>⏱️ Timeframe: {prediction.timeframe}</span>
                    <span>
                      📍 {prediction.affectedAreas.length} areas affected
                    </span>
                  </div>

                  <div className="bg-nature-50 rounded-xl p-4">
                    <p className="font-bold text-sm mb-2 text-nature-800">
                      Recommendations:
                    </p>
                    <ul className="space-y-2">
                      {prediction.recommendations.map((rec, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-nature-700 flex items-start gap-2"
                        >
                          <span className="text-emerald-600 font-bold">
                            {idx + 1}.
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {prediction.affectedAreas.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {prediction.affectedAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-nature-100 text-nature-700 rounded-full text-xs"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
