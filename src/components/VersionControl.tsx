import React, { useState } from "react";
import {
  GitBranch,
  Clock,
  User,
  FileText,
  RotateCcw,
  GitCompare,
  Trash2,
} from "lucide-react";
import { Version, VersionDiff } from "../services/versionControl";

interface VersionControlProps {
  versions: Version[];
  onRevert: (id: string) => void;
  onCompare: (id1: string, id2: string) => void;
  onClear: () => void;
}

export default function VersionControl({
  versions,
  onRevert,
  onCompare,
  onClear,
}: VersionControlProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showDiff, setShowDiff] = useState<VersionDiff | null>(null);

  const handleSelectVersion = (id: string) => {
    if (selectedVersions.includes(id)) {
      setSelectedVersions(selectedVersions.filter((v) => v !== id));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, id]);
    }
  };

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      onCompare(selectedVersions[0], selectedVersions[1]);
    }
  };

  return (
    <div className="glass p-8 rounded-[40px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <GitBranch size={28} className="text-nature-600" />
            Version Control
          </h3>
          <p className="text-nature-600 text-sm">
            Track and manage data versions
          </p>
        </div>
        <div className="flex gap-2">
          {selectedVersions.length === 2 && (
            <button
              onClick={handleCompare}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl flex items-center gap-2 transition-all"
            >
              <GitCompare size={18} />
              Compare
            </button>
          )}
          <button
            onClick={onClear}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl flex items-center gap-2 transition-all"
          >
            <Trash2 size={18} />
            Clear History
          </button>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="text-center py-12">
          <GitBranch size={48} className="mx-auto text-nature-300 mb-4" />
          <p className="text-nature-600">No versions saved yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer ${
                selectedVersions.includes(version.id)
                  ? "border-nature-500 bg-nature-50"
                  : "border-nature-100 hover:border-nature-300"
              }`}
              onClick={() => handleSelectVersion(version.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-nature-100 text-nature-800 rounded-full text-xs font-bold">
                      {version.id}
                    </span>
                    {index === 0 && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <FileText size={18} className="text-nature-600" />
                    {version.message}
                  </h4>

                  <div className="flex items-center gap-4 text-sm text-nature-600 mb-3">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {version.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {version.timestamp.toLocaleString()}
                    </span>
                  </div>

                  {version.changes.length > 0 && (
                    <div className="bg-nature-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-nature-700 mb-2">
                        Changes:
                      </p>
                      <ul className="space-y-1">
                        {version.changes.map((change, idx) => (
                          <li key={idx} className="text-xs text-nature-600">
                            • {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRevert(version.id);
                    }}
                    className="ml-4 px-4 py-2 bg-nature-100 hover:bg-nature-200 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <RotateCcw size={16} />
                    Revert
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDiff && (
        <div className="mt-6 bg-white rounded-2xl p-6 border border-nature-200">
          <h4 className="font-bold text-lg mb-4">Version Comparison</h4>

          {showDiff.added.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold text-green-700 mb-2">Added:</p>
              <ul className="space-y-1">
                {showDiff.added.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded"
                  >
                    + {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDiff.modified.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-bold text-yellow-700 mb-2">
                Modified:
              </p>
              <ul className="space-y-1">
                {showDiff.modified.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded"
                  >
                    ~ {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showDiff.removed.length > 0 && (
            <div>
              <p className="text-sm font-bold text-red-700 mb-2">Removed:</p>
              <ul className="space-y-1">
                {showDiff.removed.map((item, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded"
                  >
                    - {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
