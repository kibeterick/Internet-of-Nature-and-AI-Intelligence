import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EnhancedSensorCard, 
  BiodiversityRadar, 
  EnhancedTimeSeriesChart,
  EcosystemHealthScore,
  ActivityFeed
} from './EnhancedVisualizations';
import { 
  Droplets, Thermometer, Wind, Activity, 
  Globe, TrendingUp, Zap, Leaf, Bell, Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

// Mock data
const SENSORS = [
  { id: '1', name: 'Soil Moisture', value: 42, unit: '%', status: 'optimal', icon: Droplets, color: 'text-blue-500' },
  { id: '2', name: 'Ambient Temp', value: 24.5, unit: '°C', status: 'optimal', icon: Thermometer, color: 'text-orange-500' },
  { id: '3', name: 'Air Quality', value: 12, unit: 'AQI', status: 'optimal', icon: Wind, color: 'text-emerald-500' },
  { id: '4', name: 'Biodiversity', value: 7.8, unit: '/10', status: 'warning', icon: Activity, color: 'text-purple-500' },
];

const SENSOR_TRENDS = {
  '1': [38, 40, 39, 41, 43, 42, 44, 42],
  '2': [22, 23, 24, 23.5, 24, 24.5, 25, 24.5],
  '3': [15, 14, 13, 12, 13, 12, 11, 12],
  '4': [7.2, 7.4, 7.6, 7.5, 7.7, 7.8, 7.9, 7.8],
};

const HISTORICAL_DATA = [
  { time: '00:00', moisture: 45, temp: 18, biodiversity: 7.2 },
  { time: '04:00', moisture: 48, temp: 16, biodiversity: 7.0 },
  { time: '08:00', moisture: 46, temp: 20, biodiversity: 7.5 },
  { time: '12:00', moisture: 42, temp: 25, biodiversity: 7.8 },
  { time: '16:00', moisture: 40, temp: 26, biodiversity: 8.0 },
  { time: '20:00', moisture: 41, temp: 22, biodiversity: 7.9 },
];

const RADAR_DATA = [
  { category: 'Flora', current: 85, target: 90 },
  { category: 'Fauna', current: 72, target: 85 },
  { category: 'Water', current: 78, target: 80 },
  { category: 'Soil', current: 88, target: 95 },
  { category: 'Air', current: 92, target: 95 },
  { category: 'Climate', current: 65, target: 75 },
];

const ACTIVITIES = [
  { type: 'sensor', title: 'Moisture Level Updated', description: 'Soil sensor #3 reported new reading', time: '2 min ago' },
  { type: 'alert', title: 'Temperature Spike Detected', description: 'Zone B exceeded threshold', time: '15 min ago' },
  { type: 'contribution', title: 'New Species Identified', description: 'User @naturelover added Oak Tree', time: '1 hour ago' },
  { type: 'sensor', title: 'Air Quality Improved', description: 'AQI dropped to excellent range', time: '2 hours ago' },
  { type: 'contribution', title: 'Data Sync Complete', description: '1,247 new data points processed', time: '3 hours ago' },
];

export const EnhancedDashboard = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [healthScore, setHealthScore] = useState(0);
  
  useEffect(() => {
    // Animate health score on mount
    const timer = setTimeout(() => setHealthScore(82), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {[
          { label: 'Active Sensors', value: '24', change: '+3', icon: Zap, color: 'from-blue-500 to-cyan-500' },
          { label: 'Data Points', value: '1.2M', change: '+12%', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
          { label: 'Species Tracked', value: '156', change: '+8', icon: Leaf, color: 'from-purple-500 to-pink-500' },
          { label: 'Global Nodes', value: '89', change: '+5', icon: Globe, color: 'from-orange-500 to-red-500' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05, y: -6 }}
            className="glass p-8 rounded-[32px] relative overflow-hidden group cursor-pointer min-h-[160px]"
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity",
              stat.color
            )} />
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <stat.icon size={28} className="text-nature-400" />
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-nature-500 text-sm font-semibold">{stat.label}</p>
                <p className="text-5xl font-serif font-bold text-nature-900 mt-2">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass p-6 rounded-[32px] flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Filter size={22} className="text-nature-400" />
          <span className="text-base font-bold text-nature-600">View:</span>
          <div className="flex gap-3">
            {['all', 'sensors', 'biodiversity', 'alerts'].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={cn(
                  "px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all",
                  selectedMetric === metric
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                    : "bg-nature-50 text-nature-600 hover:bg-nature-100"
                )}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
        <button className="p-3 hover:bg-nature-100 rounded-2xl transition-colors">
          <Bell size={22} className="text-nature-400" />
        </button>
      </motion.div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Sensors */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sensor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SENSORS.map((sensor, i) => (
              <motion.div
                key={sensor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <EnhancedSensorCard 
                  sensor={sensor} 
                  trend={SENSOR_TRENDS[sensor.id as keyof typeof SENSOR_TRENDS]}
                  onNavigate={onNavigate}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Time Series Chart */}
          <EnhancedTimeSeriesChart data={HISTORICAL_DATA} />
          
          {/* Biodiversity Radar */}
          <BiodiversityRadar data={RADAR_DATA} />
        </div>
        
        {/* Right Column - Health & Activity */}
        <div className="space-y-6">
          <EcosystemHealthScore score={healthScore} />
          <ActivityFeed activities={ACTIVITIES} />
        </div>
      </div>
      
      {/* Global Heatmap */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass p-12 rounded-[56px] space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-4xl font-bold flex items-center gap-4">
              <Globe size={36} className="text-blue-500" />
              Global Ecosystem Network
            </h3>
            <p className="text-nature-500 text-lg mt-3">Real-time contribution density across the globe</p>
          </div>
          <button className="px-6 py-4 bg-emerald-500 text-white rounded-2xl text-base font-bold hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/30">
            View Full Map
          </button>
        </div>
        
        <div className="relative h-[600px] bg-gradient-to-br from-nature-900 via-nature-800 to-nature-900 rounded-[40px] overflow-hidden border-2 border-nature-700 group">
          {/* Animated mesh pattern */}
          <div className="absolute inset-0 mesh-pattern opacity-20" />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20" />
          
          {/* Animated nodes */}
          {[
            { top: '25%', left: '15%', size: 'w-24 h-24', color: 'bg-emerald-500', delay: 0 },
            { top: '40%', left: '50%', size: 'w-32 h-32', color: 'bg-blue-500', delay: 0.5 },
            { top: '55%', left: '30%', size: 'w-28 h-28', color: 'bg-emerald-400', delay: 1 },
            { top: '20%', left: '70%', size: 'w-20 h-20', color: 'bg-blue-400', delay: 1.5 },
            { top: '65%', left: '75%', size: 'w-36 h-36', color: 'bg-emerald-600', delay: 2 },
            { top: '70%', left: '20%', size: 'w-20 h-20', color: 'bg-teal-500', delay: 2.5 },
          ].map((node, i) => (
            <motion.div 
              key={i}
              style={{ top: node.top, left: node.left }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [1, 1.3, 1], 
                opacity: [0.4, 0.7, 0.4] 
              }}
              transition={{ 
                duration: 3 + i * 0.5, 
                repeat: Infinity,
                delay: node.delay
              }}
              className={cn("absolute rounded-full blur-2xl", node.size, node.color)}
            />
          ))}
          
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.line
              x1="15%" y1="25%" x2="50%" y2="40%"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.line
              x1="50%" y1="40%" x2="70%" y2="20%"
              stroke="rgba(59, 130, 246, 0.3)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
            />
          </svg>
          
          {/* Legend */}
          <div className="absolute bottom-8 right-8 flex gap-6">
            <div className="flex items-center gap-3 text-sm font-bold text-white bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /> HIGH ACTIVITY
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-white bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" /> EMERGING DATA
            </div>
          </div>
          
          {/* Stats overlay */}
          <div className="absolute top-8 left-8 space-y-4">
            <div className="bg-black/50 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl">
              <p className="text-white/70 text-sm font-semibold">Active Nodes</p>
              <p className="text-white text-4xl font-bold mt-1">89</p>
            </div>
            <div className="bg-black/50 backdrop-blur-xl px-6 py-4 rounded-3xl shadow-2xl">
              <p className="text-white/70 text-sm font-semibold">Data Streams</p>
              <p className="text-white text-4xl font-bold mt-1">1.2M</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
