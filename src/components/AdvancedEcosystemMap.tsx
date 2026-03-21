import React, { useState, useEffect, useRef } from "react";
import {
  SensorReading,
  AreaHealth,
  mockSensorData,
  mockAreaHealth,
} from "../services/ecosystemHealthService";
import {
  Eye,
  EyeOff,
  MapPin,
  Droplets,
  Wind,
  Leaf,
  Zap,
  Info,
} from "lucide-react";

interface MapLayer {
  id: string;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  color: string;
}

interface MapNode {
  id: string;
  name: string;
  type: "sensor" | "area";
  coordinates: [number, number];
  value: number;
  status: "healthy" | "warning" | "critical";
  sensorType?: "air" | "water" | "soil" | "biodiversity";
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  content: string;
}

export const AdvancedEcosystemMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: "sensors",
      name: "Sensors",
      icon: <Zap className="w-4 h-4" />,
      visible: true,
      color: "#3b82f6",
    },
    {
      id: "vegetation",
      name: "Vegetation",
      icon: <Leaf className="w-4 h-4" />,
      visible: true,
      color: "#10b981",
    },
    {
      id: "heatmap",
      name: "Heatmap",
      icon: <Wind className="w-4 h-4" />,
      visible: false,
      color: "#f59e0b",
    },
    {
      id: "satellite",
      name: "Satellite",
      icon: <MapPin className="w-4 h-4" />,
      visible: false,
      color: "#8b5cf6",
    },
  ]);

  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [realTimeData, setRealTimeData] = useState<Map<string, number>>(
    new Map(),
  );

  // Initialize nodes from mock data
  useEffect(() => {
    const mapNodes: MapNode[] = [];

    // Add sensor nodes
    mockSensorData.forEach((sensor) => {
      mapNodes.push({
        id: sensor.id,
        name: sensor.name,
        type: "sensor",
        coordinates: sensor.coordinates,
        value: sensor.value,
        status: sensor.status,
        sensorType: sensor.type,
      });
    });

    // Add area nodes
    mockAreaHealth.forEach((area) => {
      mapNodes.push({
        id: area.id,
        name: area.name,
        type: "area",
        coordinates: area.coordinates,
        value: area.overallHealth,
        status:
          area.overallHealth >= 75
            ? "healthy"
            : area.overallHealth >= 50
              ? "warning"
              : "critical",
      });
    });

    setNodes(mapNodes);
  }, []);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData((prevData) => {
        const newData = new Map(prevData);
        // Update with random variations
        for (let i = 0; i < 5; i++) {
          newData.set(`node-${i}`, Math.random() * 100);
        }
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Draw map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;

    const render = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = "#f0f9ff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = "#e0e7ff";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw heatmap layer if visible
      if (layers.find((l) => l.id === "heatmap")?.visible) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          Math.max(canvas.width, canvas.height) / 2,
        );
        gradient.addColorStop(0, "rgba(255, 107, 107, 0.3)");
        gradient.addColorStop(0.5, "rgba(255, 193, 7, 0.2)");
        gradient.addColorStop(1, "rgba(76, 175, 80, 0.1)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw nodes
      nodes.forEach((node) => {
        const x = ((node.coordinates[0] + 74) / 1.5) * (canvas.width / 100);
        const y = ((node.coordinates[1] - 40) / 1.5) * (canvas.height / 100);

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;

        let shouldDraw = false;
        if (
          node.type === "sensor" &&
          layers.find((l) => l.id === "sensors")?.visible
        ) {
          shouldDraw = true;
        }
        if (
          node.type === "area" &&
          layers.find((l) => l.id === "vegetation")?.visible
        ) {
          shouldDraw = true;
        }

        if (!shouldDraw) return;

        const statusColors = {
          healthy: "#10b981",
          warning: "#f59e0b",
          critical: "#ef4444",
        };

        ctx.fillStyle = statusColors[node.status];
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();

        if (selectedNode?.id === node.id) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = "#1f2937";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.name.substring(0, 15), x, y + 20);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find clicked node
    nodes.forEach((node) => {
      const nodeX = ((node.coordinates[0] + 74) / 1.5) * (canvas.width / 100);
      const nodeY = ((node.coordinates[1] - 40) / 1.5) * (canvas.height / 100);

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 12) {
        setSelectedNode(node);
        setTooltip({
          visible: true,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          content: `${node.name}\nStatus: ${node.status}\nValue: ${realTimeData.get(node.id) || node.value}`,
        });
      }
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hoveredNode: MapNode | null = null;

    nodes.forEach((node) => {
      const nodeX = ((node.coordinates[0] + 74) / 1.5) * (canvas.width / 100);
      const nodeY = ((node.coordinates[1] - 40) / 1.5) * (canvas.height / 100);

      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 12) {
        hoveredNode = node;
      }
    });

    if (hoveredNode) {
      canvas.style.cursor = "pointer";
      setTooltip({
        visible: true,
        x,
        y,
        content: `${hoveredNode.name}\nStatus: ${hoveredNode.status}\nValue: ${realTimeData.get(hoveredNode.id) || hoveredNode.value}`,
      });
    } else {
      canvas.style.cursor = "default";
      setTooltip({ ...tooltip, visible: false });
    }
  };

  const toggleLayer = (layerId: string) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer,
      ),
    );
  };

  const getSensorIcon = (type?: string) => {
    switch (type) {
      case "air":
        return <Wind className="w-4 h-4" />;
      case "water":
        return <Droplets className="w-4 h-4" />;
      case "soil":
        return <Leaf className="w-4 h-4" />;
      case "biodiversity":
        return <Info className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        🗺️ Advanced Ecosystem Map
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Canvas */}
        <div className="lg:col-span-3">
          <div className="relative bg-blue-50 rounded-lg overflow-hidden border-2 border-blue-200">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              className="w-full border-b border-gray-200"
            />

            {/* Tooltip */}
            {tooltip.visible && (
              <div
                className="absolute bg-gray-900 text-white px-3 py-2 rounded text-sm pointer-events-none z-10"
                style={{
                  left: `${tooltip.x + 10}px`,
                  top: `${tooltip.y + 10}px`,
                }}
              >
                {tooltip.content.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-md text-sm">
              <div className="font-semibold mb-2">Legend</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-4">
          {/* Layer Toggles */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-800 mb-3">Map Layers</h2>
            <div className="space-y-2">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded transition-all ${
                    layer.visible
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {layer.visible ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{layer.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Node Details */}
          {selectedNode && (
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <h2 className="font-semibold text-gray-800 mb-3">Node Details</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Name:</span>
                  <p className="text-gray-700">{selectedNode.name}</p>
                </div>
                <div>
                  <span className="font-semibold">Type:</span>
                  <p className="text-gray-700 capitalize">
                    {selectedNode.type}
                  </p>
                </div>
                {selectedNode.sensorType && (
                  <div>
                    <span className="font-semibold">Sensor Type:</span>
                    <p className="text-gray-700 capitalize flex items-center gap-1">
                      {getSensorIcon(selectedNode.sensorType)}
                      {selectedNode.sensorType}
                    </p>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Status:</span>
                  <p
                    className={`capitalize font-bold ${
                      selectedNode.status === "healthy"
                        ? "text-green-600"
                        : selectedNode.status === "warning"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {selectedNode.status}
                  </p>
                </div>
                <div>
                  <span className="font-semibold">Current Value:</span>
                  <p className="text-gray-700">
                    {(
                      realTimeData.get(selectedNode.id) || selectedNode.value
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Status */}
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <h2 className="font-semibold text-gray-800 mb-2">
              Real-time Status
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-700">Live Updates Active</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Data updates every 3 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
