import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Download, RefreshCw, Share2, Settings, 
  Camera, Upload, Search, Bell, X 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  color?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 glass p-4 rounded-3xl shadow-2xl min-w-[200px]"
          >
            <div className="space-y-2">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl",
                    "hover:bg-nature-100 transition-all text-left group"
                  )}
                >
                  <action.icon 
                    size={18} 
                    className={action.color || 'text-nature-600 group-hover:text-nature-900'} 
                  />
                  <span className="text-sm font-medium text-nature-700 group-hover:text-nature-900">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full shadow-2xl flex items-center justify-center",
          "bg-nature-900 text-white hover:bg-nature-800 transition-all"
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Zap size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
};
