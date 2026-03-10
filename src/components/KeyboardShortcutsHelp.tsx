import React from 'react';
import { motion } from 'motion/react';
import { X, Command, Keyboard } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['Ctrl', 'D'], description: 'Toggle dark mode', category: 'General' },
  { keys: ['Ctrl', 'K'], description: 'Open search', category: 'Navigation' },
  { keys: ['Ctrl', 'R'], description: 'Refresh data', category: 'Data' },
  { keys: ['Ctrl', 'E'], description: 'Export data', category: 'Data' },
  { keys: ['Shift', '?'], description: 'Show this help', category: 'General' },
  { keys: ['Esc'], description: 'Close modals', category: 'General' },
];

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null;

  const categories = Array.from(new Set(shortcuts.map(s => s.category)));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-nature-100 rounded-2xl flex items-center justify-center">
                <Keyboard size={24} className="text-nature-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
                <p className="text-sm text-nature-500">Power user features</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-nature-100 rounded-full transition-colors"
            >
              <X size={24} className="text-nature-400" />
            </button>
          </div>

          <div className="space-y-6">
            {categories.map(category => (
              <div key={category} className="space-y-3">
                <h3 className="text-sm font-bold text-nature-400 uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts
                    .filter(s => s.category === category)
                    .map((shortcut, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-nature-50 rounded-2xl"
                      >
                        <span className="text-sm text-nature-700">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, i) => (
                            <React.Fragment key={i}>
                              <kbd className="px-2 py-1 bg-white border border-nature-200 rounded-lg text-xs font-mono font-bold text-nature-900 shadow-sm">
                                {key}
                              </kbd>
                              {i < shortcut.keys.length - 1 && (
                                <span className="text-nature-400 text-xs">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
