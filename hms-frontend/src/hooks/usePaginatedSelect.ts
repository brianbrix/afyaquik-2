import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PaginatedSelectOptions<T> {
  queryKey: string[];
  queryFn: (page: number, size: number, search?: string) => Promise<{
    content: T[];
    totalElements: number;
    totalPages: number;
  }>;
  searchDebounceMs?: number;
  pageSize?: number;
}

interface PaginatedSelectResult<T> {
  options: { value: any; label: string }[];
  loading: boolean;
  error: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasMore: boolean;
  loadMore: () => void;
}

export function usePaginatedSelect<T extends { id: number; displayName?: string; username?: string; name?: string }>({
  queryKey,
  queryFn,
  searchDebounceMs = 300,
  pageSize = 50
}: PaginatedSelectOptions<T>): PaginatedSelectResult<T> {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [allItems, setAllItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0);
      setAllItems([]);
    }, searchDebounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, searchDebounceMs]);

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: [...queryKey, currentPage, debouncedSearch],
    queryFn: () => queryFn(currentPage, pageSize, debouncedSearch || undefined),
    enabled: true
  });

  // Update items when new data arrives
  useEffect(() => {
    if (data) {
      if (currentPage === 0) {
        setAllItems(data.content);
      } else {
        setAllItems(prev => [...prev, ...data.content]);
      }
      setHasMore(data.totalPages > currentPage + 1);
    }
  }, [data, currentPage]);

  // Reset when search changes
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setAllItems([]);
      setCurrentPage(0);
    }
  }, [debouncedSearch, searchTerm]);

  const options = useMemo(() => {
    return allItems.map((item: T) => ({
      value: item.id,
      label: item.displayName || item.name || item.username || `Item ${item.id}`
    }));
  }, [allItems]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return {
    options,
    loading: isLoading,
    error,
    searchTerm,
    setSearchTerm,
    hasMore,
    loadMore
  };
}


