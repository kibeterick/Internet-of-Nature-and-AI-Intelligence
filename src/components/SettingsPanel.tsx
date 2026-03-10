import React, { useState } from "react";
import {
  X,
  Moon,
  Bell,
  Save,
  Globe,
  Keyboard,
  Trash2,
  RefreshCw,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DarkModeToggle from "./DarkModeToggle";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onRestartTutorial: () => void;
  onClearData: () => void;
  onExportSettings: () => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  onRestartTutorial,
  onClearData,
  onExportSettings,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "appearance" | "notifications" | "data"
  >("general");
  const [autoSave, setAutoSave] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [language, setLanguage] = useState("en");

  if (!isOpen) return null;

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "appearance", label: "Appearance", icon: Moon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data", icon: Save },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass rounded-[40px] w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex"
        >
          {/* Sidebar */}
          <div className="w-64 bg-nature-50 border-r border-nature-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-nature-900">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-nature-100 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                      activeTab === tab.id
                        ? "bg-nature-900 text-white"
                        : "hover:bg-nature-100 text-nature-700"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">General Settings</h3>
                  <p className="text-nature-600">
                    Configure your basic preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-nature-900">Auto-save</p>
                        <p className="text-sm text-nature-600">
                          Automatically save your work
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                    </label>
                  </div>

                  {autoSave && (
                    <div className="bg-white rounded-2xl p-6 border border-nature-100">
                      <label>
                        <p className="font-medium text-nature-900 mb-2">
                          Auto-save interval
                        </p>
                        <p className="text-sm text-nature-600 mb-4">
                          Save every {autoSaveInterval} seconds
                        </p>
                        <input
                          type="range"
                          min="10"
                          max="300"
                          step="10"
                          value={autoSaveInterval}
                          onChange={(e) =>
                            setAutoSaveInterval(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </label>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <label>
                      <p className="font-medium text-nature-900 mb-2">
                        Language
                      </p>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-2 bg-nature-50 border border-nature-200 rounded-xl"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="sw">Kiswahili</option>
                      </select>
                    </label>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <button
                      onClick={onRestartTutorial}
                      className="w-full flex items-center justify-between p-4 hover:bg-nature-50 rounded-xl transition-all"
                    >
                      <div className="text-left">
                        <p className="font-medium text-nature-900">
                          Restart Tutorial
                        </p>
                        <p className="text-sm text-nature-600">
                          Show the welcome tutorial again
                        </p>
                      </div>
                      <RefreshCw size={20} className="text-nature-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Appearance</h3>
                  <p className="text-nature-600">Customize how the app looks</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-nature-900">Dark Mode</p>
                        <p className="text-sm text-nature-600">
                          Use dark theme
                        </p>
                      </div>
                      <DarkModeToggle
                        isDarkMode={isDarkMode}
                        onToggle={onToggleDarkMode}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <p className="font-medium text-nature-900 mb-4">
                      Theme Preview
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white border-2 border-nature-900 rounded-xl">
                        <div className="w-full h-20 bg-gradient-to-br from-nature-100 to-nature-200 rounded-lg mb-2" />
                        <p className="text-sm font-medium">Light Theme</p>
                      </div>
                      <div className="p-4 bg-nature-900 border-2 border-nature-700 rounded-xl">
                        <div className="w-full h-20 bg-gradient-to-br from-nature-700 to-nature-800 rounded-lg mb-2" />
                        <p className="text-sm font-medium text-white">
                          Dark Theme
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Notifications</h3>
                  <p className="text-nature-600">
                    Manage your notification preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <label className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-nature-900">
                          Enable Notifications
                        </p>
                        <p className="text-sm text-nature-600">
                          Receive alerts and updates
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                    </label>
                  </div>

                  {notifications && (
                    <>
                      <div className="bg-white rounded-2xl p-6 border border-nature-100">
                        <label className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-nature-900">
                              Sound Effects
                            </p>
                            <p className="text-sm text-nature-600">
                              Play sounds for notifications
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={soundEnabled}
                            onChange={(e) => setSoundEnabled(e.target.checked)}
                            className="w-5 h-5 rounded"
                          />
                        </label>
                      </div>

                      <div className="bg-white rounded-2xl p-6 border border-nature-100">
                        <p className="font-medium text-nature-900 mb-4">
                          Notification Types
                        </p>
                        <div className="space-y-3">
                          {["Predictions", "Alerts", "Updates", "Messages"].map(
                            (type) => (
                              <label
                                key={type}
                                className="flex items-center gap-3"
                              >
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-nature-700">{type}</span>
                              </label>
                            ),
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Data Management</h3>
                  <p className="text-nature-600">
                    Manage your data and storage
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <button
                      onClick={onExportSettings}
                      className="w-full flex items-center justify-between p-4 hover:bg-nature-50 rounded-xl transition-all"
                    >
                      <div className="text-left">
                        <p className="font-medium text-nature-900">
                          Export Settings
                        </p>
                        <p className="text-sm text-nature-600">
                          Download your configuration
                        </p>
                      </div>
                      <Download size={20} className="text-nature-600" />
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-nature-100">
                    <div className="mb-4">
                      <p className="font-medium text-nature-900">
                        Storage Usage
                      </p>
                      <p className="text-sm text-nature-600">
                        Local storage used by the app
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-nature-600">Sensor Data</span>
                        <span className="font-medium">2.4 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-nature-600">Version History</span>
                        <span className="font-medium">1.2 MB</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-nature-600">Cache</span>
                        <span className="font-medium">0.8 MB</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <button
                      onClick={onClearData}
                      className="w-full flex items-center justify-between p-4 hover:bg-red-100 rounded-xl transition-all"
                    >
                      <div className="text-left">
                        <p className="font-medium text-red-900">
                          Clear All Data
                        </p>
                        <p className="text-sm text-red-700">
                          Remove all local data and reset app
                        </p>
                      </div>
                      <Trash2 size={20} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
