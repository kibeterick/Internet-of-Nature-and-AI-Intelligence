import React from "react";
import { Loader, Sparkles, Leaf, Activity } from "lucide-react";

interface LoadingStateProps {
  type?: "spinner" | "pulse" | "dots" | "skeleton" | "nature";
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({
  type = "spinner",
  message,
  size = "md",
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  if (type === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div
          className={`${sizeClasses[size]} border-4 border-nature-200 border-t-nature-600 rounded-full animate-spin`}
        />
        {message && <p className="mt-4 text-nature-600 text-sm">{message}</p>}
      </div>
    );
  }

  if (type === "pulse") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div
          className={`${sizeClasses[size]} bg-nature-600 rounded-full animate-pulse`}
        />
        {message && <p className="mt-4 text-nature-600 text-sm">{message}</p>}
      </div>
    );
  }

  if (type === "dots") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-nature-600 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-nature-600 rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-3 h-3 bg-nature-600 rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
        {message && <p className="mt-4 text-nature-600 text-sm">{message}</p>}
      </div>
    );
  }

  if (type === "nature") {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <Leaf
            className={`${sizeClasses[size]} text-nature-600 animate-pulse`}
          />
          <Sparkles className="absolute top-0 right-0 w-4 h-4 text-emerald-500 animate-ping" />
        </div>
        {message && <p className="mt-4 text-nature-600 text-sm">{message}</p>}
      </div>
    );
  }

  // Skeleton
  return (
    <div className="space-y-4 p-8">
      <div className="h-4 bg-nature-200 rounded animate-pulse" />
      <div className="h-4 bg-nature-200 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-nature-200 rounded animate-pulse w-4/6" />
      {message && <p className="mt-4 text-nature-600 text-sm">{message}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass rounded-3xl p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-nature-200 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-nature-200 rounded w-3/4" />
          <div className="h-3 bg-nature-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-nature-200 rounded" />
        <div className="h-3 bg-nature-200 rounded w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="w-12 h-12 bg-nature-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-nature-200 rounded w-3/4" />
            <div className="h-3 bg-nature-200 rounded w-1/2" />
          </div>
          <div className="w-20 h-8 bg-nature-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function LoadingOverlay({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass rounded-3xl p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <Activity className="w-16 h-16 text-nature-600 animate-pulse" />
          <div className="absolute inset-0 border-4 border-nature-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-nature-900 font-medium">{message}</p>
      </div>
    </div>
  );
}
