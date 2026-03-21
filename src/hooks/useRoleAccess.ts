import { useAuth } from "../contexts/AuthContext";
import { roleManager, UserRole } from "../services/roleManagement";

export const useRoleAccess = () => {
  const { user } = useAuth();

  const userId = user?.uid || "guest";

  const hasPermission = (permissionId: string): boolean => {
    return roleManager.hasPermission(userId, permissionId);
  };

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return roleManager.hasAnyPermission(userId, permissionIds);
  };

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return roleManager.hasAllPermissions(userId, permissionIds);
  };

  const canAccessFeature = (featureId: string): boolean => {
    return roleManager.canAccessFeature(userId, featureId);
  };

  const getUserRole = (): UserRole => {
    return roleManager.getUserRole(userId);
  };

  const isAdmin = (): boolean => {
    return getUserRole() === UserRole.ADMIN;
  };

  const isResearcher = (): boolean => {
    return getUserRole() === UserRole.RESEARCHER;
  };

  const isViewer = (): boolean => {
    return getUserRole() === UserRole.VIEWER;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessFeature,
    getUserRole,
    isAdmin,
    isResearcher,
    isViewer,
    userId,
  };
};
