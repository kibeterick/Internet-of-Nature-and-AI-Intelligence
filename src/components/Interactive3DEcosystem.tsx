import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  RotateCcw,
  X,
} from "lucide-react";

interface Organism {
  id: string;
  name: string;
  type: "producer" | "herbivore" | "carnivore" | "decomposer";
  x: number;
  y: number;
  size: number;
  color: string;
  energy: number;
  population: number;
  icon: string;
  isPlanted?: boolean;
  plantedAt?: number;
}

interface PlantingAnimation {
  id: string;
  x: number;
  y: number;
  progress: number;
}

const getOrganismColor = (type: string): string => {
  const colors: Record<string, string> = {
    producer: "#10b981",
    herbivore: "#f59e0b",
    carnivore: "#ef4444",
    decomposer: "#8b5cf6",
  };
  return colors[type] || "#6b7280";
};

export const Interactive3DEcosystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedOrganism, setSelectedOrganism] = useState<Organism | null>(
    null,
  );
  const [time, setTime] = useState(0);
  const [isPlantingMode, setIsPlantingMode] = useState(false);
  const [plantingAnimations, setPlantingAnimations] = useState<
    PlantingAnimation[]
  >([]);

  const initialOrganisms = useMemo<Organism[]>(
    () => [
      {
        id: "grass-1",
        name: "Grass",
        type: "producer",
        x: -30,
        y: -20,
        size: 8,
        color: getOrganismColor("producer"),
        energy: 100,
        population: 150,
        icon: "🌿",
      },
      {
        id: "tree-1",
        name: "Oak Tree",
        type: "producer",
        x: 20,
        y: 15,
        size: 15,
        color: getOrganismColor("producer"),
        energy: 100,
        population: 5,
        icon: "🌳",
      },
      {
        id: "deer-1",
        name: "Deer",
        type: "herbivore",
        x: -15,
        y: -10,
        size: 12,
        color: getOrganismColor("herbivore"),
        energy: 70,
        population: 8,
        icon: "🦌",
      },
      {
        id: "rabbit-1",
        name: "Rabbit",
        type: "herbivore",
        x: 10,
        y: 5,
        size: 7,
        color: getOrganismColor("herbivore"),
        energy: 60,
        population: 25,
        icon: "🐰",
      },
      {
        id: "lion-1",
        name: "Lion",
        type: "carnivore",
        x: 25,
        y: -15,
        size: 14,
        color: getOrganismColor("carnivore"),
        energy: 80,
        population: 2,
        icon: "🦁",
      },
      {
        id: "eagle-1",
        name: "Eagle",
        type: "carnivore",
        x: -20,
        y: 30,
        size: 10,
        color: getOrganismColor("carnivore"),
        energy: 75,
        population: 3,
        icon: "🦅",
      },
      {
        id: "fungi-1",
        name: "Fungi",
        type: "decomposer",
        x: 0,
        y: 0,
        size: 5,
        color: getOrganismColor("decomposer"),
        energy: 60,
        population: 100,
        icon: "🍄",
      },
    ],
    [],
  );

  const [organisms, setOrganisms] = useState<Organism[]>(initialOrganisms);

  // Planting animation effect
  useEffect(() => {
    if (plantingAnimations.length === 0) return;

    const interval = setInterval(() => {
      setPlantingAnimations((prev) =>
        prev
          .map((anim) => ({ ...anim, progress: anim.progress + 0.05 }))
          .filter((anim) => anim.progress < 1),
      );
    }, 30);

    return () => clearInterval(interval);
  }, [plantingAnimations.length]);

  // Ecosystem simulation effect
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);
      setOrganisms((prev) =>
        prev.map((org) => {
          let newEnergy = org.energy;
          let newPopulation = org.population;

          if (org.type === "producer") {
            newEnergy = Math.min(100, org.energy + 2);
            newPopulation = Math.min(org.population * 1.02, 200);
          } else if (org.type === "herbivore") {
            newEnergy = Math.max(0, org.energy - 1);
            newPopulation =
              org.energy > 50 ? org.population * 1.01 : org.population * 0.98;
          } else if (org.type === "carnivore") {
            newEnergy = Math.max(0, org.energy - 1.5);
            newPopulation =
              org.energy > 60 ? org.population * 1.005 : org.population * 0.97;
          } else {
            newEnergy = Math.min(100, org.energy + 1);
            newPopulation = org.population * 1.01;
          }

          const moveX = (Math.random() - 0.5) * 2;
          const moveY = (Math.random() - 0.5) * 2;

          return {
            ...org,
            x: Math.max(-40, Math.min(40, org.x + moveX)),
            y: Math.max(-40, Math.min(40, org.y + moveY)),
            energy: Math.round(newEnergy),
            population: Math.round(newPopulation),
          };
        }),
      );
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f0fdf4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 0.5;
    for (let i = -40; i <= 40; i += 10) {
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 + i * zoom, 0);
      ctx.lineTo(canvas.width / 2 + i * zoom, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2 + i * zoom);
      ctx.lineTo(canvas.width, canvas.height / 2 + i * zoom);
      ctx.stroke();
    }

    organisms.forEach((org) => {
      const screenX = canvas.width / 2 + org.x * zoom;
      const screenY = canvas.height / 2 + org.y * zoom;

      const energyPercent = org.energy / 100;
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + energyPercent * 0.2})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, org.size * zoom * 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = org.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, org.size * zoom, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = org.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = `${Math.max(8, org.size * zoom * 1.2)}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(org.icon, screenX, screenY);

      ctx.font = "10px Arial";
      ctx.fillStyle = "#374151";
      ctx.fillText(
        `${org.population}`,
        screenX,
        screenY + org.size * zoom + 12,
      );
    });

    // Draw planting animations
    plantingAnimations.forEach((anim) => {
      const screenX = canvas.width / 2 + anim.x * zoom;
      const screenY = canvas.height / 2 + anim.y * zoom;
      const progress = anim.progress;

      // Expanding circle animation
      ctx.strokeStyle = `rgba(16, 185, 129, ${1 - progress})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(screenX, screenY, 20 * zoom * progress, 0, Math.PI * 2);
      ctx.stroke();

      // Particle effects
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 30 * zoom * progress;
        const px = screenX + Math.cos(angle) * distance;
        const py = screenY + Math.sin(angle) * distance;

        ctx.fillStyle = `rgba(34, 197, 94, ${0.6 * (1 - progress)})`;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(10, 10, 200, 100);
    ctx.fillStyle = "#fff";
    ctx.font = "12px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Time: ${time}s`, 20, 30);
    ctx.fillText(`Organisms: ${organisms.length}`, 20, 50);
    ctx.fillText(
      `Population: ${organisms.reduce((s, o) => s + o.population, 0)}`,
      20,
      70,
    );
    ctx.fillText(`Zoom: ${zoom.toFixed(1)}x`, 20, 90);
  }, [organisms, zoom, time, plantingAnimations]);

  const totalPopulation = organisms.reduce(
    (sum, org) => sum + org.population,
    0,
  );

  const plantTree = (x: number, y: number) => {
    const newTreeId = `tree-${Date.now()}`;
    const newTree: Organism = {
      id: newTreeId,
      name: "Planted Tree",
      type: "producer",
      x,
      y,
      size: 12,
      color: getOrganismColor("producer"),
      energy: 80,
      population: 1,
      icon: "🌳",
      isPlanted: true,
      plantedAt: time,
    };

    setOrganisms((prev) => [...prev, newTree]);
    setPlantingAnimations((prev) => [
      ...prev,
      { id: newTreeId, x, y, progress: 0 },
    ]);
    setIsPlantingMode(false);
  };

  return (
    <div className="fixed bottom-40 right-8 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[700px] glass rounded-3xl shadow-2xl border border-emerald-100 bg-white/95 backdrop-blur-md overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-emerald-900">
                    3D Ecosystem Simulation
                  </h3>
                  <p className="text-sm text-emerald-600">
                    Interactive real-time ecosystem dynamics
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-emerald-600" />
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={650}
                height={400}
                className={`w-full border-2 border-emerald-200 rounded-2xl bg-green-50 ${
                  isPlantingMode ? "cursor-crosshair" : "cursor-pointer"
                }`}
                onClick={(e) => {
                  const rect = canvasRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const x = (e.clientX - rect.left - rect.width / 2) / zoom;
                  const y = (e.clientY - rect.top - rect.height / 2) / zoom;

                  if (isPlantingMode) {
                    plantTree(x, y);
                    return;
                  }

                  const clicked = organisms.find(
                    (org) => Math.hypot(org.x - x, org.y - y) < org.size * 1.5,
                  );
                  setSelectedOrganism(clicked || null);
                }}
              />

              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </button>
                <button
                  onClick={() => setIsPlantingMode(!isPlantingMode)}
                  className={`p-2 rounded-lg transition-colors font-semibold text-sm px-3 flex items-center gap-1 ${
                    isPlantingMode
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  🌱 Plant Tree
                </button>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.2))}
                  className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  <ZoomIn size={18} />
                </button>
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                  className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  <ZoomOut size={18} />
                </button>
                <button
                  onClick={() => {
                    setTime(0);
                    setOrganisms(initialOrganisms);
                    setSelectedOrganism(null);
                    setIsPlantingMode(false);
                  }}
                  className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900">Time</p>
                  <p className="text-lg font-bold text-blue-600">{time}s</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
                  <p className="text-xs font-semibold text-orange-900">
                    Population
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {totalPopulation}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                  <p className="text-xs font-semibold text-purple-900">
                    Species
                  </p>
                  <p className="text-lg font-bold text-purple-600">
                    {organisms.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                  <p className="text-xs font-semibold text-green-900">Zoom</p>
                  <p className="text-lg font-bold text-green-600">
                    {zoom.toFixed(1)}x
                  </p>
                </div>
              </div>

              {selectedOrganism && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-emerald-900">
                        {selectedOrganism.icon} {selectedOrganism.name}
                      </p>
                      <p className="text-xs text-emerald-600 capitalize">
                        {selectedOrganism.type}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedOrganism(null)}
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-emerald-600 font-semibold">
                        Population
                      </p>
                      <p className="text-emerald-900 font-bold">
                        {selectedOrganism.population}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600 font-semibold">Energy</p>
                      <p className="text-emerald-900 font-bold">
                        {selectedOrganism.energy}%
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600 font-semibold">Position</p>
                      <p className="text-emerald-900 font-bold">
                        ({selectedOrganism.x.toFixed(0)},
                        {selectedOrganism.y.toFixed(0)})
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-4 gap-2 text-xs">
                {[
                  { type: "producer", label: "Producers" },
                  { type: "herbivore", label: "Herbivores" },
                  { type: "carnivore", label: "Carnivores" },
                  { type: "decomposer", label: "Decomposers" },
                ].map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getOrganismColor(item.type) }}
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all group relative"
      >
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        <RotateCw
          size={24}
          className="group-hover:rotate-12 transition-transform"
        />
      </motion.button>
    </div>
  );
};

export default Interactive3DEcosystem;
