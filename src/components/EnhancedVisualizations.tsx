import React from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, Droplets, 
  Thermometer, Wind, Leaf, Zap, AlertTriangle 
} from 'lucide-react';
import { cn } from '../lib/utils';

// Enhanced Sensor Card with Micro-Chart
export const EnhancedSensorCard = ({ 
  sensor, 
  trend, 
  onNavigate 
}: { 
  sensor: any, 
  trend: number[], 
  onNavigate: (tab: any) => void 
}) => {
  const trendDirection = trend[trend.length - 1] > trend[0];
  
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onNavigate('analytics')}
      className="relative glass p-8 rounded-[32px] flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/20 transition-all overflow-hidden group min-h-[280px]"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex justify-between items-start">
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.15 }}
          transition={{ duration: 0.6 }}
          className={cn("p-5 rounded-3xl bg-gradient-to-br shadow-xl", 
            sensor.status === 'optimal' ? 'from-emerald-100 to-teal-100' : 
            sensor.status === 'warning' ? 'from-amber-100 to-orange-100' : 
            'from-red-100 to-pink-100'
          )}
        >
          <sensor.icon size={32} className={sensor.color} />
        </motion.div>
        <div className="flex flex-col items-end gap-2">
          <div className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm",
            sensor.status === 'optimal' ? "bg-emerald-100 text-emerald-700" : 
            sensor.status === 'warning' ? "bg-amber-100 text-amber-700" : 
            "bg-red-100 text-red-700"
          )}>
            {sensor.status}
          </div>
          <div className="flex items-center gap-1">
            {trendDirection ? (
              <TrendingUp size={14} className="text-emerald-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className={cn(
              "text-xs font-bold",
              trendDirection ? "text-emerald-600" : "text-red-600"
            )}>
              {Math.abs(((trend[trend.length - 1] - trend[0]) / trend[0]) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10">
        <p className="text-nature-500 text-base font-semibold mb-2">{sensor.name}</p>
        <div className="flex items-baseline gap-3">
          <motion.h3 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl font-serif font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent"
          >
            {sensor.value}
          </motion.h3>
          <span className="text-nature-400 text-lg font-bold">{sensor.unit}</span>
        </div>
      </div>
      
      {/* Mini sparkline */}
      <div className="relative z-10 h-20 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend.map((v, i) => ({ value: v }))}>
            <defs>
              <linearGradient id={`gradient-${sensor.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sensor.status === 'optimal' ? '#10b981' : '#f59e0b'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={sensor.status === 'optimal' ? '#10b981' : '#f59e0b'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={sensor.status === 'optimal' ? '#10b981' : '#f59e0b'}
              strokeWidth={2}
              fill={`url(#gradient-${sensor.id})`}
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Enhanced Biodiversity Radar Chart
export const BiodiversityRadar = ({ data }: { data: any[] }) => {
  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-10 rounded-[48px] space-y-8"
    >
      <div>
        <h3 className="text-3xl font-bold flex items-center gap-3">
          <Activity size={32} className="text-purple-500" />
          Ecosystem Health Radar
        </h3>
        <p className="text-nature-500 text-base mt-2">Multi-dimensional biodiversity assessment</p>
      </div>
      
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#d1d5db" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
            <Radar 
              name="Current" 
              dataKey="current" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar 
              name="Target" 
              dataKey="target" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-nature-600">Current State</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-blue-500 border-dashed" />
          <span className="text-xs font-bold text-nature-600">Target Goal</span>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Time Series with Multiple Metrics
export const EnhancedTimeSeriesChart = ({ data }: { data: any[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass p-10 rounded-[48px] space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-bold">Environmental Trends</h3>
          <p className="text-nature-500 text-base mt-2">24-hour monitoring data</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Moisture', color: 'bg-blue-500' },
            { label: 'Temperature', color: 'bg-orange-500' },
            { label: 'Biodiversity', color: 'bg-purple-500' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-nature-50 rounded-full">
              <div className={cn("w-2 h-2 rounded-full", item.color)} />
              <span className="text-xs font-bold text-nature-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#d1d5db"
            />
            <YAxis 
              tick={{ fill: '#6b7280', fontSize: 12 }}
              stroke="#d1d5db"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: 'none', 
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="moisture" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorMoisture)" 
            />
            <Area 
              type="monotone" 
              dataKey="temp" 
              stroke="#f97316" 
              strokeWidth={2}
              fill="url(#colorTemp)" 
            />
            <Area 
              type="monotone" 
              dataKey="biodiversity" 
              stroke="#a855f7" 
              strokeWidth={2}
              fill="url(#colorBio)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Ecosystem Health Score Circle
export const EcosystemHealthScore = ({ score }: { score: number }) => {
  const getColor = (score: number) => {
    if (score >= 80) return { from: '#10b981', to: '#059669', text: 'text-emerald-600' };
    if (score >= 60) return { from: '#3b82f6', to: '#2563eb', text: 'text-blue-600' };
    if (score >= 40) return { from: '#f59e0b', to: '#d97706', text: 'text-amber-600' };
    return { from: '#ef4444', to: '#dc2626', text: 'text-red-600' };
  };
  
  const color = getColor(score);
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-10 rounded-[48px] flex flex-col items-center justify-center space-y-8"
    >
      <div>
        <h3 className="text-2xl font-bold text-center">Ecosystem Health</h3>
        <p className="text-nature-500 text-base text-center mt-2">Overall system vitality</p>
      </div>
      
      <div className="relative w-64 h-64">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="#e5e7eb"
            strokeWidth="16"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke={`url(#healthGradient)`}
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
            }}
          />
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.from} />
              <stop offset="100%" stopColor={color.to} />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className={cn("text-8xl font-serif font-bold", color.text)}
          >
            {score}
          </motion.div>
          <span className="text-nature-400 text-base font-bold uppercase tracking-wider mt-2">Score</span>
        </div>
      </div>
      
      <div className="w-full space-y-3">
        {[
          { label: 'Air Quality', value: 92 },
          { label: 'Water Health', value: 78 },
          { label: 'Soil Vitality', value: 85 },
          { label: 'Species Diversity', value: 71 }
        ].map((metric, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-nature-600">{metric.label}</span>
              <span className="font-bold text-nature-900">{metric.value}%</span>
            </div>
            <div className="h-3 bg-nature-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.value}%` }}
                transition={{ delay: 0.2 * i, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// Real-time Activity Feed
export const ActivityFeed = ({ activities }: { activities: any[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass p-8 rounded-[48px] space-y-6 max-h-[700px] overflow-y-auto custom-scrollbar"
    >
      <div>
        <h3 className="text-2xl font-bold">Live Activity</h3>
        <p className="text-nature-500 text-base mt-2">Real-time ecosystem updates</p>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex gap-4 p-5 bg-white/50 rounded-3xl hover:bg-white/80 transition-all cursor-pointer group"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg",
              activity.type === 'sensor' ? 'bg-blue-100 text-blue-600' :
              activity.type === 'alert' ? 'bg-red-100 text-red-600' :
              'bg-emerald-100 text-emerald-600'
            )}>
              {activity.type === 'sensor' ? <Activity size={24} /> :
               activity.type === 'alert' ? <AlertTriangle size={24} /> :
               <Leaf size={24} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-nature-900 truncate">{activity.title}</p>
              <p className="text-sm text-nature-500 mt-1">{activity.description}</p>
              <p className="text-xs text-nature-400 mt-2">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
