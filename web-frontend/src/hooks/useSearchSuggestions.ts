import { useState, useEffect } from 'react';
import { fetchSearchSuggestions } from '@/services/search.service';

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    let active = true;

    fetchSearchSuggestions(query)
      .then((data) => {
        if (active) {
          // Extract text suggestions
          const items = (data || []).map((item: any) => item.text || item.nome || '');
          setSuggestions(items.filter(Boolean));
        }
      })
      .catch(() => {
        if (active) {
          setSuggestions([]);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [query]);

  return { suggestions, isLoading };
}
