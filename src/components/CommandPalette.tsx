import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Command,
  Zap,
  Settings,
  FileText,
  Download,
  Sparkles,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export default function CommandPalette({
  isOpen,
  onClose,
  commands,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter((cmd) => {
    const searchText =
      `${cmd.label} ${cmd.description} ${cmd.keywords?.join(" ")}`.toLowerCase();
    return searchText.includes(query.toLowerCase());
  });

  const categories = [...new Set(filteredCommands.map((cmd) => cmd.category))];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, filteredCommands.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="glass rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-4 border-b border-nature-100 flex items-center gap-3">
            <Command size={20} className="text-nature-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent border-none outline-none text-lg text-nature-900 placeholder-nature-400"
            />
            <kbd className="px-2 py-1 bg-nature-100 rounded text-xs text-nature-600">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center">
                <Search size={48} className="mx-auto text-nature-300 mb-4" />
                <p className="text-nature-600">No commands found</p>
                <p className="text-sm text-nature-500 mt-2">
                  Try different keywords
                </p>
              </div>
            ) : (
              categories.map((category) => {
                const categoryCommands = filteredCommands.filter(
                  (cmd) => cmd.category === category,
                );
                if (categoryCommands.length === 0) return null;

                return (
                  <div key={category} className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-bold text-nature-600 uppercase tracking-wider">
                      {category}
                    </h3>
                    {categoryCommands.map((cmd, index) => {
                      const globalIndex = filteredCommands.indexOf(cmd);
                      const Icon = cmd.icon;

                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                            globalIndex === selectedIndex
                              ? "bg-nature-900 text-white"
                              : "hover:bg-nature-50 text-nature-900"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              globalIndex === selectedIndex
                                ? "bg-white/20"
                                : "bg-nature-100"
                            }`}
                          >
                            <Icon
                              size={18}
                              className={
                                globalIndex === selectedIndex
                                  ? "text-white"
                                  : "text-nature-700"
                              }
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{cmd.label}</p>
                            {cmd.description && (
                              <p
                                className={`text-sm ${
                                  globalIndex === selectedIndex
                                    ? "text-white/70"
                                    : "text-nature-600"
                                }`}
                              >
                                {cmd.description}
                              </p>
                            )}
                          </div>
                          {globalIndex === selectedIndex && (
                            <kbd className="px-2 py-1 bg-white/20 rounded text-xs">
                              ↵
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-nature-100 flex items-center justify-between text-xs text-nature-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-nature-100 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-nature-100 rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-nature-100 rounded">↵</kbd>
                Select
              </span>
            </div>
            <span>{filteredCommands.length} commands</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Default commands
export const createDefaultCommands = (actions: {
  openSearch: () => void;
  toggleDarkMode: () => void;
  openGenie: () => void;
  exportData: () => void;
  openSettings: () => void;
  showShortcuts: () => void;
  newProject: () => void;
  openDocs: () => void;
}): Command[] => [
  {
    id: "search",
    label: "Search",
    description: "Search sensors, species, and locations",
    icon: Search,
    category: "Navigation",
    keywords: ["find", "lookup"],
    action: actions.openSearch,
  },
  {
    id: "dark-mode",
    label: "Toggle Dark Mode",
    description: "Switch between light and dark themes",
    icon: Moon,
    category: "Appearance",
    keywords: ["theme", "light", "dark"],
    action: actions.toggleDarkMode,
  },
  {
    id: "genie",
    label: "Open Genie AI",
    description: "Chat with your AI assistant",
    icon: Sparkles,
    category: "AI",
    keywords: ["assistant", "chat", "help"],
    action: actions.openGenie,
  },
  {
    id: "export",
    label: "Export Data",
    description: "Download data in CSV or JSON format",
    icon: Download,
    category: "Actions",
    keywords: ["download", "save", "backup"],
    action: actions.exportData,
  },
  {
    id: "settings",
    label: "Open Settings",
    description: "Configure your preferences",
    icon: Settings,
    category: "Navigation",
    keywords: ["preferences", "config"],
    action: actions.openSettings,
  },
  {
    id: "shortcuts",
    label: "Keyboard Shortcuts",
    description: "View all keyboard shortcuts",
    icon: Command,
    category: "Help",
    keywords: ["keys", "hotkeys"],
    action: actions.showShortcuts,
  },
  {
    id: "new-project",
    label: "New Project",
    description: "Start a new monitoring project",
    icon: Zap,
    category: "Actions",
    keywords: ["create", "start"],
    action: actions.newProject,
  },
  {
    id: "docs",
    label: "Documentation",
    description: "View developer documentation",
    icon: FileText,
    category: "Help",
    keywords: ["guide", "manual", "api"],
    action: actions.openDocs,
  },
];
