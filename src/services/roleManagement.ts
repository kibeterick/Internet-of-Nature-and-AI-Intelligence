export enum UserRole {
  ADMIN = "admin",
  RESEARCHER = "researcher",
  VIEWER = "viewer",
  GUEST = "guest",
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  [UserRole.ADMIN]: Permission[];
  [UserRole.RESEARCHER]: Permission[];
  [UserRole.VIEWER]: Permission[];
  [UserRole.GUEST]: Permission[];
}

export const PERMISSIONS = {
  // Data Management
  VIEW_DATA: {
    id: "view_data",
    name: "View Data",
    description: "View ecosystem data",
  },
  EDIT_DATA: {
    id: "edit_data",
    name: "Edit Data",
    description: "Edit ecosystem data",
  },
  DELETE_DATA: {
    id: "delete_data",
    name: "Delete Data",
    description: "Delete ecosystem data",
  },
  EXPORT_DATA: {
    id: "export_data",
    name: "Export Data",
    description: "Export data to files",
  },

  // User Management
  MANAGE_USERS: {
    id: "manage_users",
    name: "Manage Users",
    description: "Manage user accounts",
  },
  ASSIGN_ROLES: {
    id: "assign_roles",
    name: "Assign Roles",
    description: "Assign roles to users",
  },
  VIEW_USERS: {
    id: "view_users",
    name: "View Users",
    description: "View user list",
  },

  // System Management
  MANAGE_SETTINGS: {
    id: "manage_settings",
    name: "Manage Settings",
    description: "Manage system settings",
  },
  VIEW_LOGS: {
    id: "view_logs",
    name: "View Logs",
    description: "View system logs",
  },
  MANAGE_ALERTS: {
    id: "manage_alerts",
    name: "Manage Alerts",
    description: "Manage system alerts",
  },

  // Features
  ACCESS_AI_TUNING: {
    id: "access_ai_tuning",
    name: "Access AI Tuning",
    description: "Access AI model tuning",
  },
  ACCESS_ADVANCED_MAP: {
    id: "access_advanced_map",
    name: "Access Advanced Map",
    description: "Access advanced map features",
  },
  ACCESS_ERROR_MONITOR: {
    id: "access_error_monitor",
    name: "Access Error Monitor",
    description: "Access error monitoring",
  },
  ACCESS_ECOSYSTEM_HEALTH: {
    id: "access_ecosystem_health",
    name: "Access Ecosystem Health",
    description: "Access ecosystem health monitoring",
  },

  // Analytics
  VIEW_ANALYTICS: {
    id: "view_analytics",
    name: "View Analytics",
    description: "View analytics dashboard",
  },
  EXPORT_ANALYTICS: {
    id: "export_analytics",
    name: "Export Analytics",
    description: "Export analytics reports",
  },
};

export const ROLE_PERMISSIONS: RolePermissions = {
  [UserRole.ADMIN]: [
    PERMISSIONS.VIEW_DATA,
    PERMISSIONS.EDIT_DATA,
    PERMISSIONS.DELETE_DATA,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.ASSIGN_ROLES,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.MANAGE_ALERTS,
    PERMISSIONS.ACCESS_AI_TUNING,
    PERMISSIONS.ACCESS_ADVANCED_MAP,
    PERMISSIONS.ACCESS_ERROR_MONITOR,
    PERMISSIONS.ACCESS_ECOSYSTEM_HEALTH,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
  ],
  [UserRole.RESEARCHER]: [
    PERMISSIONS.VIEW_DATA,
    PERMISSIONS.EDIT_DATA,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.ACCESS_AI_TUNING,
    PERMISSIONS.ACCESS_ADVANCED_MAP,
    PERMISSIONS.ACCESS_ECOSYSTEM_HEALTH,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
  ],
  [UserRole.VIEWER]: [
    PERMISSIONS.VIEW_DATA,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.ACCESS_ADVANCED_MAP,
    PERMISSIONS.ACCESS_ECOSYSTEM_HEALTH,
    PERMISSIONS.VIEW_ANALYTICS,
  ],
  [UserRole.GUEST]: [PERMISSIONS.VIEW_DATA, PERMISSIONS.ACCESS_ADVANCED_MAP],
};

export class RoleManager {
  private userRoles: Map<string, UserRole> = new Map();

  setUserRole(userId: string, role: UserRole): void {
    this.userRoles.set(userId, role);
  }

  getUserRole(userId: string): UserRole {
    return this.userRoles.get(userId) || UserRole.GUEST;
  }

  hasPermission(userId: string, permissionId: string): boolean {
    const role = this.getUserRole(userId);
    const permissions = ROLE_PERMISSIONS[role];
    return permissions.some((p) => p.id === permissionId);
  }

  hasAnyPermission(userId: string, permissionIds: string[]): boolean {
    return permissionIds.some((id) => this.hasPermission(userId, id));
  }

  hasAllPermissions(userId: string, permissionIds: string[]): boolean {
    return permissionIds.every((id) => this.hasPermission(userId, id));
  }

  canAccessFeature(userId: string, featureId: string): boolean {
    const featurePermissionMap: Record<string, string> = {
      "ai-tuning": PERMISSIONS.ACCESS_AI_TUNING.id,
      "enhanced-map": PERMISSIONS.ACCESS_ADVANCED_MAP.id,
      "error-monitor": PERMISSIONS.ACCESS_ERROR_MONITOR.id,
      "ecosystem-health": PERMISSIONS.ACCESS_ECOSYSTEM_HEALTH.id,
      analytics: PERMISSIONS.VIEW_ANALYTICS.id,
    };

    const permissionId = featurePermissionMap[featureId];
    return permissionId ? this.hasPermission(userId, permissionId) : true;
  }

  getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role];
  }

  getAllRoles(): UserRole[] {
    return Object.values(UserRole);
  }
}

export const roleManager = new RoleManager();
