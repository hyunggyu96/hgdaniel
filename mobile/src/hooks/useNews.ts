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

export function useNews() {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNews = useCallback(async () => {
    const { data: articles, error: err } = await supabase
      .from("articles")
      .select("*")
      .neq("category", "NOISE")
      .order("published_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setData(articles || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(fetchNews, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchNews]);

  return { data, loading, error, refetch: fetchNews };
}
