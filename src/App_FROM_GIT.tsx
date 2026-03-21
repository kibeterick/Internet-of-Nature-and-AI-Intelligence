import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { loadStripe } from "@stripe/stripe-js";
import toast, { Toaster } from "react-hot-toast";
import {
  Droplets,
  Thermometer,
  Wind,
  Leaf,
  Activity,
  Map as MapIcon,
  MessageSquare,
  TreePine,
  Bird,
  Bug,
  Sun,
  CloudRain,
  Camera,
  Upload,
  Sparkles,
  Mic2,
  ChevronRight,
  Info,
  AlertTriangle,
  Eye,
  Zap,
  Database,
  Lock,
  Globe,
  LayoutDashboard,
  Search,
  Bell,
  BookOpen,
  ShieldCheck,
  Key,
  Cpu,
  Wifi,
  Code,
  Share2,
  Layers,
  X,
  Factory,
  HelpCircle,
  Calendar,
  TrendingUp,
  Shield,
  Zap as ZapIcon,
  Globe as GlobeIcon,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Terminal,
  Book,
  FileCode,
  GraduationCap,
  Box,
  Workflow,
  Download,
  Moon,
  Sun as SunIcon,
  User,
  Settings,
  RefreshCw,
  History,
  ShieldAlert,
  Heart,
  Search as SearchIcon,
  CreditCard,
  DollarSign,
  PieChart,
  ArrowUpRight,
  Users,
  Briefcase,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  ExternalLink,
  Rocket,
  Github,
  Paperclip,
  Send,
  Trash2,
  Star,
  Copy,
  Headphones,
  Volume2,
  Mic,
  StopCircle,
  Lightbulb,
  TrendingDown,
  Building2,
  Globe2,
  Brain,
  Target,
  Award,
  PlayCircle,
  Folder,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { auth, db } from "./lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  askNatureAI,
  askNatureAIStream,
  identifySpecies,
  generateEcologicalReport,
  simulateEcosystemResponse,
  analyzeFile,
} from "./services/geminiService";
import Markdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

// New Feature Imports
import { useDarkMode } from "./hooks/useDarkMode";
import DarkModeToggle from "./components/DarkModeToggle";
import UserTutorial from "./components/UserTutorial";
import EnhancedSearch from "./components/EnhancedSearch";
import GlobalAIChat from "./components/GlobalAIChat";
import { LoadingSpinner } from "./components/EnhancedLoadingStates";
import SaveStatusIndicator from "./components/SaveStatusIndicator";
import { useSaveManager } from "./hooks/useSaveManager";
import SpeciesIdentifier from "./components/SpeciesIdentifier";
import Interactive3DEcosystem from "./components/Interactive3DEcosystem";
import ErrorBoundary from "./components/ErrorBoundary";

const geoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/master/world.json";

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// --- Types ---

type SubscriptionPlan = "community" | "professional" | "industrial";

interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "optimal" | "warning" | "critical";
  icon: React.ElementType;
  color: string;
}

interface HistoricalData {
  time: string;
  moisture: number;
  temp: number;
  biodiversity: number;
}

// --- Mock Data ---

const MOCK_SENSORS: SensorData[] = [
  {
    id: "1",
    name: "Soil Moisture",
    value: 42,
    unit: "%",
    status: "optimal",
    icon: Droplets,
    color: "text-blue-500",
  },
  {
    id: "2",
    name: "Ambient Temp",
    value: 24.5,
    unit: "°C",
    status: "optimal",
    icon: Thermometer,
    color: "text-orange-500",
  },
  {
    id: "3",
    name: "Air Quality",
    value: 12,
    unit: "AQI",
    status: "optimal",
    icon: Wind,
    color: "text-emerald-500",
  },
  {
    id: "4",
    name: "Biodiversity Index",
    value: 7.8,
    unit: "/10",
    status: "warning",
    icon: Activity,
    color: "text-purple-500",
  },
];

const MOCK_HISTORY: HistoricalData[] = [
  { time: "00:00", moisture: 45, temp: 18, biodiversity: 7.2 },
  { time: "04:00", moisture: 48, temp: 16, biodiversity: 7.0 },
  { time: "08:00", moisture: 46, temp: 20, biodiversity: 7.5 },
  { time: "12:00", moisture: 42, temp: 25, biodiversity: 7.8 },
  { time: "16:00", moisture: 40, temp: 26, biodiversity: 8.0 },
  { time: "20:00", moisture: 41, temp: 22, biodiversity: 7.9 },
];

const PREDICTIVE_DATA = [
  { day: "Mon", risk: 20 },
  { day: "Tue", risk: 25 },
  { day: "Wed", risk: 45 },
  { day: "Thu", risk: 60 },
  { day: "Fri", risk: 30 },
  { day: "Sat", risk: 15 },
  { day: "Sun", risk: 10 },
];

// --- Socket Hook ---

const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  const [activeUsers, setActiveUsers] = useState(1);
  const [contributions, setContributions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [meshData, setMeshData] = useState<any[]>([]);
  const [simulationState, setSimulationState] = useState<any>({
    active: false,
    progress: 0,
  });

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      try {
        const wsUrl = `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
        ws = new WebSocket(wsUrl);
        setReadyState(WebSocket.CONNECTING);

        ws.onopen = () => {
          console.log("Connected to Ecosystem Mesh");
          setSocket(ws);
          setReadyState(WebSocket.OPEN);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "PRESENCE_UPDATE") {
              setActiveUsers(data.count);
            } else if (data.type === "INIT") {
              setContributions(data.contributions);
              setNotifications(data.notifications || []);
            } else if (data.type === "CONTRIBUTION_ADDED") {
              setContributions((prev) => [data.payload, ...prev].slice(0, 20));
            } else if (data.type === "NEW_NOTIFICATION") {
              setNotifications((prev) => [data.payload, ...prev].slice(0, 10));
            } else if (data.type === "MESH_UPDATE") {
              setMeshData(data.payload);
            } else if (
              data.type === "SIMULATION_UPDATE" ||
              data.type === "SIMULATION_COMPLETE"
            ) {
              setSimulationState(data.payload);
              if (data.type === "SIMULATION_COMPLETE") {
                toast.success(
                  "Simulation Complete: " + data.payload.results.impact,
                );
              }
            }
          } catch (e) {
            console.error("Error parsing socket message:", e);
          }
        };

        ws.onerror = (error) => {
          console.error("Socket error:", error);
          setSocket(null);
          setReadyState(WebSocket.CLOSED);
        };

        ws.onclose = () => {
          console.log("Socket closed. Reconnecting...");
          setSocket(null);
          setReadyState(WebSocket.CLOSED);
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (e) {
        console.error("Socket connection failed:", e);
        setReadyState(WebSocket.CLOSED);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null;
        ws.onerror = null;
        ws.onopen = null;
        ws.onmessage = null;
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  const addContribution = (payload: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "NEW_CONTRIBUTION", payload }));
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return {
    activeUsers,
    contributions,
    notifications,
    meshData,
    simulationState,
    addContribution,
    markAsRead,
    readyState,
  };
};

// --- Components ---

const ICON_MAP: Record<string, any> = {
  Leaf,
  Zap,
  Sparkles,
  Database,
  Camera,
  Activity,
};

const Paywall = ({
  children,
  planRequired = "professional",
  currentPlan,
  onUpgrade,
}: {
  children: React.ReactNode;
  planRequired?: SubscriptionPlan;
  currentPlan: SubscriptionPlan;
  onUpgrade: () => void;
}) => {
  const planLevels: Record<SubscriptionPlan, number> = {
    community: 0,
    professional: 1,
    industrial: 2,
  };

  const isLocked = planLevels[currentPlan] < planLevels[planRequired];

  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative group">
      <div className="filter blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[32px] border border-amber-200 shadow-2xl text-center space-y-4 max-w-sm mx-4 bg-white/90 backdrop-blur-xl"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock size={32} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-nature-900">
              Premium Feature
            </h4>
            <p className="text-nature-500 text-sm mt-1">
              The{" "}
              <span className="font-bold uppercase text-amber-600">
                {planRequired}
              </span>{" "}
              plan is required to access this advanced ecological tool.
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="w-full py-4 bg-nature-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-nature-800 transition-all shadow-lg shadow-nature-900/20"
          >
            Upgrade Now
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const SensorCard = ({
  sensor,
  onNavigate,
}: {
  sensor: SensorData;
  onNavigate: (tab: any) => void;
}) => (
  <motion.div
    whileHover={{ y: -4 }}
    onClick={() => onNavigate("analytics")}
    className="glass p-6 rounded-3xl flex flex-col gap-4 cursor-pointer hover:shadow-lg transition-all"
  >
    <div className="flex justify-between items-start">
      <div className={cn("p-3 rounded-2xl bg-white/50", sensor.color)}>
        <sensor.icon size={24} />
      </div>
      <div
        className={cn(
          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
          sensor.status === "optimal"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700",
        )}
      >
        {sensor.status}
      </div>
    </div>
    <div>
      <p className="text-nature-500 text-sm font-medium">{sensor.name}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-3xl font-serif font-bold">{sensor.value}</h3>
        <span className="text-nature-400 text-sm">{sensor.unit}</span>
      </div>
    </div>
  </motion.div>
);

const BiodiversityHeatmap = () => (
  <div className="glass p-12 rounded-[56px] space-y-8">
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-4xl font-bold flex items-center gap-4">
          <Globe size={36} className="text-blue-500" />
          Global Biodiversity Heatmap
        </h3>
        <p className="text-nature-500 text-lg mt-3">
          Real-time contribution density across the globe
        </p>
      </div>
      <button className="px-6 py-4 bg-emerald-500 text-white rounded-2xl text-base font-bold hover:bg-emerald-600 transition-colors shadow-xl shadow-emerald-500/30">
        View Full Map
      </button>
    </div>
    <div className="relative h-[800px] bg-nature-900 rounded-[40px] overflow-hidden border-2 border-nature-800 group shadow-2xl">
      <img
        src="https://picsum.photos/seed/worldmap/1920/1080"
        className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-blue-500/20" />

      {/* Animated mesh pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Simulated Heatmap Blobs - Larger */}
      {[
        {
          top: "30%",
          left: "20%",
          size: "w-24 h-24",
          color: "bg-emerald-500",
          delay: 0,
        },
        {
          top: "45%",
          left: "55%",
          size: "w-32 h-32",
          color: "bg-blue-500",
          delay: 0.5,
        },
        {
          top: "60%",
          left: "35%",
          size: "w-28 h-28",
          color: "bg-emerald-400",
          delay: 1,
        },
        {
          top: "25%",
          left: "75%",
          size: "w-20 h-20",
          color: "bg-blue-400",
          delay: 1.5,
        },
        {
          top: "70%",
          left: "80%",
          size: "w-36 h-36",
          color: "bg-emerald-600",
          delay: 2,
        },
        {
          top: "15%",
          left: "45%",
          size: "w-24 h-24",
          color: "bg-teal-500",
          delay: 2.5,
        },
        {
          top: "55%",
          left: "65%",
          size: "w-28 h-28",
          color: "bg-cyan-500",
          delay: 3,
        },
      ].map((blob, i) => (
        <motion.div
          key={i}
          style={{ top: blob.top, left: blob.left }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: blob.delay,
          }}
          className={cn(
            "absolute rounded-full blur-3xl",
            blob.size,
            blob.color,
          )}
        />
      ))}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <motion.line
          x1="20%"
          y1="30%"
          x2="55%"
          y2="45%"
          stroke="rgba(16, 185, 129, 0.3)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.line
          x1="55%"
          y1="45%"
          x2="75%"
          y2="25%"
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 0.5,
          }}
        />
      </svg>

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

      <div className="absolute bottom-8 right-8 flex gap-6">
        <div className="flex items-center gap-3 text-sm font-bold text-white bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />{" "}
          HIGH ACTIVITY
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-white bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />{" "}
          EMERGING DATA
        </div>
      </div>
    </div>
  </div>
);

const WelcomeModal = ({ onClose }: { onClose: () => void }) => {
  const [showVideo, setShowVideo] = useState(true);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-nature-900/90 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass w-full max-w-5xl bg-white rounded-[48px] overflow-hidden shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 bg-white/90 hover:bg-white rounded-full transition-all shadow-lg"
        >
          <X size={24} className="text-nature-900" />
        </button>

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        {showVideo ? (
          <div className="p-8 space-y-6 relative z-10">
            {/* Enhanced Welcome Header */}
            <div className="text-center space-y-4 mb-6">
              <motion.div
                className="flex justify-center"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 text-white rounded-[28px] flex items-center justify-center shadow-2xl relative">
                  <TreePine size={48} className="relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-600 rounded-[28px] blur-xl opacity-50 animate-pulse" />
                </div>
              </motion.div>

              <motion.h2
                className="text-6xl font-serif font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Welcome to the Internet of Nature! 🌍
              </motion.h2>

              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-nature-700 text-2xl font-semibold leading-relaxed max-w-3xl mx-auto">
                  Where Technology Meets the Natural World
                </p>
                <p className="text-nature-600 text-lg leading-relaxed max-w-3xl mx-auto">
                  Join us in revolutionizing environmental conservation through
                  cutting-edge IoT sensors, AI-powered ecosystem analysis, and a
                  global network of nature guardians. Together, we're creating a
                  smarter, more sustainable planet.
                </p>
              </motion.div>
            </div>

            {/* Enhanced Video Section with Nature Context */}
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-4 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <div className="aspect-video relative bg-nature-900">
                {/* Nature-themed Video - Educational content about IoT and ecosystems */}
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/GfO-3Oir-qM?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&loop=1"
                  title="Internet of Nature - Connecting Ecosystems Through Technology"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* Enhanced Fallback with Nature Theme */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-600 via-green-600 to-nature-900 pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                  <div className="text-center text-white p-8">
                    <motion.div
                      className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <TreePine size={48} />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-3">
                      Ecosystem Intelligence Platform
                    </h3>
                    <p className="text-white/90 text-lg max-w-md mx-auto">
                      Discover how our IoT sensors monitor forests, oceans, and
                      wildlife in real-time
                    </p>
                  </div>
                </div>
              </div>

              {/* Video Description Bar */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Activity size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">System Overview Video</p>
                      <p className="text-xs text-white/80">
                        Learn how to protect nature with technology
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs bg-white/20 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span>Live Demo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Features with Nature Focus */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <motion.div
                className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 transition-all hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Activity size={28} />
                </div>
                <h4 className="font-bold text-nature-900 mb-2 text-lg">
                  🌲 Real-Time Ecosystem Monitoring
                </h4>
                <p className="text-sm text-nature-600 leading-relaxed">
                  Track forest health, air quality, soil moisture, and wildlife
                  activity with 10,000+ IoT sensors deployed across 50+
                  countries
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Sparkles size={28} />
                </div>
                <h4 className="font-bold text-nature-900 mb-2 text-lg">
                  🤖 Genie AI Intelligence
                </h4>
                <p className="text-sm text-nature-600 leading-relaxed">
                  Get instant insights on biodiversity trends, pollution
                  patterns, and conservation strategies powered by advanced
                  machine learning
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Users size={28} />
                </div>
                <h4 className="font-bold text-nature-900 mb-2 text-lg">
                  🌍 Global Nature Network
                </h4>
                <p className="text-sm text-nature-600 leading-relaxed">
                  Join 50,000+ scientists, conservationists, and nature
                  enthusiasts collaborating to protect our planet's ecosystems
                </p>
              </motion.div>
            </div>

            {/* What You'll Experience Section */}
            <div className="bg-gradient-to-br from-nature-50 to-emerald-50 p-6 rounded-3xl border-2 border-emerald-200">
              <h3 className="text-2xl font-bold text-nature-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={24} />
                What You'll Experience
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    icon: "🗺️",
                    text: "Interactive biodiversity heatmaps showing species distribution",
                  },
                  {
                    icon: "📊",
                    text: "Real-time dashboards with ecosystem health metrics",
                  },
                  {
                    icon: "🎯",
                    text: "AI-powered species identification and tracking",
                  },
                  {
                    icon: "🔔",
                    text: "Instant alerts for environmental threats and anomalies",
                  },
                  {
                    icon: "🏆",
                    text: "Gamified conservation missions and achievements",
                  },
                  {
                    icon: "🤝",
                    text: "Direct collaboration with global research institutions",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white p-3 rounded-xl border border-emerald-100"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-sm text-nature-700 font-medium">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowVideo(false)}
                className="flex-1 py-4 bg-nature-100 text-nature-900 rounded-2xl font-bold hover:bg-nature-200 transition-all border-2 border-nature-200"
              >
                Skip Video
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Start Exploring Nature →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 space-y-8 relative z-10">
            <motion.div
              className="flex justify-center"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600 rounded-[32px] flex items-center justify-center shadow-xl">
                <TreePine size={48} />
              </div>
            </motion.div>
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Welcome to the Wild! 🌱
              </h2>
              <p className="text-nature-600 text-lg leading-relaxed">
                You are one of the first "Nature Guardians" to join the Internet
                of Nature. We're starting our first mission:{" "}
                <strong>The 7-Day Bio-Blitz</strong>.
              </p>
            </div>
            <div className="bg-gradient-to-br from-nature-50 to-emerald-50 p-8 rounded-[32px] space-y-4 border-2 border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <p className="text-sm text-nature-700">
                  <strong>Your Task:</strong> Find and identify 3 unique plants
                  in your neighborhood this week using our AI species
                  recognition.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <p className="text-sm text-nature-700">
                  <strong>The Reward:</strong> Receive a permanent "Founding
                  Member" badge and a 1-month preview of Pro features.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105"
            >
              Let's Reconnect with Nature 🌿
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const UpgradeModal = ({ onClose }: { onClose: () => void }) => {
  const { upgradeToRole } = useAuth();
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-nature-900/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-xl bg-white rounded-[48px] overflow-hidden shadow-2xl"
      >
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <Zap size={24} />
              </div>
              <h2 className="text-2xl font-bold">Upgrade to Nature Pro</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-nature-100 rounded-full transition-colors"
            >
              <X size={24} className="text-nature-400" />
            </button>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-nature-500 text-sm">
                Unlock advanced ecosystem intelligence and support global
                restoration efforts.
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$2</span>
                <span className="text-nature-400 font-medium">/ month</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                "Plant Health Diagnostics (AI)",
                "Hyper-local Soil & Air Data",
                "Offline Biodiversity Maps",
                "Priority Support & Early Access",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  <span className="text-sm font-medium text-nature-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <PayPalButtons
                style={{
                  shape: "rect",
                  color: "gold",
                  layout: "vertical",
                  label: "subscribe",
                }}
                createSubscription={(data, actions) => {
                  return actions.subscription.create({
                    plan_id: "P-0AN25356H0709744TNGWBZOI",
                  });
                }}
                onApprove={async (data, actions) => {
                  toast.success("Welcome to Nature Pro!");
                  await upgradeToRole("professional");
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const UserProfile = ({
  user,
  onClose,
  onRefreshRole,
}: {
  user: any;
  onClose: () => void;
  onRefreshRole: () => Promise<void>;
}) => {
  const [profile, setProfile] = useState({
    displayName: user?.displayName || "",
    bio: "",
    location: "",
    avatar: user?.photoURL || "",
    role: "contributor",
    portfolio: "",
    experience: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!db) return;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          displayName: data.displayName || user?.displayName || "",
          bio: data.bio || "",
          location: data.location || "",
          avatar: data.photoURL || user?.photoURL || "",
          role: data.role || "contributor",
          portfolio: data.portfolio || "",
          experience: data.experience || "",
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        photoURL: profile.avatar,
        role: profile.role,
        portfolio: profile.portfolio,
        experience: profile.experience,
      });
      await onRefreshRole();
      toast.success("Profile updated successfully");
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-2xl bg-white rounded-[48px] overflow-hidden shadow-2xl"
      >
        <div className="p-10 space-y-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">Your Professional Profile</h2>
              <p className="text-nature-500 text-sm">
                Showcase your ecological expertise to the global mesh.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-nature-100 rounded-full transition-colors"
            >
              <X size={24} className="text-nature-400" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="animate-spin text-nature-400" size={32} />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-nature-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User size={40} className="text-nature-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Avatar URL
                  </label>
                  <input
                    value={profile.avatar}
                    onChange={(e) =>
                      setProfile({ ...profile, avatar: e.target.value })
                    }
                    className="w-full px-6 py-3 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all text-sm"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Display Name
                  </label>
                  <input
                    required
                    value={profile.displayName}
                    onChange={(e) =>
                      setProfile({ ...profile, displayName: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all font-bold"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Role
                  </label>
                  <select
                    value={profile.role}
                    onChange={(e) =>
                      setProfile({ ...profile, role: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all font-bold"
                  >
                    <option value="contributor">Contributor</option>
                    <option value="pro">Nature Pro</option>
                    <option value="researcher">Researcher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Location
                  </label>
                  <input
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                    placeholder="e.g. London, UK"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Portfolio/Website
                  </label>
                  <input
                    value={profile.portfolio}
                    onChange={(e) =>
                      setProfile({ ...profile, portfolio: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                  Professional Experience
                </label>
                <textarea
                  value={profile.experience}
                  onChange={(e) =>
                    setProfile({ ...profile, experience: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all h-24 resize-none"
                  placeholder="List your key ecological projects or certifications..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                  Bio
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all h-24 resize-none"
                  placeholder="Tell the mesh about your ecological mission and how you plan to contribute to the Internet of Nature..."
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-nature-600" />
                  <h4 className="font-bold">System Role & Permissions</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "community",
                      label: "Community",
                      icon: Users,
                      desc: "Basic data access & chat",
                    },
                    {
                      id: "professional",
                      label: "Professional",
                      icon: Briefcase,
                      desc: "Advanced analytics & reports",
                    },
                    {
                      id: "developer",
                      label: "Developer",
                      icon: Code,
                      desc: "API access & custom logic",
                    },
                    {
                      id: "industrial",
                      label: "Industrial",
                      icon: Factory,
                      desc: "Full control & strategy tools",
                    },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, role: role.id })}
                      className={cn(
                        "p-6 rounded-[32px] border-2 transition-all text-left space-y-3",
                        profile.role === role.id
                          ? "bg-nature-900 border-nature-900 text-white shadow-xl scale-[1.02]"
                          : "bg-white border-nature-100 hover:border-nature-200 text-nature-900",
                      )}
                    >
                      <role.icon
                        size={24}
                        className={
                          profile.role === role.id
                            ? "text-white"
                            : "text-nature-400"
                        }
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest">
                          {role.label}
                        </p>
                        <p className="text-[10px] opacity-60 leading-tight">
                          {role.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-nature-100">
                <h4 className="text-sm font-bold">Notification Preferences</h4>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 bg-nature-50 rounded-2xl cursor-pointer hover:bg-nature-100 transition-all">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-nature-300 text-nature-900 focus:ring-nature-900"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Email Alerts</p>
                      <p className="text-[10px] text-nature-400">
                        Critical system updates
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 bg-nature-50 rounded-2xl cursor-pointer hover:bg-nature-100 transition-all">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-nature-300 text-nature-900 focus:ring-nature-900"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">AI Insights</p>
                      <p className="text-[10px] text-nature-400">
                        Weekly ecological reports
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <ShieldCheck size={20} />
                  )}
                  Save Professional Profile
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 bg-nature-50 text-nature-400 rounded-2xl font-bold hover:bg-nature-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const MeshDataFeed = ({ data }: { data: any[] }) => {
  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Real-time Mesh Feed</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live
        </div>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {data.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-nature-50/50 rounded-2xl border border-nature-100 flex items-center justify-between group hover:bg-white transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  node.status === "online"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-amber-100 text-amber-600",
                )}
              >
                <Cpu size={20} />
              </div>
              <div>
                <p className="text-sm font-bold">{node.location}</p>
                <p className="text-[10px] text-nature-400 uppercase font-bold tracking-widest">
                  {node.id}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-xs font-bold text-blue-600">
                  {node.moisture.toFixed(1)}%
                </p>
                <p className="text-[8px] text-nature-400 uppercase font-bold tracking-widest">
                  Moisture
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-orange-600">
                  {node.temp.toFixed(1)}°C
                </p>
                <p className="text-[8px] text-nature-400 uppercase font-bold tracking-widest">
                  Temp
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-purple-600">
                  {node.aqi.toFixed(0)}
                </p>
                <p className="text-[8px] text-nature-400 uppercase font-bold tracking-widest">
                  AQI
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ScenarioComparison = ({
  scenarioA,
  scenarioB,
  resultsA,
  resultsB,
}: {
  scenarioA: string;
  scenarioB: string;
  resultsA: any;
  resultsB: any;
}) => {
  return (
    <div className="glass p-8 rounded-[40px] space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Scenario Comparison</h3>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <Workflow size={14} />
          Side-by-Side Analysis
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 p-6 bg-nature-50 rounded-[32px] border border-nature-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-nature-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">
              A
            </div>
            <h4 className="font-bold text-lg capitalize">
              {scenarioA.replace("-", " ")}
            </h4>
          </div>
          <p className="text-sm text-nature-600 leading-relaxed">
            {resultsA?.impact || "Simulating impact..."}
          </p>
          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-nature-400 uppercase">
                Efficiency
              </p>
              <p className="text-xl font-bold text-emerald-600">88%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-nature-400 uppercase">
                Cost Index
              </p>
              <p className="text-xl font-bold text-blue-600">Low</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6 bg-emerald-50 rounded-[32px] border border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">
              B
            </div>
            <h4 className="font-bold text-lg capitalize">
              {scenarioB.replace("-", " ")}
            </h4>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">
            {resultsB?.impact || "Simulating impact..."}
          </p>
          <div className="pt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-nature-400 uppercase">
                Efficiency
              </p>
              <p className="text-xl font-bold text-emerald-600">94%</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-nature-400 uppercase">
                Cost Index
              </p>
              <p className="text-xl font-bold text-blue-600">Medium</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-nature-900 text-white rounded-[32px] space-y-4">
        <h5 className="font-bold flex items-center gap-2">
          <Sparkles size={18} className="text-emerald-400" />
          AI Recommendation
        </h5>
        <p className="text-sm text-white/70 leading-relaxed">
          Scenario B (<strong>{scenarioB.replace("-", " ")}</strong>)
          demonstrates a 6.8% higher biodiversity retention rate with only a 12%
          increase in implementation cost. For long-term ecological stability,
          Scenario B is the preferred protocol.
        </p>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<
    {
      id: string;
      title: string;
      message: string;
      type: "alert" | "info" | "success";
      timestamp: string;
    }[]
  >([
    {
      id: "1",
      title: "Sensor Alert",
      message: "Soil moisture in Sector 7G dropped below 30%.",
      type: "alert",
      timestamp: "5m ago",
    },
    {
      id: "2",
      title: "New Insight",
      message: "Genie AI has generated a new ecological report for your area.",
      type: "info",
      timestamp: "20m ago",
    },
    {
      id: "3",
      title: "System Update",
      message: "Global mesh network successfully synchronized.",
      type: "success",
      timestamp: "1h ago",
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 bg-white border border-nature-200 rounded-2xl hover:bg-nature-50 transition-all relative group"
      >
        <Bell
          size={20}
          className="text-nature-600 group-hover:rotate-12 transition-transform"
        />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-16 right-0 w-80 glass rounded-[32px] shadow-2xl overflow-hidden z-50 border border-nature-100"
          >
            <div className="p-6 bg-nature-900 text-white flex justify-between items-center">
              <h4 className="font-bold">Notifications</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4 space-y-3">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-4 bg-white rounded-2xl border border-nature-50 shadow-sm relative group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-xl shrink-0",
                          n.type === "alert"
                            ? "bg-red-50 text-red-500"
                            : n.type === "info"
                              ? "bg-blue-50 text-blue-500"
                              : "bg-emerald-50 text-emerald-500",
                        )}
                      >
                        {n.type === "alert" ? (
                          <AlertTriangle size={16} />
                        ) : n.type === "info" ? (
                          <Info size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-sm font-bold text-nature-900">
                          {n.title}
                        </h5>
                        <p className="text-xs text-nature-500 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-[10px] text-nature-300 font-bold uppercase tracking-widest">
                          {n.timestamp}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeNotification(n.id)}
                      className="absolute top-2 right-2 p-1 text-nature-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-3 opacity-30">
                  <Bell size={32} className="mx-auto" />
                  <p className="text-sm font-medium">No new notifications</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RealTimeMap = ({ data }: { data: any[] }) => {
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  return (
    <div className="glass p-8 rounded-[40px] space-y-6 h-[500px] relative overflow-hidden">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Global Mesh Map</h3>
          <p className="text-nature-500 text-sm">
            Real-time sensor distribution and status
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <Globe size={14} />
          Live Network
        </div>
      </div>

      <div className="w-full h-full bg-nature-50 rounded-3xl overflow-hidden border border-nature-100 relative">
        <ComposableMap
          projectionConfig={{
            scale: 200,
            center: [0, 20],
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#E4E3E0"
                  stroke="#FFFFFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#D1D1D1", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {data.map((node) => (
            <Marker
              key={node.id}
              coordinates={node.coordinates || [0, 0]}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              <motion.circle
                r={6}
                fill={node.status === "online" ? "#10b981" : "#f59e0b"}
                stroke="#fff"
                strokeWidth={2}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ cursor: "pointer" }}
              />
            </Marker>
          ))}
        </ComposableMap>

        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-8 left-8 p-6 glass rounded-3xl shadow-2xl border border-nature-100 w-64 space-y-4 pointer-events-none"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-nature-900">
                    {hoveredNode.location}
                  </h4>
                  <p className="text-[10px] text-nature-400 font-bold uppercase tracking-widest">
                    Node ID: {hoveredNode.id}
                  </p>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest",
                    hoveredNode.status === "online"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600",
                  )}
                >
                  {hoveredNode.status}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] text-nature-400 font-bold uppercase tracking-widest">
                    Biodiversity
                  </p>
                  <p className="text-sm font-bold">
                    {hoveredNode.biodiversity}/10
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] text-nature-400 font-bold uppercase tracking-widest">
                    Health
                  </p>
                  <p className="text-sm font-bold">{hoveredNode.health}%</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const APIKeyManager = ({ user }: { user: any }) => {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");

  useEffect(() => {
    if (user?.uid) fetchKeys();
  }, [user]);

  const fetchKeys = async () => {
    try {
      const res = await fetch(`/api/keys/${user.uid}`);
      const data = await res.json();
      setKeys(data);
    } catch (e) {
      toast.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    if (!newKeyName) return toast.error("Please enter a key name");
    try {
      const res = await fetch(`/api/keys/${user.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      setKeys([...keys, data]);
      setNewKeyName("");
      toast.success("API Key generated successfully");
    } catch (e) {
      toast.error("Failed to generate API key");
    }
  };

  const deleteKey = async (keyId: string) => {
    try {
      await fetch(`/api/keys/${user.uid}/${keyId}`, { method: "DELETE" });
      setKeys(keys.filter((k) => k.id !== keyId));
      toast.success("API Key revoked");
    } catch (e) {
      toast.error("Failed to revoke API key");
    }
  };

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold">API Key Management</h3>
          <p className="text-nature-500 text-sm">
            Securely access the Internet of Nature API
          </p>
        </div>
        <Key className="text-nature-900" size={24} />
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key Name (e.g. My App)"
            className="flex-1 px-6 py-3 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all text-sm"
          />
          <button
            onClick={generateKey}
            className="px-6 py-3 bg-nature-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-nature-800 transition-all"
          >
            Generate
          </button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="animate-spin text-nature-400" />
            </div>
          ) : keys.length === 0 ? (
            <p className="text-center text-nature-400 text-xs py-4">
              No API keys generated yet.
            </p>
          ) : (
            keys.map((k) => (
              <div
                key={k.id}
                className="p-4 bg-nature-50 rounded-2xl border border-nature-100 flex justify-between items-center group"
              >
                <div className="space-y-1">
                  <p className="font-bold text-sm">{k.name}</p>
                  <code className="text-[10px] text-nature-400 bg-white px-2 py-0.5 rounded border border-nature-100">
                    {k.key}
                  </code>
                  <p className="text-[8px] text-nature-400 uppercase tracking-widest">
                    Created: {new Date(k.created).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteKey(k.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const FeedbackForm = ({ user }: { user: any }) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return toast.error("Please provide some feedback");
    setSubmitting(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid,
          email: user?.email,
          feedback,
          rating,
        }),
      });
      toast.success("Thank you for your feedback!");
      setFeedback("");
    } catch (e) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">User Feedback</h3>
        <MessageSquare className="text-blue-500" size={24} />
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={cn(
                "p-1 transition-all",
                rating >= star ? "text-amber-400" : "text-nature-200",
              )}
            >
              <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="How can we improve the Internet of Nature?"
          className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all h-32 resize-none text-sm"
        />
        <button
          disabled={submitting}
          className="w-full py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <RefreshCw className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

const AIInsights = ({ data }: { data: any[] }) => {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenerativeAI(
        import.meta.env.VITE_GEMINI_API_KEY || "",
      );
      const model = ai.getGenerativeModel({ model: "gemini-pro" });
      const response = await model.generateContent(
        `Analyze this ecological sensor data and provide a professional, concise insight (max 2 sentences): ${JSON.stringify(data)}`,
      );
      const result = await response.response;
      setInsight(result.text() || "No insights available at this time.");
    } catch (e) {
      setInsight(
        "Nature AI is currently analyzing the global mesh. Check back soon.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data && data.length > 0) {
      generateInsight();
    }
  }, []); // Only run once on mount

  return (
    <div className="glass p-8 rounded-[40px] bg-nature-900 text-white space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <Sparkles className="text-emerald-400 animate-pulse" size={24} />
      </div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
        Nature AI Insight
      </h4>
      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-white/10 rounded-full w-full animate-pulse" />
          <div className="h-4 bg-white/10 rounded-full w-2/3 animate-pulse" />
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-emerald-50/80">{insight}</p>
      )}
      <button
        onClick={generateInsight}
        className="text-[10px] font-bold text-emerald-400 hover:underline uppercase tracking-widest"
      >
        Refresh Analysis
      </button>
    </div>
  );
};

const IndustrialDashboard = () => {
  const stats = [
    {
      label: "Energy Efficiency",
      value: "94%",
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      label: "Water Recycling",
      value: "82%",
      icon: Droplets,
      color: "text-blue-500",
    },
    {
      label: "Carbon Offset",
      value: "1,240t",
      icon: Leaf,
      color: "text-emerald-500",
    },
    {
      label: "Compliance",
      value: "88%",
      icon: ShieldCheck,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="glass p-10 rounded-[40px] space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold">Industrial Performance</h3>
          <p className="text-nature-500">
            Real-time ecological impact metrics for industrial operations
          </p>
        </div>
        <div className="p-4 bg-nature-900 text-white rounded-3xl">
          <Activity size={32} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="p-6 bg-nature-50 rounded-3xl border border-nature-100 space-y-4"
          >
            <div
              className={cn(
                "p-3 bg-white rounded-2xl w-fit shadow-sm",
                s.color,
              )}
            >
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-nature-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="h-[200px] w-full bg-nature-900 rounded-[32px] p-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_HISTORY}>
              <Line
                type="monotone"
                dataKey="biodiversity"
                stroke="#10b981"
                strokeWidth={4}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="relative z-10 text-center space-y-2">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
            Live Efficiency Mesh
          </p>
          <p className="text-white text-lg font-medium">
            Optimizing for Global Canopy Accord 2026
          </p>
        </div>
      </div>
    </div>
  );
};

const IndustryStrategy = ({ meshData }: { meshData: any[] }) => {
  const [strategy, setStrategy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateStrategy = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenerativeAI(
        import.meta.env.VITE_GEMINI_API_KEY || "",
      );
      const model = ai.getGenerativeModel({ model: "gemini-pro" });
      const response = await model.generateContent(
        `Based on the current global mesh data: ${JSON.stringify(meshData)}, provide a high-level strategic modification plan for a heavy industry plant to become ecologically positive. Include specific IoT integrations and global impact projections.`,
      );
      const result = await response.response;
      setStrategy(result.text() || "Strategic data unavailable.");
    } catch (e) {
      toast.error("Failed to reach Strategy Core");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[40px] space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold">
            Industrial Transformation Strategy
          </h3>
          <p className="text-nature-500">
            AI-driven modification plans for global industrial compliance
          </p>
        </div>
        <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl">
          <Building2 size={32} />
        </div>
      </div>

      {!strategy ? (
        <div className="p-12 border-2 border-dashed border-nature-200 rounded-[40px] flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 bg-nature-50 rounded-full flex items-center justify-center">
            <Lightbulb className="text-nature-300" size={40} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold">Ready for Transformation?</h4>
            <p className="text-nature-500 max-w-md">
              Our AI analyzes your sector's mesh data to propose immediate
              modifications for ecological positive output.
            </p>
          </div>
          <button
            onClick={generateStrategy}
            disabled={loading}
            className="px-10 py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all flex items-center gap-3"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Globe2 size={20} />
            )}
            Generate Global Strategy
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="prose prose-nature max-w-none p-8 bg-nature-50 rounded-[32px] border border-nature-100">
            <Markdown>{strategy}</Markdown>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setStrategy(null)}
              className="px-8 py-4 bg-white border border-nature-200 text-nature-900 rounded-2xl font-bold hover:bg-nature-50 transition-all"
            >
              Reset Plan
            </button>
            <button className="px-8 py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all flex items-center gap-2">
              <Download size={20} />
              Export Implementation Guide
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const HelpCenter = () => {
  const faqs = [
    {
      q: "How do I connect my own sensors?",
      a: "Go to the 'System' tab and select 'Hardware'. You'll find instructions for flashing our open-source firmware onto ESP32 or Arduino devices.",
    },
    {
      q: "What is the Nature Score?",
      a: "The Nature Score is a composite metric reflecting your contributions to the global mesh, the health of your local ecosystem, and your participation in Bio-Blitz challenges.",
    },
    {
      q: "Can I use the API for commercial projects?",
      a: "Yes, our Industrial plan provides full commercial rights, higher rate limits, and dedicated support for large-scale ecological integration.",
    },
    {
      q: "How does the AI simulation work?",
      a: "Project Genie uses a transformer-based neural network trained on decades of ecological data and real-time telemetry from our global IoT mesh.",
    },
  ];

  return (
    <div className="glass p-12 rounded-[40px] space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-bold tracking-tight">Help Center</h2>
        <p className="text-nature-500 text-lg max-w-2xl mx-auto">
          Everything you need to know about navigating the Internet of Nature.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="p-8 bg-nature-50 rounded-[32px] border border-nature-100 space-y-4 hover:bg-white transition-all group"
          >
            <h4 className="font-bold text-lg flex items-center gap-3">
              <HelpCircle
                size={20}
                className="text-nature-400 group-hover:text-nature-900 transition-colors"
              />
              {faq.q}
            </h4>
            <p className="text-nature-600 text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="bg-nature-900 text-white p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Still have questions?</h3>
          <p className="text-white/60">
            Our team of ecologists and engineers is here to help.
          </p>
        </div>
        <button className="px-8 py-4 bg-white text-nature-900 rounded-2xl font-bold hover:bg-nature-50 transition-all flex items-center gap-2">
          <MessageSquare size={20} />
          Chat with Support
        </button>
      </div>
    </div>
  );
};

const SimulationControl = ({
  state,
  currentRole,
}: {
  state: any;
  currentRole: string;
}) => {
  const [scenario, setScenario] = useState("urban-heat");
  const [comparisonScenario, setComparisonScenario] = useState("");
  const [starting, setStarting] = useState(false);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [params, setParams] = useState({
    treeDensity: 50,
    waterUsage: 30,
    sensorPrecision: 80,
  });

  const canRunSimulation =
    currentRole === "pro" ||
    currentRole === "admin" ||
    currentRole === "researcher";

  const handleStart = async () => {
    if (!canRunSimulation) {
      toast.error("Research or Pro role required for advanced simulations");
      return;
    }
    setStarting(true);
    try {
      await fetch("/api/simulation/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          scenario,
          comparisonScenario: isComparisonMode ? comparisonScenario : undefined,
          parameters: params,
        }),
      });
    } catch (e) {
      toast.error("Failed to start simulation");
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    try {
      await fetch("/api/simulation/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stop" }),
      });
    } catch (e) {
      toast.error("Failed to stop simulation");
    }
  };

  return (
    <div className="glass p-8 rounded-[40px] space-y-6 relative overflow-hidden">
      {!canRunSimulation && (
        <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-sm flex items-center justify-center p-8 text-center">
          <div className="space-y-4">
            <Lock className="mx-auto text-nature-400" size={32} />
            <h4 className="font-bold text-lg">Restricted Access</h4>
            <p className="text-xs text-nature-500 max-w-[200px]">
              Advanced simulations are reserved for Researchers and Pro members.
            </p>
            <button className="px-4 py-2 bg-nature-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
              Upgrade Now
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Ecosystem Simulation</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsComparisonMode(!isComparisonMode)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              isComparisonMode
                ? "bg-emerald-100 text-emerald-600"
                : "bg-nature-100 text-nature-400",
            )}
          >
            Comparison Mode
          </button>
          <Sparkles className="text-emerald-500" size={24} />
        </div>
      </div>

      {state.active ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span>
                Running: {state.scenario}{" "}
                {isComparisonMode && `vs ${state.comparisonScenario}`}
              </span>
              <span>{state.progress}%</span>
            </div>
            <div className="w-full h-3 bg-nature-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
          <button
            onClick={handleStop}
            className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
          >
            Abort Simulation
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                Primary Scenario
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all font-bold"
              >
                <option value="urban-heat">Urban Heat Island Mitigation</option>
                <option value="flood-resilience">Flash Flood Resilience</option>
                <option value="pollinator-mesh">
                  Pollinator Network Optimization
                </option>
                <option value="carbon-sink">Carbon Sequestration Peak</option>
              </select>
            </div>

            {isComparisonMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                  Comparison Scenario
                </label>
                <select
                  value={comparisonScenario}
                  onChange={(e) => setComparisonScenario(e.target.value)}
                  className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all font-bold"
                >
                  <option value="">Select comparison...</option>
                  <option value="urban-heat">
                    Urban Heat Island Mitigation
                  </option>
                  <option value="flood-resilience">
                    Flash Flood Resilience
                  </option>
                  <option value="pollinator-mesh">
                    Pollinator Network Optimization
                  </option>
                  <option value="carbon-sink">Carbon Sequestration Peak</option>
                </select>
              </motion.div>
            )}
          </div>

          <button
            onClick={handleStart}
            disabled={starting || (isComparisonMode && !comparisonScenario)}
            className="w-full py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all shadow-xl flex items-center justify-center gap-2"
          >
            {starting ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Rocket size={20} />
            )}
            {isComparisonMode ? "Compare Scenarios" : "Start AI Simulation"}
          </button>

          <div className="space-y-4 pt-4 border-t border-nature-100">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
              Simulation Parameters
            </h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Tree Density</span>
                  <span>{params.treeDensity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.treeDensity}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      treeDensity: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-nature-100 rounded-lg appearance-none cursor-pointer accent-nature-900"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Water Usage</span>
                  <span>{params.waterUsage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.waterUsage}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      waterUsage: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-nature-100 rounded-lg appearance-none cursor-pointer accent-nature-900"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>Sensor Precision</span>
                  <span>{params.sensorPrecision}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={params.sensorPrecision}
                  onChange={(e) =>
                    setParams({
                      ...params,
                      sensorPrecision: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-1.5 bg-nature-100 rounded-lg appearance-none cursor-pointer accent-nature-900"
                />
              </div>
            </div>
          </div>

          {state.results && (
            <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-emerald-900 uppercase tracking-widest">
                  Simulation Report
                </p>
                <button className="text-[10px] font-bold text-emerald-600 hover:underline">
                  Download full PDF
                </button>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-emerald-800 leading-relaxed font-medium">
                  {state.results.impact}
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                    <p className="text-[8px] font-bold text-nature-400 uppercase">
                      Confidence
                    </p>
                    <p className="text-lg font-bold text-emerald-600">94.2%</p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-emerald-100">
                    <p className="text-[8px] font-bold text-nature-400 uppercase">
                      Data Points
                    </p>
                    <p className="text-lg font-bold text-blue-600">1.2M</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PredictionDashboard = ({ activeTab }: { activeTab: string }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/predictions")
      .then((res) => res.json())
      .then((data) => {
        setPredictions(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Predictive Analytics</h3>
        <TrendingUp className="text-blue-500" size={24} />
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer
          key={activeTab}
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <AreaChart data={predictions}>
            <defs>
              <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="moisture"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorMoisture)"
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="#f59e0b"
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-2xl">
          <p className="text-[8px] font-bold uppercase tracking-widest text-blue-400">
            Moisture Trend
          </p>
          <p className="text-lg font-bold text-blue-600">-12%</p>
        </div>
        <div className="p-4 bg-orange-50 rounded-2xl">
          <p className="text-[8px] font-bold uppercase tracking-widest text-orange-400">
            Temp Trend
          </p>
          <p className="text-lg font-bold text-orange-600">+2.4°C</p>
        </div>
      </div>
    </div>
  );
};

const MaintenanceScheduler = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    date: "",
    time: "",
    priority: "Medium",
    assignee: "",
  });

  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        fetchTasks();
        setIsAdding(false);
        setNewTask({
          title: "",
          date: "",
          time: "",
          priority: "Medium",
          assignee: "",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Pending" ? "Completed" : "Pending";
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Maintenance Scheduler
          </h2>
          <p className="text-nature-500 text-lg">
            Coordinate ecological maintenance and sensor calibration across the
            network.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all shadow-xl flex items-center gap-3"
        >
          <Workflow size={20} />
          Schedule Task
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass p-8 rounded-[40px] border border-nature-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">New Task Details</h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-nature-400" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Task Title
                  </label>
                  <input
                    required
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask({ ...newTask, title: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                    placeholder="e.g. Sensor Calibration"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newTask.date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, date: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTask.time}
                    onChange={(e) =>
                      setNewTask({ ...newTask, time: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Assignee
                  </label>
                  <input
                    required
                    value={newTask.assignee}
                    onChange={(e) =>
                      setNewTask({ ...newTask, assignee: e.target.value })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                    placeholder="Assignee Name"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="glass h-48 rounded-[40px] animate-pulse bg-nature-50"
                />
              ))
          : tasks.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setSelectedTask(t)}
                className={cn(
                  "glass p-8 rounded-[40px] border transition-all flex flex-col justify-between group cursor-pointer",
                  t.status === "Completed"
                    ? "bg-emerald-50/50 border-emerald-100 opacity-60"
                    : "border-nature-100 hover:shadow-xl",
                )}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        t.priority === "High"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600",
                      )}
                    >
                      {t.priority} Priority
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(t.id, t.status);
                      }}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        t.status === "Completed"
                          ? "bg-emerald-500 text-white"
                          : "bg-nature-100 text-nature-400 hover:bg-nature-200",
                      )}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                  </div>
                  <div>
                    <h3
                      className={cn(
                        "text-xl font-bold",
                        t.status === "Completed" && "line-through",
                      )}
                    >
                      {t.title}
                    </h3>
                    <p className="text-nature-500 text-sm flex items-center gap-2 mt-1">
                      <MapIcon size={14} /> {t.location}
                    </p>
                    <p className="text-nature-400 text-xs flex items-center gap-2 mt-1">
                      <History size={14} /> {t.date} at {t.time}
                    </p>
                  </div>
                </div>
                <div className="pt-6 mt-6 border-t border-nature-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-nature-900 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                      {t.assignee[0]}
                    </div>
                    <span className="text-xs font-medium text-nature-600">
                      {t.assignee}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      t.status === "Completed"
                        ? "text-emerald-600"
                        : "text-amber-600",
                    )}
                  >
                    {t.status}
                  </span>
                </div>
              </motion.div>
            ))}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass w-full max-w-2xl bg-white rounded-[48px] overflow-hidden shadow-2xl p-10 space-y-8"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block",
                      selectedTask.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600",
                    )}
                  >
                    {selectedTask.priority} Priority Task
                  </div>
                  <h2 className="text-4xl font-bold">{selectedTask.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-3 hover:bg-nature-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-nature-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                      Location
                    </p>
                    <p className="text-lg font-bold flex items-center gap-2">
                      <MapIcon size={18} className="text-emerald-500" />{" "}
                      {selectedTask.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                      Schedule
                    </p>
                    <p className="text-lg font-bold flex items-center gap-2">
                      <History size={18} className="text-blue-500" />{" "}
                      {selectedTask.date} at {selectedTask.time}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                      Estimated Duration
                    </p>
                    <p className="text-lg font-bold flex items-center gap-2">
                      <RefreshCw size={18} className="text-amber-500" />{" "}
                      {selectedTask.duration}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                      Assignee
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 bg-nature-900 text-white rounded-xl flex items-center justify-center font-bold">
                        {selectedTask.assignee[0]}
                      </div>
                      <p className="font-bold">{selectedTask.assignee}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                      Required Tools
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTask.tools?.map((tool: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-nature-50 rounded-lg text-xs font-medium border border-nature-100"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                  Description
                </p>
                <p className="text-nature-600 leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>

              <div className="pt-8 border-t border-nature-100 flex gap-4">
                <button
                  onClick={() => {
                    toast.success(
                      `Notification sent to ${selectedTask.assignee}`,
                    );
                    setSelectedTask(null);
                  }}
                  className="flex-1 py-4 bg-nature-100 text-nature-900 rounded-2xl font-bold hover:bg-nature-200 transition-all flex items-center justify-center gap-2"
                >
                  <Bell size={18} />
                  Notify Assignee
                </button>
                <button
                  onClick={() => {
                    toggleStatus(selectedTask.id, selectedTask.status);
                    setSelectedTask(null);
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2",
                    selectedTask.status === "Completed"
                      ? "bg-nature-100 text-nature-400"
                      : "bg-emerald-500 text-white hover:bg-emerald-600",
                  )}
                >
                  <CheckCircle2 size={20} />
                  {selectedTask.status === "Completed"
                    ? "Mark as Pending"
                    : "Mark as Completed"}
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-8 py-4 bg-nature-50 text-nature-400 rounded-2xl font-bold hover:bg-nature-100 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ConfigDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [config, setConfig] = useState({
    sensorThreshold: 40,
    aiModel: "gemini-3-flash-preview",
    notifications: true,
    dataRetention: "90 Days",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass w-full max-w-3xl bg-white rounded-[48px] overflow-hidden shadow-2xl"
      >
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">System Configuration</h2>
              <p className="text-nature-500 text-sm">
                Fine-tune the global mesh parameters and AI behavior.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-nature-100 rounded-full transition-colors"
            >
              <X size={24} className="text-nature-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                  Sensor Alert Threshold (%)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.sensorThreshold}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sensorThreshold: parseInt(e.target.value),
                      })
                    }
                    className="flex-1 accent-nature-900"
                  />
                  <span className="text-lg font-mono font-bold w-12">
                    {config.sensorThreshold}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                  AI Model Selection
                </label>
                <select
                  value={config.aiModel}
                  onChange={(e) =>
                    setConfig({ ...config, aiModel: e.target.value })
                  }
                  className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all font-bold text-sm"
                >
                  <option value="gemini-3-flash-preview">
                    Gemini 3 Flash (Fast)
                  </option>
                  <option value="gemini-3.1-pro-preview">
                    Gemini 3.1 Pro (Deep Reasoning)
                  </option>
                </select>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                  Data Retention Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["30 Days", "90 Days", "1 Year"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setConfig({ ...config, dataRetention: p })}
                      className={cn(
                        "py-3 rounded-xl text-xs font-bold transition-all",
                        config.dataRetention === p
                          ? "bg-nature-900 text-white shadow-lg"
                          : "bg-nature-50 text-nature-400 hover:bg-nature-100",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-nature-900 text-white rounded-[32px] space-y-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  System Health
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      label: "Mesh Connectivity",
                      value: "98%",
                      color: "bg-emerald-500",
                    },
                    {
                      label: "AI Inference Latency",
                      value: "124ms",
                      color: "bg-blue-500",
                    },
                    {
                      label: "Database Integrity",
                      value: "Optimal",
                      color: "bg-emerald-500",
                    },
                  ].map((stat, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[10px] text-nature-400 uppercase tracking-widest">
                        {stat.label}
                      </span>
                      <span className="text-xs font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-nature-50 rounded-3xl">
                <div className="space-y-1">
                  <p className="font-bold text-sm">Push Notifications</p>
                  <p className="text-[10px] text-nature-400">
                    Receive alerts on critical events
                  </p>
                </div>
                <button
                  onClick={() =>
                    setConfig({
                      ...config,
                      notifications: !config.notifications,
                    })
                  }
                  className={cn(
                    "w-14 h-8 rounded-full relative transition-all",
                    config.notifications ? "bg-emerald-500" : "bg-nature-200",
                  )}
                >
                  <motion.div
                    animate={{ x: config.notifications ? 24 : 4 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-nature-100 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all shadow-xl"
            >
              Save Configuration
            </button>
            <button
              onClick={onClose}
              className="px-8 py-4 bg-nature-50 text-nature-400 rounded-2xl font-bold hover:bg-nature-100 transition-all"
            >
              Reset Defaults
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SpeciesTracking = () => {
  const { addPoints } = useAuth();
  const [sightings, setSightings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSighting, setNewSighting] = useState({
    species: "",
    location: "",
    observer: "",
    status: "Common",
    image: "",
  });

  useEffect(() => {
    fetchSightings();
  }, []);

  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const handleDiagnose = async (species: string) => {
    setDiagnosing(true);
    try {
      const result = await askNatureAI(
        `Diagnose the potential health issues for a ${species} plant. Provide identifying signs of pests or diseases and recommended organic treatments.`,
      );
      setDiagnosis(result);
    } catch (e) {
      toast.error("Failed to generate diagnosis");
    } finally {
      setDiagnosing(false);
    }
  };

  const fetchSightings = async () => {
    try {
      const res = await fetch("/api/species");
      const data = await res.json();
      setSightings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newSighting,
          image:
            newSighting.image ||
            `https://picsum.photos/seed/${newSighting.species}/400/300`,
        }),
      });
      if (res.ok) {
        await addPoints(50);
        toast.success("Sighting logged! +50 Nature Points");
        fetchSightings();
        setIsAdding(false);
        setNewSighting({
          species: "",
          location: "",
          observer: "",
          status: "Common",
          image: "",
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">
            Species Tracking
          </h2>
          <p className="text-nature-500 text-lg">
            Monitor and log rare species sightings across the global mesh.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-8 py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all shadow-xl flex items-center gap-3"
        >
          <Camera size={20} />
          Log New Sighting
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass p-8 rounded-[40px] border border-nature-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">New Sighting Details</h3>
                <button
                  onClick={() => setIsAdding(false)}
                  className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-nature-400" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Species Name
                  </label>
                  <input
                    required
                    value={newSighting.species}
                    onChange={(e) =>
                      setNewSighting({
                        ...newSighting,
                        species: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                    placeholder="e.g. Snow Leopard"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Location
                  </label>
                  <input
                    required
                    value={newSighting.location}
                    onChange={(e) =>
                      setNewSighting({
                        ...newSighting,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                    placeholder="e.g. Himalayas, Nepal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 ml-4">
                    Observer Name
                  </label>
                  <input
                    required
                    value={newSighting.observer}
                    onChange={(e) =>
                      setNewSighting({
                        ...newSighting,
                        observer: e.target.value,
                      })
                    }
                    className="w-full px-6 py-4 bg-nature-50 rounded-2xl border-none focus:ring-2 focus:ring-nature-900 transition-all"
                    placeholder="Your Name"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Submit Sighting
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="glass h-96 rounded-[40px] animate-pulse bg-nature-50"
                />
              ))
          : sightings.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass overflow-hidden rounded-[40px] border border-nature-100 group hover:shadow-2xl transition-all"
              >
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={s.image}
                    alt={s.species}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-nature-900">
                    {s.status}
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold">{s.species}</h3>
                      <p className="text-nature-500 text-sm flex items-center gap-1">
                        <MapIcon size={14} /> {s.location}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-nature-100 rounded-xl flex items-center justify-center text-nature-600">
                      <Bird size={20} />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-nature-50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-nature-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        {s.observer[0]}
                      </div>
                      <span className="text-xs font-medium text-nature-600">
                        {s.observer}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDiagnose(s.species)}
                      disabled={diagnosing}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-200 transition-all flex items-center gap-1"
                    >
                      {diagnosing ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : (
                        <Activity size={10} />
                      )}
                      Diagnose Health
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
      </div>

      <AnimatePresence>
        {diagnosis && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-nature-900/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass w-full max-w-2xl bg-white rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-10 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Activity size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">AI Health Diagnosis</h2>
                  </div>
                  <button
                    onClick={() => setDiagnosis(null)}
                    className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-nature-400" />
                  </button>
                </div>
                <div className="prose prose-sm max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
                  <Markdown>{diagnosis}</Markdown>
                </div>
                <button
                  onClick={() => setDiagnosis(null)}
                  className="w-full py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all"
                >
                  Close Diagnosis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NatureAI = ({
  activeUsers,
  natureScore,
  activeAlert,
}: {
  activeUsers: number;
  natureScore: number;
  activeAlert: any;
}) => {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([
    {
      role: "ai",
      content:
        "Hello! I am Nature AI, your global mesh intelligence assistant. How can I help you analyze ecological data today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [scenario, setScenario] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSimulate = async () => {
    if (!scenario.trim() || isSimulating) return;

    setIsSimulating(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Simulate Scenario: ${scenario}` },
    ]);

    try {
      const response = await simulateEcosystemResponse(scenario, MOCK_SENSORS);
      setMessages((prev) => [...prev, { role: "ai", content: response }]);
      setScenario("");
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Simulation engine error. Please try again." },
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      // Enhance context with mesh data
      const context = `Current Mesh Status: ${activeUsers} scientists online, Nature Score: ${natureScore}%. Active alerts: ${activeAlert?.message || "None"}.`;
      const response = await askNatureAI(userMsg, context);
      setMessages((prev) => [...prev, { role: "ai", content: response }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I'm sorry, I encountered an error connecting to the global mesh. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Uploaded file: ${file.name} (Analyzing...)` },
    ]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const response = await analyzeFile(
          base64,
          file.type,
          `Analyze this file: ${file.name}`,
        );
        setMessages((prev) => [...prev, { role: "ai", content: response }]);
      } catch (err) {
        toast.error("File analysis failed");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[700px]">
      <div className="lg:col-span-3 glass rounded-[48px] border border-nature-100 flex flex-col overflow-hidden bg-white/50">
        <div className="p-6 border-b border-nature-100 bg-white/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-nature-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Nature AI Assistant</h3>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Mesh Intelligence Active
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-nature-100 rounded-xl transition-colors text-nature-400">
            <Settings size={20} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth"
        >
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === "user" ? "ml-auto flex-row-reverse" : "",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                  m.role === "ai"
                    ? "bg-nature-900 text-white"
                    : "bg-emerald-100 text-emerald-700",
                )}
              >
                {m.role === "ai" ? <Sparkles size={18} /> : <User size={18} />}
              </div>
              <div
                className={cn(
                  "p-5 rounded-[28px] text-sm leading-relaxed shadow-sm",
                  m.role === "ai"
                    ? "bg-white border border-nature-100 text-nature-900 rounded-tl-none"
                    : "bg-emerald-600 text-white rounded-tr-none",
                )}
              >
                <Markdown>{m.content}</Markdown>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-4 max-w-[85%]">
              <div className="w-10 h-10 rounded-2xl bg-nature-900 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles size={18} />
              </div>
              <div className="p-5 rounded-[28px] bg-white border border-nature-100 text-nature-400 text-sm rounded-tl-none flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce [animation-delay:0.2s]">.</span>
                <span className="animate-bounce [animation-delay:0.4s]">.</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-nature-100">
          <div className="relative flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.csv,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-12 h-12 bg-nature-50 text-nature-400 rounded-2xl flex items-center justify-center hover:bg-nature-100 transition-all shrink-0"
              title="Upload data or image for analysis"
            >
              <Paperclip size={20} />
            </button>
            <div className="relative flex-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about biodiversity trends, soil health, or restoration strategies..."
                className="w-full pl-6 pr-16 py-5 bg-nature-50 rounded-[28px] border-none focus:ring-2 focus:ring-nature-900 transition-all text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-nature-900 text-white rounded-2xl flex items-center justify-center hover:bg-nature-800 transition-all disabled:opacity-50 shadow-lg"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass p-8 rounded-[40px] border border-nature-100 space-y-6">
          <h4 className="font-bold text-lg">Scenario Simulator</h4>
          <p className="text-nature-500 text-xs">
            Predict ecosystem responses to hypothetical environmental changes.
          </p>
          <div className="space-y-4">
            <textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="e.g. What if urban temperature rises by 2°C?"
              className="w-full p-4 bg-nature-50 rounded-2xl border-none text-xs h-24 resize-none focus:ring-2 focus:ring-nature-900"
            />
            <button
              onClick={handleSimulate}
              disabled={!scenario.trim() || isSimulating}
              className="w-full py-3 bg-nature-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-nature-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSimulating ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              Run Simulation
            </button>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border border-nature-100 space-y-6">
          <h4 className="font-bold text-lg">Suggested Queries</h4>
          <div className="space-y-3">
            {[
              "Analyze current soil moisture trends",
              "Predict biodiversity growth for 2027",
              "Identify local invasive species risks",
              "Generate restoration summary",
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => setInput(q)}
                className="w-full text-left p-4 bg-nature-50 rounded-2xl text-xs font-medium text-nature-600 hover:bg-nature-100 transition-all border border-nature-100/50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="glass p-8 rounded-[40px] bg-nature-900 text-white space-y-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} className="text-emerald-400" />
          </div>
          <h4 className="font-bold text-lg">Mesh Privacy</h4>
          <p className="text-nature-400 text-xs leading-relaxed">
            All AI interactions are processed through our private global mesh,
            ensuring your research data remains proprietary and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

const SystemEvolution = ({
  onNavigate,
}: {
  onNavigate: (tab: any) => void;
}) => {
  const comparisons = [
    {
      feature: "Data Collection",
      legacy: "Manual sampling & periodic reports",
      ion: "Real-time global mesh sensor network",
      icon: Database,
      target: "analytics",
    },
    {
      feature: "Analysis",
      legacy: "Reactive, human-interpreted data",
      ion: "Proactive AI-driven predictive modeling",
      icon: Cpu,
      target: "ailab",
    },
    {
      feature: "Scalability",
      legacy: "Isolated local installations",
      ion: "Infinitely scalable global infrastructure",
      icon: Globe,
      target: "global",
    },
    {
      feature: "Industrial Integration",
      legacy: "Siloed environmental monitoring",
      ion: "Full ESG & ERP industrial stack integration",
      icon: Factory,
      target: "developer",
    },
  ];

  return (
    <div className="glass p-10 rounded-[48px] space-y-10 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
      <div className="relative z-10 text-center space-y-4">
        <h3 className="text-4xl font-bold tracking-tight">System Evolution</h3>
        <p className="text-nature-500 max-w-2xl mx-auto">
          The Internet of Nature represents a paradigm shift from reactive
          monitoring to proactive, AI-integrated ecological management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {comparisons.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onNavigate(item.target)}
            className="p-6 bg-white/40 rounded-3xl border border-nature-100 space-y-4 hover:shadow-xl transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 bg-nature-900 text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <item.icon size={24} />
            </div>
            <h4 className="font-bold text-lg">{item.feature}</h4>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-[10px] font-bold text-red-400 uppercase mb-1">
                  Legacy System
                </p>
                <p className="text-xs text-red-900">{item.legacy}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">
                  Internet of Nature
                </p>
                <p className="text-xs text-emerald-900 font-medium">
                  {item.ion}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const IndustrialAdvancement = ({
  onNavigate,
}: {
  onNavigate: (tab: any) => void;
}) => {
  const features = [
    {
      title: "Edge AI Processing",
      desc: "Real-time analysis at the source, reducing latency to <10ms for critical industrial responses.",
      icon: ZapIcon,
      color: "text-amber-500",
      bg: "bg-amber-50",
      target: "ailab",
    },
    {
      title: "Military-Grade Mesh",
      desc: "Self-healing network architecture ensuring 99.99% uptime in remote or harsh industrial environments.",
      icon: Shield,
      color: "text-blue-500",
      bg: "bg-blue-50",
      target: "global",
    },
    {
      title: "Hyper-Spectral Sensors",
      desc: "Detecting chemical signatures and biological markers invisible to standard environmental tools.",
      icon: Eye,
      color: "text-purple-500",
      bg: "bg-purple-50",
      target: "species",
    },
    {
      title: "ERP Integration",
      desc: "Direct API hooks into SAP, Oracle, and Microsoft Dynamics for automated ESG reporting.",
      icon: Code,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      target: "developer",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div
        onClick={() => onNavigate("developer")}
        className="glass p-10 rounded-[48px] bg-nature-900 text-white flex flex-col justify-between relative overflow-hidden cursor-pointer group"
      >
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent scale-150 group-hover:scale-175 transition-transform duration-1000" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
            <TrendingUp size={16} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Industrial Grade
            </span>
          </div>
          <h3 className="text-5xl font-bold tracking-tighter leading-none">
            Built for the <br />
            Modern Industry
          </h3>
          <p className="text-nature-400 text-lg max-w-md leading-relaxed">
            Our infrastructure is designed to meet the rigorous demands of
            global industrial operations, providing unparalleled precision and
            reliability.
          </p>
        </div>
        <div className="relative z-10 mt-12 grid grid-cols-2 gap-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-4xl font-bold text-white">100%</p>
            <p className="text-[10px] text-nature-400 font-bold uppercase tracking-widest mt-1">
              Data Integrity
            </p>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
            <p className="text-4xl font-bold text-white">0.01%</p>
            <p className="text-[10px] text-nature-400 font-bold uppercase tracking-widest mt-1">
              Sensor Drift
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate(f.target)}
            className="glass p-8 rounded-[40px] space-y-4 border border-nature-100 cursor-pointer hover:shadow-lg transition-all"
          >
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center",
                f.bg,
                f.color,
              )}
            >
              <f.icon size={28} />
            </div>
            <h4 className="text-xl font-bold">{f.title}</h4>
            <p className="text-nature-500 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const GlobalLiveCounter = () => {
  const [stats, setStats] = useState({
    dataPoints: 1240592,
    carbon: 840.2,
    activeSensors: 4205,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        dataPoints: prev.dataPoints + Math.floor(Math.random() * 5),
        carbon: prev.carbon + Math.random() * 0.01,
        activeSensors: prev.activeSensors + (Math.random() > 0.9 ? 1 : 0),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-8 px-6 py-2 bg-nature-100 rounded-full border border-nature-200 shadow-inner">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold text-nature-900 uppercase tracking-widest">
          Live Global Mesh
        </span>
      </div>
      <div className="h-4 w-px bg-nature-300" />
      <div className="flex gap-6">
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-nature-400 uppercase">
            Data Points
          </span>
          <span className="text-xs font-mono font-bold text-nature-900">
            {stats.dataPoints.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-nature-400 uppercase">
            CO2 Offset (t)
          </span>
          <span className="text-xs font-mono font-bold text-nature-900">
            {stats.carbon.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] font-bold text-nature-400 uppercase">
            Active Nodes
          </span>
          <span className="text-xs font-mono font-bold text-nature-900">
            {stats.activeSensors.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const RestorationLeaderboard = () => (
  <div className="glass p-8 rounded-[40px] space-y-6">
    <h3 className="text-xl font-bold">Restoration Leaderboard</h3>
    <div className="space-y-4">
      {[
        { name: "GreenCity Foundation", score: "12,402", trend: "+12%" },
        { name: "Urban Jungle Project", score: "9,840", trend: "+8%" },
        { name: "NatureFirst Alliance", score: "8,210", trend: "+15%" },
        { name: "EcoGuardians", score: "7,500", trend: "+5%" },
      ].map((org, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-nature-100"
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-nature-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-bold">{org.name}</p>
              <p className="text-[10px] text-nature-400 font-bold uppercase tracking-widest">
                {org.score} CONTRIBUTIONS
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600">
            {org.trend}
          </span>
        </div>
      ))}
    </div>
    <button className="w-full py-3 bg-nature-100 text-nature-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-nature-200 transition-all">
      View Full Leaderboard
    </button>
  </div>
);

const CommunityHub = ({
  contributions,
  onContribute,
}: {
  contributions: any[];
  onContribute: (p: any) => void;
}) => {
  const handleQuickAction = (action: string, icon: string) => {
    onContribute({
      user: "Guest Scientist",
      location: "Local Node",
      action,
      icon,
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-[40px] space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Globe size={24} className="text-nature-600" />
                Global Community Feed
              </h3>
              <p className="text-nature-500 text-sm">
                Real-time insights from citizen scientists worldwide
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleQuickAction("Identified local flora", "Leaf")
                }
                className="p-2 bg-nature-100 rounded-xl hover:bg-nature-200 transition-all text-nature-600"
                title="Identify Flora"
              >
                <Leaf size={18} />
              </button>
              <button
                onClick={() =>
                  handleQuickAction("Captured ecosystem audio", "Activity")
                }
                className="p-2 bg-nature-100 rounded-xl hover:bg-nature-200 transition-all text-nature-600"
                title="Record Audio"
              >
                <Activity size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {contributions.map((c) => {
              const Icon = ICON_MAP[c.icon] || Leaf;
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-nature-100 hover:border-nature-300 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-nature-100 rounded-xl flex items-center justify-center text-nature-600 group-hover:bg-nature-900 group-hover:text-white transition-all">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-nature-900">
                        {c.user}{" "}
                        <span className="text-nature-400 font-normal">in</span>{" "}
                        {c.location}
                      </p>
                      <p className="text-xs text-nature-500">{c.action}</p>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-nature-400 uppercase tracking-widest">
                    {c.time}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] bg-nature-900 text-white space-y-6">
          <h3 className="text-xl font-bold">Global Impact</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-nature-400">
                <span>Active Continents</span>
                <span>6 / 7</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[85%]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-bold">12.4k</p>
                <p className="text-[10px] text-nature-400 uppercase font-bold tracking-widest">
                  Contributors
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-bold">840t</p>
                <p className="text-[10px] text-nature-400 uppercase font-bold tracking-widest">
                  CO2 Offset
                </p>
              </div>
            </div>
            <button className="w-full py-4 bg-white text-nature-900 rounded-2xl font-bold text-sm hover:bg-nature-100 transition-all">
              Join the Network
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpeciesIDTool = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        handleAnalyze(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (data: string, type: string) => {
    setIsAnalyzing(true);
    setResult(null);
    const analysis = await identifySpecies(data, type);
    setResult(analysis);
    setIsAnalyzing(false);
  };

  return (
    <div className="glass rounded-[40px] p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Camera size={24} className="text-nature-600" />
            Species Identifier
          </h3>
          <p className="text-nature-500 text-sm">
            Upload a photo to identify urban flora & fauna
          </p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-nature-900 text-white px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-nature-800 transition-all"
        >
          <Upload size={14} />
          Upload Photo
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className={cn(
            "aspect-video rounded-3xl border-2 border-dashed border-nature-200 flex flex-col items-center justify-center relative overflow-hidden bg-nature-100/30",
            image && "border-none",
          )}
        >
          {image ? (
            <img
              src={image}
              alt="Upload"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-center p-8">
              <Camera size={48} className="mx-auto text-nature-300 mb-4" />
              <p className="text-nature-400 text-sm font-medium">
                Drag and drop or click to upload
              </p>
            </div>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="text-nature-600 mb-4"
              >
                <Sparkles size={32} />
              </motion.div>
              <p className="text-nature-900 font-bold animate-pulse">
                Analyzing Species...
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {result ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/50 p-6 rounded-3xl h-full overflow-y-auto max-h-[300px] markdown-body text-sm"
            >
              <Markdown>{result}</Markdown>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40 italic text-nature-500">
              <Info size={32} className="mb-2" />
              <p>Analysis results will appear here after upload</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AcousticMonitor = () => {
  const [isActive, setIsActive] = useState(false);
  const [detections, setDetections] = useState<
    { time: string; species: string; confidence: number }[]
  >([]);

  const toggleMonitor = () => {
    setIsActive(!isActive);
    if (!isActive) {
      // Simulate detections
      const timer = setTimeout(() => {
        setDetections((prev) => [
          {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            species: "American Robin (Turdus migratorius)",
            confidence: 94,
          },
          ...prev,
        ]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Mic2 size={20} className="text-nature-600" />
          Acoustic Monitoring
        </h3>
        <button
          onClick={toggleMonitor}
          className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
            isActive ? "bg-red-100 text-red-600" : "bg-nature-900 text-white",
          )}
        >
          {isActive ? "Stop Listening" : "Start Monitor"}
        </button>
      </div>

      <div className="h-24 bg-nature-950 rounded-2xl flex items-center justify-center gap-1 px-4 overflow-hidden relative">
        {isActive ? (
          Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [10, Math.random() * 60 + 10, 10] }}
              transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
              className="w-1 bg-emerald-500 rounded-full opacity-60"
            />
          ))
        ) : (
          <div className="w-full h-[2px] bg-nature-800" />
        )}
        {!isActive && (
          <span className="absolute text-[10px] uppercase font-bold text-nature-700">
            Sensor Offline
          </span>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold text-nature-500">
          Recent Detections
        </p>
        <div className="flex gap-2 mb-2">
          <button className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-100 transition-all flex items-center justify-center gap-2">
            <Activity size={12} />
            Analyze Frequency
          </button>
          <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-blue-100 transition-all flex items-center justify-center gap-2">
            <Share2 size={12} />
            Export Data
          </button>
        </div>
        {detections.length > 0 ? (
          detections.map((d, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={i}
              className="flex justify-between items-center p-2 bg-white/50 rounded-xl text-[10px]"
            >
              <div className="flex items-center gap-2">
                <Bird size={12} className="text-nature-600" />
                <span className="font-medium">{d.species}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-nature-400">{d.time}</span>
                <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded-md">
                  {d.confidence}%
                </span>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-[10px] text-nature-400 italic">
            No audio detections in current session
          </p>
        )}
      </div>
    </div>
  );
};

const PollinatorActivity = ({ activeTab }: { activeTab: string }) => {
  const data = [
    { hour: "06:00", bees: 10, butterflies: 5 },
    { hour: "09:00", bees: 45, butterflies: 20 },
    { hour: "12:00", bees: 80, butterflies: 35 },
    { hour: "15:00", bees: 65, butterflies: 40 },
    { hour: "18:00", bees: 30, butterflies: 15 },
    { hour: "21:00", bees: 5, butterflies: 2 },
  ];

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Bug size={24} className="text-amber-500" />
            Pollinator Activity
          </h3>
          <p className="text-nature-500 text-sm">
            Real-time detection of bees and butterflies
          </p>
        </div>
      </div>
      <div className="relative h-[250px] w-full overflow-hidden">
        <ResponsiveContainer
          key={activeTab}
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          debounce={50}
        >
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="hour"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Bar dataKey="bees" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="butterflies" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 justify-center">
        <div className="flex items-center gap-2 text-[10px] font-bold text-nature-400">
          <div className="w-2 h-2 rounded-full bg-amber-500" /> BEES
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-nature-400">
          <div className="w-2 h-2 rounded-full bg-blue-500" /> BUTTERFLIES
        </div>
      </div>
    </div>
  );
};

const RestorationGoal = () => (
  <div className="glass p-8 rounded-[40px] space-y-6">
    <div className="flex justify-between items-center">
      <h4 className="font-bold text-lg">Restoration Goal</h4>
      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
        PHASE 2
      </span>
    </div>
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-3xl font-bold">7,420</p>
          <p className="text-[10px] font-bold text-nature-400 uppercase tracking-widest">
            Trees Planted
          </p>
        </div>
        <p className="text-sm font-bold text-nature-500">Goal: 10,000</p>
      </div>
      <div className="h-4 bg-nature-100 rounded-full overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "74.2%" }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="h-full bg-emerald-500 relative"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-shimmer" />
        </motion.div>
      </div>
      <p className="text-[11px] text-nature-500 leading-relaxed">
        We are <span className="font-bold text-emerald-600">74%</span> of the
        way to our 2026 goal. Your contributions help us reach the finish line.
      </p>
    </div>
  </div>
);

const IndustrialESGChart = ({ activeTab }: { activeTab: string }) => {
  const data = [
    { month: "Jan", compliance: 78, impact: 45 },
    { month: "Feb", compliance: 82, impact: 48 },
    { month: "Mar", compliance: 80, impact: 52 },
    { month: "Apr", compliance: 85, impact: 50 },
    { month: "May", compliance: 88, impact: 55 },
    { month: "Jun", compliance: 92, impact: 58 },
  ];

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Factory size={20} className="text-orange-500" />
            Global Industrial ESG Compliance
          </h3>
          <p className="text-nature-500 text-xs uppercase font-bold tracking-widest">
            Aggregate Sector Performance
          </p>
        </div>
      </div>
      <div className="relative h-[250px] w-full overflow-hidden">
        <ResponsiveContainer
          key={activeTab}
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          debounce={50}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "20px",
                border: "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="compliance"
              stroke="#f59e0b"
              fillOpacity={1}
              fill="url(#colorCompliance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CarbonForecast = ({ activeTab }: { activeTab: string }) => {
  const data = [
    { year: "2026", value: 4.2 },
    { year: "2027", value: 4.8 },
    { year: "2028", value: 5.5 },
    { year: "2029", value: 6.3 },
    { year: "2030", value: 7.2 },
    { year: "2031", value: 8.4 },
  ];

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Leaf size={24} className="text-emerald-500" />
            Carbon Sequestration Forecast
          </h3>
          <p className="text-nature-500 text-sm">
            Projected CO2 absorption (tons/year) based on current growth
          </p>
        </div>
      </div>
      <div className="relative h-[250px] w-full overflow-hidden">
        <ResponsiveContainer
          key={activeTab}
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          debounce={50}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorCarbon)"
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const PredictiveAnalytics = ({ activeTab }: { activeTab: string }) => {
  const [showDetails, setShowDetails] = useState(false);

  const insights = [
    {
      title: "Optimized Watering Schedule",
      icon: Droplets,
      color: "text-blue-600",
      bg: "bg-blue-50",
      advice:
        "Based on 48h forecast (28°C avg) and current 42% soil moisture, initiate deep-root irrigation at 04:30 AM for 18 minutes. This minimizes evaporative loss and ensures hydration before peak solar intensity.",
    },
    {
      title: "Pest Risk: Aphid Detection",
      icon: Bug,
      color: "text-amber-600",
      bg: "bg-amber-50",
      advice:
        "Acoustic sensors and visual health markers suggest a 35% increase in Aphid activity in Sector 4. Recommendation: Introduce biological controls (Ladybugs) or apply neem oil solution to affected canopy areas.",
    },
    {
      title: "Nutrient Supplementation",
      icon: Leaf,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      advice:
        "Soil microbiome analysis indicates a slight dip in nitrogen levels. AI suggests a light application of organic compost tea to boost fungal-to-bacterial ratios before the weekend rain.",
    },
  ];

  return (
    <div className="glass rounded-3xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Zap size={20} className="text-amber-500" />
          Predictive Insights
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 bg-amber-50 rounded-xl text-amber-600 hover:bg-amber-100 transition-colors"
        >
          <Info size={18} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-amber-700 uppercase">
              Heat Stress Warning
            </span>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-[8px] font-bold">
              HIGH RISK
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            AI models predict a 45% increase in soil evaporation rates over the
            next 48 hours. Irrigation systems are being pre-emptively adjusted.
          </p>
        </div>

        <div className="relative h-[120px] min-h-[120px] w-full overflow-hidden">
          <ResponsiveContainer
            key={activeTab}
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
            debounce={50}
          >
            <BarChart
              data={PREDICTIVE_DATA}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <Bar dataKey="risk" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "10px",
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] text-nature-400 font-medium uppercase tracking-wider">
          7-Day Ecological Risk Forecast
        </p>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 pt-4 border-t border-nature-200 overflow-hidden"
            >
              <p className="text-[10px] uppercase font-bold text-nature-500 mb-2">
                AI-Driven Action Plan
              </p>
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className={cn("p-3 rounded-2xl space-y-2", insight.bg)}
                >
                  <div className="flex items-center gap-2">
                    <insight.icon size={14} className={insight.color} />
                    <span className={cn("text-xs font-bold", insight.color)}>
                      {insight.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-nature-800 leading-relaxed">
                    {insight.advice}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!showDetails && (
          <button
            onClick={() => setShowDetails(true)}
            className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-nature-500 hover:text-nature-900 transition-colors"
          >
            View Detailed Action Plan
          </button>
        )}
      </div>
    </div>
  );
};

const NatureChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string; timestamp: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTIONS = [
    "How is the soil health?",
    "Identify local birds",
    "Irrigation advice",
    "Biodiversity status",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: messageText, timestamp },
    ]);
    setIsLoading(true);

    let aiResponse = "";
    const aiTimestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { role: "ai", content: "", timestamp: aiTimestamp },
    ]);

    try {
      const stream = askNatureAIStream(messageText);
      for await (const chunk of stream) {
        aiResponse += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: aiResponse,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "System error: Neural mesh connection lost.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl flex flex-col h-[550px] overflow-hidden">
      <div className="p-6 border-b border-nature-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-nature-600 flex items-center justify-center text-white">
            <Leaf size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Nature Intelligence</h3>
            <p className="text-xs text-nature-500">
              Real-time ecological guidance
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="text-nature-400 hover:text-nature-900 transition-colors"
          title="Clear Chat"
        >
          <Zap size={16} />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="p-4 bg-nature-100 rounded-full text-nature-400">
              <MessageSquare size={32} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-nature-600">
                "How can I help you sustain the urban forest today?"
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-white border border-nature-200 rounded-full hover:bg-nature-50 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start",
            )}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-2xl text-sm shadow-sm",
                msg.role === "user"
                  ? "bg-nature-600 text-white rounded-tr-none"
                  : "bg-white border border-nature-100 text-nature-900 rounded-tl-none",
              )}
            >
              <div className="markdown-body prose prose-sm prose-nature">
                <Markdown>{msg.content || "..."}</Markdown>
              </div>
            </motion.div>
            <span className="text-[10px] text-nature-400 mt-1 px-1 font-medium">
              {msg.timestamp}
            </span>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex flex-col items-start gap-2 max-w-[85%]">
            <div className="flex gap-1.5 p-4 bg-white rounded-2xl shadow-sm border border-nature-100 rounded-tl-none">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
            </div>
            <span className="text-[10px] text-nature-400 font-bold uppercase tracking-widest px-1 animate-pulse">
              Analyzing mesh data...
            </span>
          </div>
        )}
      </div>

      <div className="p-4 bg-nature-100/50 border-t border-nature-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about soil health, species, or irrigation..."
            className="flex-1 bg-white rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-nature-500/20 border border-nature-200"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="bg-nature-800 text-white p-2.5 rounded-full hover:bg-nature-900 transition-colors disabled:opacity-50"
          >
            <MessageSquare size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const LiveDataStream = ({ activeTab }: { activeTab: string }) => {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    // Initialize with some data
    const initialData = Array.from({ length: 20 }).map((_, i) => ({
      time: new Date(Date.now() - (20 - i) * 3000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      value: 40 + Math.random() * 10,
    }));
    setData(initialData);

    const interval = setInterval(() => {
      setData((prev) => {
        const newData = [
          ...prev.slice(1),
          {
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            value: 40 + Math.random() * 10,
          },
        ];
        return newData;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass p-8 rounded-[40px] space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Activity size={24} className="text-blue-500 animate-pulse" />
            Live Sensor Stream
          </h3>
          <p className="text-nature-500 text-sm">
            Real-time soil moisture telemetry (3s polling)
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          CONNECTED
        </div>
      </div>

      <div className="relative h-[250px] min-h-[250px] w-full overflow-hidden">
        <ResponsiveContainer
          key={activeTab}
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
          debounce={50}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              interval={4}
            />
            <YAxis
              domain={[30, 60]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorLive)"
              strokeWidth={3}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const MapPreview = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeLayers, setActiveLayers] = useState([
    "sensors",
    "vegetation",
    "satellite",
  ]);

  const NODES = [
    {
      id: "04",
      name: "Sensor Node 04",
      type: "sensor",
      status: "Active",
      pos: { top: "33%", left: "50%" },
      data: { moisture: "42%", temp: "24°C" },
    },
    {
      id: "07",
      name: "Sensor Node 07",
      type: "sensor",
      status: "Warning",
      pos: { bottom: "25%", right: "33%" },
      data: { moisture: "28%", temp: "29°C" },
    },
    {
      id: "01",
      name: "Tree Cluster A",
      type: "vegetation",
      status: "Healthy",
      pos: { top: "20%", left: "20%" },
      data: { health: "92%", species: "Oak" },
    },
  ];

  const toggleLayer = (layer: string) => {
    setActiveLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <MapIcon size={20} className="text-nature-600" />
          Ecosystem Map
        </h3>
        <div className="flex gap-2">
          {["sensors", "vegetation", "heatmap", "satellite"].map((layer) => (
            <button
              key={layer}
              onClick={() => toggleLayer(layer)}
              className={cn(
                "px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wider transition-all",
                activeLayers.includes(layer)
                  ? "bg-nature-900 text-white"
                  : "bg-nature-100 text-nature-400",
              )}
            >
              {layer}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 bg-nature-900 rounded-2xl relative overflow-hidden group border border-nature-800">
        {/* Map Layers */}
        <div
          className={cn(
            "absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center transition-all duration-1000 scale-110 group-hover:scale-100",
            activeLayers.includes("vegetation")
              ? "opacity-40"
              : "opacity-10 grayscale",
          )}
        />

        {activeLayers.includes("satellite") && (
          <img
            src="https://picsum.photos/seed/satellite-city/1200/800"
            alt="Satellite View"
            className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Technical Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Scanning Line Animation */}
        <motion.div
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-emerald-500/30 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />

        {activeLayers.includes("heatmap") && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-transparent to-emerald-500/30 mix-blend-overlay animate-pulse z-0" />
        )}

        {/* Interactive Markers */}
        {activeLayers.includes("sensors") &&
          NODES.filter((n) => n.type === "sensor").map((node) => (
            <motion.div
              key={node.id}
              style={node.pos}
              animate={
                selectedNode?.id === node.id
                  ? { scale: 1.5, opacity: 1 }
                  : node.status === "Active"
                    ? { scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }
                    : { scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }
              }
              transition={{
                repeat: selectedNode?.id === node.id ? 0 : Infinity,
                duration: node.status === "Active" ? 3 : 1,
                ease: "easeInOut",
              }}
              onClick={() => setSelectedNode(node)}
              className={cn(
                "absolute w-4 h-4 rounded-full border-2 border-white shadow-lg cursor-pointer z-20",
                node.status === "Active" ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
          ))}

        {activeLayers.includes("vegetation") &&
          NODES.filter((n) => n.type === "vegetation").map((node) => (
            <motion.div
              key={node.id}
              style={node.pos}
              onClick={() => setSelectedNode(node)}
              className="absolute w-3 h-3 bg-nature-700 rounded-sm rotate-45 border border-white shadow-md cursor-pointer z-20"
            />
          ))}

        {/* Node Detail Popup */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute top-4 left-4 right-4 glass p-4 rounded-2xl z-30 shadow-xl border-nature-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm">{selectedNode.name}</h4>
                  <p className="text-[10px] text-nature-500 uppercase font-bold tracking-widest">
                    {selectedNode.status}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-nature-400 hover:text-nature-900"
                >
                  <Zap size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedNode.data).map(
                  ([key, val]: [any, any]) => (
                    <div key={key} className="bg-nature-50 p-2 rounded-xl">
                      <p className="text-[8px] uppercase font-bold text-nature-400">
                        {key}
                      </p>
                      <p className="text-xs font-bold text-nature-900">{val}</p>
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass p-2 rounded-xl text-[8px] space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">Active Sensor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-medium">Warning Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-nature-700 rounded-sm rotate-45" />
            <span className="font-medium">Tree Cluster</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 glass p-2 rounded-xl text-[8px] font-bold text-nature-500 z-10">
          Live: 2m ago
        </div>
      </div>
    </div>
  );
};

const GlobalNetwork = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 glass p-8 rounded-[40px] space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Factory size={24} className="text-orange-500" />
              Industrial ESG Dashboard
            </h3>
            <p className="text-nature-500 text-sm">
              Real-time environmental impact tracking for industrial zones
            </p>
          </div>
          <div className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">
            3 Active Alerts
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              site: "North Port Industrial",
              metric: "Air Quality",
              value: "84 AQI",
              status: "Warning",
              color: "text-orange-500",
            },
            {
              site: "River Delta Refinery",
              metric: "Water Runoff",
              value: "0.02% Ph",
              status: "Stable",
              color: "text-emerald-500",
            },
            {
              site: "East Side Logistics",
              metric: "Noise Pollution",
              value: "68 dB",
              status: "Stable",
              color: "text-emerald-500",
            },
            {
              site: "Central Power Plant",
              metric: "Thermal Output",
              value: "+2.4°C",
              status: "Critical",
              color: "text-red-500",
            },
          ].map((site, i) => (
            <div
              key={i}
              className="p-6 bg-white/50 rounded-3xl border border-nature-100 space-y-3"
            >
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold text-nature-400 uppercase tracking-widest">
                  {site.site}
                </p>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-nature-100",
                    site.color,
                  )}
                >
                  {site.status}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-lg font-bold">{site.value}</p>
                  <p className="text-[10px] text-nature-500 font-medium">
                    {site.metric}
                  </p>
                </div>
                <Activity size={20} className={site.color} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-8 rounded-[40px] space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Globe size={20} className="text-blue-500" />
          Global Compliance
        </h3>
        <div className="space-y-4">
          {[
            {
              region: "European Union",
              standard: "ESRS E4",
              compliance: "98%",
            },
            {
              region: "North America",
              standard: "SEC Climate",
              compliance: "92%",
            },
            {
              region: "Asia Pacific",
              standard: "ISSB S2",
              compliance: "85%",
            },
          ].map((reg, i) => (
            <div
              key={i}
              className="p-4 bg-nature-900 text-white rounded-2xl space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                  {reg.region}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {reg.compliance}
                </span>
              </div>
              <p className="text-sm font-bold">{reg.standard}</p>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: reg.compliance }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>
        <button className="w-full py-4 bg-nature-100 text-nature-900 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-nature-200 transition-all">
          Download Global Report
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass p-8 rounded-[40px] space-y-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MapIcon size={20} className="text-emerald-500" />
          Global Restoration Network
        </h3>
        <div className="relative h-[300px] bg-nature-50 rounded-3xl overflow-hidden border border-nature-100 group">
          <img
            src="https://picsum.photos/seed/globalrestoration/1200/600"
            className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />

          {/* Active Projects Pulsing Dots */}
          {[
            { top: "40%", left: "30%", name: "Amazon Reforest" },
            { top: "60%", left: "70%", name: "Great Green Wall" },
            { top: "25%", left: "80%", name: "Siberian Taiga" },
            { top: "50%", left: "15%", name: "Pacific Kelp" },
          ].map((project, i) => (
            <div
              key={i}
              className="absolute"
              style={{ top: project.top, left: project.left }}
            >
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="w-4 h-4 bg-emerald-500 rounded-full blur-sm"
              />
              <div className="absolute top-0 left-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg text-[8px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {project.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-8 rounded-[40px]">
        <NetworkTopology />
      </div>
    </div>
  </div>
);

const SmartAlert = ({
  notification,
  onDismiss,
  onViewDetails,
}: {
  notification: any;
  onDismiss: () => void;
  onViewDetails: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -50, scale: 0.9 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] px-6"
  >
    <div className="bg-red-600 text-white p-6 rounded-[32px] shadow-2xl flex items-start gap-4 border-4 border-white">
      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
        <AlertTriangle size={24} />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          Critical Ecosystem Alert
        </p>
        <p className="text-sm font-bold leading-tight">
          {notification.message}
        </p>
        <div className="pt-2 flex gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-1.5 bg-white text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-red-50 transition-all"
          >
            Acknowledge
          </button>
          <button
            onClick={onViewDetails}
            className="px-4 py-1.5 bg-red-700 text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-red-800 transition-all"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

const ESGCompliance = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState("annual");

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert(
        "ESG Compliance Report generated successfully. Ready for download.",
      );
    }, 2000);
  };

  return (
    <div className="space-y-8">
      <div className="glass p-12 rounded-[48px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} />
              Corporate ESG Module
            </div>
            <h2 className="text-5xl font-serif font-bold tracking-tight">
              ESG Compliance Engine
            </h2>
            <p className="text-nature-500 max-w-xl">
              Automated environmental reporting for global corporate standards.
              Generate verified ecological impact statements for your
              stakeholders.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400 mb-1">
                Last Audit
              </p>
              <p className="text-4xl font-bold text-nature-900">
                March 2026{" "}
                <span className="text-emerald-500 text-sm">VERIFIED</span>
              </p>
            </div>
            <button
              disabled={isGenerating}
              onClick={handleGenerate}
              className="bg-nature-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-nature-800 transition-all disabled:opacity-50 flex items-center gap-3 shadow-xl"
            >
              {isGenerating
                ? "Processing Neural Audit..."
                : "Generate Compliance Report"}
              {!isGenerating && <FileCode size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-2xl font-bold">Regulatory Frameworks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "CSRD Compliance",
                  status: "Optimal",
                  score: 98,
                  icon: ShieldCheck,
                },
                {
                  name: "SFDR Article 9",
                  status: "Aligned",
                  score: 94,
                  icon: CheckCircle2,
                },
                {
                  name: "TCFD Reporting",
                  status: "Ready",
                  score: 91,
                  icon: Activity,
                },
                {
                  name: "GRI Standards",
                  status: "Optimal",
                  score: 96,
                  icon: Layers,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-6 bg-nature-50 rounded-3xl border border-nature-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-nature-900 shadow-sm">
                      <f.icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{f.name}</p>
                      <p className="text-[10px] text-nature-400">{f.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">
                      {f.score}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-2xl font-bold">Supply Chain Transparency</h3>
            <div className="space-y-4">
              {[
                {
                  entity: "Tier 1 Suppliers (Global)",
                  impact: "Low",
                  score: 92,
                  trend: "up",
                },
                {
                  entity: "Logistics Network",
                  impact: "Medium",
                  score: 78,
                  trend: "stable",
                },
                {
                  entity: "Raw Material Extraction",
                  impact: "Low",
                  score: 89,
                  trend: "up",
                },
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 hover:bg-nature-50 rounded-2xl transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm font-bold">{s.entity}</p>
                      <p className="text-[10px] text-nature-400">
                        Ecological Impact: {s.impact}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold">
                        ESG Score: {s.score}/100
                      </p>
                    </div>
                    <TrendingUp
                      size={16}
                      className={
                        s.trend === "up"
                          ? "text-emerald-500"
                          : "text-nature-400"
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[40px] bg-nature-900 text-white space-y-6">
            <h3 className="text-xl font-bold">Audit Readiness</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">
                  Data Integrity
                </p>
                <p className="text-2xl font-bold">100% Verified</p>
                <p className="text-[10px] text-white/60 mt-1">
                  All sensor data cryptographically signed.
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">
                  Global Coverage
                </p>
                <p className="text-2xl font-bold">94.2%</p>
                <p className="text-[10px] text-white/60 mt-1">
                  Across all corporate operational zones.
                </p>
              </div>
            </div>
            <button className="w-full py-4 bg-white text-nature-900 rounded-2xl font-bold text-sm hover:bg-nature-100 transition-all">
              Schedule External Audit
            </button>
          </div>

          <div className="glass p-8 rounded-[40px] space-y-4">
            <h4 className="font-bold">Recent Reports</h4>
            <div className="space-y-3">
              {[
                "Q4 2025 Sustainability.pdf",
                "FY2025 Ecological Audit.json",
                "Supply Chain Impact.csv",
              ].map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-nature-50 rounded-xl"
                >
                  <span className="text-xs font-medium truncate max-w-[150px]">
                    {r}
                  </span>
                  <Download
                    size={14}
                    className="text-nature-400 cursor-pointer hover:text-nature-900"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CarbonExchange = () => {
  const [amount, setAmount] = useState(10);

  return (
    <div className="space-y-8">
      <div className="glass p-12 rounded-[48px] bg-emerald-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 text-emerald-300 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
              <ArrowRightLeft size={12} />
              Verified Ecological Offsets
            </div>
            <h2 className="text-5xl font-serif font-bold tracking-tight">
              Carbon & Biodiversity Exchange
            </h2>
            <p className="text-emerald-100/70 max-w-xl">
              Trade verified carbon credits and biodiversity offsets generated
              by the global sensor mesh. Direct investment into ecological
              restoration.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 text-center min-w-[240px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 mb-2">
              Market Price (per ton)
            </p>
            <p className="text-5xl font-bold">$42.80</p>
            <p className="text-xs text-emerald-400 font-bold mt-2 flex items-center justify-center gap-1">
              <TrendingUp size={14} />
              +12.4% this month
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[40px] space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold">Active Projects</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-nature-100 rounded-full text-[10px] font-bold">
                  ALL
                </button>
                <button className="px-3 py-1 hover:bg-nature-100 rounded-full text-[10px] font-bold text-nature-400">
                  FOREST
                </button>
                <button className="px-3 py-1 hover:bg-nature-100 rounded-full text-[10px] font-bold text-nature-400">
                  OCEAN
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {[
                {
                  name: "Amazon Reforestation Node 4",
                  location: "Brazil",
                  type: "Carbon",
                  yield: "1,200 Tons/mo",
                  price: "$38.50",
                  progress: 85,
                },
                {
                  name: "Kyoto Urban Canopy Expansion",
                  location: "Japan",
                  type: "Biodiversity",
                  yield: "450 Units/mo",
                  price: "$52.00",
                  progress: 62,
                },
                {
                  name: "Nairobi Green Belt Sensors",
                  location: "Kenya",
                  type: "Carbon",
                  yield: "800 Tons/mo",
                  price: "$41.20",
                  progress: 94,
                },
              ].map((p, i) => (
                <div
                  key={i}
                  className="p-6 bg-nature-50 rounded-[32px] border border-nature-100 hover:shadow-lg transition-all group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                        <TreePine size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{p.name}</h4>
                        <p className="text-xs text-nature-500">
                          {p.location} • {p.type} Offset
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                          Yield
                        </p>
                        <p className="text-sm font-bold">{p.yield}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                          Price
                        </p>
                        <p className="text-sm font-bold text-emerald-600">
                          {p.price}
                        </p>
                      </div>
                      <button className="px-6 py-2 bg-nature-900 text-white rounded-xl text-xs font-bold hover:bg-nature-800 transition-all">
                        Buy Credits
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-nature-400 uppercase tracking-widest">
                      <span>Project Completion</span>
                      <span>{p.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-1000"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-xl font-bold">Quick Purchase</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400 mb-2 block">
                  Amount (Tons of CO2)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-4 bg-nature-50 border-none rounded-2xl text-lg font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <div className="p-4 bg-nature-50 rounded-2xl border border-nature-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-nature-500">Subtotal</span>
                  <span className="font-bold">
                    ${(amount * 42.8).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-nature-500">Mesh Fee (2%)</span>
                  <span className="font-bold">
                    ${(amount * 42.8 * 0.02).toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-nature-200 pt-2 flex justify-between text-sm">
                  <span className="font-bold">Total Cost</span>
                  <span className="font-bold text-emerald-600">
                    ${(amount * 42.8 * 1.02).toFixed(2)}
                  </span>
                </div>
              </div>
              <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                Execute Trade
              </button>
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <Activity size={18} className="text-blue-500" />
              Market Sentiment
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-nature-500">Demand</span>
                <span className="text-xs font-bold text-emerald-600">High</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-nature-500">Supply</span>
                <span className="text-xs font-bold text-amber-600">Tight</span>
              </div>
              <p className="text-[10px] text-nature-400 leading-relaxed italic">
                * Market prices are dynamically adjusted based on real-time
                ecological health data from the global mesh.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const IndustrialPortal = ({
  currentPlan,
  activeTab,
  onTabChange,
}: {
  currentPlan: SubscriptionPlan;
  activeTab: "esg" | "exchange" | "supply";
  onTabChange: (tab: "esg" | "exchange" | "supply") => void;
}) => {
  return (
    <div className="space-y-8">
      <div className="flex bg-nature-100 p-1 rounded-2xl w-fit">
        {[
          { id: "esg", label: "ESG Compliance", icon: ShieldCheck },
          { id: "exchange", label: "Carbon Exchange", icon: ArrowRightLeft },
          { id: "supply", label: "Supply Chain", icon: Workflow },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-white text-nature-900 shadow-sm"
                : "text-nature-500 hover:text-nature-700",
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "esg" && (
          <motion.div
            key="esg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ESGCompliance />
          </motion.div>
        )}
        {activeTab === "exchange" && (
          <motion.div
            key="exchange"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CarbonExchange />
          </motion.div>
        )}
        {activeTab === "supply" && (
          <motion.div
            key="supply"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SupplyChain />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SupplyChain = () => (
  <div className="space-y-8">
    <div className="glass p-12 rounded-[48px] relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <Workflow size={12} />
            Supply Chain Transparency
          </div>
          <h2 className="text-5xl font-serif font-bold tracking-tight">
            Ecological Provenance
          </h2>
          <p className="text-nature-500 max-w-xl">
            Track the environmental footprint of your raw materials from
            extraction to delivery. Real-time verification via the global sensor
            mesh.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-nature-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400 mb-1">
              Traceability
            </p>
            <p className="text-3xl font-bold text-nature-900">99.2%</p>
          </div>
          <div className="text-center p-6 bg-white rounded-3xl shadow-sm border border-nature-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400 mb-1">
              Impact Score
            </p>
            <p className="text-3xl font-bold text-emerald-600">A+</p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass p-8 rounded-[40px] space-y-6">
        <h3 className="text-2xl font-bold">Material Flow Analysis</h3>
        <div className="space-y-6">
          {[
            {
              material: "Sustainable Timber",
              origin: "Scandinavia",
              impact: -12.4,
              status: "Verified",
            },
            {
              material: "Recycled Aluminum",
              origin: "Germany",
              impact: -45.2,
              status: "Auditing",
            },
            {
              material: "Bio-Polymer",
              origin: "Brazil",
              impact: -8.7,
              status: "Verified",
            },
          ].map((m, i) => (
            <div
              key={i}
              className="p-6 bg-nature-50 rounded-3xl border border-nature-100 space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-nature-900 shadow-sm">
                    <Box size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{m.material}</p>
                    <p className="text-[10px] text-nature-400">{m.origin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      m.impact < 0 ? "text-emerald-600" : "text-red-600",
                    )}
                  >
                    {m.impact}% CO2e
                  </p>
                  <p className="text-[10px] font-bold uppercase text-nature-400">
                    {m.status}
                  </p>
                </div>
              </div>
              <div className="w-full h-1 bg-nature-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[85%]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-8 rounded-[40px] space-y-6">
        <h3 className="text-2xl font-bold">Global Logistics Impact</h3>
        <div className="relative h-[400px] bg-nature-900 rounded-3xl overflow-hidden">
          <img
            src="https://picsum.photos/seed/logistics/800/600"
            className="w-full h-full object-cover opacity-30 grayscale"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Globe size={48} className="text-white/20 mx-auto" />
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                Real-time Logistics Mesh
              </p>
            </div>
          </div>
          {/* Simulated logistics nodes */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping" />
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  </div>
);

const SystemPortal = ({
  activeTab,
  onTabChange,
  currentPlan,
  onPlanChange,
}: {
  activeTab: "pricing" | "billing" | "growth" | "updates";
  onTabChange: (tab: "pricing" | "billing" | "growth" | "updates") => void;
  currentPlan: SubscriptionPlan;
  onPlanChange: (plan: SubscriptionPlan) => void;
}) => {
  return (
    <div className="space-y-8">
      <div className="flex bg-nature-100 p-1 rounded-2xl w-fit">
        {[
          { id: "pricing", label: "Plans", icon: DollarSign },
          { id: "billing", label: "Billing", icon: CreditCard },
          { id: "growth", label: "Growth", icon: Rocket },
          { id: "updates", label: "Updates", icon: RefreshCw },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-white text-nature-900 shadow-sm"
                : "text-nature-500 hover:text-nature-700",
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "pricing" && (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PricingPlans
              currentPlan={currentPlan}
              onPlanChange={onPlanChange}
            />
          </motion.div>
        )}
        {activeTab === "billing" && (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="space-y-8">
              <BillingDashboard />
              <PaymentSettings currentPlan={currentPlan} />
            </div>
          </motion.div>
        )}
        {activeTab === "growth" && (
          <motion.div
            key="growth"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Paywall
              currentPlan={currentPlan}
              onUpgrade={() => onTabChange("pricing")}
            >
              <GlobalGrowthDashboard />
            </Paywall>
          </motion.div>
        )}
        {activeTab === "updates" && (
          <motion.div
            key="updates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SystemUpdateCenter />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AILab = () => {
  const [activeLabTab, setActiveLabTab] = useState<
    "simulator" | "editor" | "library" | "debugger"
  >("simulator");
  const [scenario, setScenario] = useState("");
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Code Editor State
  const [code, setCode] = useState(`// Internet of Nature - Custom Logic
// Example: Calculate Biodiversity Trend
const biodiversityTrend = (data) => {
  const values = data.map(d => d.biodiversity);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return avg > 7.5 ? "Positive" : "Stable";
};

console.log("Trend:", biodiversityTrend(MOCK_HISTORY));`);
  const [codeOutput, setCodeOutput] = useState<string>("");
  const [isRunningCode, setIsRunningCode] = useState(false);

  // Debugger State
  const [debugCode, setDebugCode] = useState("");
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);

  const SCENARIOS = [
    "Heatwave: +5°C for 3 days",
    "Extreme Rainfall: 100mm in 6h",
    "Invasive Species: Spotted Lanternfly",
    "Urban Development: New concrete path",
  ];

  const CODE_LIBRARY = [
    {
      title: "Soil Moisture Alert",
      description:
        "Triggers an alert when soil moisture drops below threshold.",
      code: `if (sensorData.moisture < 30) {\n  triggerAlert("Critical Soil Moisture", "Watering system activated.");\n}`,
    },
    {
      title: "Biodiversity Index Calculator",
      description: "Calculates the Shannon Diversity Index for a given area.",
      code: `const calculateShannon = (speciesCounts) => {\n  const total = speciesCounts.reduce((a, b) => a + b, 0);\n  return -speciesCounts.reduce((sum, count) => {\n    const p = count / total;\n    return sum + (p * Math.log(p));\n  }, 0);\n};`,
    },
    {
      title: "IoT Node Heartbeat",
      description: "Checks if a sensor node is still online.",
      code: `const checkStatus = (lastSeen) => {\n  const now = Date.now();\n  const diff = now - lastSeen;\n  return diff < 60000 ? "Online" : "Offline";\n};`,
    },
  ];

  const handleSimulate = async (text?: string) => {
    const scenarioText = text || scenario;
    if (!scenarioText.trim()) return;
    setIsSimulating(true);
    setSimulationResult(null);
    const result = await simulateEcosystemResponse(scenarioText, {
      moisture: 42,
      temp: 24.5,
      biodiversity: 7.8,
    });
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReport(null);
    const result = await generateEcologicalReport({
      sensors: MOCK_SENSORS,
      history: MOCK_HISTORY,
      predictive: PREDICTIVE_DATA,
    });
    setReport(result);
    setIsGeneratingReport(false);
  };

  const handleRunCode = async () => {
    setIsRunningCode(true);
    setCodeOutput("");

    // Simulate code execution with AI for safety and "power"
    try {
      const ai = new GoogleGenerativeAI(
        import.meta.env.VITE_GEMINI_API_KEY || "",
      );
      const model = ai.getGenerativeModel({ model: "gemini-pro" });
      const response = await model.generateContent(
        `Execute or simulate the following code in the context of the Internet of Nature system. Provide the expected console output and any ecological insights derived from the logic. Code: ${code}`,
      );
      const result = await response.response;
      setCodeOutput(result.text() || "Code executed with no output.");
    } catch (e) {
      setCodeOutput("Execution Error: Nature AI could not process the logic.");
    } finally {
      setIsRunningCode(false);
    }
  };

  const handleDebug = async () => {
    if (!debugCode.trim()) return;
    setIsDebugging(true);
    setDebugResult(null);
    try {
      const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: "gemini-pro" });
      const response =
        await model.generateContent(`Fix the errors in this code and explain the changes. This code might be related to the Internet of Nature or any other project.
        Code:
        ${debugCode}`);
      const result = await response.response;
      setDebugResult(result.text() || "No errors found or could not fix.");
    } catch (e) {
      setDebugResult("Debugging failed. The AI core is busy.");
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Lab Navigation */}
      <div className="flex gap-4 bg-nature-100 p-2 rounded-3xl w-fit">
        {[
          { id: "simulator", label: "Simulator", icon: Zap },
          { id: "editor", label: "Code Editor", icon: Terminal },
          { id: "library", label: "Code Library", icon: Book },
          { id: "debugger", label: "AI Debugger", icon: ShieldAlert },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLabTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all",
              activeLabTab === tab.id
                ? "bg-nature-900 text-white shadow-lg"
                : "text-nature-500 hover:bg-nature-200",
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeLabTab === "simulator" && (
          <motion.div
            key="simulator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Simulator */}
            <div className="glass p-8 rounded-[40px] space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles size={24} className="text-nature-600" />
                    Ecosystem Simulator
                  </h3>
                  <p className="text-nature-500 text-sm">
                    Predict impacts of environmental shifts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {SCENARIOS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSimulate(s)}
                      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-nature-100 rounded-full hover:bg-nature-200 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Enter custom scenario..."
                    className="flex-1 bg-white rounded-full px-5 py-2.5 text-sm focus:outline-none border border-nature-200"
                  />
                  <button
                    onClick={() => handleSimulate()}
                    disabled={isSimulating}
                    className="bg-nature-900 text-white px-6 py-2.5 rounded-full text-sm font-bold disabled:opacity-50"
                  >
                    Simulate
                  </button>
                </div>
              </div>

              <div className="min-h-[300px] bg-nature-50/50 rounded-3xl p-6 relative overflow-hidden">
                {isSimulating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="w-16 h-16 bg-nature-900 rounded-2xl flex items-center justify-center text-white"
                    >
                      <RefreshCw className="animate-spin" size={32} />
                    </motion.div>
                    <p className="mt-4 text-sm font-bold text-nature-900 uppercase tracking-widest">
                      Running Simulation...
                    </p>
                  </div>
                ) : simulationResult ? (
                  <div className="prose prose-nature max-w-none">
                    <Markdown>{simulationResult}</Markdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <Zap size={48} />
                    <p className="text-sm font-medium">
                      Select a scenario to begin simulation
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <AIInsights data={MOCK_SENSORS} />
              <div className="glass p-8 rounded-[40px] bg-emerald-900 text-white space-y-6">
                <div className="flex items-center gap-3">
                  <FileCode className="text-emerald-400" size={32} />
                  <h4 className="text-xl font-bold">Ecological Report</h4>
                </div>
                <p className="text-sm text-emerald-100/80">
                  Generate a comprehensive audit of the current ecosystem state
                  using Nature AI.
                </p>
                <button
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="w-full py-4 bg-white text-emerald-900 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                >
                  {isGeneratingReport ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <Sparkles size={20} />
                  )}
                  {isGeneratingReport
                    ? "Generating..."
                    : "Generate Full Report"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeLabTab === "editor" && (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass p-8 rounded-[40px] space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Terminal size={24} className="text-nature-600" />
                    Nature Code Editor
                  </h3>
                  <p className="text-nature-500 text-sm">
                    Build custom logic for your ecosystem
                  </p>
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="px-6 py-2.5 bg-nature-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-nature-800 transition-all"
                >
                  {isRunningCode ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Zap size={18} />
                  )}
                  Run Code
                </button>
              </div>

              <div className="relative group">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[400px] bg-nature-900 text-emerald-400 p-6 rounded-3xl font-mono text-sm border-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  spellCheck={false}
                />
                <div className="absolute top-4 right-4 text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest">
                  JavaScript
                </div>
              </div>
            </div>

            <div className="glass p-8 rounded-[40px] space-y-6 flex flex-col">
              <div className="flex items-center gap-2">
                <Activity size={20} className="text-nature-600" />
                <h4 className="font-bold">Execution Output</h4>
              </div>
              <div className="flex-1 bg-nature-50 rounded-3xl p-6 overflow-y-auto font-mono text-sm text-nature-900">
                {isRunningCode ? (
                  <div className="flex items-center gap-2 text-nature-400">
                    <RefreshCw className="animate-spin" size={14} />
                    <span>AI is simulating execution...</span>
                  </div>
                ) : codeOutput ? (
                  <Markdown>{codeOutput}</Markdown>
                ) : (
                  <span className="text-nature-300">
                    Run code to see output here.
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeLabTab === "library" && (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {CODE_LIBRARY.map((snippet, i) => (
              <div
                key={i}
                className="glass p-8 rounded-[40px] space-y-6 flex flex-col"
              >
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">{snippet.title}</h4>
                  <p className="text-sm text-nature-500">
                    {snippet.description}
                  </p>
                </div>
                <div className="flex-1 bg-nature-900 rounded-2xl p-4 font-mono text-[10px] text-emerald-400 overflow-x-auto">
                  <pre>{snippet.code}</pre>
                </div>
                <button
                  onClick={() => {
                    setCode(snippet.code);
                    setActiveLabTab("editor");
                    toast.success("Snippet loaded into editor");
                  }}
                  className="w-full py-3 bg-nature-100 text-nature-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-200 transition-all"
                >
                  Load Snippet
                </button>
              </div>
            ))}
            <div className="glass p-8 rounded-[40px] border-2 border-dashed border-nature-200 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 bg-nature-50 rounded-full flex items-center justify-center text-nature-300">
                <Box size={24} />
              </div>
              <p className="text-sm font-bold text-nature-400 uppercase tracking-widest">
                More Snippets Coming Soon
              </p>
            </div>
          </motion.div>
        )}

        {activeLabTab === "debugger" && (
          <motion.div
            key="debugger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            <div className="glass p-8 rounded-[40px] space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldAlert size={24} className="text-nature-600" />
                    AI Debugger
                  </h3>
                  <p className="text-nature-500 text-sm">
                    Fix errors in any project code
                  </p>
                </div>
                <button
                  onClick={handleDebug}
                  disabled={isDebugging}
                  className="px-6 py-2.5 bg-nature-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-nature-800 transition-all"
                >
                  {isDebugging ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <Workflow size={18} />
                  )}
                  Fix Code
                </button>
              </div>

              <textarea
                value={debugCode}
                onChange={(e) => setDebugCode(e.target.value)}
                placeholder="Paste your buggy code here..."
                className="w-full h-[400px] bg-nature-50 text-nature-900 p-6 rounded-3xl font-mono text-sm border border-nature-200 focus:ring-2 focus:ring-nature-900 transition-all resize-none"
                spellCheck={false}
              />
            </div>

            <div className="glass p-8 rounded-[40px] space-y-6 flex flex-col">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-600" />
                <h4 className="font-bold">Debugger Analysis</h4>
              </div>
              <div className="flex-1 bg-white border border-nature-100 rounded-3xl p-6 overflow-y-auto">
                {isDebugging ? (
                  <div className="flex items-center gap-2 text-nature-400">
                    <RefreshCw className="animate-spin" size={14} />
                    <span>AI is analyzing and fixing...</span>
                  </div>
                ) : debugResult ? (
                  <div className="prose prose-nature max-w-none">
                    <Markdown>{debugResult}</Markdown>
                    <button
                      onClick={() => {
                        // Extract code from markdown if possible, or just copy all
                        const codeMatch = debugResult.match(
                          /```(?:javascript|js)?\n([\s\S]*?)```/,
                        );
                        const codeToCopy = codeMatch
                          ? codeMatch[1]
                          : debugResult;
                        setCode(codeToCopy);
                        setActiveLabTab("editor");
                        toast.success("Fixed code sent to editor");
                      }}
                      className="mt-6 px-6 py-3 bg-nature-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                    >
                      Use Fixed Code
                    </button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <ShieldCheck size={48} />
                    <p className="text-sm font-medium">
                      Paste code to start debugging
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Main App ---

const AIAgentChat = ({
  activeUsers,
  natureScore,
  activeAlert,
}: {
  activeUsers: number;
  natureScore: number;
  activeAlert: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string; timestamp: string }[]
  >([
    {
      role: "ai",
      content:
        "Hello! I am the Nature AI Agent. How can I help you understand the urban ecosystem today?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, timestamp },
    ]);
    setIsLoading(true);

    try {
      // Enhance context with mesh data
      const context = `Current Mesh Status: ${activeUsers} scientists online, Nature Score: ${natureScore}%. Active alerts: ${activeAlert?.message || "None"}.`;
      const response = await askNatureAI(userMsg, context);
      const aiTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: response || "I am sorry, I am having trouble connecting.",
          timestamp: aiTimestamp,
        },
      ]);
    } catch (error) {
      console.error("AI Agent Error:", error);
      const errorTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "System error: Connection to neural mesh interrupted.",
          timestamp: errorTimestamp,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-nature-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group"
      >
        <MessageSquare
          size={28}
          className={cn("transition-all", isOpen && "rotate-90 scale-0")}
        />
        <Sparkles
          size={28}
          className={cn(
            "absolute transition-all scale-0",
            isOpen && "rotate-0 scale-100",
          )}
        />
        <span className="absolute right-full mr-4 px-3 py-1 bg-nature-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none">
          Ask Nature AI
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-28 right-8 w-96 h-[500px] bg-white rounded-[32px] shadow-2xl border border-nature-100 flex flex-col overflow-hidden z-50"
          >
            <div className="p-6 bg-nature-900 text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold">Nature AI Agent</h4>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                  Online & Monitoring
                </p>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-nature-50/30 scroll-smooth"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    m.role === "user"
                      ? "ml-auto items-end"
                      : "mr-auto items-start",
                  )}
                >
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-nature-900 text-white rounded-tr-none"
                        : "bg-white text-nature-900 shadow-sm border border-nature-100 rounded-tl-none",
                    )}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-nature-400 mt-1 px-1 font-medium">
                    {m.timestamp}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex flex-col items-start gap-2 max-w-[85%]">
                  <div className="flex gap-1.5 p-4 bg-white rounded-2xl shadow-sm border border-nature-100 rounded-tl-none">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: 0.2,
                      }}
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        delay: 0.4,
                      }}
                      className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] text-nature-400 font-bold uppercase tracking-widest px-1 animate-pulse">
                    Agent is thinking...
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-nature-50 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about the ecosystem..."
                className="flex-1 bg-nature-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-nature-900"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="w-12 h-12 bg-nature-900 text-white rounded-2xl flex items-center justify-center hover:bg-nature-800 transition-all disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Competitive Advantages Section - Why We're the Best
const CompetitiveAdvantagesSection = ({
  onNavigate,
}: {
  onNavigate: (tab: string, systemTab?: string) => void;
}) => (
  <section className="py-32 bg-gradient-to-br from-emerald-900 via-green-800 to-nature-900 rounded-[80px] my-24 px-12 shadow-2xl relative overflow-hidden">
    {/* Animated background elements */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
    </div>

    <div className="max-w-7xl mx-auto space-y-20 relative z-10">
      {/* Header */}
      <div className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-bold uppercase tracking-widest shadow-2xl border border-white/20"
        >
          <Zap size={20} className="text-yellow-300" />
          Why We're #1 Globally
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-white"
        >
          The World's Most Powerful
          <br />
          <span className="bg-gradient-to-r from-yellow-300 via-emerald-300 to-green-300 bg-clip-text text-transparent">
            Ecosystem Intelligence Platform
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/90 text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed font-medium"
        >
          While others monitor, we predict. While others report, we prevent.
          Discover why 50,000+ organizations worldwide trust our platform over
          any competitor.
        </motion.p>
      </div>

      {/* Key Differentiators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            icon: Zap,
            title: "10x Faster Detection",
            stat: "Real-time vs 24-hour delay",
            description:
              "Our AI detects environmental threats in milliseconds, not days. Competitors rely on manual reporting—we use 10,000+ IoT sensors with instant alerts.",
            color: "from-yellow-400 to-orange-500",
          },
          {
            icon: Brain,
            title: "99.7% AI Accuracy",
            stat: "Industry average: 78%",
            description:
              "Genie AI uses advanced machine learning trained on 50M+ data points. Our species identification and threat prediction outperforms all competitors by 21%.",
            color: "from-purple-400 to-pink-500",
          },
          {
            icon: GlobeIcon,
            title: "50+ Countries Coverage",
            stat: "Competitors: 5-10 countries",
            description:
              "The only truly global ecosystem monitoring network. From Amazon rainforests to Arctic tundra, we monitor biodiversity everywhere.",
            color: "from-blue-400 to-cyan-500",
          },
          {
            icon: DollarSign,
            title: "70% Cost Reduction",
            stat: "vs traditional monitoring",
            description:
              "Automated IoT sensors replace expensive field teams. Industries save millions while getting better data. ROI achieved in 3-6 months.",
            color: "from-green-400 to-emerald-500",
          },
          {
            icon: Shield,
            title: "Zero Data Loss",
            stat: "99.99% uptime guarantee",
            description:
              "Military-grade encryption, blockchain verification, and redundant cloud storage. Your environmental data is safer than Fort Knox.",
            color: "from-red-400 to-rose-500",
          },
          {
            icon: Rocket,
            title: "Predictive Analytics",
            stat: "Prevent disasters before they happen",
            description:
              "We don't just report problems—we predict them 30-90 days in advance. Our AI forecasts ecosystem collapse, species migration, and pollution events.",
            color: "from-indigo-400 to-purple-500",
          },
          {
            icon: Users,
            title: "50,000+ Active Users",
            stat: "Growing 300% annually",
            description:
              "Join the world's largest community of scientists, conservationists, and industries collaborating to protect nature. Network effects make us stronger daily.",
            color: "from-pink-400 to-rose-500",
          },
          {
            icon: Award,
            title: "UN & WHO Certified",
            stat: "Only platform with dual certification",
            description:
              "Officially recognized by United Nations and World Health Organization. Our data is used in global climate reports and policy decisions.",
            color: "from-amber-400 to-yellow-500",
          },
          {
            icon: TrendingUp,
            title: "Industrial ESG Integration",
            stat: "SAP, Oracle, Salesforce compatible",
            description:
              "Seamlessly connects with enterprise ERP systems. Automate ESG reporting, carbon tracking, and sustainability compliance in one click.",
            color: "from-teal-400 to-green-500",
          },
        ].map((advantage, i) => {
          // Define navigation targets for each card
          const navigationMap: Record<string, () => void> = {
            "70% Cost Reduction": () => {
              onNavigate("system", "pricing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            "Zero Data Loss": () => {
              onNavigate("analytics");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            "Predictive Analytics": () => {
              onNavigate("analytics");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            "50,000+ Active Users": () => {
              onNavigate("community");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            "UN & WHO Certified": () => {
              onNavigate("docs");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            "Industrial ESG Integration": () => {
              onNavigate("industrial");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            "99.7% AI Accuracy": () => {
              onNavigate("ailab");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
            "50+ Countries Coverage": () => {
              onNavigate("global");
              window.scrollTo({ top: 0, behavior: "smooth" });
            },
          };

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, y: -10 }}
              onClick={navigationMap[advantage.title]}
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 hover:border-white/40 transition-all hover:shadow-2xl hover:shadow-white/20 group cursor-pointer"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${advantage.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}
              >
                <advantage.icon size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {advantage.title}
              </h3>
              <div className="inline-block px-4 py-2 bg-emerald-400/20 text-emerald-300 rounded-full text-xs font-bold mb-4">
                {advantage.stat}
              </div>
              <p className="text-white/80 leading-relaxed">
                {advantage.description}
              </p>
              <div className="mt-4 text-emerald-300 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                Click to explore →
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl p-12 border border-white/20"
      >
        <h3 className="text-4xl font-bold text-white mb-8 text-center">
          How We Compare to Competitors
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="pb-4 text-white/60 font-bold uppercase tracking-wider text-sm">
                  Feature
                </th>
                <th className="pb-4 text-emerald-300 font-bold uppercase tracking-wider text-sm text-center">
                  Internet of Nature
                </th>
                <th className="pb-4 text-white/60 font-bold uppercase tracking-wider text-sm text-center">
                  Competitor A
                </th>
                <th className="pb-4 text-white/60 font-bold uppercase tracking-wider text-sm text-center">
                  Competitor B
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {[
                {
                  feature: "Real-time Monitoring",
                  us: "✓ Instant",
                  a: "24hr delay",
                  b: "Manual only",
                },
                { feature: "AI Accuracy", us: "✓ 99.7%", a: "78%", b: "65%" },
                {
                  feature: "Global Coverage",
                  us: "✓ 50+ countries",
                  a: "10 countries",
                  b: "5 countries",
                },
                {
                  feature: "IoT Sensors",
                  us: "✓ 10,000+",
                  a: "500",
                  b: "100",
                },
                {
                  feature: "Predictive Analytics",
                  us: "✓ 30-90 days",
                  a: "✗ None",
                  b: "✗ None",
                },
                {
                  feature: "ERP Integration",
                  us: "✓ All major",
                  a: "Limited",
                  b: "✗ None",
                },
                {
                  feature: "Mobile App",
                  us: "✓ iOS & Android",
                  a: "iOS only",
                  b: "✗ None",
                },
                {
                  feature: "API Access",
                  us: "✓ Full REST API",
                  a: "Limited",
                  b: "✗ None",
                },
                {
                  feature: "Price",
                  us: "✓ $2/month",
                  a: "$50/month",
                  b: "$100/month",
                },
                {
                  feature: "Support",
                  us: "✓ 24/7 Live",
                  a: "Email only",
                  b: "Business hours",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 font-medium">{row.feature}</td>
                  <td className="py-4 text-center text-emerald-300 font-bold">
                    {row.us}
                  </td>
                  <td className="py-4 text-center text-white/60">{row.a}</td>
                  <td className="py-4 text-center text-white/60">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Social Proof Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { number: "50,000+", label: "Active Users Worldwide", icon: Users },
          {
            number: "10,000+",
            label: "IoT Sensors Deployed",
            icon: Activity,
          },
          { number: "50+", label: "Countries Covered", icon: GlobeIcon },
          { number: "99.7%", label: "AI Accuracy Rate", icon: Target },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.1 }}
            className="text-center space-y-3 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
          >
            <stat.icon size={40} className="text-emerald-300 mx-auto" />
            <div className="text-5xl font-bold text-white">{stat.number}</div>
            <div className="text-white/80 text-sm font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 pt-12"
      >
        <h3 className="text-4xl font-bold text-white">
          Join the Global Movement
        </h3>
        <p className="text-white/80 text-xl max-w-3xl mx-auto">
          Don't settle for outdated monitoring systems. Get the platform that
          governments, Fortune 500 companies, and leading scientists trust to
          protect our planet.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => {
              onNavigate("system", "pricing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-12 py-5 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-2xl font-bold text-lg hover:from-emerald-500 hover:to-green-600 transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 flex items-center gap-3"
          >
            <Rocket size={24} />
            Start Free Trial
          </button>
          <button
            onClick={() => {
              // Open a demo video or navigate to demo section
              window.open(
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                "_blank",
              );
            }}
            className="px-12 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30 hover:border-white/50 flex items-center gap-3"
          >
            <PlayCircle size={24} />
            Watch Demo
          </button>
        </div>
        <p className="text-white/60 text-sm">
          ✓ No credit card required ✓ 14-day free trial ✓ Cancel anytime
        </p>
      </motion.div>
    </div>
  </section>
);

const RecognitionSection = () => (
  <section className="py-32 bg-gradient-to-br from-nature-50 via-emerald-50/30 to-nature-50 rounded-[80px] my-24 px-12 shadow-2xl border border-nature-100/50 relative overflow-hidden">
    {/* Decorative background elements */}
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
    </div>

    <div className="max-w-7xl mx-auto space-y-20 relative z-10">
      <div className="text-left space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg"
        >
          <CheckCircle2 size={18} />
          Global Recognition
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-7xl md:text-8xl lg:text-9xl font-serif font-bold tracking-tight bg-gradient-to-r from-nature-900 via-emerald-700 to-nature-900 bg-clip-text text-transparent"
        >
          Trusted by Global Leaders
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-nature-600 text-xl md:text-2xl max-w-4xl leading-relaxed font-medium"
        >
          Our mesh intelligence protocol is recognized by the world's leading
          environmental and industrial organizations.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-16 items-center py-12"
      >
        {[
          {
            icon: GlobeIcon,
            name: "UN ECO-MESH",
            color: "text-blue-600",
            url: "https://www.un.org/en/climatechange",
          },
          {
            icon: Shield,
            name: "GLOBAL SHIELD",
            color: "text-emerald-600",
            url: "https://www.unep.org/",
          },
          {
            icon: Factory,
            name: "INDUS-BIO",
            color: "text-orange-600",
            url: "https://www.unido.org/",
          },
          {
            icon: Cpu,
            name: "NEURAL-NATURE",
            color: "text-purple-600",
            url: "https://www.nature.com/",
          },
        ].map((org, i) => (
          <motion.a
            key={i}
            href={org.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            whileHover={{ scale: 1.1, y: -8 }}
            className="flex flex-col items-center gap-4 p-6 rounded-3xl hover:bg-white/80 transition-all cursor-pointer group"
          >
            <div
              className={cn(
                "p-4 rounded-2xl bg-white shadow-lg group-hover:shadow-xl transition-all",
                org.color,
              )}
            >
              <org.icon size={64} />
            </div>
            <span className="font-bold text-lg tracking-tight text-nature-900 group-hover:text-emerald-600 transition-colors">
              {org.name}
            </span>
            <ExternalLink
              size={16}
              className="text-nature-400 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </motion.a>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16">
        {[
          {
            quote:
              "The Internet of Nature is the missing link in industrial-scale restoration. It turns biology into actionable data.",
            author: "Dr. Elena Vance",
            role: "Chief Ecologist, Global Mesh",
          },
          {
            quote:
              "Finally, a system that speaks the language of both the boardroom and the forest. Truly revolutionary work.",
            author: "Marcus Thorne",
            role: "Director, Industrial ESG Alliance",
          },
          {
            quote:
              "This protocol hasn't just monitored our ecosystems; it has actively predicted and prevented collapse.",
            author: "Sarah Chen",
            role: "Lead Scientist, Urban Canopy Project",
          },
        ].map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.15 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="glass p-10 rounded-[40px] space-y-6 relative hover:shadow-2xl transition-all border border-white/50"
          >
            <div className="absolute top-8 right-8 text-emerald-200 opacity-50">
              <Sparkles size={48} />
            </div>
            <p className="text-nature-700 italic leading-relaxed text-lg relative z-10">
              "{t.quote}"
            </p>
            <div className="relative z-10">
              <p className="font-bold text-nature-900 text-xl">{t.author}</p>
              <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 mt-2">
                {t.role}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const SystemUpdateCenter = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const updates = [
    {
      version: "v2.4.0",
      date: "2026-03-05",
      title: "Global Mesh Intelligence",
      description:
        "Implemented the world's leading industrial-scale autonomous restoration protocol.",
      status: "Deployed",
    },
    {
      version: "v2.3.5",
      date: "2026-03-04",
      title: "AI Chat Refinement",
      description:
        "Enhanced AI Agent with timestamps, typing indicators, and smooth auto-scroll.",
      status: "Deployed",
    },
    {
      version: "v2.3.0",
      date: "2026-03-03",
      title: "Industrial Lab",
      description:
        "Launched the AI Lab for ecological simulations and species identification.",
      status: "Deployed",
    },
    {
      version: "v2.2.0",
      date: "2026-03-01",
      title: "Real-time Data Mesh",
      description:
        "Connected over 500+ urban sensors to the global monitoring network.",
      status: "Deployed",
    },
    {
      version: "v2.1.0",
      date: "2026-02-25",
      title: "Community Hub",
      description:
        "Added social features for scientists and citizens to share observations.",
      status: "Deployed",
    },
  ];

  const handleUpdate = () => {
    setIsUpdating(true);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsUpdating(false);
          setProgress(0);
          alert("System successfully synchronized with global mesh.");
        }, 500);
      }
      setProgress(p);
    }, 300);
  };

  return (
    <div className="space-y-8">
      <div className="glass p-12 rounded-[48px] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
              <RefreshCw
                size={12}
                className={isUpdating ? "animate-spin" : ""}
              />
              System Status: Optimal
            </div>
            <h2 className="text-5xl font-serif font-bold tracking-tight">
              System Update Center
            </h2>
            <p className="text-nature-500 max-w-xl">
              Manage and monitor the evolution of the Internet of Nature
              protocol. Ensure your node is synchronized with the latest global
              intelligence.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400 mb-1">
                Current Version
              </p>
              <p className="text-4xl font-bold text-nature-900">
                v2.4.0 <span className="text-emerald-500 text-sm">LATEST</span>
              </p>
            </div>
            <button
              disabled={isUpdating}
              onClick={handleUpdate}
              className="bg-nature-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-nature-800 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isUpdating
                ? `Syncing... ${Math.floor(progress)}%`
                : "Check for Updates"}
              {!isUpdating && <RefreshCw size={18} />}
            </button>
          </div>
        </div>
        {isUpdating && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-[40px] space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <History size={24} className="text-nature-600" />
              Update History
            </h3>
            <button className="text-[10px] font-bold uppercase tracking-widest text-nature-400 hover:text-nature-900">
              View Full Changelog
            </button>
          </div>
          <div className="space-y-6">
            {updates.map((u, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5" />
                  {i !== updates.length - 1 && (
                    <div className="w-0.5 flex-1 bg-nature-100 my-1" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg group-hover:text-emerald-600 transition-colors">
                      {u.title}
                    </h4>
                    <span className="text-[10px] font-bold text-nature-400">
                      {u.date}
                    </span>
                  </div>
                  <p className="text-sm text-nature-500 leading-relaxed mb-3">
                    {u.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-nature-100 rounded-full uppercase tracking-widest">
                      {u.version}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      {u.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert size={24} className="text-amber-500" />
              Security & Integrity
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">
                    Encryption Active
                  </p>
                  <p className="text-[10px] text-emerald-600">
                    AES-256 Mesh Protocol
                  </p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Key size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">
                    Identity Verified
                  </p>
                  <p className="text-[10px] text-blue-600">
                    Biometric Neural Auth
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full py-4 bg-nature-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-nature-800 transition-all">
              Security Audit
            </button>
          </div>

          <div className="glass p-8 rounded-[40px] space-y-4">
            <h3 className="text-xl font-bold">System Health</h3>
            <div className="space-y-4">
              {[
                { label: "Neural Mesh", status: "Healthy", val: 98 },
                { label: "Sensor Network", status: "Active", val: 94 },
                { label: "AI Core", status: "Optimal", val: 100 },
                { label: "Data Storage", status: "92% Free", val: 8 },
              ].map((h, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-nature-500">{h.label}</span>
                    <span className="text-emerald-600">{h.status}</span>
                  </div>
                  <div className="w-full h-1 bg-nature-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all"
                      style={{ width: `${h.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingPlans = ({
  currentPlan,
  onPlanChange,
}: {
  currentPlan: SubscriptionPlan;
  onPlanChange: (plan: SubscriptionPlan) => void;
}) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { user, upgradeToRole } = useAuth();

  const plans = [
    {
      id: "community" as SubscriptionPlan,
      name: "Community",
      price: "Free",
      amount: 0,
      description:
        "For citizen scientists and hobbyists contributing to the global mesh.",
      features: [
        "Real-time sensor viewing",
        "Basic species identification",
        "Community hub access",
        "Public data API (Rate limited)",
      ],
      cta: "Current Plan",
      highlight: false,
    },
    {
      id: "professional" as SubscriptionPlan,
      name: "Professional",
      price: "$49",
      amount: 49.0,
      period: "/mo",
      description: "For independent researchers and environmental consultants.",
      features: [
        "Advanced AI simulations",
        "Priority species ID",
        "Private data silos",
        "Full API access",
        "Custom alerts",
      ],
      cta: "Upgrade to Pro",
      highlight: true,
    },
    {
      id: "industrial" as SubscriptionPlan,
      name: "Industrial",
      price: "$499",
      amount: 499.0,
      period: "/mo",
      description:
        "For municipalities and large-scale ecological restoration projects.",
      features: [
        "Unlimited sensor nodes",
        "Enterprise-grade security",
        "White-label dashboards",
        "Dedicated support",
        "Carbon credit verification",
      ],
      cta: "Go Industrial",
      highlight: false,
    },
  ];

  const handlePaymentSuccess = async (
    details: any,
    planId: SubscriptionPlan,
  ) => {
    try {
      // Update the user's role in Firebase
      if (user) {
        await upgradeToRole(planId);
      }

      toast.success(
        `Transaction completed! Your mesh access is being upgraded to ${planId.toUpperCase()}.`,
      );
      onPlanChange(planId);
      setSelectedPlan(null);

      // Add a notification
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Subscription upgraded to ${planId.toUpperCase()}`,
          type: "system",
        }),
      });
    } catch (e) {
      console.error(e);
      toast.error(
        "Payment successful, but failed to update plan in our system.",
      );
    }
  };

  const handleStripePayment = async (plan: any) => {
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          planName: plan.name,
          amount: plan.amount,
        }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-5xl font-serif font-bold tracking-tight">
          Monetize Your Mesh
        </h2>
        <p className="text-nature-500">
          Choose the plan that fits your scale. From local gardens to global
          industrial restoration protocols.
        </p>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl inline-block mt-4">
          <p className="text-amber-800 text-xs font-medium flex items-center justify-center gap-2">
            <Info size={14} />
            Stripe has limited support in some regions (e.g., Kenya). Use{" "}
            <b>PayPal</b> or the <b>Demo Upgrade</b> below for testing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={cn(
              "glass p-10 rounded-[48px] flex flex-col space-y-8 transition-all hover:scale-[1.02]",
              plan.highlight
                ? "ring-2 ring-emerald-500 shadow-2xl shadow-emerald-500/10 relative overflow-hidden"
                : "",
              currentPlan === plan.id && "bg-emerald-50/50 border-emerald-200",
            )}
          >
            {plan.highlight && (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}
            {currentPlan === plan.id && (
              <div className="absolute top-4 left-4 flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">
                <CheckCircle2 size={12} /> Active
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-nature-500 text-sm">{plan.description}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-bold">{plan.price}</span>
              {plan.period && (
                <span className="text-nature-400 font-medium">
                  {plan.period}
                </span>
              )}
            </div>
            <ul className="flex-1 space-y-4">
              {plan.features.map((f, j) => (
                <li
                  key={j}
                  className="flex items-center gap-3 text-sm text-nature-600"
                >
                  <CheckCircle2
                    size={18}
                    className="text-emerald-500 shrink-0"
                  />
                  {f}
                </li>
              ))}
            </ul>

            {selectedPlan?.id === plan.id ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => handleStripePayment(plan)}
                    className="w-full py-4 bg-nature-900 text-white rounded-2xl font-bold hover:bg-nature-800 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <CreditCard size={20} />
                    Pay with Stripe
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-nature-100"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                      <span className="bg-white px-2 text-nature-400">Or</span>
                    </div>
                  </div>
                  <PayPalButtons
                    style={{
                      layout: "vertical",
                      shape: "pill",
                      label: "pay",
                    }}
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            description: `${plan.name} Plan Subscription`,
                            amount: {
                              currency_code: "USD",
                              value: plan.amount.toString(),
                            },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      try {
                        const response = await fetch("/api/paypal/capture", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderID: data.orderID }),
                        });
                        const result = await response.json();
                        if (result.status === "success") {
                          handlePaymentSuccess(result.details, plan.id);
                        } else {
                          toast.error("Payment verification failed");
                        }
                      } catch (err) {
                        console.error("Capture Error:", err);
                        toast.error("Capture failed");
                      }
                    }}
                    onCancel={() => {
                      setSelectedPlan(null);
                    }}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      if (!err.toString().includes("Detected popup close")) {
                        toast.error("PayPal encountered an error");
                      }
                      setSelectedPlan(null);
                    }}
                  />
                </div>

                <button
                  onClick={() =>
                    handlePaymentSuccess({ method: "demo" }, plan.id)
                  }
                  className="w-full py-4 border-2 border-emerald-100 text-emerald-700 rounded-2xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles size={18} className="text-amber-500" />
                  Demo Upgrade (0 Fee)
                </button>

                <button
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-2 text-[10px] font-bold uppercase tracking-widest text-nature-400 hover:text-nature-900"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (currentPlan === plan.id) return;
                  plan.amount > 0
                    ? setSelectedPlan(plan)
                    : onPlanChange("community");
                }}
                disabled={currentPlan === plan.id}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold transition-all",
                  currentPlan === plan.id
                    ? "bg-nature-100 text-nature-400 cursor-default"
                    : plan.highlight
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                      : "bg-nature-900 text-white hover:bg-nature-800",
                )}
              >
                {currentPlan === plan.id ? "Current Plan" : plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="glass p-12 rounded-[48px] bg-nature-900 text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-2">
          <h3 className="text-3xl font-bold">Enterprise Custom</h3>
          <p className="text-nature-400">
            Need a custom mesh configuration for a global network?
          </p>
        </div>
        <button className="px-10 py-4 bg-white text-nature-900 rounded-2xl font-bold hover:bg-nature-100 transition-all">
          Talk to an Expert
        </button>
      </div>
    </div>
  );
};

const BillingDashboard = () => {
  const stats = [
    {
      label: "Total Revenue",
      value: "$12,450.00",
      icon: DollarSign,
      trend: "+12.5%",
      color: "text-emerald-600",
    },
    {
      label: "Active Nodes",
      value: "1,240",
      icon: Activity,
      trend: "+5.2%",
      color: "text-blue-600",
    },
    {
      label: "API Calls",
      value: "2.4M",
      icon: Cpu,
      trend: "+18.1%",
      color: "text-purple-600",
    },
    {
      label: "Carbon Credits",
      value: "450.2t",
      icon: Leaf,
      trend: "+2.4%",
      color: "text-emerald-600",
    },
  ];

  const transactions = [
    {
      id: "TX-9012",
      date: "2026-03-05",
      amount: "$499.00",
      status: "Success",
      plan: "Industrial",
    },
    {
      id: "TX-9011",
      date: "2026-03-04",
      amount: "$49.00",
      status: "Success",
      plan: "Professional",
    },
    {
      id: "TX-9010",
      date: "2026-03-04",
      amount: "$499.00",
      status: "Success",
      plan: "Industrial",
    },
    {
      id: "TX-9009",
      date: "2026-03-03",
      amount: "$49.00",
      status: "Pending",
      plan: "Professional",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold tracking-tight">
            Billing & Monetization
          </h2>
          <p className="text-nature-500">
            Track your mesh revenue and manage industrial subscriptions.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white border border-nature-200 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-nature-50 transition-all">
            <Download size={18} /> Export Invoices
          </button>
          <button className="px-6 py-3 bg-nature-900 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-nature-800 transition-all">
            <CreditCard size={18} /> Payment Methods
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="glass p-6 rounded-[32px] space-y-4">
            <div className="flex justify-between items-start">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm",
                  s.color,
                )}
              >
                <s.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                {s.trend}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-nature-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-bold text-nature-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-[40px] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Recent Transactions</h3>
            <button className="text-xs font-bold text-nature-400 hover:text-nature-900">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-nature-50">
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-nature-400">
                    Transaction ID
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-nature-400">
                    Date
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-nature-400">
                    Plan
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-nature-400">
                    Amount
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-nature-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-nature-50">
                {transactions.map((t, i) => (
                  <tr
                    key={i}
                    className="group hover:bg-nature-50/50 transition-colors"
                  >
                    <td className="py-4 text-sm font-mono text-nature-600">
                      {t.id}
                    </td>
                    <td className="py-4 text-sm text-nature-900">{t.date}</td>
                    <td className="py-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-nature-100 rounded-full uppercase tracking-widest">
                        {t.plan}
                      </span>
                    </td>
                    <td className="py-4 text-sm font-bold text-nature-900">
                      {t.amount}
                    </td>
                    <td className="py-4">
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1",
                          t.status === "Success"
                            ? "text-emerald-600"
                            : "text-amber-600",
                        )}
                      >
                        {t.status === "Success" ? (
                          <CheckCircle2 size={10} />
                        ) : (
                          <RefreshCw size={10} className="animate-spin" />
                        )}
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-xl font-bold">Revenue Breakdown</h3>
            <div className="h-48 flex items-center justify-center relative">
              <div className="w-32 h-32 rounded-full border-[12px] border-emerald-500 border-t-blue-500 border-r-purple-500" />
              <div className="absolute flex flex-col items-center">
                <p className="text-xs font-bold text-nature-400">Total</p>
                <p className="text-lg font-bold">$12.4k</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Industrial", val: 65, color: "bg-emerald-500" },
                { label: "Professional", val: 25, color: "bg-blue-500" },
                { label: "Community", val: 10, color: "bg-purple-500" },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", r.color)} />
                    <span className="text-xs font-medium text-nature-600">
                      {r.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold">{r.val}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] bg-emerald-50 border-emerald-100 space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-lg font-bold text-emerald-900">
              Growth Forecast
            </h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Based on current mesh expansion, revenue is projected to grow by
              24% next month.
            </p>
            <button className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:underline">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const GlobalGrowthDashboard = () => {
  const marketingStats = [
    {
      label: "Global Reach",
      value: "142 Countries",
      icon: Globe,
      color: "text-blue-600",
    },
    {
      label: "Social Shares",
      value: "12.4k",
      icon: Share2,
      color: "text-emerald-600",
    },
    {
      label: "Referral Signups",
      value: "842",
      icon: Users,
      color: "text-purple-600",
    },
    {
      label: "SEO Visibility",
      value: "94/100",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold tracking-tight">
            Global Growth & Visibility
          </h2>
          <p className="text-nature-500">
            Strategies and tools to scale the Internet of Nature worldwide.
          </p>
        </div>
        <button className="px-8 py-4 bg-nature-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-nature-800 transition-all shadow-xl shadow-nature-900/20">
          <Rocket size={20} /> Launch Global Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {marketingStats.map((s, i) => (
          <div key={i} className="glass p-6 rounded-[32px] space-y-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm">
              <s.icon size={24} className={s.color} />
            </div>
            <div>
              <p className="text-xs font-bold text-nature-400 uppercase tracking-widest">
                {s.label}
              </p>
              <p className="text-2xl font-bold text-nature-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[40px] space-y-6">
            <h3 className="text-xl font-bold">Social Sharing Toolkit</h3>
            <p className="text-nature-500 text-sm">
              Spread the word about your ecological impact with one click.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Twitter", icon: Twitter, color: "bg-sky-500" },
                { name: "LinkedIn", icon: Linkedin, color: "bg-blue-700" },
                { name: "Facebook", icon: Facebook, color: "bg-blue-600" },
                { name: "Email", icon: Mail, color: "bg-nature-900" },
              ].map((social, i) => (
                <button
                  key={i}
                  className={cn(
                    "flex flex-col items-center gap-3 p-6 rounded-3xl text-white transition-all hover:scale-105",
                    social.color,
                  )}
                >
                  <social.icon size={24} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {social.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Public Showcase Page</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold">
                <Eye size={12} /> LIVE
              </div>
            </div>
            <div className="aspect-video bg-nature-100 rounded-3xl relative overflow-hidden group">
              <img
                src="https://picsum.photos/seed/showcase/1200/800"
                className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-6 rounded-[32px] shadow-2xl text-center space-y-4 max-w-xs">
                  <p className="text-xs font-bold text-nature-900">
                    Your system is currently visible to the world at:
                  </p>
                  <code className="text-[10px] bg-nature-50 p-2 rounded-lg block overflow-hidden text-ellipsis">
                    nature-mesh.io/erik-scientist
                  </code>
                  <button className="w-full py-3 bg-nature-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
                    Customize Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass p-8 rounded-[40px] bg-purple-900 text-white space-y-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <Users size={24} className="text-purple-300" />
            </div>
            <h3 className="text-xl font-bold">Referral Program</h3>
            <p className="text-purple-100/60 text-xs leading-relaxed">
              Invite other scientists and earn 15% of their subscription revenue
              for life.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <code className="text-[10px] font-mono">ION-REF-ERIK-2026</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("ION-REF-ERIK-2026");
                    alert("Referral code copied to clipboard!");
                  }}
                  className="text-[10px] font-bold uppercase text-purple-300 hover:text-white"
                >
                  Copy
                </button>
              </div>
              <p className="text-[10px] text-center text-purple-200/40 italic">
                12 people joined using your link
              </p>
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] space-y-4">
            <h4 className="text-lg font-bold">SEO Optimization</h4>
            <div className="space-y-4">
              {[
                {
                  label: "Meta Tags",
                  status: "Optimized",
                  color: "text-emerald-500",
                },
                {
                  label: "Sitemap",
                  status: "Generated",
                  color: "text-emerald-500",
                },
                {
                  label: "Backlinks",
                  status: "1.2k Found",
                  color: "text-blue-500",
                },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs font-medium text-nature-600">
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      s.color,
                    )}
                  >
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full py-3 border border-nature-200 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-nature-50 transition-all">
              Run SEO Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentSettings = ({
  currentPlan,
}: {
  currentPlan: SubscriptionPlan;
}) => {
  const [paypalEmail, setPaypalEmail] = useState("tooerick913@gmail.com");
  const [isEditing, setIsEditing] = useState(false);
  const isLive =
    (import.meta as any).env.VITE_PAYPAL_CLIENT_ID &&
    (import.meta as any).env.VITE_PAYPAL_CLIENT_ID !== "test";
  const hasSecret =
    (import.meta as any).env.PAYPAL_SECRET_KEY &&
    (import.meta as any).env.PAYPAL_SECRET_KEY !== "";

  return (
    <div className="glass p-10 rounded-[48px] space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-sm">
            <DollarSign size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Payment Settings</h3>
            <p className="text-nature-500 text-sm">
              Configure how you receive payments from the global mesh.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={cn(
              "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
              isLive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-amber-50 text-amber-600 border border-amber-100",
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isLive ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            {isLive ? "Live Mode Active" : "Test Mode (Sandbox)"}
          </div>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5",
              hasSecret
                ? "bg-blue-50 text-blue-600"
                : "bg-nature-50 text-nature-400",
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                hasSecret ? "bg-blue-500" : "bg-nature-300",
              )}
            />
            {hasSecret ? "Server-Side Capture Enabled" : "Client-Side Only"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="p-8 bg-nature-50 rounded-[32px] border border-nature-100 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                Current Plan
              </p>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Active
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-nature-900 shadow-sm">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold uppercase tracking-tight">
                  {currentPlan}
                </h4>
                <p className="text-nature-500 text-xs">Billed monthly</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
              PayPal Account
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-nature-400" />
              </div>
              <input
                type="email"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
                disabled={!isEditing}
                className={cn(
                  "w-full pl-12 pr-24 py-4 bg-nature-50 border-none rounded-2xl text-sm font-medium transition-all",
                  isEditing
                    ? "ring-2 ring-blue-500 bg-white"
                    : "text-nature-500",
                )}
              />
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-600 font-bold text-[10px] uppercase tracking-widest hover:underline"
              >
                {isEditing ? "Save" : "Edit"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-nature-400 leading-relaxed italic">
                * Payments are automatically routed to this account via your API
                credentials.
              </p>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-bold">
                <CheckCircle2 size={10} /> VERIFIED
              </div>
            </div>
            <a
              href="https://www.paypal.com/mep/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-600 hover:underline font-bold block mt-1"
            >
              Open PayPal Dashboard →
            </a>
          </div>

          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Account Verified
              </p>
              <p className="text-[10px] text-emerald-600">
                You are eligible for instant payouts.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
              Other Methods
            </label>
            <div className="space-y-3">
              <button className="w-full p-4 border border-nature-100 rounded-2xl flex items-center justify-between hover:bg-nature-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-nature-900 text-white rounded-lg flex items-center justify-center">
                    <CreditCard size={16} />
                  </div>
                  <span className="text-xs font-bold">
                    Bank Transfer (Stripe)
                  </span>
                </div>
                <ChevronRight
                  size={16}
                  className="text-nature-300 group-hover:translate-x-1 transition-transform"
                />
              </button>
              <button className="w-full p-4 border border-nature-100 rounded-2xl flex items-center justify-between hover:bg-nature-50 transition-all group opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-nature-100 text-nature-400 rounded-lg flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <span className="text-xs font-bold">Crypto (USDC/ETH)</span>
                </div>
                <span className="text-[8px] font-bold bg-nature-200 px-1.5 py-0.5 rounded uppercase">
                  Coming Soon
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MonetizationCard = ({
  onNavigate,
}: {
  onNavigate: (tab: any) => void;
}) => (
  <div className="glass p-8 rounded-[40px] bg-emerald-900 text-white space-y-8 relative overflow-hidden group">
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
    <div className="relative z-10 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
          <DollarSign size={28} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Monetize Your Mesh</h3>
          <p className="text-emerald-100/60 text-sm">
            Turn ecological data into revenue.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Next Generation Opportunity
          </h4>
          <p className="text-sm leading-relaxed text-emerald-50/80">
            Join the global movement of ecological entrepreneurs. By upgrading,
            you unlock advanced simulation tools that are highly sought after by
            urban planners and conservationists worldwide.
          </p>
        </div>

        <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">
          <Sparkles size={16} />
          High-Demand Skillset
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate("pricing")}
          className="py-4 bg-white text-emerald-900 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg"
        >
          View Plans
        </button>
        <button
          onClick={() => onNavigate("billing")}
          className="py-4 bg-emerald-800 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all border border-emerald-700"
        >
          Revenue
        </button>
      </div>
    </div>
  </div>
);

const MeshStatus = ({ data }: { data: any[] }) => {
  const activeNodes = data.filter((n) => n.status === "online").length;
  const totalNodes = data.length || 1242; // Fallback to mock if empty
  const healthScore = Math.round((activeNodes / totalNodes) * 100) || 94;

  return (
    <div className="glass p-8 rounded-[40px] space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold">Mesh Network Status</h3>
          <p className="text-nature-500 text-sm">
            Global IoT connectivity and node health
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-bold border border-emerald-100">
          <Wifi size={16} />
          {healthScore}% HEALTHY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-nature-50 rounded-3xl space-y-2">
          <p className="text-[10px] font-bold text-nature-400 uppercase tracking-widest">
            Active Nodes
          </p>
          <p className="text-3xl font-bold text-nature-900">
            {activeNodes || 1242}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <ArrowUpRight size={12} /> +12% this week
          </div>
        </div>
        <div className="p-6 bg-nature-50 rounded-3xl space-y-2">
          <p className="text-[10px] font-bold text-nature-400 uppercase tracking-widest">
            Data Throughput
          </p>
          <p className="text-3xl font-bold text-nature-900">1.4 GB/s</p>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
            <RefreshCw size={12} className="animate-spin" /> Live Stream
          </div>
        </div>
        <div className="p-6 bg-nature-50 rounded-3xl space-y-2">
          <p className="text-[10px] font-bold text-nature-400 uppercase tracking-widest">
            Avg Latency
          </p>
          <p className="text-3xl font-bold text-nature-900">24ms</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
            <CheckCircle2 size={12} /> Optimal
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-bold uppercase tracking-widest text-nature-400">
            Node Distribution
          </h4>
          <button className="text-[10px] font-bold text-nature-900 hover:underline">
            View Map
          </button>
        </div>
        <div className="h-24 w-full flex items-end gap-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 100}%` }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "flex-1 rounded-t-sm",
                i % 5 === 0 ? "bg-emerald-500" : "bg-nature-200",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const SpeciesSpotlight = () => (
  <div className="glass p-8 rounded-[40px] relative overflow-hidden group">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">
            Species of the Day
          </p>
          <h3 className="text-3xl font-bold">Parus major</h3>
          <p className="text-nature-500 italic text-sm">(Great Tit)</p>
        </div>
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
          <Bird size={24} />
        </div>
      </div>
      <p className="text-nature-600 text-sm leading-relaxed mb-6">
        A frequent visitor to our urban sensors. Recent acoustic data shows a
        15% increase in nesting calls in Sector 4.
      </p>
      <div className="flex gap-4">
        <div className="flex-1 bg-nature-50 p-4 rounded-2xl">
          <p className="text-[8px] font-bold uppercase text-nature-400 mb-1">
            Population
          </p>
          <p className="text-lg font-bold">Stable</p>
        </div>
        <div className="flex-1 bg-nature-50 p-4 rounded-2xl">
          <p className="text-[8px] font-bold uppercase text-nature-400 mb-1">
            Activity
          </p>
          <p className="text-lg font-bold">High</p>
        </div>
      </div>
    </div>
    <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
      <Bird size={200} />
    </div>
  </div>
);

const NetworkTopology = () => {
  const nodes = [
    { id: 1, x: 100, y: 100, type: "gateway" },
    { id: 2, x: 300, y: 150, type: "sensor" },
    { id: 3, x: 200, y: 300, type: "sensor" },
    { id: 4, x: 500, y: 200, type: "sensor" },
    { id: 5, x: 400, y: 400, type: "sensor" },
    { id: 6, x: 600, y: 350, type: "gateway" },
  ];

  const links = [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 },
    { from: 2, to: 3 },
  ];

  return (
    <div className="glass p-8 rounded-[40px] space-y-6 overflow-hidden relative min-h-[500px]">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Share2 size={24} className="text-nature-600" />
            Mesh Topology
          </h3>
          <p className="text-nature-500 text-sm">
            Real-time IoT network connectivity map
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-nature-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> GATEWAY
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-nature-400">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> SENSOR
          </div>
        </div>
      </div>

      <div className="relative w-full h-[400px] bg-nature-50/50 rounded-3xl border border-nature-100">
        <svg className="w-full h-full">
          {links.map((link, i) => {
            const from = nodes.find((n) => n.id === link.from)!;
            const to = nodes.find((n) => n.id === link.to)!;
            return (
              <motion.line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-nature-200"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, delay: i * 0.2 }}
              />
            );
          })}
          {nodes.map((node) => (
            <motion.g
              key={node.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                damping: 12,
                delay: node.id * 0.1,
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={node.type === "gateway" ? 12 : 8}
                className={cn(
                  "stroke-white stroke-2 shadow-lg",
                  node.type === "gateway"
                    ? "fill-emerald-500"
                    : "fill-blue-500",
                )}
              />
              {node.type === "gateway" && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  className="fill-emerald-500/20 animate-ping"
                />
              )}
            </motion.g>
          ))}
        </svg>

        {/* Data Packets Animation */}
        <div className="absolute inset-0 pointer-events-none">
          {links.map((link, i) => {
            const from = nodes.find((n) => n.id === link.from)!;
            const to = nodes.find((n) => n.id === link.to)!;
            return (
              <motion.div
                key={`packet-${i}`}
                initial={{ left: from.x, top: from.y, opacity: 0 }}
                animate={{
                  left: [from.x, to.x],
                  top: [from.y, to.y],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1.5,
                  ease: "linear",
                }}
                className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- Developer Portal Components ---

const GitHubIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [repoName, setRepoName] = useState("project-genie-data");

  useEffect(() => {
    checkStatus();
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "GITHUB_AUTH_SUCCESS") {
        checkStatus();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/auth/github/status");
      const data = await res.json();
      setIsConnected(data.connected);
      if (data.connected) {
        fetchUser();
      } else {
        setGithubUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/github/user");
      const data = await res.json();
      setGithubUser(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/auth/github/url");
      const { url } = await res.json();
      window.open(url, "github_oauth", "width=600,height=700");
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/github/logout", { method: "POST" });
      setIsConnected(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePush = async () => {
    setIsPushing(true);
    try {
      const report = await generateEcologicalReport(
        "Global Mesh Status Summary",
      );
      const res = await fetch("/api/github/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoName,
          fileName: `report-${new Date().toISOString().split("T")[0]}.md`,
          content: report,
          message: `Ecological Report Sync: ${new Date().toLocaleString()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Successfully pushed to GitHub!`);
        window.open(data.url, "_blank");
      } else {
        toast.error(`Push failed: ${data.error?.message || "Unknown error"}`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Push failed");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="glass p-10 rounded-[48px] space-y-8 border border-nature-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-nature-900 text-white rounded-3xl flex items-center justify-center shadow-lg">
            <Github size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold">GitHub Integration</h3>
            <p className="text-nature-500 text-sm">
              Sync your ecological data and reports to GitHub repositories.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-4">
              {githubUser && (
                <div className="flex items-center gap-3 pr-4 border-r border-nature-100">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-nature-100 shadow-sm">
                    <img
                      src={githubUser.avatar_url}
                      alt={githubUser.login}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-nature-900">
                      {githubUser.login}
                    </span>
                    <span className="text-[10px] text-nature-400 font-medium uppercase tracking-widest">
                      GitHub Profile
                    </span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Connected
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold uppercase tracking-widest text-nature-400 hover:text-red-500 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="px-6 py-3 bg-nature-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-nature-800 transition-all shadow-lg"
            >
              <Github size={18} />
              Connect GitHub
            </button>
          )}
        </div>
      </div>

      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 pt-8 border-t border-nature-100"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <BookOpen size={24} className="text-nature-600" />
                <h4 className="text-xl font-bold">API Documentation</h4>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-nature-50 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      GET
                    </span>
                    <code className="text-xs font-mono text-nature-500">
                      /api/v1/mesh/status
                    </code>
                  </div>
                  <p className="text-xs text-nature-500">
                    Retrieve real-time status of all sensor nodes in the global
                    mesh.
                  </p>
                </div>
                <div className="p-6 bg-nature-50 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      POST
                    </span>
                    <code className="text-xs font-mono text-nature-500">
                      /api/v1/ai/simulate
                    </code>
                  </div>
                  <p className="text-xs text-nature-500">
                    Run an AI-powered ecological simulation based on custom
                    parameters.
                  </p>
                </div>
                <div className="p-6 bg-nature-50 rounded-3xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      GET
                    </span>
                    <code className="text-xs font-mono text-nature-500">
                      /api/v1/reports/latest
                    </code>
                  </div>
                  <p className="text-xs text-nature-500">
                    Fetch the most recent ecological health report generated by
                    Nature AI.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Terminal size={24} className="text-nature-600" />
                <h4 className="text-xl font-bold">Developer SDK</h4>
              </div>
              <div className="bg-nature-900 rounded-[32px] p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                      NPM Package
                    </span>
                  </div>
                  <span className="text-[10px] text-nature-500 font-mono">
                    v1.2.4
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-nature-300">
                    Install the official Internet of Nature SDK to build custom
                    integrations.
                  </p>
                  <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-emerald-400 flex justify-between items-center group">
                    <code>npm install @nature/sdk</code>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-xs font-bold text-nature-500 uppercase tracking-widest">
                    Quick Start
                  </p>
                  <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] text-emerald-400/80 leading-relaxed">
                    <pre>{`import { NatureMesh } from '@nature/sdk';\n\nconst mesh = new NatureMesh(API_KEY);\nconst data = await mesh.getRealtimeData();\nconsole.log(data.biodiversityIndex);`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-6 border-t border-nature-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 size={24} className="text-nature-600" />
                <h4 className="text-xl font-bold">GitHub Repository Sync</h4>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                  Target Repository
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Box size={18} className="text-nature-400" />
                  </div>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="repository-name"
                    className="w-full pl-12 pr-4 py-4 bg-nature-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-nature-900 transition-all"
                  />
                </div>
                <p className="text-[10px] text-nature-400 italic">
                  * If the repository doesn't exist, it will be created
                  automatically.
                </p>
              </div>
              <div className="flex flex-col justify-end">
                <button
                  disabled={isPushing}
                  onClick={handlePush}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isPushing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      Pushing to GitHub...
                    </>
                  ) : (
                    <>
                      <Rocket size={18} />
                      Push Ecological Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const DeveloperPortal = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    "ide" | "api" | "sdk" | "cert" | "industrial" | "github"
  >("ide");

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-nature-900">
            Developer & Cloud IDE Portal
          </h2>
          <p className="text-nature-500 mt-2">
            Build, run, and deploy ANY project with our cloud IDE - Just like
            Google Colab but better!
          </p>
        </div>
        <div className="flex bg-nature-100 p-1 rounded-2xl flex-wrap">
          {[
            { id: "ide", label: "Cloud IDE", icon: Terminal },
            { id: "api", label: "API Docs", icon: Code },
            { id: "sdk", label: "SDKs", icon: Box },
            { id: "github", label: "GitHub", icon: Github },
            { id: "industrial", label: "Industrial Connect", icon: Factory },
            { id: "cert", label: "Certification", icon: GraduationCap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                activeSubTab === tab.id
                  ? "bg-white text-nature-900 shadow-sm"
                  : "text-nature-500 hover:text-nature-700",
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "ide" && <CloudIDE key="ide" />}
        {activeSubTab === "api" && <ApiDocs key="api" />}
        {activeSubTab === "sdk" && <SdkDownloads key="sdk" />}
        {activeSubTab === "github" && <GitHubIntegration key="github" />}
        {activeSubTab === "industrial" && (
          <IndustrialIntegrations key="industrial" />
        )}
        {activeSubTab === "cert" && <CertificationPath key="cert" />}
      </AnimatePresence>
    </div>
  );
};

// NEW: Cloud IDE Component - Like Google Colab
const CloudIDE = () => {
  const [code, setCode] = useState(`# Welcome to Internet of Nature Cloud IDE!
# Run ANY project here - Python, JavaScript, Node.js, and more!

# Example: Analyze ecosystem data
import pandas as pd
import matplotlib.pyplot as plt

# Load sample biodiversity data
data = {
    'species': ['Birds', 'Insects', 'Plants', 'Mammals'],
    'count': [142, 856, 234, 45]
}

df = pd.DataFrame(data)
print(df)

# Visualize
plt.bar(df['species'], df['count'])
plt.title('Biodiversity Distribution')
plt.show()

print("✓ Analysis complete! Your ecosystem is healthy.")
`);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState("python");
  const [projectName, setProjectName] = useState("My Ecosystem Project");
  const [savedProjects, setSavedProjects] = useState([
    {
      name: "Biodiversity Analysis",
      language: "python",
      lastModified: "2 hours ago",
    },
    {
      name: "IoT Sensor Dashboard",
      language: "javascript",
      lastModified: "1 day ago",
    },
    {
      name: "Carbon Calculator",
      language: "python",
      lastModified: "3 days ago",
    },
  ]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running your code...\n");

    // Simulate code execution
    setTimeout(() => {
      setOutput(
        `Running ${language} code...\n\n` +
          `✓ Environment initialized\n` +
          `✓ Dependencies loaded\n` +
          `✓ Code executed successfully\n\n` +
          `Output:\n` +
          `================\n` +
          `   species  count\n` +
          `0    Birds    142\n` +
          `1  Insects    856\n` +
          `2   Plants    234\n` +
          `3  Mammals     45\n\n` +
          `✓ Analysis complete! Your ecosystem is healthy.\n\n` +
          `Execution time: 1.24s\n` +
          `Memory used: 45.2 MB\n`,
      );
      setIsRunning(false);
    }, 2000);
  };

  const templates = [
    { name: "Ecosystem Analysis", lang: "python", icon: Leaf },
    { name: "IoT Data Processing", lang: "javascript", icon: Wifi },
    { name: "Machine Learning Model", lang: "python", icon: Brain },
    { name: "API Integration", lang: "javascript", icon: Code },
    { name: "Data Visualization", lang: "python", icon: BarChart3 },
    { name: "Blank Project", lang: "python", icon: FileCode },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header with Project Info */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Terminal size={32} />
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-white/20 px-4 py-2 rounded-xl text-2xl font-bold border-2 border-white/30 focus:border-white/60 outline-none"
              />
            </div>
            <p className="text-white/80">
              Cloud IDE - Run any code, anywhere, anytime
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/20 px-4 py-2 rounded-xl font-bold border-2 border-white/30 focus:border-white/60 outline-none"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="r">R</option>
              <option value="julia">Julia</option>
            </select>
            <button className="px-6 py-2 bg-white text-emerald-600 rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Project Templates */}
      <div className="bg-white rounded-3xl p-6 border border-nature-100">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Rocket size={20} className="text-emerald-600" />
          Quick Start Templates
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {templates.map((template, i) => (
            <button
              key={i}
              onClick={() => {
                setLanguage(template.lang);
                toast.success(`Loaded ${template.name} template`);
              }}
              className="p-4 bg-nature-50 hover:bg-emerald-50 rounded-2xl transition-all group text-center space-y-2"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <template.icon size={24} className="text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-nature-900">
                {template.name}
              </p>
              <span className="text-[10px] text-nature-500">
                {template.lang}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Saved Projects */}
        <div className="bg-white rounded-3xl p-6 border border-nature-100 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <Folder size={18} className="text-emerald-600" />
            My Projects
          </h3>
          <div className="space-y-2">
            {savedProjects.map((project, i) => (
              <button
                key={i}
                className="w-full text-left p-3 bg-nature-50 hover:bg-emerald-50 rounded-xl transition-all group"
              >
                <p className="font-bold text-sm text-nature-900 group-hover:text-emerald-600">
                  {project.name}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-nature-500">
                    {project.language}
                  </span>
                  <span className="text-[10px] text-nature-400">
                    {project.lastModified}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const projectName = prompt("Enter project name:");
              if (projectName) {
                setSavedProjects([
                  ...savedProjects,
                  {
                    name: projectName,
                    language: language,
                    lastModified: "Just now",
                  },
                ]);
                setCode(
                  `// ${projectName}\n// Created: ${new Date().toLocaleDateString()}\n\n`,
                );
              }
            }}
            className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Code Editor and Terminal */}
        <div className="lg:col-span-3 space-y-4">
          {/* Code Editor */}
          <div className="bg-nature-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-nature-800 border-b border-nature-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-white/60 text-sm font-mono">
                  editor.{language}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all">
                  Format
                </button>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all">
                  Share
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-[400px] bg-nature-900 text-emerald-400 p-6 font-mono text-sm resize-none outline-none"
              spellCheck={false}
              placeholder="Write your code here..."
            />
          </div>

          {/* Control Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {isRunning ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayCircle size={20} />
                  Run Code
                </>
              )}
            </button>
            <button className="px-6 py-4 bg-nature-100 text-nature-900 rounded-2xl font-bold hover:bg-nature-200 transition-all">
              Stop
            </button>
            <button className="px-6 py-4 bg-nature-100 text-nature-900 rounded-2xl font-bold hover:bg-nature-200 transition-all">
              Clear
            </button>
          </div>

          {/* Terminal Output */}
          <div className="bg-nature-900 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 bg-nature-800 border-b border-nature-700">
              <div className="flex items-center gap-3">
                <Terminal size={16} className="text-emerald-400" />
                <span className="text-white/60 text-sm font-mono">
                  Terminal Output
                </span>
              </div>
              <button className="text-white/40 hover:text-white transition-colors">
                <Copy size={16} />
              </button>
            </div>
            <pre className="p-6 font-mono text-sm text-emerald-400 h-[300px] overflow-auto">
              {output || "Ready to run your code. Click 'Run Code' to execute."}
            </pre>
          </div>

          {/* System Resources */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-nature-100">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-nature-600">
                  CPU Usage
                </span>
              </div>
              <div className="text-2xl font-bold text-nature-900">23%</div>
              <div className="w-full h-2 bg-nature-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500 w-[23%]" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-nature-100">
              <div className="flex items-center gap-2 mb-2">
                <Database size={16} className="text-purple-600" />
                <span className="text-xs font-bold text-nature-600">
                  Memory
                </span>
              </div>
              <div className="text-2xl font-bold text-nature-900">45 MB</div>
              <div className="w-full h-2 bg-nature-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-purple-500 w-[45%]" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-nature-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-nature-600">
                  Status
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">Ready</div>
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-nature-500">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Info */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200">
        <h3 className="text-2xl font-bold text-nature-900 mb-4 flex items-center gap-2">
          <Sparkles className="text-blue-600" />
          Cloud IDE Features
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              label: "Instant Execution",
              desc: "Run code in milliseconds",
            },
            {
              icon: Globe,
              label: "Access Anywhere",
              desc: "Work from any device",
            },
            {
              icon: Users,
              label: "Collaborate",
              desc: "Share projects with team",
            },
            {
              icon: Shield,
              label: "Secure",
              desc: "Enterprise-grade security",
            },
          ].map((feature, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto">
                <feature.icon size={24} className="text-blue-600" />
              </div>
              <p className="font-bold text-sm text-nature-900">
                {feature.label}
              </p>
              <p className="text-xs text-nature-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ApiDocs = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white p-6 rounded-[32px] border border-nature-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Book size={20} className="text-emerald-500" />
            Endpoints
          </h3>
          <div className="space-y-2">
            {[
              {
                path: "/v1/mesh/nodes",
                method: "GET",
                desc: "List all active mesh nodes",
              },
              {
                path: "/v1/mesh/telemetry",
                method: "GET",
                desc: "Real-time sensor stream",
              },
              {
                path: "/v1/ai/analyze",
                method: "POST",
                desc: "Ecological AI analysis",
              },
              {
                path: "/v1/industrial/esg",
                method: "GET",
                desc: "Industrial compliance data",
              },
            ].map((endpoint) => (
              <button
                key={endpoint.path}
                className="w-full text-left p-3 rounded-xl hover:bg-nature-50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      endpoint.method === "GET"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-emerald-100 text-emerald-600",
                    )}
                  >
                    {endpoint.method}
                  </span>
                  <code className="text-xs font-mono text-nature-900">
                    {endpoint.path}
                  </code>
                </div>
                <p className="text-[10px] text-nature-500">{endpoint.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-nature-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <span className="text-xs font-mono text-white/40 ml-4">
                bash — internet-of-nature-cli
              </span>
            </div>
            <button className="text-white/40 hover:text-white transition-colors">
              <Share2 size={16} />
            </button>
          </div>
          <pre className="font-mono text-sm text-emerald-400 overflow-x-auto">
            <code>{`# Install the Global CLI
$ npm install -g @ion/cli

# Authenticate with Industrial API Key
$ ion auth login --key ION_IND_882x_991

# Stream real-time telemetry from Amazon Basin
$ ion mesh stream --region "amazon-basin" --type "biodiversity"

[ION] Connecting to Global Mesh...
[ION] Connected. Latency: 12ms
[ION] Receiving data stream:
{
  "node_id": "AMZ-092",
  "timestamp": "2026-03-04T07:52:00Z",
  "metrics": {
    "species_count": 142,
    "carbon_sequestration": "4.2t/h",
    "soil_health": 0.92
  }
}`}</code>
          </pre>
        </div>
      </div>
    </motion.div>
  );
};

const SdkDownloads = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
    >
      {[
        {
          lang: "Node.js",
          version: "v2.4.0",
          icon: Code,
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          lang: "Python",
          version: "v1.8.2",
          icon: FileCode,
          color: "bg-blue-50 text-blue-600",
        },
        {
          lang: "C++ (Embedded)",
          version: "v3.1.0",
          icon: Cpu,
          color: "bg-purple-50 text-purple-600",
        },
      ].map((sdk) => (
        <div
          key={sdk.lang}
          className="bg-white p-8 rounded-[40px] border border-nature-100 shadow-sm hover:shadow-md transition-all group"
        >
          <div
            className={cn(
              "w-16 h-16 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform",
              sdk.color,
            )}
          >
            <sdk.icon size={32} />
          </div>
          <h4 className="text-2xl font-bold text-nature-900 mb-2">
            {sdk.lang} SDK
          </h4>
          <p className="text-nature-500 text-sm mb-6">
            Full-featured library for industrial integration and edge computing.
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-nature-400 uppercase tracking-widest">
              {sdk.version}
            </span>
            <button className="text-nature-900 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
              Download <ChevronRight size={16} />
            </button>
          </div>
        </div>
      ))}
    </motion.div>
  );
};

const IndustrialIntegrations = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="bg-nature-900 text-white p-12 rounded-[48px] relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-4xl font-bold mb-4">Enterprise ERP Sync</h3>
          <p className="text-white/60 text-lg mb-8">
            Connect your industrial operations directly to the global
            restoration mesh for automated ESG compliance and real-time impact
            reporting.
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              {
                name: "SAP S/4HANA",
                url: "https://www.sap.com/products/erp/s4hana.html",
              },
              { name: "Oracle NetSuite", url: "https://www.netsuite.com/" },
              {
                name: "Microsoft Dynamics",
                url: "https://dynamics.microsoft.com/",
              },
              {
                name: "Salesforce Net Zero",
                url: "https://www.salesforce.com/products/net-zero-cloud/overview/",
              },
            ].map((erp) => (
              <a
                key={erp.name}
                href={erp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 rounded-full border border-white/20 text-sm font-medium hover:bg-white/20 hover:border-white/40 transition-all cursor-pointer group flex items-center gap-2"
              >
                {erp.name}
                <ExternalLink
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none" />
        <Factory
          size={200}
          className="absolute -right-20 -bottom-20 text-white/5 rotate-12"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-nature-100 shadow-sm">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield size={24} className="text-blue-500" />
            Compliance Automation
          </h4>
          <p className="text-nature-500 text-sm leading-relaxed">
            Automatically generate CSRD and SEC-compliant environmental reports
            based on verified real-time data from the mesh network.
          </p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-nature-100 shadow-sm">
          <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap size={24} className="text-yellow-500" />
            Smart Contract Triggers
          </h4>
          <p className="text-nature-500 text-sm leading-relaxed">
            Execute automated payments or carbon credit releases when
            restoration milestones are verified by the mesh's consensus
            protocol.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const CertificationPath = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-emerald-50 p-10 rounded-[48px] border border-emerald-100">
          <h3 className="text-3xl font-bold text-emerald-900 mb-4">
            Master the Internet of Nature
          </h3>
          <p className="text-emerald-700 mb-8 max-w-xl">
            Accelerate your career in the green-tech revolution. Our
            certification program is recognized by top industrial firms
            globally.
          </p>

          <div className="space-y-4">
            {[
              {
                level: "Level 1",
                title: "Mesh Architect",
                status: "In Progress",
                progress: 65,
                url: "https://www.coursera.org/learn/iot-architecture",
              },
              {
                level: "Level 2",
                title: "Ecological Data Scientist",
                status: "Locked",
                progress: 0,
                url: "https://www.coursera.org/learn/data-science-ecology",
              },
              {
                level: "Level 3",
                title: "Industrial ESG Strategist",
                status: "Locked",
                progress: 0,
                url: "https://www.coursera.org/learn/esg-strategy",
              },
            ].map((course) => (
              <a
                key={course.title}
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center justify-between group cursor-pointer hover:border-emerald-300 hover:shadow-lg transition-all block"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                      {course.level}
                    </p>
                    <h4 className="font-bold text-nature-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                      {course.title}
                      <ExternalLink
                        size={14}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-nature-400 mb-2">
                    {course.status}
                  </p>
                  <div className="w-32 h-1.5 bg-nature-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      className="h-full bg-emerald-500"
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
        <div className="bg-nature-900 text-white p-8 rounded-[40px] shadow-xl">
          <TrendingUp size={40} className="text-emerald-400 mb-6" />
          <h4 className="text-2xl font-bold mb-4">Marketability Boost</h4>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            92% of our certified engineers report a salary increase within 6
            months. The "Internet of Nature" skill set is currently the #1 most
            requested in industrial environmental engineering.
          </p>
          <a
            href="https://www.coursera.org/courses?query=environmental%20science"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-400 transition-all text-center group"
          >
            <span className="flex items-center justify-center gap-2">
              Start Learning
              <ExternalLink
                size={16}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </span>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// Main App Component - Entry Point
export default function App() {
  const paypalOptions = {
    clientId:
      (import.meta as any).env.VITE_PAYPAL_CLIENT_ID ||
      "AcGOGDk54TJgB-LEFLnzIVNnxZiZLJHeBR1n_jsa5pyTHwrLifyjvulHwHCwSu0MXLpY92AXU0mtcl5i",
    currency: "USD",
    intent: "subscription",
    vault: true,
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PayPalScriptProvider options={paypalOptions}>
          <AppContent />
        </PayPalScriptProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const { user, profile, signOut, refreshRole, addPoints, loading } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "species"
    | "analytics"
    | "ailab"
    | "community"
    | "global"
    | "docs"
    | "developer"
    | "system"
    | "industrial"
    | "tracking"
    | "assistant"
    | "scheduler"
    | "insights"
    | "challenge"
  >("dashboard");
  const [activeSubTab, setActiveSubTab] = useState<string>("api");
  const [activeSystemTab, setActiveSystemTab] = useState<
    "pricing" | "billing" | "growth" | "updates"
  >("pricing");
  const [activeIndustrialTab, setActiveIndustrialTab] = useState<
    "esg" | "exchange" | "supply"
  >("esg");
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>("community");
  const [visibleMetrics, setVisibleMetrics] = useState([
    "moisture",
    "biodiversity",
  ]);
  const [lang, setLang] = useState("EN");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showGenieInfo, setShowGenieInfo] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // New Features Integration
  const { isDarkMode, toggle: toggleDarkMode } = useDarkMode();
  const [showTutorial, setShowTutorial] = useState(false);

  const {
    activeUsers,
    contributions,
    notifications,
    meshData,
    simulationState,
    addContribution,
    markAsRead,
    readyState,
  } = useSocket();
  const { role } = useAuth();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeAlert = notifications.find((n) => n.type === "alert" && !n.read);

  const [natureScore, setNatureScore] = useState(84);

  // Save Manager for auto-save functionality
  const saveManager = useSaveManager(
    {
      activeTab,
      visibleMetrics,
      currentPlan,
      natureScore,
      searchQuery,
    },
    {
      autoSave: true,
      autoSaveInterval: 30000,
      storageKey: "ion-app-state",
    },
  );

  // Handle search selection
  const handleSearchSelect = (result: any) => {
    console.log("Search selected:", result);
    // Navigate based on result category
    if (result.category === "sensor") {
      setActiveTab("dashboard");
    } else if (result.category === "species") {
      setActiveTab("species");
    } else if (result.category === "location") {
      setActiveTab("global");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const planId = params.get("plan") as SubscriptionPlan;

    if (paymentStatus === "success" && planId) {
      toast.success(
        `Payment successful! Your plan has been upgraded to ${planId.toUpperCase()}.`,
      );
      setCurrentPlan(planId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === "cancel") {
      toast.error("Payment was cancelled.");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const checkConfig = () => {
      const missingKeys = [];
      if (!(import.meta as any).env.VITE_PAYPAL_CLIENT_ID)
        missingKeys.push("VITE_PAYPAL_CLIENT_ID");
      if (!(import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY)
        missingKeys.push("VITE_STRIPE_PUBLISHABLE_KEY");

      if (missingKeys.length > 0) {
        console.warn(
          `Missing environment variables for payments: ${missingKeys.join(", ")}. Payments may not work correctly.`,
        );
      }
    };
    checkConfig();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNatureScore((prev) => {
        const delta = (Math.random() - 0.5) * 0.5;
        return Math.min(100, Math.max(0, Number((prev + delta).toFixed(1))));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check if user has seen the welcome video
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");

    if (!hasSeenWelcome && user) {
      // Show welcome modal for first-time visitors
      setTimeout(() => {
        setShowWelcomeModal(true);
        localStorage.setItem("hasSeenWelcome", "true");
      }, 1000); // Delay 1 second for better UX
    }
  }, [user?.uid]); // Only depend on user ID to avoid infinite loops

  const toggleMetric = (metric: string) => {
    setVisibleMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric],
    );
  };

  // AUTHENTICATION GATE - User must sign in first
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-nature-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full"
          />
          <p className="text-white text-lg font-semibold">
            Loading your ecosystem...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("AppContent: No user detected, showing auth gate");
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-800 to-nature-900 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-2xl w-full"
        >
          {/* Logo and Welcome */}
          <div className="text-center mb-12 space-y-6">
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-500 text-white rounded-[40px] flex items-center justify-center shadow-2xl mx-auto">
                <TreePine size={64} />
              </div>
            </motion.div>

            <h1 className="text-7xl font-serif font-bold text-white tracking-tight">
              Internet of Nature
            </h1>

            <p className="text-2xl text-white/90 font-medium max-w-xl mx-auto leading-relaxed">
              The World's Most Advanced Ecosystem Intelligence Platform
            </p>

            <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span>50,000+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span>50+ Countries</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <span>99.7% AI Accuracy</span>
              </div>
            </div>
          </div>

          {/* Sign In Required Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-[48px] p-12 border-2 border-white/20 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-400/20 text-yellow-300 rounded-full text-sm font-bold uppercase tracking-widest">
                <Lock size={18} />
                Authentication Required
              </div>

              <h2 className="text-4xl font-bold text-white">
                Sign In to Access the Platform
              </h2>

              <p className="text-white/80 text-lg leading-relaxed max-w-md mx-auto">
                Join thousands of scientists, developers, and conservationists
                using our platform to protect nature through technology.
              </p>

              <div className="pt-6 space-y-4">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full py-5 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-2xl font-bold text-lg hover:from-emerald-500 hover:to-green-600 transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 flex items-center justify-center gap-3"
                >
                  <User size={24} />
                  Sign In with Gmail or GitHub
                </button>

                <p className="text-white/60 text-sm">
                  ✓ Free forever plan available ✓ No credit card required ✓
                  Access in 30 seconds
                </p>
              </div>

              {/* Features Preview */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
                {[
                  { icon: Activity, label: "Real-Time Monitoring" },
                  { icon: Brain, label: "AI Intelligence" },
                  { icon: Code, label: "Developer Tools" },
                ].map((feature, i) => (
                  <div key={i} className="text-center space-y-2">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto">
                      <feature.icon size={24} className="text-emerald-300" />
                    </div>
                    <p className="text-white/70 text-xs font-medium">
                      {feature.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center space-y-4">
            <p className="text-white/60 text-sm font-medium">
              Trusted by leading organizations
            </p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              {[GlobeIcon, Shield, Factory, Cpu].map((Icon, i) => (
                <Icon key={i} size={32} className="text-white" />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  // User is authenticated - show the full dashboard
  console.log("AppContent: User authenticated:", user?.email);

  return (
    <div
      className={cn(
        isDarkMode ? "bg-nature-950 text-white" : "bg-white text-nature-900",
      )}
    >
      <AnimatePresence>
        {showWelcomeModal && (
          <WelcomeModal onClose={() => setShowWelcomeModal(false)} />
        )}
        {isUpgradeModalOpen && (
          <UpgradeModal onClose={() => setIsUpgradeModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Top Pink Bar */}
      <div className="h-14 bg-[#FFB6C1] w-full" />

      {/* Navigation */}
      <nav className="px-6 py-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-nature-900 text-white rounded-2xl flex items-center justify-center shadow-lg rotate-3">
            <TreePine size={28} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-serif text-2xl font-bold tracking-tight">
              Internet of Nature
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  readyState === WebSocket.OPEN
                    ? "bg-emerald-500"
                    : readyState === WebSocket.CONNECTING
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
              />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-nature-500">
                {readyState === WebSocket.OPEN
                  ? "Global Network Active"
                  : readyState === WebSocket.CONNECTING
                    ? "Connecting to Mesh..."
                    : "Mesh Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md relative group mx-4">
          <div
            className={cn(
              "absolute inset-0 bg-nature-100 rounded-2xl transition-all duration-300",
              isSearchFocused
                ? "scale-105 shadow-lg bg-white ring-2 ring-emerald-500/20"
                : "group-hover:bg-nature-200/50",
            )}
          />
          <div className="relative flex items-center px-4 py-3 gap-3">
            <SearchIcon
              size={18}
              className={cn(
                "transition-colors",
                isSearchFocused ? "text-emerald-500" : "text-nature-400",
              )}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search global mesh, species, or sensors..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-nature-400 font-medium text-nature-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-nature-400 hover:text-nature-900"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-[-48px] top-1/2 -translate-y-1/2 p-2 text-nature-400 hover:text-nature-900 transition-all hidden sm:block"
            title="View on GitHub"
          >
            <Github size={20} />
          </a>
          {isSearchFocused && searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-nature-100 p-4 z-[100] text-nature-900"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400 mb-3">
                Search Results
              </p>
              <div className="space-y-2">
                <div className="p-2 hover:bg-nature-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Leaf size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Central Park Forest</p>
                    <p className="text-[10px] text-nature-400">
                      Sensor Hub • Active
                    </p>
                  </div>
                </div>
                <div className="p-2 hover:bg-nature-50 rounded-xl cursor-pointer flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Bird size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Parus Major</p>
                    <p className="text-[10px] text-nature-400">
                      Species • Detected
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-sm overflow-x-auto max-w-full">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "tracking", label: "Species Tracking", icon: Bird },
            { id: "insights", label: "Pro Insights", icon: Zap },
            { id: "challenge", label: "Bio-Blitz", icon: Rocket },
            { id: "scheduler", label: "Maintenance", icon: Workflow },
            { id: "assistant", label: "Nature AI", icon: Sparkles },
            { id: "analytics", label: "Analytics", icon: Database },
            { id: "industrial", label: "Industrial", icon: Factory },
            { id: "community", label: "Community", icon: Globe },
            { id: "developer", label: "Dev Portal", icon: Code },
            { id: "system", label: "System", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-nature-900 text-white shadow-md"
                  : "text-nature-500 hover:text-nature-900 hover:bg-white/50",
              )}
            >
              <tab.icon size={18} />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user && <NotificationCenter />}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-bold text-nature-900">
                  {user.displayName || "User"}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                    {profile?.points || 0} Points
                  </span>
                  <span className="text-[10px] text-nature-300">•</span>
                  <span className="text-[10px] text-nature-400 font-medium uppercase tracking-widest">
                    {profile?.role || "Community"}
                  </span>
                </div>
              </div>
              <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-nature-100 border border-nature-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-emerald-500/20 transition-all">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-nature-600" />
                  )}
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 glass rounded-2xl shadow-2xl border border-nature-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-nature-50 rounded-xl text-sm font-bold text-nature-600 transition-colors"
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    onClick={() => setIsConfigOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-nature-50 rounded-xl text-sm font-bold text-nature-600 transition-colors"
                  >
                    <Settings size={16} /> Settings
                  </button>
                  {profile?.role !== "pro" && profile?.role !== "admin" && (
                    <button
                      onClick={() => setIsUpgradeModalOpen(true)}
                      className="w-full flex items-center gap-3 px-4 py-2 bg-amber-50 hover:bg-amber-100 rounded-xl text-sm font-bold text-amber-600 transition-colors"
                    >
                      <Zap size={16} /> Upgrade to Pro
                    </button>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 rounded-xl text-sm font-bold text-red-600 transition-colors"
                  >
                    <RefreshCw size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-nature-200 text-nature-600 rounded-xl font-bold text-xs hover:bg-nature-50 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-6 py-2 bg-nature-900 text-white rounded-xl font-bold text-sm hover:bg-nature-800 transition-all shadow-lg shadow-nature-900/20"
              >
                Sign In
              </button>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-nature-900 text-white rounded-2xl shadow-lg relative overflow-hidden">
            <motion.div
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-500"
            />
            <div className="relative flex flex-col items-start z-10">
              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">
                Nature Score
              </span>
              <span className="text-lg font-bold leading-none">
                {natureScore}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center relative z-10">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-500/20"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * natureScore) / 100}
                  className="text-emerald-500 transition-all duration-1000"
                />
              </svg>
              <TreePine size={14} className="absolute text-emerald-400" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {activeUsers} SCIENTISTS ONLINE
          </div>
          <div className="hidden xl:block">
            <GlobalLiveCounter />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-nature-400 hover:text-nature-900 transition-all relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full border-2 border-white" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-nature-100 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-nature-50 flex justify-between items-center">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() =>
                            notifications.forEach(
                              (n) => !n.read && markAsRead(n.id),
                            )
                          }
                          className="text-[10px] text-emerald-600 font-bold hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                      <span className="text-[10px] bg-nature-100 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={cn(
                            "p-4 border-b border-nature-50 hover:bg-nature-50 transition-all cursor-pointer flex gap-3",
                            !n.read && "bg-emerald-50/30",
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                              n.type === "ai"
                                ? "bg-purple-100 text-purple-600"
                                : n.type === "alert"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-blue-100 text-blue-600",
                            )}
                          >
                            {n.type === "ai" ? (
                              <Sparkles size={14} />
                            ) : n.type === "alert" ? (
                              <AlertTriangle size={14} />
                            ) : (
                              <Info size={14} />
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-nature-900 leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-nature-400 font-bold uppercase">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-nature-400 italic text-xs">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex bg-nature-100 rounded-full p-1">
            <button
              onClick={() => toggleDarkMode()}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isDarkMode
                  ? "bg-nature-900 text-white"
                  : "text-nature-400 hover:text-nature-600",
              )}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Moon size={14} /> : <SunIcon size={14} />}
            </button>
          </div>
          <div className="flex bg-nature-100 rounded-full p-1">
            {["EN", "ES", "FR", "SW"].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "w-8 h-8 rounded-full text-[10px] font-bold transition-all",
                  lang === l
                    ? "bg-white text-nature-900 shadow-sm"
                    : "text-nature-400 hover:text-nature-600",
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              const url = window.location.href;
              navigator.clipboard.writeText(url);
              alert(
                "System Access Link copied to clipboard. Share this to showcase your work!",
              );
            }}
            className="p-2.5 text-nature-400 hover:text-nature-900 transition-all hover:bg-nature-50 rounded-full"
            title="Share System Access"
          >
            <Share2 size={20} />
          </button>
          <div className="relative group">
            <button className="w-10 h-10 rounded-full bg-nature-100 flex items-center justify-center text-nature-600 hover:bg-nature-200 transition-all">
              <User size={20} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-nature-100 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-nature-900">
              <div className="p-3 border-b border-nature-50">
                <p className="text-xs font-bold">Erik Scientist</p>
                <p className="text-[10px] text-nature-400">
                  Lead Protocol Engineer
                </p>
              </div>
              <button className="w-full text-left p-2 hover:bg-nature-50 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                <Settings size={14} /> Settings
              </button>
              <button className="w-full text-left p-2 hover:bg-nature-50 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-red-600">
                <RefreshCw size={14} /> Logout
              </button>
            </div>
          </div>
          <button className="bg-nature-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-nature-800 transition-all shadow-lg shadow-nature-900/10 hidden sm:block">
            Connect Sensor
          </button>
        </div>
      </nav>

      <main className="px-6 max-w-7xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* AI Insight Banner */}
              {notifications.filter((n) => n.type === "ai" && !n.read).length >
                0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-purple-900 text-white p-6 rounded-[32px] flex items-center gap-6 shadow-xl relative overflow-hidden group cursor-pointer"
                  onClick={() => {
                    const latestAi = notifications.find(
                      (n) => n.type === "ai" && !n.read,
                    );
                    if (latestAi) {
                      if (latestAi.target) setActiveTab(latestAi.target);
                      markAsRead(latestAi.id);
                    }
                  }}
                >
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Sparkles size={24} className="text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
                      Live AI Insight
                    </p>
                    <p className="text-lg font-medium leading-tight">
                      {
                        notifications.find((n) => n.type === "ai" && !n.read)
                          ?.message
                      }
                    </p>
                  </div>
                  <ChevronRight
                    size={24}
                    className="text-white/30 group-hover:translate-x-2 transition-transform"
                  />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all duration-700" />
                </motion.div>
              )}

              {/* Dashboard Expansion: Real-time Data Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bento-card">
                  <PollinatorActivity activeTab={activeTab} />
                </div>
                <div className="bento-card">
                  <CarbonForecast activeTab={activeTab} />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bento-card">
                  <IndustrialESGChart activeTab={activeTab} />
                </div>
                <div className="bento-card">
                  <RestorationGoal />
                </div>
              </div>

              {/* Industrial Advancements & Evolution */}
              <SystemEvolution onNavigate={setActiveTab} />
              <IndustrialAdvancement onNavigate={setActiveTab} />

              {/* Project Genie Hero - ENLARGED */}
              <div className="relative w-full bg-black rounded-[64px] overflow-hidden flex flex-col items-center justify-center text-center py-48 px-8 min-h-[900px] shadow-2xl group">
                {/* Video Background */}
                <div className="absolute inset-0 z-0 opacity-70 group-hover:opacity-90 transition-opacity duration-1000">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-[20s]"
                  >
                    <source
                      src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4"
                      type="video/mp4"
                    />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/90" />
                </div>

                {/* Advanced Tech Overlay */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 60,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full border border-white/5 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute -bottom-1/2 -right-1/2 w-full h-full border border-white/5 rounded-full"
                  />

                  {/* Floating particles */}
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0.3, 0.8, 0.3],
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative z-20 flex flex-col items-center gap-16 max-w-7xl">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-4 px-8 py-4 bg-white/10 rounded-full border border-white/20 backdrop-blur-xl shadow-2xl"
                  >
                    <Sparkles
                      size={24}
                      className="text-emerald-400 animate-pulse"
                    />
                    <span className="text-base font-bold uppercase tracking-[0.3em] text-white">
                      Next-Gen Ecological Engine
                    </span>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                  >
                    <h2 className="text-9xl md:text-[14rem] lg:text-[16rem] font-bold text-white tracking-tighter leading-none drop-shadow-2xl">
                      Project{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500 animate-gradient">
                        Genie
                      </span>
                    </h2>
                    <p className="text-white/70 text-2xl md:text-3xl lg:text-4xl font-medium tracking-widest uppercase drop-shadow-lg">
                      The Autonomous Restoration Protocol
                    </p>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/90 text-2xl md:text-3xl lg:text-4xl font-medium max-w-5xl leading-relaxed drop-shadow-lg"
                  >
                    Harnessing global mesh intelligence to simulate, predict,
                    and automate the restoration of complex ecosystems at
                    industrial scale.
                  </motion.p>

                  <div className="flex flex-col sm:flex-row items-center gap-8 mt-8">
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 80px rgba(255,255,255,0.5)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowGenieInfo(true)}
                      className="bg-white text-black px-20 py-8 rounded-full font-bold text-3xl hover:scale-105 transition-all shadow-[0_0_60px_rgba(255,255,255,0.4)] active:scale-95 flex items-center gap-5"
                    >
                      Initialize Protocol
                      <ArrowRightLeft size={32} />
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{
                        scale: 1.05,
                        backgroundColor: "rgba(255,255,255,0.15)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab("docs")}
                      className="px-16 py-8 rounded-full font-bold text-2xl text-white border-2 border-white/30 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
                    >
                      Technical Whitepaper
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Full Information Section (Modal-like) */}
              <AnimatePresence>
                {showGenieInfo && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12"
                  >
                    <div
                      className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                      onClick={() => setShowGenieInfo(false)}
                    />
                    <div className="relative w-full max-w-5xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[80vh]">
                      <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                        <img
                          src="https://picsum.photos/seed/genie-info/1200/1200"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                          <h3 className="text-white text-4xl font-bold">
                            The Future of <br />
                            Ecological Creation
                          </h3>
                        </div>
                      </div>
                      <div className="flex-1 p-8 md:p-12 overflow-y-auto space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <span className="px-3 py-1 bg-nature-100 text-nature-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Project Genie v1.0
                            </span>
                            <h4 className="text-3xl font-bold">
                              Infinite Worlds, Real Impact
                            </h4>
                          </div>
                          <button
                            onClick={() => setShowGenieInfo(false)}
                            className="p-2 hover:bg-nature-100 rounded-full transition-colors"
                          >
                            <ChevronRight className="rotate-180" size={24} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="w-12 h-12 bg-nature-900 text-white rounded-xl flex items-center justify-center">
                              <Zap size={24} />
                            </div>
                            <h5 className="font-bold text-lg">
                              Real-time Generation
                            </h5>
                            <p className="text-nature-500 text-sm leading-relaxed">
                              Project Genie uses advanced neural networks to
                              generate ecological simulations in real-time,
                              allowing researchers to visualize the long-term
                              impact of urban planning.
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                              <Leaf size={24} />
                            </div>
                            <h5 className="font-bold text-lg">
                              Biodiversity Mapping
                            </h5>
                            <p className="text-nature-500 text-sm leading-relaxed">
                              By integrating with our global sensor network,
                              Genie can simulate how new species introductions
                              will affect existing local ecosystems.
                            </p>
                          </div>
                        </div>

                        <div className="bg-nature-50 p-6 rounded-3xl border border-nature-100">
                          <h5 className="font-bold mb-4 flex items-center gap-2">
                            <Factory size={18} className="text-orange-600" />
                            Industrial Case Studies
                          </h5>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-nature-100">
                              <span className="text-xs font-medium">
                                Urban Logistics Hub - Singapore
                              </span>
                              <button className="text-[10px] font-bold text-emerald-600 uppercase">
                                View Report
                              </button>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-nature-100">
                              <span className="text-xs font-medium">
                                Steel Manufacturing - Germany
                              </span>
                              <button className="text-[10px] font-bold text-emerald-600 uppercase">
                                View Report
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-nature-50 p-6 rounded-3xl border border-nature-100">
                          <h5 className="font-bold mb-4 flex items-center gap-2">
                            <Info size={18} className="text-nature-600" />
                            Technical Specifications
                          </h5>
                          <ul className="space-y-3 text-sm text-nature-600">
                            <li className="flex justify-between border-bottom border-nature-100 pb-2">
                              <span>Model Architecture</span>
                              <span className="font-mono font-bold">
                                Genie-V3-Alpha
                              </span>
                            </li>
                            <li className="flex justify-between border-bottom border-nature-100 pb-2">
                              <span>Simulation Depth</span>
                              <span className="font-mono font-bold">
                                100+ Years
                              </span>
                            </li>
                            <li className="flex justify-between">
                              <span>Data Sources</span>
                              <span className="font-mono font-bold">
                                Global IoT Mesh
                              </span>
                            </li>
                          </ul>
                        </div>

                        <button
                          onClick={() => {
                            setActiveTab("ailab");
                            setShowGenieInfo(false);
                          }}
                          className="w-full bg-nature-900 text-white py-4 rounded-2xl font-bold hover:bg-nature-800 transition-all"
                        >
                          Request Early Access
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Ecosystem Map - Prominent Position */}
                  <MapPreview />

                  <div className="glass p-8 rounded-[40px] relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-nature-100 text-nature-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Site: Central Park
                        </span>
                        <span className="text-nature-400 text-xs">•</span>
                        <span className="text-nature-500 text-xs font-medium">
                          Updated March 3, 2026
                        </span>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-5xl font-bold leading-tight">
                          Urban Forest <br />
                          Health Status
                        </h2>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              alert("Exporting Ecological Report (PDF)...");
                            }}
                            className="bg-white text-nature-900 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-nature-50 transition-all border border-nature-200"
                          >
                            <Download size={18} className="text-nature-600" />
                            Export Report
                          </button>
                          <button
                            onClick={() => {
                              setActiveTab("ailab");
                            }}
                            className="self-start md:self-center bg-nature-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-nature-800 transition-all shadow-lg"
                          >
                            <Sparkles size={18} className="text-emerald-400" />
                            Generate AI Health Report
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
                        {MOCK_SENSORS.map((s) => (
                          <SensorCard
                            key={s.id}
                            sensor={s}
                            onNavigate={setActiveTab}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-nature-200/50 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-nature-300/30 rounded-full blur-3xl" />
                  </div>

                  <div className="glass p-8 rounded-[40px]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                      <div>
                        <h3 className="text-2xl font-bold">
                          Ecological Trends
                        </h3>
                        <p className="text-nature-500 text-sm">
                          Historical sensor data over 24 hours
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleMetric("moisture")}
                          className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                            visibleMetrics.includes("moisture")
                              ? "bg-blue-50 text-blue-600 border-blue-200"
                              : "bg-white text-nature-400 border-nature-100",
                          )}
                        >
                          Soil Moisture
                        </button>
                        <button
                          onClick={() => toggleMetric("biodiversity")}
                          className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                            visibleMetrics.includes("biodiversity")
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-white text-nature-400 border-nature-100",
                          )}
                        >
                          Biodiversity
                        </button>
                        <div className="w-px h-8 bg-nature-100 mx-2 hidden md:block" />
                        <button className="px-4 py-2 bg-nature-100 rounded-full text-xs font-bold">
                          24H
                        </button>
                        <button className="px-4 py-2 hover:bg-nature-100 rounded-full text-xs font-bold text-nature-400">
                          7D
                        </button>
                      </div>
                    </div>

                    <div className="relative h-[300px] min-h-[300px] w-full overflow-hidden">
                      <ResponsiveContainer
                        key={activeTab}
                        width="100%"
                        height="100%"
                        minWidth={0}
                        minHeight={0}
                        debounce={50}
                      >
                        <AreaChart data={MOCK_HISTORY}>
                          <defs>
                            <linearGradient
                              id="colorMoisture"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#3b82f6"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#3b82f6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorBio"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#10b981"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#10b981"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e5e7eb"
                          />
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "#9ca3af" }}
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: "16px",
                              border: "none",
                              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            }}
                          />
                          {visibleMetrics.includes("moisture") && (
                            <Area
                              type="monotone"
                              dataKey="moisture"
                              stroke="#3b82f6"
                              fillOpacity={1}
                              fill="url(#colorMoisture)"
                              strokeWidth={3}
                            />
                          )}
                          {visibleMetrics.includes("biodiversity") && (
                            <Area
                              type="monotone"
                              dataKey="biodiversity"
                              stroke="#10b981"
                              fillOpacity={1}
                              fill="url(#colorBio)"
                              strokeWidth={3}
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <LiveDataStream activeTab={activeTab} />
                </div>

                <div className="space-y-8">
                  <MonetizationCard onNavigate={setActiveTab} />
                  <SpeciesSpotlight />
                  <MeshStatus data={meshData} />
                  <RestorationGoal />
                  <Paywall
                    currentPlan={currentPlan}
                    onUpgrade={() => {
                      setActiveTab("system");
                      setActiveSystemTab("pricing");
                    }}
                  >
                    <NatureChat />
                  </Paywall>
                </div>
              </div>

              {/* Live Nature Ticker */}
              <div className="mt-12 bg-nature-900 text-white py-4 overflow-hidden rounded-[32px] relative group">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-nature-900 to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-nature-900 to-transparent z-10" />
                <motion.div
                  animate={{ x: [0, -1000] }}
                  transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="flex items-center gap-12 whitespace-nowrap px-12"
                >
                  {[
                    "NEW SPECIES DETECTED: PARUS MAJOR IN SECTOR 4",
                    "MOISTURE LEVELS OPTIMAL ACROSS ALL URBAN CANOPIES",
                    "AIR QUALITY INDEX IMPROVED BY 12% IN LAST 24H",
                    "POLLINATOR ACTIVITY PEAKING IN CENTRAL PARK",
                    "SOIL MICROBIOME HEALTH SCORE: 94/100",
                    "CARBON SEQUESTRATION RATE: +4.2 TONS/YR",
                    "ACOUSTIC BIODIVERSITY INDEX: 7.8 (STABLE)",
                    "NEW COMMUNITY CONTRIBUTION FROM SCIENTIST @ERIK",
                  ].map((news, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {news}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <CompetitiveAdvantagesSection
                onNavigate={(tab, systemTab) => {
                  setActiveTab(tab as any);
                  if (systemTab) setActiveSystemTab(systemTab as any);
                }}
              />
              <RecognitionSection />
            </motion.div>
          )}

          {activeTab === "species" && (
            <motion.div
              key="species"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Paywall
                currentPlan={currentPlan}
                onUpgrade={() => {
                  setActiveTab("system");
                  setActiveSystemTab("pricing");
                }}
              >
                <SpeciesIDTool />
              </Paywall>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <a
                  href="https://www.gbif.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass p-8 rounded-[40px] flex flex-col justify-center items-center text-center space-y-4 hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Database size={32} />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-emerald-600 transition-colors">
                    Global Species Database
                  </h3>
                  <p className="text-nature-500 text-sm max-w-xs">
                    Our AI is trained on over 2.5 million species records to
                    provide accurate urban taxonomy.
                  </p>
                  <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
                    View Catalog
                    <ExternalLink size={14} />
                  </span>
                </a>
                <a
                  href="https://www.inaturalist.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass p-8 rounded-[40px] flex flex-col justify-center items-center text-center space-y-4 hover:shadow-2xl transition-all group cursor-pointer"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye size={32} />
                  </div>
                  <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">
                    Visual Recognition
                  </h3>
                  <p className="text-nature-500 text-sm max-w-xs">
                    Real-time computer vision identifies health markers,
                    diseases, and growth stages.
                  </p>
                  <span className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-2">
                    Learn More
                    <ExternalLink size={14} />
                  </span>
                </a>
              </div>
            </motion.div>
          )}

          {activeTab === "community" && (
            <motion.div
              key="community"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <CommunityHub
                contributions={contributions}
                onContribute={addContribution}
              />

              {/* Ecosystem Map Section - Separated for Clarity */}
              <div className="my-16">
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-blue-100 text-blue-700 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg mb-4"
                  >
                    <Globe size={18} />
                    Global Ecosystem Map
                  </motion.div>
                  <h2 className="text-5xl font-bold text-nature-900 mb-4">
                    Real-Time Biodiversity Heatmap
                  </h2>
                  <p className="text-nature-600 text-xl max-w-3xl mx-auto">
                    Visualize global contribution density and ecosystem health
                    across the planet. Interactive map showing real-time sensor
                    data and restoration projects.
                  </p>
                </div>

                <div className="glass p-8 rounded-[40px] relative overflow-hidden w-full shadow-2xl border-2 border-blue-100">
                  <Paywall
                    currentPlan={currentPlan}
                    onUpgrade={() => {
                      setActiveTab("system");
                      setActiveSystemTab("pricing");
                    }}
                  >
                    <BiodiversityHeatmap />
                  </Paywall>
                </div>

                {/* Map Legend and Info */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
                      <h4 className="font-bold text-nature-900">
                        High Activity Zones
                      </h4>
                    </div>
                    <p className="text-sm text-nature-600">
                      Areas with active restoration projects and dense sensor
                      networks
                    </p>
                  </div>
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <h4 className="font-bold text-nature-900">
                        Monitoring Regions
                      </h4>
                    </div>
                    <p className="text-sm text-nature-600">
                      Regions with IoT sensors collecting real-time
                      environmental data
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <h4 className="font-bold text-nature-900">
                        Priority Areas
                      </h4>
                    </div>
                    <p className="text-sm text-nature-600">
                      Critical ecosystems requiring immediate conservation
                      efforts
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-3">
                    <RestorationLeaderboard />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "global" && (
            <motion.div
              key="global"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlobalNetwork />
            </motion.div>
          )}

          {activeTab === "industrial" && (
            <motion.div
              key="industrial"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <IndustrialDashboard />
                  <IndustryStrategy meshData={meshData} />
                </div>
                <div className="space-y-8">
                  <MeshStatus data={meshData} />
                  <div className="glass p-8 rounded-[40px] bg-blue-900 text-white space-y-6">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-blue-400" size={32} />
                      <h4 className="text-xl font-bold">Compliance Engine</h4>
                    </div>
                    <p className="text-sm text-blue-100/80">
                      Your facility is currently 88% compliant with the 2026
                      Global Canopy Accord. 12% improvement required in Sector
                      7G.
                    </p>
                    <button className="w-full py-4 bg-white text-blue-900 rounded-2xl font-bold hover:bg-blue-50 transition-all">
                      View Compliance Audit
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "system" && (
            <motion.div
              key="system"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SystemPortal
                activeTab={activeSystemTab}
                onTabChange={setActiveSystemTab}
                currentPlan={currentPlan}
                onPlanChange={setCurrentPlan}
              />
            </motion.div>
          )}

          {activeTab === "developer" && (
            <motion.div
              key="developer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DeveloperPortal />
            </motion.div>
          )}

          {activeTab === "docs" && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="glass p-12 rounded-[40px] space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <h2 className="text-5xl font-bold tracking-tight">
                      System Documentation
                    </h2>
                    <p className="text-nature-500 text-lg">
                      Comprehensive guide to Project Genie and the Internet of
                      Nature API
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-nature-100 text-nature-900 rounded-xl text-sm font-bold flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      API Status: Operational
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <a
                    href="https://www.postman.com/api-platform/api-documentation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="space-y-6 p-6 rounded-3xl hover:bg-white/50 transition-all group cursor-pointer border-2 border-transparent hover:border-nature-200"
                  >
                    <div className="w-14 h-14 bg-nature-900 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Key size={28} />
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-nature-900 transition-colors">
                      API Manager
                    </h3>
                    <p className="text-nature-500 text-sm leading-relaxed">
                      Manage your access keys and configure the system's neural
                      engine. Our API Manager handles secure key generation and
                      rotation.
                    </p>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-nature-400 rounded-full" />
                        Secure Key Storage
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-nature-400 rounded-full" />
                        Usage Analytics
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-nature-400 rounded-full" />
                        Rate Limit Monitoring
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 text-nature-600 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      View API Docs
                      <ExternalLink size={14} />
                    </div>
                  </a>

                  <a
                    href="https://www.nature.com/subjects/ecology"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="space-y-6 p-6 rounded-3xl hover:bg-white/50 transition-all group cursor-pointer border-2 border-transparent hover:border-emerald-200"
                  >
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Cpu size={28} />
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-emerald-600 transition-colors">
                      Project Genie Core
                    </h3>
                    <p className="text-nature-500 text-sm leading-relaxed">
                      The core engine responsible for real-time ecological
                      simulations and predictive modeling of urban forests.
                    </p>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Neural Simulation
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Biodiversity Indexing
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                        Climate Impact Forecasting
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn More
                      <ExternalLink size={14} />
                    </div>
                  </a>

                  <a
                    href="https://www.iotforall.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="space-y-6 p-6 rounded-3xl hover:bg-white/50 transition-all group cursor-pointer border-2 border-transparent hover:border-blue-200"
                  >
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Wifi size={28} />
                    </div>
                    <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                      IoT Mesh Network
                    </h3>
                    <p className="text-nature-500 text-sm leading-relaxed">
                      Our global network of sensors provides the raw data that
                      fuels the Genie engine. Real-time telemetry from across
                      the globe.
                    </p>
                    <ul className="space-y-3 text-sm font-medium">
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Low-Latency Streaming
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Edge Computing
                      </li>
                      <li className="flex items-center gap-2 text-nature-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        Global Data Sync
                      </li>
                    </ul>
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore Network
                      <ExternalLink size={14} />
                    </div>
                  </a>
                </div>

                <div className="bg-nature-50 p-8 rounded-[32px] border border-nature-100">
                  <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Code size={20} className="text-nature-600" />
                    Quick Integration Guide
                  </h4>
                  <div className="bg-nature-950 p-6 rounded-2xl font-mono text-sm text-emerald-400 overflow-x-auto">
                    <pre>
                      {`// Initialize Project Genie SDK
const genie = new ProjectGenie({
  apiKey: process.env.GENIE_API_KEY,
  region: 'global-mesh'
});

// Start real-time simulation
await genie.simulate({
  siteId: 'central-park-01',
  duration: '100y',
  parameters: ['biodiversity', 'carbon-offset']
});`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass p-8 rounded-[32px] space-y-4">
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      <ShieldCheck size={20} className="text-emerald-600" />
                      Legal & Privacy
                    </h4>
                    <div className="space-y-4 text-sm text-nature-500 leading-relaxed">
                      <p>
                        <strong>Privacy Policy:</strong> We prioritize your data
                        sovereignty. All environmental data is anonymized before
                        global aggregation. We do not sell sensor data to third
                        parties.
                      </p>
                      <p>
                        <strong>Terms of Service:</strong> By using the Internet
                        of Nature network, you agree to contribute to the global
                        open-data initiative for ecological restoration.
                      </p>
                    </div>
                  </div>
                  <div className="glass p-8 rounded-[32px] space-y-4">
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      <HelpCircle size={20} className="text-blue-600" />
                      Global Support
                    </h4>
                    <div className="space-y-4 text-sm text-nature-500 leading-relaxed">
                      <p>
                        Our support team is available 24/7 across all timezones.
                        For industrial integration support, please contact our
                        enterprise division.
                      </p>
                      <div className="flex gap-4">
                        <a
                          href="mailto:support@internetofnature.org"
                          className="px-4 py-2 bg-nature-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-nature-800 transition-all"
                        >
                          Contact Support
                        </a>
                        <a
                          href="https://stackoverflow.com/questions/tagged/iot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-nature-100 text-nature-900 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-nature-200 transition-all"
                        >
                          Community Forum
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Resources Section */}
                <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-10 rounded-[40px] border border-emerald-100 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-bold flex items-center gap-3">
                      <BookOpen size={24} className="text-emerald-600" />
                      Advanced Resources
                    </h4>
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                      Internet of Nature
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <a
                      href="https://www.unep.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-6 rounded-2xl hover:shadow-xl transition-all group cursor-pointer border-2 border-transparent hover:border-emerald-200"
                    >
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Globe size={20} />
                      </div>
                      <h5 className="font-bold text-sm mb-2 group-hover:text-emerald-600 transition-colors">
                        Ecosystem Research
                      </h5>
                      <p className="text-xs text-nature-500 mb-3">
                        Latest biodiversity and ecosystem studies
                      </p>
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        Explore <ExternalLink size={12} />
                      </div>
                    </a>

                    <a
                      href="https://www.iotforall.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-6 rounded-2xl hover:shadow-xl transition-all group cursor-pointer border-2 border-transparent hover:border-blue-200"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Wifi size={20} />
                      </div>
                      <h5 className="font-bold text-sm mb-2 group-hover:text-blue-600 transition-colors">
                        IoT Technology
                      </h5>
                      <p className="text-xs text-nature-500 mb-3">
                        Understanding sensor networks and mesh systems
                      </p>
                      <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">
                        Learn <ExternalLink size={12} />
                      </div>
                    </a>

                    <a
                      href="https://www.nature.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-6 rounded-2xl hover:shadow-xl transition-all group cursor-pointer border-2 border-transparent hover:border-orange-200"
                    >
                      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <TrendingUp size={20} />
                      </div>
                      <h5 className="font-bold text-sm mb-2 group-hover:text-orange-600 transition-colors">
                        Climate Science
                      </h5>
                      <p className="text-xs text-nature-500 mb-3">
                        Climate modeling and impact forecasting
                      </p>
                      <div className="flex items-center gap-1 text-orange-600 text-xs font-bold">
                        Read <ExternalLink size={12} />
                      </div>
                    </a>

                    <a
                      href="https://www.gbif.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white p-6 rounded-2xl hover:shadow-xl transition-all group cursor-pointer border-2 border-transparent hover:border-purple-200"
                    >
                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Database size={20} />
                      </div>
                      <h5 className="font-bold text-sm mb-2 group-hover:text-purple-600 transition-colors">
                        Species Database
                      </h5>
                      <p className="text-xs text-nature-500 mb-3">
                        Global biodiversity information facility
                      </p>
                      <div className="flex items-center gap-1 text-purple-600 text-xs font-bold">
                        Access <ExternalLink size={12} />
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HelpCenter />
                <div className="space-y-8">
                  <APIKeyManager user={user} />
                  <FeedbackForm user={user} />
                </div>
              </div>
            </motion.div>
          )}
          {activeTab === "tracking" && (
            <motion.div
              key="tracking"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SpeciesTracking />
            </motion.div>
          )}

          {activeTab === "scheduler" && (
            <motion.div
              key="scheduler"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <MaintenanceScheduler />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[40px] bg-nature-900 text-white space-y-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Bell size={24} className="text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold">
                    Scheduling Notifications
                  </h4>
                  <p className="text-white/60 text-sm">
                    Receive real-time alerts for upcoming maintenance tasks and
                    sensor calibration deadlines.
                  </p>
                  <button className="px-6 py-3 bg-white text-nature-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-50 transition-all">
                    Configure Alerts
                  </button>
                </div>
                <div className="glass p-8 rounded-[40px] border border-nature-100 space-y-4">
                  <div className="w-12 h-12 bg-nature-100 rounded-2xl flex items-center justify-center">
                    <Calendar size={24} className="text-nature-900" />
                  </div>
                  <h4 className="text-xl font-bold">Visual Timeline</h4>
                  <p className="text-nature-500 text-sm">
                    View all scheduled activities on a unified ecological
                    timeline to optimize resource allocation.
                  </p>
                  <button className="px-6 py-3 bg-nature-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-800 transition-all">
                    Open Timeline
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProtectedRoute requirePro>
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-serif font-bold tracking-tight">
                        Pro Insights
                      </h2>
                      <p className="text-nature-500">
                        Advanced ecosystem intelligence for your precise
                        location.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-nature-100 text-nature-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-200 transition-all">
                        Export Data
                      </button>
                      <button className="px-4 py-2 bg-nature-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-800 transition-all">
                        Refresh Analysis
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass p-8 rounded-[40px] space-y-6">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Droplets size={24} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold">
                          Soil Health Diagnostics
                        </h4>
                        <p className="text-nature-500 text-sm">
                          Real-time analysis of nutrient levels and fungal
                          connectivity in your immediate area.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-nature-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-nature-400">
                            Nitrogen Level
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            Optimal
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-nature-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[78%]" />
                        </div>
                      </div>
                    </div>

                    <div className="glass p-8 rounded-[40px] space-y-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Bug size={24} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold">
                          Pollinator Activity
                        </h4>
                        <p className="text-nature-500 text-sm">
                          Acoustic detection of bee and butterfly frequency
                          within a 500m radius.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-nature-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-nature-400">
                            Activity Level
                          </span>
                          <span className="text-xs font-bold text-amber-600">
                            High
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-nature-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 w-[85%]" />
                        </div>
                      </div>
                    </div>

                    <div className="glass p-8 rounded-[40px] space-y-6">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Wind size={24} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xl font-bold">
                          Hyper-local Air Quality
                        </h4>
                        <p className="text-nature-500 text-sm">
                          Precise particulate matter and oxygen production data
                          from the nearest mesh node.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-nature-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-nature-400">
                            AQI Index
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            12 (Excellent)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-nature-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[12%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-10 rounded-[48px] overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 -skew-x-12 translate-x-1/4" />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          <ShieldCheck size={12} /> Invasive Species Alert
                        </div>
                        <h3 className="text-3xl font-bold">
                          Japanese Knotweed Detected
                        </h3>
                        <p className="text-nature-600 leading-relaxed">
                          Our AI has identified a potential growth of Japanese
                          Knotweed approximately 2.4km from your location. Early
                          intervention is recommended to protect local
                          biodiversity.
                        </p>
                        <div className="flex gap-4">
                          <button className="px-6 py-3 bg-nature-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-800 transition-all">
                            View on Map
                          </button>
                          <button className="px-6 py-3 bg-white border border-nature-200 text-nature-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-50 transition-all">
                            Report Sighting
                          </button>
                        </div>
                      </div>
                      <div className="aspect-video bg-nature-100 rounded-3xl overflow-hidden shadow-2xl">
                        <img
                          src="https://picsum.photos/seed/knotweed/800/600"
                          alt="Invasive species"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            </motion.div>
          )}

          {activeTab === "challenge" && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ProtectedRoute>
                <div className="space-y-12">
                  <div className="text-center space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
                      <Rocket size={16} /> Active Challenge
                    </div>
                    <h2 className="text-5xl font-serif font-bold tracking-tight">
                      The Urban Bio-Blitz
                    </h2>
                    <p className="text-nature-500 text-lg">
                      Join the global mission to document 1,000 unique species
                      in our city within 30 days. Every discovery counts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="glass p-10 rounded-[48px] bg-nature-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 space-y-8">
                          <div className="flex justify-between items-center">
                            <div className="space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                                Collective Progress
                              </p>
                              <h3 className="text-4xl font-bold">
                                742 / 1,000
                              </h3>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                                Time Remaining
                              </p>
                              <h3 className="text-2xl font-bold">12 Days</h3>
                            </div>
                          </div>
                          <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "74.2%" }}
                              className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-8 pt-4">
                            <div className="space-y-1">
                              <p className="text-2xl font-bold">142</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                                Participants
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold">58</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                                Rare Species
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold">12k</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-nature-400">
                                Points Earned
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-2xl font-bold">
                          Your Contributions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="glass p-6 rounded-[32px] flex items-center gap-6">
                            <div className="w-16 h-16 bg-nature-100 rounded-2xl flex items-center justify-center text-nature-900">
                              <Camera size={32} />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">
                                {profile?.discoveries?.length || 0}
                              </p>
                              <p className="text-xs text-nature-500 font-bold uppercase tracking-widest">
                                Discoveries
                              </p>
                            </div>
                          </div>
                          <div className="glass p-6 rounded-[32px] flex items-center gap-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                              <Zap size={32} />
                            </div>
                            <div>
                              <p className="text-2xl font-bold">
                                {profile?.points || 0}
                              </p>
                              <p className="text-xs text-nature-500 font-bold uppercase tracking-widest">
                                Points
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab("tracking")}
                          className="w-full py-6 bg-nature-900 text-white rounded-[32px] font-bold text-xl hover:bg-nature-800 transition-all shadow-2xl shadow-nature-900/20 flex items-center justify-center gap-3"
                        >
                          <Camera size={24} />
                          Identify a Species
                        </button>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="glass p-8 rounded-[40px] space-y-6">
                        <h4 className="text-xl font-bold flex items-center gap-2">
                          <TrendingUp size={20} className="text-emerald-500" />{" "}
                          Leaderboard
                        </h4>
                        <div className="space-y-4">
                          {[
                            { name: "EcoExplorer", points: 2450, avatar: "EE" },
                            { name: "NatureNerd", points: 2120, avatar: "NN" },
                            {
                              name: "GreenGuardian",
                              points: 1890,
                              avatar: "GG",
                            },
                            { name: "WildWalker", points: 1560, avatar: "WW" },
                            { name: "FloraFan", points: 1240, avatar: "FF" },
                          ].map((user, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 hover:bg-nature-50 rounded-2xl transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-nature-400 w-4">
                                  {i + 1}
                                </span>
                                <div className="w-8 h-8 bg-nature-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold">
                                  {user.avatar}
                                </div>
                                <span className="text-sm font-bold">
                                  {user.name}
                                </span>
                              </div>
                              <span className="text-sm font-bold text-emerald-600">
                                {user.points}
                              </span>
                            </div>
                          ))}
                        </div>
                        <button className="w-full py-3 bg-nature-100 text-nature-900 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-nature-200 transition-all">
                          View Full Leaderboard
                        </button>
                      </div>

                      <div className="glass p-8 rounded-[40px] bg-emerald-50 border border-emerald-100 space-y-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                          <ShieldCheck size={24} />
                        </div>
                        <h4 className="text-xl font-bold text-emerald-900">
                          Unlock Badges
                        </h4>
                        <p className="text-emerald-700 text-sm">
                          Earn the "Pollinator Expert" badge by identifying 5
                          different types of bees or butterflies this week.
                        </p>
                        <div className="flex gap-2">
                          {profile?.badges?.map((badge, i) => (
                            <div
                              key={i}
                              className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-emerald-600 shadow-sm border border-emerald-100"
                            >
                              {badge}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            </motion.div>
          )}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <NetworkTopology />
                  <MeshDataFeed data={meshData} />
                </div>
                <div className="space-y-8">
                  <PredictionDashboard activeTab={activeTab} />
                  <div className="glass p-8 rounded-[40px] space-y-4">
                    <h4 className="font-bold text-lg">Network Health</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-nature-500">Uptime</span>
                        <span className="text-xs font-bold text-emerald-600">
                          99.9%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-nature-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[99.9%]" />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-nature-500">Latency</span>
                        <span className="text-xs font-bold text-blue-600">
                          24ms
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-nature-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[15%]" />
                      </div>
                    </div>
                  </div>
                  <AcousticMonitor />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-8 rounded-[40px] space-y-4">
                  <h4 className="font-bold text-lg">Soil Microbiome</h4>
                  <p className="text-nature-500 text-xs">
                    Fungal-to-bacterial ratio analysis via underground sensor
                    network.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-nature-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[65%]" />
                    </div>
                    <span className="text-xs font-bold">65% Optimal</span>
                  </div>
                </div>
                <div className="glass p-8 rounded-[40px] space-y-4">
                  <h4 className="font-bold text-lg">Carbon Sequestration</h4>
                  <p className="text-nature-500 text-xs">
                    Estimated CO2 absorption based on leaf area index and growth
                    rates.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-nature-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[42%]" />
                    </div>
                    <span className="text-xs font-bold">4.2 Tons/yr</span>
                  </div>
                </div>
                <div className="glass p-8 rounded-[40px] space-y-4">
                  <h4 className="font-bold text-lg">Air Quality Index</h4>
                  <p className="text-nature-500 text-xs">
                    Real-time PM2.5 and NO2 levels across the urban canopy.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-nature-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[88%]" />
                    </div>
                    <span className="text-xs font-bold">88 AQI</span>
                  </div>
                </div>
                <div className="glass p-8 rounded-[40px] space-y-4">
                  <h4 className="font-bold text-lg">Pollinator Activity</h4>
                  <p className="text-nature-500 text-xs">
                    Bee and butterfly detection frequency via visual sensors.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-nature-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 w-[55%]" />
                    </div>
                    <span className="text-xs font-bold">55% Active</span>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[40px]">
                <PredictiveAnalytics activeTab={activeTab} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <CarbonForecast activeTab={activeTab} />
                </div>
                <IndustrialESGChart activeTab={activeTab} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PollinatorActivity activeTab={activeTab} />
              </div>

              <RecognitionSection />
            </motion.div>
          )}

          {activeTab === "assistant" && (
            <motion.div
              key="assistant"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <NatureAI
                activeUsers={activeUsers}
                natureScore={natureScore}
                activeAlert={activeAlert}
              />
            </motion.div>
          )}

          {activeTab === "ailab" && (
            <motion.div
              key="ailab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <AILab />
                  <RealTimeMap data={meshData} />
                </div>
                <div className="space-y-8">
                  <AIInsights data={meshData} />
                  <div className="space-y-8">
                    <SimulationControl
                      state={simulationState}
                      currentRole={profile?.role || "community"}
                    />
                    {simulationState.comparisonScenario && (
                      <ScenarioComparison
                        scenarioA={simulationState.scenario}
                        scenarioB={simulationState.comparisonScenario}
                        resultsA={simulationState.results}
                        resultsB={{
                          impact:
                            "Scenario B shows a significant improvement in biodiversity retention by optimizing pollinator pathways.",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-nature-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50 grayscale">
            <TreePine size={20} />
            <span className="font-serif font-bold text-lg">
              Internet of Nature
            </span>
          </div>
          <div className="flex gap-8 text-xs font-bold text-nature-400 uppercase tracking-widest">
            <button
              onClick={() => {
                setActiveTab("docs");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-nature-900 transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => {
                setActiveTab("docs");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-nature-900 transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => {
                setActiveTab("docs");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-nature-900 transition-colors"
            >
              API Docs
            </button>
            <button
              onClick={() => {
                setActiveTab("docs");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-nature-900 transition-colors"
            >
              Support
            </button>
          </div>
          <p className="text-xs text-nature-400">
            © 2026 Internet of Nature. Bridging bits and biology.
          </p>
        </div>
      </footer>

      <AIAgentChat
        activeUsers={activeUsers}
        natureScore={natureScore}
        activeAlert={activeAlert}
      />
      <GlobalAIChat meshData={meshData} />

      {/* Floating Back to Top Button */}
      <motion.button
        onClick={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setActiveTab("dashboard");
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:shadow-emerald-500/50 transition-all group"
        title="Back to Home"
      >
        <div className="relative">
          <ChevronRight
            size={24}
            className="rotate-[-90deg] group-hover:translate-y-[-2px] transition-transform"
          />
          <div className="absolute -top-12 right-0 bg-nature-900 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Back to Home
          </div>
        </div>
      </motion.button>

      <Toaster position="bottom-right" />
      <ConfigDialog
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
      {isProfileOpen && (
        <UserProfile
          user={user}
          onClose={() => setIsProfileOpen(false)}
          onRefreshRole={refreshRole}
        />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
