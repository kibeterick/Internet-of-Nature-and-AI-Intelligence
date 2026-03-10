export interface Version {
  id: string;
  timestamp: Date;
  author: string;
  message: string;
  data: any;
  changes: string[];
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

export class VersionControlService {
  private versions: Version[] = [];
  private currentVersion: number = -1;

  constructor() {
    this.loadVersions();
  }

  commit(data: any, message: string, author: string): Version {
    const version: Version = {
      id: `v${Date.now()}`,
      timestamp: new Date(),
      author,
      message,
      data: JSON.parse(JSON.stringify(data)),
      changes: this.calculateChanges(data),
    };

    this.versions.push(version);
    this.currentVersion = this.versions.length - 1;
    this.saveVersions();

    return version;
  }

  getHistory(): Version[] {
    return [...this.versions].reverse();
  }

  getVersion(id: string): Version | null {
    return this.versions.find((v) => v.id === id) || null;
  }

  revert(id: string): any | null {
    const version = this.getVersion(id);
    if (!version) return null;

    this.currentVersion = this.versions.indexOf(version);
    return JSON.parse(JSON.stringify(version.data));
  }

  diff(id1: string, id2: string): VersionDiff | null {
    const v1 = this.getVersion(id1);
    const v2 = this.getVersion(id2);

    if (!v1 || !v2) return null;

    const keys1 = Object.keys(v1.data);
    const keys2 = Object.keys(v2.data);

    return {
      added: keys2.filter((k) => !keys1.includes(k)),
      removed: keys1.filter((k) => !keys2.includes(k)),
      modified: keys1.filter(
        (k) =>
          keys2.includes(k) &&
          JSON.stringify(v1.data[k]) !== JSON.stringify(v2.data[k]),
      ),
    };
  }

  getCurrentVersion(): Version | null {
    return this.currentVersion >= 0 ? this.versions[this.currentVersion] : null;
  }

  private calculateChanges(data: any): string[] {
    const changes: string[] = [];
    const prev = this.getCurrentVersion();

    if (!prev) {
      changes.push("Initial version");
      return changes;
    }

    const diff = this.diff(prev.id, `temp_${Date.now()}`);
    if (diff) {
      if (diff.added.length > 0)
        changes.push(`Added: ${diff.added.join(", ")}`);
      if (diff.removed.length > 0)
        changes.push(`Removed: ${diff.removed.join(", ")}`);
      if (diff.modified.length > 0)
        changes.push(`Modified: ${diff.modified.join(", ")}`);
    }

    return changes.length > 0 ? changes : ["No changes detected"];
  }

  private saveVersions(): void {
    try {
      localStorage.setItem("ion_versions", JSON.stringify(this.versions));
    } catch (error) {
      console.error("Failed to save versions:", error);
    }
  }

  private loadVersions(): void {
    try {
      const stored = localStorage.getItem("ion_versions");
      if (stored) {
        this.versions = JSON.parse(stored);
        this.currentVersion = this.versions.length - 1;
      }
    } catch (error) {
      console.error("Failed to load versions:", error);
    }
  }

  clearHistory(): void {
    this.versions = [];
    this.currentVersion = -1;
    localStorage.removeItem("ion_versions");
  }
}
