import { motion, AnimatePresence } from 'motion/react';
import { X, Command } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts: Shortcut[] = [
    { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
    { keys: ['Ctrl', 'K'], description: 'Open search' },
    { keys: ['Shift', '?'], description: 'Show this help' },
    { keys: ['Ctrl', 'R'], description: 'Refresh data' },
    { keys: ['Ctrl', 'E'], description: 'Export data' },
    { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
    { keys: ['Esc'], description: 'Close modals' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-nature-900 rounded-3xl shadow-2xl z-50 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-nature-100 dark:bg-nature-800 rounded-xl flex items-center justify-center">
                  <Command size={20} className="text-nature-600 dark:text-nature-400" />
                </div>
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-nature-100 dark:hover:bg-nature-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-nature-50 dark:hover:bg-nature-800 transition-colors"
                >
                  <span className="text-sm text-nature-600 dark:text-nature-300">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-nature-100 dark:bg-nature-800 border border-nature-200 dark:border-nature-700 rounded text-xs font-mono">
                          {key}
                        </kbd>
                        {i < shortcut.keys.length - 1 && (
                          <span className="text-nature-400">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-nature-50 dark:bg-nature-800 rounded-xl">
              <p className="text-xs text-nature-500 dark:text-nature-400 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-nature-900 border border-nature-200 dark:border-nature-700 rounded text-xs font-mono">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
