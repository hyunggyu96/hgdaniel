import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface Article {
  id: string;
  title: string;
  description: string;
  link: string;
  published_at: string;
  category: string;
  keyword: string;
}

const PAGE_SIZE = 300;

export function useNews() {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchNewsPage = useCallback(async (reset: boolean) => {
    if (isFetchingRef.current) return;
    if (!reset && !hasMoreRef.current) return;

    isFetchingRef.current = true;
    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    const from = reset ? 0 : offsetRef.current;
    const to = from + PAGE_SIZE - 1;

    const { data: articles, error: err, count } = await supabase
      .from("articles")
      .select("*", reset ? { count: "planned" } : undefined)
      .neq("category", "NOISE")
      .order("published_at", { ascending: false })
      .range(from, to);

    if (err) {
      setError(err.message);
    } else {
      const rows = articles || [];
      if (reset) {
        setData(rows);
        if (typeof count === "number") {
          setTotal(count);
        }
      } else {
        setData((prev) => {
          const seen = new Set(prev.map((a) => a.id || a.link));
          const merged = [...prev];
          rows.forEach((article) => {
            const key = article.id || article.link;
            if (!seen.has(key)) {
              seen.add(key);
              merged.push(article);
            }
          });
          return merged;
        });
      }

      offsetRef.current = from + rows.length;
      const more =
        typeof count === "number"
          ? offsetRef.current < count
          : rows.length === PAGE_SIZE;
      hasMoreRef.current = more;
      setHasMore(more);
      setError(null);
    }

    if (reset) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
    isFetchingRef.current = false;
  }, []);

  const refetch = useCallback(async () => {
    offsetRef.current = 0;
    hasMoreRef.current = true;
    setHasMore(true);
    await fetchNewsPage(true);
  }, [fetchNewsPage]);

  const loadMore = useCallback(async () => {
    if (!hasMoreRef.current || isFetchingRef.current) return;
    await fetchNewsPage(false);
  }, [fetchNewsPage]);

  useEffect(() => {
    refetch();
    return () => {
      isFetchingRef.current = false;
    };
  }, [refetch]);

  return { data, loading, loadingMore, hasMore, total, error, refetch, loadMore };
}
