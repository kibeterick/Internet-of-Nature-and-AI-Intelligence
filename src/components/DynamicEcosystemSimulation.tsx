import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";
import { useRealTimeEnvironment } from "../hooks/useRealTimeEnvironment";
import type { EcosystemImpact } from "../services/realTimeEnvironmentalData";

interface Plant {
  id: string;
  x: number;
  y: number;
  size: number;
  growth: number;
  health: number;
  type: "tree" | "bush" | "grass" | "flower";
  color: string;
}

interface Animal {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  energy: number;
  type: "bird" | "mammal" | "insect";
  color: string;
}

interface DynamicEcosystemSimulationProps {
  lat?: number;
  lon?: number;
  locationName?: string;
  width?: number;
  height?: number;
}

export function DynamicEcosystemSimulation({
  lat = 0,
  lon = 0,
  locationName = "Global",
  width = 800,
  height = 600,
}: DynamicEcosystemSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [time, setTime] = useState(0);

  const { data, impact } = useRealTimeEnvironment({
    lat,
    lon,
    locationName,
    updateInterval: 300000,
    autoUpdate: true,
  });

  // Initialize ecosystem
  useEffect(() => {
    initializeEcosystem();
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = () => {
      updateEcosystem();
      drawEcosystem();
      setTime((t) => t + 1);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, plants, animals, impact]);

  const initializeEcosystem = () => {
    // Create initial plants
    const initialPlants: Plant[] = [];
    for (let i = 0; i < 50; i++) {
      initialPlants.push(createPlant());
    }

    // Create initial animals
    const initialAnimals: Animal[] = [];
    for (let i = 0; i < 20; i++) {
      initialAnimals.push(createAnimal());
    }

    setPlants(initialPlants);
    setAnimals(initialAnimals);
  };

  const createPlant = (): Plant => {
    const types: Plant["type"][] = ["tree", "bush", "grass", "flower"];
    const type = types[Math.floor(Math.random() * types.length)];

    const colors = {
      tree: "#2d5016",
      bush: "#4a7c2f",
      grass: "#7cb342",
      flower: "#ff6b9d",
    };

    const sizes = {
      tree: 20 + Math.random() * 30,
      bush: 10 + Math.random() * 15,
      grass: 5 + Math.random() * 10,
      flower: 8 + Math.random() * 12,
    };

    return {
      id: Math.random().toString(36),
      x: Math.random() * width,
      y: Math.random() * height,
      size: sizes[type],
      growth: 0.5 + Math.random() * 0.5,
      health: 0.8 + Math.random() * 0.2,
      type,
      color: colors[type],
    };
  };

  const createAnimal = (): Animal => {
    const types: Animal["type"][] = ["bird", "mammal", "insect"];
    const type = types[Math.floor(Math.random() * types.length)];

    const colors = {
      bird: "#3b82f6",
      mammal: "#8b5a3c",
      insect: "#fbbf24",
    };

    const sizes = {
      bird: 8 + Math.random() * 6,
      mammal: 10 + Math.random() * 8,
      insect: 4 + Math.random() * 4,
    };

    return {
      id: Math.random().toString(36),
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: sizes[type],
      energy: 0.8 + Math.random() * 0.2,
      type,
      color: colors[type],
    };
  };

  const updateEcosystem = () => {
    if (!impact) return;

    // Update plants based on environmental conditions
    setPlants((prevPlants) =>
      prevPlants.map((plant) => {
        // Growth affected by environmental factors
        const growthRate = impact.plantGrowthRate * 0.001;
        const newGrowth = Math.min(1, plant.growth + growthRate);

        // Health affected by pollution and temperature stress
        const healthChange =
          (1 - impact.pollutionStress - impact.temperatureStress) * 0.001;
        const newHealth = Math.max(0, Math.min(1, plant.health + healthChange));

        // Size increases with growth
        const newSize = plant.size * (1 + growthRate * 0.1);

        return {
          ...plant,
          growth: newGrowth,
          health: newHealth,
          size: newSize,
        };
      }),
    );

    // Update animals based on environmental conditions
    setAnimals((prevAnimals) =>
      prevAnimals.map((animal) => {
        // Activity level affects movement speed
        const speedMultiplier = impact.animalActivityLevel;

        // Update position
        let newX = animal.x + animal.vx * speedMultiplier;
        let newY = animal.y + animal.vy * speedMultiplier;
        let newVx = animal.vx;
        let newVy = animal.vy;

        // Bounce off walls
        if (newX < 0 || newX > width) {
          newVx = -newVx;
          newX = Math.max(0, Math.min(width, newX));
        }
        if (newY < 0 || newY > height) {
          newVy = -newVy;
          newY = Math.max(0, Math.min(height, newY));
        }

        // Random direction changes
        if (Math.random() < 0.02) {
          newVx += (Math.random() - 0.5) * 0.5;
          newVy += (Math.random() - 0.5) * 0.5;
        }

        // Energy affected by environmental conditions
        const energyChange = (impact.ecosystemHealth / 100 - 0.5) * 0.001;
        const newEnergy = Math.max(
          0.2,
          Math.min(1, animal.energy + energyChange),
        );

        return {
          ...animal,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
          energy: newEnergy,
        };
      }),
    );

    // Spawn new plants if conditions are good
    if (
      impact.ecosystemHealth > 70 &&
      plants.length < 100 &&
      Math.random() < 0.01
    ) {
      setPlants((prev) => [...prev, createPlant()]);
    }

    // Spawn new animals if conditions are good
    if (
      impact.ecosystemHealth > 60 &&
      animals.length < 40 &&
      Math.random() < 0.005
    ) {
      setAnimals((prev) => [...prev, createAnimal()]);
    }

    // Remove unhealthy plants
    setPlants((prev) => prev.filter((plant) => plant.health > 0.1));

    // Remove low-energy animals
    setAnimals((prev) => prev.filter((animal) => animal.energy > 0.2));
  };

  const drawEcosystem = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#f0fdf4"; // Light green background
    ctx.fillRect(0, 0, width, height);

    // Draw environmental effects
    if (data) {
      // Cloud cover effect
      const cloudAlpha = data.weather.cloudCover / 200;
      ctx.fillStyle = `rgba(200, 200, 200, ${cloudAlpha})`;
      ctx.fillRect(0, 0, width, height);

      // Precipitation effect
      if (data.weather.precipitation > 0) {
        ctx.strokeStyle = "rgba(100, 150, 255, 0.3)";
        ctx.lineWidth = 1;
        for (let i = 0; i < data.weather.precipitation * 5; i++) {
          const x = Math.random() * width;
          const y = (time * 5 + Math.random() * height) % height;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 2, y + 10);
          ctx.stroke();
        }
      }
    }

    // Draw plants
    plants.forEach((plant) => {
      ctx.save();
      ctx.globalAlpha = plant.health;

      if (plant.type === "tree") {
        // Draw tree trunk
        ctx.fillStyle = "#8b4513";
        ctx.fillRect(
          plant.x - plant.size * 0.1,
          plant.y,
          plant.size * 0.2,
          plant.size * 0.6,
        );

        // Draw tree crown
        ctx.fillStyle = plant.color;
        ctx.beginPath();
        ctx.arc(plant.x, plant.y, plant.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (plant.type === "bush") {
        // Draw bush
        ctx.fillStyle = plant.color;
        ctx.beginPath();
        ctx.arc(plant.x, plant.y, plant.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (plant.type === "grass") {
        // Draw grass
        ctx.strokeStyle = plant.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plant.x, plant.y);
        ctx.lineTo(plant.x, plant.y - plant.size);
        ctx.stroke();
      } else if (plant.type === "flower") {
        // Draw flower
        ctx.fillStyle = plant.color;
        ctx.beginPath();
        ctx.arc(
          plant.x,
          plant.y - plant.size * 0.5,
          plant.size * 0.3,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        // Draw stem
        ctx.strokeStyle = "#4a7c2f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plant.x, plant.y);
        ctx.lineTo(plant.x, plant.y - plant.size * 0.5);
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw animals
    animals.forEach((animal) => {
      ctx.save();
      ctx.globalAlpha = animal.energy;
      ctx.fillStyle = animal.color;

      if (animal.type === "bird") {
        // Draw bird (triangle)
        ctx.beginPath();
        ctx.moveTo(animal.x, animal.y - animal.size);
        ctx.lineTo(animal.x - animal.size * 0.5, animal.y + animal.size * 0.5);
        ctx.lineTo(animal.x + animal.size * 0.5, animal.y + animal.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (animal.type === "mammal") {
        // Draw mammal (circle)
        ctx.beginPath();
        ctx.arc(animal.x, animal.y, animal.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else if (animal.type === "insect") {
        // Draw insect (small circle)
        ctx.beginPath();
        ctx.arc(animal.x, animal.y, animal.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Draw stats
    if (impact) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(10, 10, 200, 100);

      ctx.fillStyle = "white";
      ctx.font = "12px monospace";
      ctx.fillText(`Plants: ${plants.length}`, 20, 30);
      ctx.fillText(`Animals: ${animals.length}`, 20, 50);
      ctx.fillText(`Health: ${impact.ecosystemHealth.toFixed(0)}%`, 20, 70);
      ctx.fillText(
        `Growth: ${(impact.plantGrowthRate * 100).toFixed(0)}%`,
        20,
        90,
      );
    }
  };

  const handleReset = () => {
    initializeEcosystem();
    setTime(0);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-nature-600" />
            Dynamic Ecosystem Simulation
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-nature-600 text-white rounded-lg hover:bg-nature-700 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="w-full border-2 border-gray-200 rounded-lg"
          />
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            This simulation responds to real-time environmental data. Watch how
            plants grow and animals behave based on current weather and air
            quality conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
