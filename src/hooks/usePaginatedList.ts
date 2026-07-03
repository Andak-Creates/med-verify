import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/api/client';

interface Page<T> {
  items: T[];
}

/**
 * Generic offset-based pagination driver used by the marketplace, scan
 * history, and consultation lists: initial load, pull-to-refresh, and
 * infinite scrolling.
 *
 * `fetchPage` must be referentially stable (useCallback) — changing it resets
 * and reloads the list, which is how callers re-query on filter changes.
 */
export function usePaginatedList<T>(
  fetchPage: (offset: number, limit: number) => Promise<Page<T>>,
  pageSize = 20,
) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Guards against state updates from stale requests after filters change.
  const requestIdRef = useRef(0);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      const requestId = ++requestIdRef.current;
      if (mode === 'initial') setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);
      try {
        const page = await fetchPage(0, pageSize);
        if (requestId !== requestIdRef.current) return;
        setItems(page.items);
        setHasMore(page.items.length >= pageSize);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setError(getApiErrorMessage(err));
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [fetchPage, pageSize],
  );

  useEffect(() => {
    load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  const loadMore = useCallback(async () => {
    if (isLoading || isRefreshing || isLoadingMore || !hasMore) return;
    const requestId = requestIdRef.current;
    setIsLoadingMore(true);
    try {
      const page = await fetchPage(items.length, pageSize);
      if (requestId !== requestIdRef.current) return;
      setItems((prev) => [...prev, ...page.items]);
      setHasMore(page.items.length >= pageSize);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(getApiErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) setIsLoadingMore(false);
    }
  }, [fetchPage, pageSize, items.length, isLoading, isRefreshing, isLoadingMore, hasMore]);

  return { items, setItems, isLoading, isRefreshing, isLoadingMore, hasMore, error, refresh, loadMore };
}
