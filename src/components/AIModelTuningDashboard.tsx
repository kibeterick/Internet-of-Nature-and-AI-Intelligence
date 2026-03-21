import React, { useState, useEffect } from "react";
import {
  mockTrainingData,
  mockModelMetrics,
  finetuneModel,
  generatePredictionWithConfidence,
  calculateModelImprovement,
  identifyWeakAreas,
  generateTuningRecommendations,
  TrainingData,
  ModelMetrics,
} from "../services/aiModelTuning";
import {
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  RefreshCw,
} from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "stable";
  color: "green" | "blue" | "orange" | "red";
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  color,
}) => {
  const colorClasses = {
    green: "bg-green-100 text-green-800 border-green-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    orange: "bg-orange-100 text-orange-800 border-orange-300",
    red: "bg-red-100 text-red-800 border-red-300",
  };

  const trendIcons = {
    up: "↑",
    down: "↓",
    stable: "→",
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-semibold text-sm">{label}</span>
        {trend && <span className="text-lg">{trendIcons[trend]}</span>}
      </div>
      <div className="text-2xl font-bold">
        {typeof value === "number" ? value.toFixed(2) : value}
      </div>
      {unit && <div className="text-xs opacity-75 mt-1">{unit}</div>}
    </div>
  );
};

interface TrainingExampleProps {
  data: TrainingData;
}

const TrainingExample: React.FC<TrainingExampleProps> = ({ data }) => {
  const isCorrect = data.actualOutcome === data.predictedOutcome;

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${
        isCorrect ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="font-semibold text-sm">{data.id}</span>
        </div>
        <span className="text-xs font-bold bg-white px-2 py-1 rounded">
          {(data.accuracy * 100).toFixed(1)}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div>
          <span className="text-gray-600">Air Quality:</span>
          <span className="font-bold ml-1">
            {data.sensorReadings.airQuality}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Water Quality:</span>
          <span className="font-bold ml-1">
            {data.sensorReadings.waterQuality}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Soil Health:</span>
          <span className="font-bold ml-1">
            {data.sensorReadings.soilHealth}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Biodiversity:</span>
          <span className="font-bold ml-1">
            {data.sensorReadings.biodiversity}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <div>
          <span className="text-gray-600">Predicted:</span>
          <span className="font-bold ml-1 capitalize">
            {data.predictedOutcome}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Actual:</span>
          <span className="font-bold ml-1 capitalize">
            {data.actualOutcome}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-600 italic">{data.feedback}</p>
    </div>
  );
};

export const AIModelTuningDashboard: React.FC = () => {
  const [currentMetrics, setCurrentMetrics] =
    useState<ModelMetrics>(mockModelMetrics);
  const [trainingData, setTrainingData] =
    useState<TrainingData[]>(mockTrainingData);
  const [isTuning, setIsTuning] = useState(false);
  const [tuningProgress, setTuningProgress] = useState(0);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [improvement, setImprovement] = useState(0);
  const [predictionTest, setPredictionTest] = useState<{
    prediction: string;
    confidence: number;
    reasoning: string;
  } | null>(null);

  useEffect(() => {
    // Identify weak areas and generate recommendations on mount
    const weak = identifyWeakAreas(trainingData);
    const recs = generateTuningRecommendations(trainingData);
    setWeakAreas(weak);
    setRecommendations(recs);
  }, [trainingData]);

  const handleFinetune = async () => {
    setIsTuning(true);
    setTuningProgress(0);

    // Simulate tuning progress
    const progressInterval = setInterval(() => {
      setTuningProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 30;
      });
    }, 500);

    try {
      const newMetrics = await finetuneModel(trainingData);
      setCurrentMetrics(newMetrics);

      const improvementPercent = calculateModelImprovement(
        mockModelMetrics,
        newMetrics,
      );
      setImprovement(improvementPercent);

      setTuningProgress(100);
    } catch (error) {
      console.error("Tuning error:", error);
    } finally {
      setTimeout(() => {
        setIsTuning(false);
        setTuningProgress(0);
      }, 1000);
    }
  };

  const handleTestPrediction = async () => {
    const testData = {
      airQuality: 48,
      waterQuality: 70,
      soilHealth: 82,
      biodiversity: 75,
    };

    const result = await generatePredictionWithConfidence(testData);
    setPredictionTest(result);
  };

  const handleAddTrainingData = () => {
    const newData: TrainingData = {
      id: `train-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sensorReadings: {
        airQuality: Math.floor(Math.random() * 100),
        waterQuality: Math.floor(Math.random() * 100),
        soilHealth: Math.floor(Math.random() * 100),
        biodiversity: Math.floor(Math.random() * 100),
      },
      actualOutcome: ["stable", "improving", "declining", "critical"][
        Math.floor(Math.random() * 4)
      ],
      predictedOutcome: ["stable", "improving", "declining", "critical"][
        Math.floor(Math.random() * 4)
      ],
      accuracy: Math.random() * 0.4 + 0.6,
      feedback: "User-provided training example",
    };

    setTrainingData([...trainingData, newData]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Brain className="w-8 h-8 text-purple-600" />
          AI Model Fine-Tuning Dashboard
        </h1>
        <p className="text-gray-600">
          Optimize ecological prediction accuracy using historical data and user
          feedback
        </p>
      </div>

      {/* Current Model Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Current Model Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="Accuracy"
            value={currentMetrics.accuracy}
            unit="(0-1)"
            trend="up"
            color="green"
          />
          <MetricCard
            label="Precision"
            value={currentMetrics.precision}
            unit="(0-1)"
            trend="up"
            color="blue"
          />
          <MetricCard
            label="Recall"
            value={currentMetrics.recall}
            unit="(0-1)"
            trend="stable"
            color="blue"
          />
          <MetricCard
            label="F1 Score"
            value={currentMetrics.f1Score}
            unit="(0-1)"
            trend="up"
            color="green"
          />
          <MetricCard
            label="Training Examples"
            value={currentMetrics.totalTrainingExamples}
            unit="samples"
            color="orange"
          />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Last updated: {new Date(currentMetrics.lastUpdated).toLocaleString()}
        </p>
      </div>

      {/* Improvement Indicator */}
      {improvement > 0 && (
        <div className="bg-green-50 border-2 border-green-300 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-green-800">
              Model Improvement Detected
            </h3>
          </div>
          <p className="text-green-700">
            F1 Score improved by{" "}
            <span className="font-bold">{improvement.toFixed(2)}%</span> after
            fine-tuning
          </p>
        </div>
      )}

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {weakAreas.map((area, i) => (
              <li
                key={i}
                className="text-orange-700 text-sm flex items-start gap-2"
              >
                <span className="font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Tuning Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-blue-700 text-sm flex items-start gap-2"
              >
                <span className="font-bold">✓</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Fine-tuning Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          Fine-Tuning Controls
        </h2>

        <div className="space-y-3">
          <button
            onClick={handleFinetune}
            disabled={isTuning}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-bold flex items-center justify-center gap-2"
          >
            <RefreshCw
              className={`w-5 h-5 ${isTuning ? "animate-spin" : ""}`}
            />
            {isTuning ? "Fine-tuning in Progress..." : "Start Fine-tuning"}
          </button>

          {isTuning && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${tuningProgress}%` }}
              />
            </div>
          )}

          <button
            onClick={handleTestPrediction}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
          >
            Test Prediction
          </button>

          <button
            onClick={handleAddTrainingData}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
          >
            Add Training Data
          </button>
        </div>
      </div>

      {/* Prediction Test Result */}
      {predictionTest && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Prediction Test Result
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Prediction</p>
              <p className="text-2xl font-bold text-blue-600 capitalize">
                {predictionTest.prediction}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Confidence</p>
              <p className="text-2xl font-bold text-green-600">
                {(predictionTest.confidence * 100).toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 mb-1">Status</p>
              <p className="text-lg font-bold text-purple-600">
                {predictionTest.confidence > 0.8 ? "✓ High" : "⚠ Medium"}
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">Reasoning</p>
            <p className="text-sm text-gray-700">{predictionTest.reasoning}</p>
          </div>
        </div>
      )}

      {/* Training Data Examples */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Training Data Examples ({trainingData.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {trainingData.map((data) => (
            <TrainingExample key={data.id} data={data} />
          ))}
        </div>
      </div>

      {/* Model Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-600 mb-2">Correct Predictions</p>
          <p className="text-3xl font-bold text-green-600">
            {
              trainingData.filter((d) => d.actualOutcome === d.predictedOutcome)
                .length
            }
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {(
              (trainingData.filter(
                (d) => d.actualOutcome === d.predictedOutcome,
              ).length /
                trainingData.length) *
              100
            ).toFixed(1)}
            % accuracy
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-600 mb-2">Average Confidence</p>
          <p className="text-3xl font-bold text-blue-600">
            {(
              (trainingData.reduce((sum, d) => sum + d.accuracy, 0) /
                trainingData.length) *
              100
            ).toFixed(1)}
            %
          </p>
          <p className="text-xs text-gray-500 mt-2">Across all predictions</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-sm text-gray-600 mb-2">Last Updated</p>
          <p className="text-lg font-bold text-purple-600">
            {new Date(
              trainingData[trainingData.length - 1].timestamp,
            ).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">Training data timestamp</p>
        </div>
      </div>
    </div>
  );
};
