import React, { useState } from "react";
import {
  Bell,
  X,
  Check,
  AlertTriangle,
  Info,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error" | "ai";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return Check;
      case "warning":
        return AlertTriangle;
      case "error":
        return AlertTriangle;
      case "ai":
        return Sparkles;
      default:
        return Info;
    }
  };

  const getColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "error":
        return "bg-red-50 border-red-200 text-red-900";
      case "ai":
        return "bg-purple-50 border-purple-200 text-purple-900";
      default:
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "text-emerald-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      case "ai":
        return "text-purple-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 hover:bg-nature-100 rounded-xl transition-all"
      >
        <Bell size={20} className="text-nature-700" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 glass rounded-2xl shadow-2xl border border-nature-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-nature-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-nature-900">Notifications</h3>
                <p className="text-xs text-nature-600">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-nature-600 hover:text-nature-900 underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-nature-100 rounded-lg transition-all"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell size={48} className="mx-auto text-nature-300 mb-4" />
                  <p className="text-nature-600">No notifications</p>
                  <p className="text-sm text-nature-500 mt-2">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {notifications.map((notification) => {
                    const Icon = getIcon(notification.type);
                    const colorClass = getColor(notification.type);
                    const iconColor = getIconColor(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-all ${
                          notification.read ? "bg-white" : colorClass
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${notification.read ? "bg-nature-100" : "bg-white/50"}`}
                          >
                            <Icon size={18} className={iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {notification.title}
                              </h4>
                              <button
                                onClick={() => onDelete(notification.id)}
                                className="p-1 hover:bg-nature-100 rounded transition-all flex-shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-nature-700 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-nature-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              <div className="flex items-center gap-2">
                                {notification.action && (
                                  <button
                                    onClick={notification.action.onClick}
                                    className="text-xs font-medium text-nature-900 hover:underline"
                                  >
                                    {notification.action.label}
                                  </button>
                                )}
                                {!notification.read && (
                                  <button
                                    onClick={() =>
                                      onMarkAsRead(notification.id)
                                    }
                                    className="text-xs text-nature-600 hover:text-nature-900"
                                  >
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-nature-100">
                <button
                  onClick={onClearAll}
                  className="w-full flex items-center justify-center gap-2 p-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                  Clear all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
