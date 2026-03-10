import React, { useState, useEffect } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  RefreshCw,
  Download,
} from "lucide-react";
import { AIFeaturesService, AIAnalysisResult } from "../services/aiFeatures";

interface AIInsightsDashboardProps {
  apiKey: string;
  sensorData: any[];
  onExport?: (data: AIAnalysisResult) => void;
}

export default function AIInsightsDashboard({
  apiKey,
  sensorData,
  onExport,
}: AIInsightsDashboardProps) {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!apiKey || sensorData.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const aiService = new AIFeaturesService(apiKey);
      const result = await aiService.analyzeEcosystemHealth(sensorData);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [apiKey, sensorData]);

  return (
    <div className="glass p-8 rounded-[40px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Sparkles size={28} className="text-purple-600" />
            AI Insights
          </h3>
          <p className="text-nature-600 text-sm">Powered by Google Gemini</p>
        </div>
        <div className="flex gap-2">
          {analysis && onExport && (
            <button
              onClick={() => onExport(analysis)}
              className="px-4 py-2 bg-nature-100 hover:bg-nature-200 rounded-xl flex items-center gap-2 transition-all"
            >
              <Download size={18} />
              Export
            </button>
          )}
          <button
            onClick={runAnalysis}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="font-bold text-red-900 mb-1">Analysis Error</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
          <p className="text-nature-600">Analyzing ecosystem data...</p>
        </div>
      )}

      {!isLoading && analysis && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-2">
                  Overall Health Summary
                </h4>
                <p className="text-nature-700">{analysis.summary}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-nature-600 mb-1">Confidence</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(analysis.confidence * 100)}%
                </p>
              </div>
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white rounded-2xl p-6 border border-nature-100">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-600" />
              Key Insights
            </h4>
            <div className="space-y-3">
              {analysis.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-nature-700">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl p-6 border border-nature-100">
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-emerald-600" />
              Recommendations
            </h4>
            <div className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-nature-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all">
              Apply Recommendations
            </button>
            <button className="flex-1 bg-nature-100 text-nature-900 py-4 rounded-2xl font-bold hover:bg-nature-200 transition-all">
              Generate Full Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
