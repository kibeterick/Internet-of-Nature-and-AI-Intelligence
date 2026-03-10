import { useState, useMemo } from "react";

export const useSearch = <T extends Record<string, any>>(
  items: T[],
  searchKeys: (keyof T)[],
) => {
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();

    return items.filter((item) =>
      searchKeys.some((key) => {
        const value = item[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      }),
    );
  }, [items, query, searchKeys]);

  return {
    query,
    setQuery,
    filteredItems,
    hasResults: filteredItems.length > 0,
    resultCount: filteredItems.length,
  };
};
