import React, { useState } from "react";
import {
  UserRole,
  ROLE_PERMISSIONS,
  PERMISSIONS,
  roleManager,
} from "../services/roleManagement";
import { Shield, Users, CheckCircle, XCircle, Edit2, Save } from "lucide-react";

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const RoleManagementPanel: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([
    {
      id: "user-1",
      name: "Admin User",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    },
    {
      id: "user-2",
      name: "Researcher User",
      email: "researcher@example.com",
      role: UserRole.RESEARCHER,
    },
    {
      id: "user-3",
      name: "Viewer User",
      email: "viewer@example.com",
      role: UserRole.VIEWER,
    },
  ]);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VIEWER);
  const [selectedRoleView, setSelectedRoleView] = useState<UserRole>(
    UserRole.ADMIN,
  );

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    roleManager.setUserRole(userId, newRole);
    setEditingUserId(null);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 border-red-300";
      case UserRole.RESEARCHER:
        return "bg-blue-100 text-blue-800 border-blue-300";
      case UserRole.VIEWER:
        return "bg-green-100 text-green-800 border-green-300";
      case UserRole.GUEST:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "Full system access, user management, settings";
      case UserRole.RESEARCHER:
        return "Data editing, AI tuning, analytics export";
      case UserRole.VIEWER:
        return "View-only access to data and analytics";
      case UserRole.GUEST:
        return "Limited access to basic features";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-purple-600" />
          Role Management System
        </h1>
        <p className="text-gray-600">
          Control user access and permissions across the application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Users & Roles
          </h2>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>

                  {editingUserId === user.id ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) =>
                          setSelectedRole(e.target.value as UserRole)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
                      >
                        {Object.values(UserRole).map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRoleChange(user.id, selectedRole)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold border ${getRoleColor(
                          user.role,
                        )}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingUserId(user.id);
                          setSelectedRole(user.role);
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role Permissions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Role Permissions</h2>

          <div className="space-y-2">
            {Object.values(UserRole).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleView(role)}
                className={`w-full px-4 py-2 rounded-lg font-semibold text-left transition-all ${
                  selectedRoleView === role
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md space-y-3">
            <h3 className="font-bold text-gray-800">
              {selectedRoleView.charAt(0).toUpperCase() +
                selectedRoleView.slice(1)}{" "}
              Permissions
            </h3>
            <p className="text-sm text-gray-600">
              {getRoleDescription(selectedRoleView)}
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {ROLE_PERMISSIONS[selectedRoleView].map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start gap-2 p-2 bg-gray-50 rounded"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {permission.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.values(UserRole).map((role) => (
          <div
            key={role}
            className={`p-4 rounded-lg border-2 ${getRoleColor(role)}`}
          >
            <h4 className="font-bold mb-2">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </h4>
            <p className="text-xs mb-2">
              {ROLE_PERMISSIONS[role].length} permissions
            </p>
            <div className="text-xs space-y-1">
              {ROLE_PERMISSIONS[role].slice(0, 3).map((p) => (
                <div key={p.id} className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{p.name}</span>
                </div>
              ))}
              {ROLE_PERMISSIONS[role].length > 3 && (
                <p className="text-xs opacity-75">
                  +{ROLE_PERMISSIONS[role].length - 3} more
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
