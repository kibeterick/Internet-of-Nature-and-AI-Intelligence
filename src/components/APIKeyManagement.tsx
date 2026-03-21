import React, { useState, useEffect } from "react";
import { apiKeyManager, APIKey } from "../services/apiKeyManagement";
import {
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

export const APIKeyManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(90);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    "read",
    "write",
  ]);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [newKeyDisplay, setNewKeyDisplay] = useState<string | null>(null);
  const [stats, setStats] = useState(apiKeyManager.getStats());

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = () => {
    const keys = apiKeyManager.getAllKeys();
    setApiKeys(keys);
    setStats(apiKeyManager.getStats());
  };

  const handleCreateKey = () => {
    if (!keyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    const newKey = apiKeyManager.generateKey(
      keyName,
      selectedPermissions,
      expiresInDays,
    );

    setNewKeyDisplay(newKey.key);
    setKeyName("");
    setExpiresInDays(90);
    setSelectedPermissions(["read", "write"]);
    setShowCreateForm(false);
    loadKeys();

    toast.success("API key created successfully!");
  };

  const handleRevokeKey = (keyId: string) => {
    if (window.confirm("Are you sure you want to revoke this API key?")) {
      apiKeyManager.revokeKey(keyId);
      loadKeys();
      toast.success("API key revoked");
    }
  };

  const handleDeleteKey = (keyId: string) => {
    if (window.confirm("Are you sure you want to delete this API key?")) {
      apiKeyManager.deleteKey(keyId);
      loadKeys();
      toast.success("API key deleted");
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "revoked":
        return "bg-red-100 text-red-800 border-red-300";
      case "expired":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "revoked":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "expired":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Zap className="w-8 h-8 text-blue-600" />
          API Key Management
        </h1>
        <p className="text-gray-600">
          Generate and manage API keys for accessing Internet of Nature backend
          services
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <p className="text-sm text-gray-600 mb-1">Total Keys</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalKeys}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Active Keys</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.activeKeys}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <p className="text-sm text-gray-600 mb-1">Revoked Keys</p>
          <p className="text-3xl font-bold text-red-600">{stats.revokedKeys}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-purple-600">
            {stats.totalRequests}
          </p>
        </div>
      </div>

      {/* New Key Display */}
      {newKeyDisplay && (
        <div className="bg-green-50 border-2 border-green-300 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-green-800 mb-3">
            ✅ API Key Created Successfully
          </h3>
          <p className="text-sm text-green-700 mb-3">
            Copy your API key now. You won't be able to see it again!
          </p>
          <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300 mb-3">
            <code className="flex-1 font-mono text-sm text-gray-800 break-all">
              {newKeyDisplay}
            </code>
            <button
              onClick={() => handleCopyKey(newKeyDisplay)}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          </div>
          <button
            onClick={() => setNewKeyDisplay(null)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
          >
            Done
          </button>
        </div>
      )}

      {/* Create Key Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Create New API Key
          </h2>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Key Name
            </label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Mobile App, Data Pipeline"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expiration (days)
            </label>
            <input
              type="number"
              value={expiresInDays || ""}
              onChange={(e) =>
                setExpiresInDays(
                  e.target.value ? parseInt(e.target.value) : undefined,
                )
              }
              placeholder="Leave empty for no expiration"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2">
              {["read", "write", "delete", "admin"].map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPermissions([...selectedPermissions, perm]);
                      } else {
                        setSelectedPermissions(
                          selectedPermissions.filter((p) => p !== perm),
                        );
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {perm}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCreateKey}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Create Key
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Button */}
      {!showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New API Key
        </button>
      )}

      {/* API Keys List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Your API Keys</h2>

        {apiKeys.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600">
              No API keys yet. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {apiKey.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(
                          apiKey.status,
                        )}`}
                      >
                        {getStatusIcon(apiKey.status)}
                        {apiKey.status.charAt(0).toUpperCase() +
                          apiKey.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 font-mono text-sm text-gray-600 bg-gray-100 p-2 rounded">
                        {visibleKeys.has(apiKey.id)
                          ? apiKey.maskedKey.replace(/\*/g, "•")
                          : apiKey.maskedKey}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        {visibleKeys.has(apiKey.id) ? (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                      <div>
                        <span className="font-semibold">Created:</span>{" "}
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </div>
                      {apiKey.expiresAt && (
                        <div>
                          <span className="font-semibold">Expires:</span>{" "}
                          {new Date(apiKey.expiresAt).toLocaleDateString()}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Usage:</span>{" "}
                        {apiKey.usageCount} requests
                      </div>
                      <div>
                        <span className="font-semibold">Rate Limit:</span>{" "}
                        {apiKey.rateLimit}/min
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs font-semibold text-gray-700">
                        Permissions:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.permissions.map((perm) => (
                          <span
                            key={perm}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold capitalize"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {apiKey.status === "active" && (
                      <button
                        onClick={() => handleRevokeKey(apiKey.id)}
                        className="px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 font-semibold text-sm"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteKey(apiKey.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Guide */}
      <div className="bg-blue-50 border-2 border-blue-300 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-blue-800 mb-3">
          📚 How to Use API Keys
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>
            <span className="font-semibold">1. Generate a Key:</span> Click
            "Create New API Key" and configure permissions
          </p>
          <p>
            <span className="font-semibold">2. Copy the Key:</span> Copy your
            key immediately after creation
          </p>
          <p>
            <span className="font-semibold">3. Use in Requests:</span> Include
            in Authorization header:
          </p>
          <code className="block bg-white p-2 rounded border border-blue-300 font-mono text-xs mt-1">
            Authorization: Bearer YOUR_API_KEY
          </code>
          <p className="mt-2">
            <span className="font-semibold">4. Monitor Usage:</span> Track
            requests and revoke keys when needed
          </p>
        </div>
      </div>
    </div>
  );
};
