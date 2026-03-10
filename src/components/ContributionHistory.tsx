import React, { useState } from "react";
import {
  History,
  GitBranch,
  User,
  Calendar,
  Filter,
  Download,
} from "lucide-react";

interface Contribution {
  id: string;
  type: "data" | "observation" | "analysis" | "report";
  title: string;
  description: string;
  author: string;
  timestamp: Date;
  impact: number;
  status: "pending" | "approved" | "rejected";
}

interface ContributionHistoryProps {
  contributions: Contribution[];
  onExport?: () => void;
}

export default function ContributionHistory({
  contributions,
  onExport,
}: ContributionHistoryProps) {
  const [filter, setFilter] = useState<
    "all" | "data" | "observation" | "analysis" | "report"
  >("all");
  const [sortBy, setSortBy] = useState<"date" | "impact">("date");

  const filteredContributions = contributions
    .filter((c) => filter === "all" || c.type === filter)
    .sort((a, b) => {
      if (sortBy === "date") {
        return b.timestamp.getTime() - a.timestamp.getTime();
      }
      return b.impact - a.impact;
    });

  const stats = {
    total: contributions.length,
    approved: contributions.filter((c) => c.status === "approved").length,
    pending: contributions.filter((c) => c.status === "pending").length,
    totalImpact: contributions.reduce((sum, c) => sum + c.impact, 0),
  };

  return (
    <div className="glass p-8 rounded-[40px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <History size={28} className="text-nature-600" />
            Contribution History
          </h3>
          <p className="text-nature-600 text-sm">
            Track your impact on the ecosystem
          </p>
        </div>
        <button
          onClick={onExport}
          className="px-4 py-2 bg-nature-100 hover:bg-nature-200 rounded-xl flex items-center gap-2 transition-all"
        >
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-nature-100">
          <p className="text-nature-600 text-sm mb-1">Total</p>
          <p className="text-2xl font-bold text-nature-900">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
          <p className="text-emerald-700 text-sm mb-1">Approved</p>
          <p className="text-2xl font-bold text-emerald-900">
            {stats.approved}
          </p>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
          <p className="text-yellow-700 text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
          <p className="text-purple-700 text-sm mb-1">Impact Score</p>
          <p className="text-2xl font-bold text-purple-900">
            {stats.totalImpact}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-nature-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white border border-nature-200 rounded-xl text-sm"
          >
            <option value="all">All Types</option>
            <option value="data">Data</option>
            <option value="observation">Observation</option>
            <option value="analysis">Analysis</option>
            <option value="report">Report</option>
          </select>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-white border border-nature-200 rounded-xl text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="impact">Sort by Impact</option>
        </select>
      </div>

      {/* Contributions List */}
      <div className="space-y-3">
        {filteredContributions.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch size={48} className="mx-auto text-nature-300 mb-4" />
            <p className="text-nature-600">
              No contributions yet. Start contributing!
            </p>
          </div>
        ) : (
          filteredContributions.map((contribution) => (
            <div
              key={contribution.id}
              className="bg-white rounded-2xl p-5 border border-nature-100 hover:border-nature-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        contribution.type === "data"
                          ? "bg-blue-100 text-blue-800"
                          : contribution.type === "observation"
                            ? "bg-green-100 text-green-800"
                            : contribution.type === "analysis"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {contribution.type}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        contribution.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : contribution.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {contribution.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">
                    {contribution.title}
                  </h4>
                  <p className="text-nature-600 text-sm mb-3">
                    {contribution.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-nature-500">
                    <span className="flex items-center gap-1">
                      <User size={14} />
                      {contribution.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {contribution.timestamp.toLocaleDateString()}
                    </span>
                    <span className="font-bold text-purple-600">
                      +{contribution.impact} impact
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
