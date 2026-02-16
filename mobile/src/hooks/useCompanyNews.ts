import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Article } from "./useNews";

export function useCompanyNews(companyName: string) {
  const [data, setData] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyNews = useCallback(async () => {
    if (!companyName) return;
    setLoading(true);

    const { data: articles, error: err } = await supabase
      .from("articles")
      .select("title, published_at, link, id")
      .neq("category", "NOISE")
      .or(
        `title.ilike.%${companyName}%,description.ilike.%${companyName}%`
      )
      .order("published_at", { ascending: false })
      .limit(10);

    if (err) {
      setError(err.message);
    } else {
      setData((articles as Article[]) || []);
      setError(null);
    }
    setLoading(false);
  }, [companyName]);

  useEffect(() => {
    fetchCompanyNews();
  }, [fetchCompanyNews]);

  return { data, loading, error, refetch: fetchCompanyNews };
}
