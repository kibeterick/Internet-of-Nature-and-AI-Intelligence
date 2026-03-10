import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner = ({ size = "md", text }: LoadingSpinnerProps) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 size={sizes[size]} className="text-emerald-500" />
      </motion.div>
      {text && (
        <p className="text-sm text-nature-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export const LoadingSkeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-nature-200 rounded-xl ${className}`} />
  );
};
