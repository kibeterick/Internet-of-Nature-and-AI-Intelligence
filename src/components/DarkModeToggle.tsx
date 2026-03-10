import React from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

export default function DarkModeToggle({
  isDarkMode,
  onToggle,
}: DarkModeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative w-16 h-8 bg-nature-200 dark:bg-nature-700 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-nature-500"
      aria-label="Toggle dark mode"
    >
      <motion.div
        className="w-6 h-6 bg-white dark:bg-nature-900 rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isDarkMode ? 32 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDarkMode ? (
          <Moon size={14} className="text-nature-400" />
        ) : (
          <Sun size={14} className="text-yellow-500" />
        )}
      </motion.div>
    </button>
  );
}
