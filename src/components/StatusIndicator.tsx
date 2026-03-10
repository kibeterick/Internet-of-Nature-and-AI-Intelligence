import React from 'react';
import { motion } from 'motion/react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'connecting';
  label?: string;
  showIcon?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  label,
  showIcon = true 
}) => {
  const statusConfig = {
    online: {
      color: 'bg-emerald-500',
      text: 'text-emerald-600',
      icon: Wifi,
      label: 'Connected',
    },
    offline: {
      color: 'bg-red-500',
      text: 'text-red-600',
      icon: WifiOff,
      label: 'Disconnected',
    },
    connecting: {
      color: 'bg-amber-500',
      text: 'text-amber-600',
      icon: Activity,
      label: 'Connecting...',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <motion.div
          className={cn('w-2 h-2 rounded-full', config.color)}
          animate={status === 'online' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {status === 'online' && (
          <motion.div
            className={cn('absolute inset-0 rounded-full', config.color)}
            animate={{ scale: [1, 2, 2], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      {showIcon && <Icon size={14} className={config.text} />}
      <span className={cn('text-xs font-medium', config.text)}>
        {label || config.label}
      </span>
    </div>
  );
};

export const ConnectionStatus: React.FC<{ 
  wsStatus: number;
  activeUsers?: number;
}> = ({ wsStatus, activeUsers }) => {
  const status = wsStatus === WebSocket.OPEN ? 'online' : 
                 wsStatus === WebSocket.CONNECTING ? 'connecting' : 'offline';

  return (
    <div className="flex items-center gap-4 px-4 py-2 glass rounded-full">
      <StatusIndicator status={status} />
      {activeUsers !== undefined && status === 'online' && (
        <div className="flex items-center gap-1 text-xs text-nature-600">
          <Activity size={14} />
          <span>{activeUsers} online</span>
        </div>
      )}
    </div>
  );
};
