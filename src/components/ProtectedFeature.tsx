import React from "react";
import { useRoleAccess } from "../hooks/useRoleAccess";
import { Lock } from "lucide-react";

interface ProtectedFeatureProps {
  featureId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermissions?: string[];
  requireAll?: boolean;
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  featureId,
  children,
  fallback,
  requiredPermissions,
  requireAll = false,
}) => {
  const {
    canAccessFeature,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
  } = useRoleAccess();

  let hasAccess = false;

  if (requiredPermissions) {
    hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
  } else {
    hasAccess = canAccessFeature(featureId);
  }

  if (!hasAccess) {
    return (
      fallback || (
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg text-center">
          <Lock className="w-12 h-12 text-red-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-red-800 mb-2">Access Denied</h3>
          <p className="text-red-700">
            You don't have permission to access this feature.
          </p>
          <p className="text-sm text-red-600 mt-2">
            Contact an administrator if you believe this is an error.
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
