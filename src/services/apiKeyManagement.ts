export interface APIKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  status: "active" | "revoked" | "expired";
  permissions: string[];
  rateLimit: number;
  usageCount: number;
}

export interface APIKeyStats {
  totalKeys: number;
  activeKeys: number;
  revokedKeys: number;
  expiredKeys: number;
  totalRequests: number;
}

export class APIKeyManager {
  private apiKeys: Map<string, APIKey> = new Map();
  private keyStats: APIKeyStats = {
    totalKeys: 0,
    activeKeys: 0,
    revokedKeys: 0,
    expiredKeys: 0,
    totalRequests: 0,
  };

  generateKey(
    name: string,
    permissions: string[] = ["read", "write"],
    expiresInDays?: number,
  ): APIKey {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullKey = `ion_${keyId}_${Math.random().toString(36).substr(2, 32)}`;
    const maskedKey = `ion_${keyId}_${"*".repeat(32)}`;

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const apiKey: APIKey = {
      id: keyId,
      name,
      key: fullKey,
      maskedKey,
      createdAt: new Date().toISOString(),
      expiresAt,
      status: "active",
      permissions,
      rateLimit: 1000,
      usageCount: 0,
    };

    this.apiKeys.set(keyId, apiKey);
    this.updateStats();

    return apiKey;
  }

  getKeys(userId: string): APIKey[] {
    return Array.from(this.apiKeys.values()).map((key) => ({
      ...key,
      key: "", // Never return full key
    }));
  }

  getKeyById(keyId: string): APIKey | undefined {
    const key = this.apiKeys.get(keyId);
    if (key) {
      return { ...key, key: "" };
    }
    return undefined;
  }

  revokeKey(keyId: string): boolean {
    const key = this.apiKeys.get(keyId);
    if (key) {
      key.status = "revoked";
      this.updateStats();
      return true;
    }
    return false;
  }

  updateKeyPermissions(keyId: string, permissions: string[]): boolean {
    const key = this.apiKeys.get(keyId);
    if (key) {
      key.permissions = permissions;
      return true;
    }
    return false;
  }

  updateKeyRateLimit(keyId: string, rateLimit: number): boolean {
    const key = this.apiKeys.get(keyId);
    if (key) {
      key.rateLimit = rateLimit;
      return true;
    }
    return false;
  }

  recordKeyUsage(keyId: string): void {
    const key = this.apiKeys.get(keyId);
    if (key && key.status === "active") {
      key.usageCount++;
      key.lastUsedAt = new Date().toISOString();
      this.keyStats.totalRequests++;
    }
  }

  validateKey(fullKey: string): boolean {
    for (const key of this.apiKeys.values()) {
      if (key.key === fullKey && key.status === "active") {
        const expiresAt = key.expiresAt ? new Date(key.expiresAt) : null;
        if (!expiresAt || expiresAt > new Date()) {
          return true;
        }
      }
    }
    return false;
  }

  getKeyPermissions(fullKey: string): string[] {
    for (const key of this.apiKeys.values()) {
      if (key.key === fullKey && key.status === "active") {
        return key.permissions;
      }
    }
    return [];
  }

  private updateStats(): void {
    this.keyStats.totalKeys = this.apiKeys.size;
    this.keyStats.activeKeys = Array.from(this.apiKeys.values()).filter(
      (k) => k.status === "active",
    ).length;
    this.keyStats.revokedKeys = Array.from(this.apiKeys.values()).filter(
      (k) => k.status === "revoked",
    ).length;
    this.keyStats.expiredKeys = Array.from(this.apiKeys.values()).filter(
      (k) => k.status === "expired",
    ).length;
  }

  getStats(): APIKeyStats {
    this.updateStats();
    return this.keyStats;
  }

  deleteKey(keyId: string): boolean {
    return this.apiKeys.delete(keyId);
  }

  getAllKeys(): APIKey[] {
    return Array.from(this.apiKeys.values()).map((key) => ({
      ...key,
      key: "",
    }));
  }
}

export const apiKeyManager = new APIKeyManager();
