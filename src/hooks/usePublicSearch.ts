import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface PublicDocket {
  id: string;
  title: string;
  summary: string;
  slug: string;
  tags: string[];
  status: string;
  open_at: string;
  close_at?: string;
  comment_count: number;
  agency_name: string;
}

export interface SearchFilters {
  query?: string;
  tags?: string[];
  status?: 'open' | 'closed' | 'all';
  limit?: number;
  offset?: number;
}

export const usePublicSearch = () => {
  const [dockets, setDockets] = useState<PublicDocket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const searchDockets = useCallback(async (filters: SearchFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase.rpc('get_public_dockets', {
        p_search_query: filters.query || null,
        p_tags: filters.tags || null,
        p_status: filters.status === 'all' ? null : (filters.status || 'open'),
        p_limit: filters.limit || 20,
        p_offset: filters.offset || 0
      });

      if (searchError) {
        console.error('Search error:', searchError);
        setError('Failed to search dockets');
        return;
      }

      const results = data || [];
      
      if (filters.offset === 0) {
        setDockets(results);
      } else {
        setDockets(prev => [...prev, ...results]);
      }

      setHasMore(results.length === (filters.limit || 20));
      setTotal(prev => filters.offset === 0 ? results.length : prev + results.length);

    } catch (err) {
      console.error('Search error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback((filters: SearchFilters = {}) => {
    const newFilters = {
      ...filters,
      offset: dockets.length
    };
    searchDockets(newFilters);
  }, [dockets.length, searchDockets]);

  const reset = useCallback(() => {
    setDockets([]);
    setError(null);
    setHasMore(true);
    setTotal(0);
  }, []);

  return {
    dockets,
    loading,
    error,
    hasMore,
    total,
    searchDockets,
    loadMore,
    reset
  };
};