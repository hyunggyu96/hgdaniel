import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface TrendDataPoint {
  date: string;
  [category: string]: string | number;
}

export function useTrends() {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 8);

    const { data: articles, error: err } = await supabase
      .from("articles")
      .select("published_at, category")
      .neq("category", "NOISE")
      .gte("published_at", startDate.toISOString())
      .order("published_at", { ascending: false })
      .limit(5000);

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Group by date (KST) and category
    const dateMap: Record<string, Record<string, number>> = {};

    (articles || []).forEach((a: { published_at: string; category: string }) => {
      const kstDate = new Date(
        new Date(a.published_at).getTime() + 9 * 60 * 60 * 1000
      );
      const dateStr = kstDate.toISOString().split("T")[0];
      if (!dateMap[dateStr]) dateMap[dateStr] = {};
      dateMap[dateStr][a.category] = (dateMap[dateStr][a.category] || 0) + 1;
    });

    const sorted = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, categories]) => ({
        date,
        ...categories,
      }));

    setData(sorted);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { data, loading, error, refetch: fetchTrends };
}
