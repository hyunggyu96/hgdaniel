import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publication_date: string;
  journal: string;
  keywords: string[];
  link: string;
}

interface InsightsResult {
  data: Paper[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function sanitizeSearchQuery(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&").slice(0, 200);
}

export function useInsights(
  page: number = 1,
  limit: number = 20,
  keyword: string = "",
  query: string = ""
): InsightsResult {
  const [data, setData] = useState<Paper[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let dbQuery = supabase
      .from("pubmed_papers")
      .select("*", { count: "planned" })
      .order("publication_date", { ascending: false })
      .range(from, to)
      .abortSignal(controller.signal);

    if (keyword) {
      dbQuery = dbQuery.contains("keywords", [keyword]);
    }

    if (query) {
      const sanitized = sanitizeSearchQuery(query);
      dbQuery = dbQuery.or(
        `title.ilike.%${sanitized}%,abstract.ilike.%${sanitized}%`
      );
    }

    try {
      const { data: papers, error: err, count } = await dbQuery;
      if (controller.signal.aborted) return;

      if (err) {
        setError(err.message);
      } else {
        setData(papers || []);
        setTotal(count || 0);
        setError(null);
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message || "Failed to load papers");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, limit, keyword, query]);

  useEffect(() => {
    fetchPapers();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchPapers]);

  return {
    data,
    total,
    totalPages: total ? Math.ceil(total / limit) : 0,
    loading,
    error,
    refetch: fetchPapers,
  };
}
