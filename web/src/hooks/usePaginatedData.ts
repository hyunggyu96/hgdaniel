import { useState, useEffect, useCallback } from 'react';

interface PaginationInfo {
    page: number;
    limit: number;
    total: number | null;
    totalPages: number;
}

interface UsePaginatedDataOptions {
    endpoint: string;
    itemsPerPage?: number;
    params?: Record<string, string | number | boolean | undefined>;
}

interface UsePaginatedDataResult<T> {
    items: T[];
    loading: boolean;
    error: string;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    setCurrentPage: (page: number | ((prev: number) => number)) => void;
    refetch: () => void;
}

export function usePaginatedData<T = any>({
    endpoint,
    itemsPerPage = 10,
    params = {},
}: UsePaginatedDataOptions): UsePaginatedDataResult<T> {
    const [items, setItems] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    // Serialize params for dependency tracking
    const paramsKey = JSON.stringify(params);

    const fetchData = useCallback(async (page: number) => {
        setLoading(true);
        setError('');
        try {
            const searchParams = new URLSearchParams();
            searchParams.set('page', String(page));
            searchParams.set('limit', String(itemsPerPage));

            // Add custom params
            const parsedParams = JSON.parse(paramsKey);
            for (const [key, value] of Object.entries(parsedParams)) {
                if (value !== undefined && value !== '' && value !== false) {
                    searchParams.set(key, String(value));
                }
            }

            const res = await fetch(`${endpoint}?${searchParams.toString()}`, {
                headers: { 'Cache-Control': 'no-cache' },
            });
            const result = await res.json();

            if (result.error) {
                setError(result.error);
                return;
            }

            setItems(result.data || []);
            setTotalPages(result.pagination?.totalPages || 0);
            setTotalCount(result.pagination?.total || 0);
        } catch {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    }, [endpoint, itemsPerPage, paramsKey]);

    // Reset to page 1 when params change
    useEffect(() => {
        setCurrentPage(1);
        fetchData(1);
    }, [fetchData]);

    // Fetch when page changes (but not on initial mount / param change)
    useEffect(() => {
        if (currentPage !== 1) {
            fetchData(currentPage);
        }
    }, [currentPage]);

    return {
        items,
        loading,
        error,
        currentPage,
        totalPages,
        totalCount,
        setCurrentPage,
        refetch: () => fetchData(currentPage),
    };
}
