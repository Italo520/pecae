import { useState, useEffect } from 'react';

// Mock hook for search suggestions
export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      // Mock data based on query
      const mockData = [
        `${query} honda civic`,
        `${query} parachoque`,
        `motor ${query}`,
        `farol para ${query}`,
      ];
      setSuggestions(mockData);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return { suggestions, isLoading };
}
