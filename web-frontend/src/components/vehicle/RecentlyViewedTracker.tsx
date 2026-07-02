'use client';

import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

export function RecentlyViewedTracker({ id, title, imageUrl }: { id: string, title: string, imageUrl: string }) {
  useRecentlyViewed({ id, title, imageUrl });
  return null;
}
