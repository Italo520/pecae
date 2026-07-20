import { useEffect, useState } from 'react';

export interface RecentlyViewedItem {
  id: string;
  title: string;
  imageUrl: string;
  price?: number; // Preço não exsite em sucata, mas útil no futuro
}

const STORAGE_KEY = 'pecae-recently-viewed';

export function useRecentlyViewed(currentItem?: RecentlyViewedItem) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let parsed: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

      if (currentItem && currentItem.id) {
        // Remove if already exists to push to top
        parsed = parsed.filter((item) => item.id !== currentItem.id);
        parsed.unshift(currentItem);
        
        // Keep only last 10
        if (parsed.length > 10) {
          parsed = parsed.slice(0, 10);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }

      setItems(parsed);
    } catch (err) {
      console.error('Error with recently viewed items', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentItem?.id]); // Apenas reexecuta se o ID mudar

  return items;
}
