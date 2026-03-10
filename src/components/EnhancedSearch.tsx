import React, { useState, useEffect, useRef } from "react";
import { Search, X, Filter, TrendingUp, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: "sensor" | "species" | "location" | "report" | "feature";
  relevance: number;
  metadata?: any;
}

interface EnhancedSearchProps {
  data: any[];
  onSelect: (result: SearchResult) => void;
  placeholder?: string;
}

export default function EnhancedSearch({
  data,
  onSelect,
  placeholder = "Search ecosystem data...",
}: EnhancedSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "sensor", label: "Sensors", icon: TrendingUp },
    { id: "species", label: "Species", icon: TrendingUp },
    { id: "location", label: "Locations", icon: TrendingUp },
    { id: "report", label: "Reports", icon: TrendingUp },
  ];

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchResults = performSearch(query, data, selectedCategory);
    setResults(searchResults);
  }, [query, data, selectedCategory]);

  const performSearch = (
    searchQuery: string,
    searchData: any[],
    category: string,
  ): SearchResult[] => {
    const lowerQuery = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Mock search implementation - replace with your actual search logic
    searchData.forEach((item: any) => {
      if (category !== "all" && item.category !== category) return;

      const titleMatch = item.name?.toLowerCase().includes(lowerQuery);
      const descMatch = item.description?.toLowerCase().includes(lowerQuery);

      if (titleMatch || descMatch) {
        results.push({
          id: item.id || Math.random().toString(),
          title: item.name || item.title || "Untitled",
          description: item.description || "No description",
          category: item.category || "sensor",
          relevance: titleMatch ? 1.0 : 0.5,
          metadata: item,
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsOpen(true);

    if (searchQuery.length >= 2) {
      const updated = [
        searchQuery,
        ...recentSearches.filter((s) => s !== searchQuery),
      ].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(result);
    setIsOpen(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-nature-400"
          size={20}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-white border-2 border-nature-200 rounded-2xl focus:border-nature-600 focus:ring-4 focus:ring-nature-100 transition-all text-nature-900 placeholder-nature-400"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-nature-100 rounded-lg transition-all"
          >
            <X size={18} className="text-nature-400" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full glass rounded-2xl shadow-2xl border border-nature-100 overflow-hidden z-50"
          >
            {/* Category Filters */}
            <div className="p-4 border-b border-nature-100 flex items-center gap-2 overflow-x-auto">
              <Filter size={16} className="text-nature-600 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-nature-900 text-white"
                      : "bg-nature-100 text-nature-700 hover:bg-nature-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className="w-full p-4 hover:bg-nature-50 rounded-xl transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            result.category === "sensor"
                              ? "bg-blue-100"
                              : result.category === "species"
                                ? "bg-green-100"
                                : result.category === "location"
                                  ? "bg-purple-100"
                                  : "bg-orange-100"
                          }`}
                        >
                          <TrendingUp size={16} className="text-nature-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-nature-900 group-hover:text-nature-600 transition-colors truncate">
                            {result.title}
                          </h4>
                          <p className="text-sm text-nature-600 truncate">
                            {result.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-nature-100 text-nature-700 rounded-full">
                              {result.category}
                            </span>
                            <span className="text-xs text-nature-500">
                              {Math.round(result.relevance * 100)}% match
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="p-8 text-center">
                  <p className="text-nature-600">
                    No results found for "{query}"
                  </p>
                  <p className="text-sm text-nature-500 mt-2">
                    Try different keywords or filters
                  </p>
                </div>
              ) : recentSearches.length > 0 ? (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={16} className="text-nature-600" />
                    <h4 className="text-sm font-medium text-nature-700">
                      Recent Searches
                    </h4>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full p-2 hover:bg-nature-50 rounded-lg transition-all text-left text-sm text-nature-700"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
