import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ConferenceEvent, CONFERENCE_EVENTS_2026 } from "@/data/conferences";

export function useConferences() {
  const [conferences, setConferences] = useState<ConferenceEvent[]>(CONFERENCE_EVENTS_2026);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const fetchConferences = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("conferences")
        .select(
          "id, series, name_ko, name_en, start_date, end_date, city_ko, city_en, country_ko, country_en, venue, url, confirmed, is_active"
        )
        .eq("is_active", true)
        .order("start_date", { ascending: true })
        .order("end_date", { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const mapped: ConferenceEvent[] = data.map((item: any) => ({
          id: item.id,
          series: item.series,
          name: {
            ko: item.name_ko,
            en: item.name_en,
          },
          startDate: item.start_date,
          endDate: item.end_date,
          city: {
            ko: item.city_ko,
            en: item.city_en,
          },
          country: {
            ko: item.country_ko,
            en: item.country_en,
          },
          venue: item.venue,
          url: item.url,
        }));

        setConferences(mapped);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      loadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    fetchConferences();
  }, [fetchConferences]);

  return { conferences, loading, error, refetch: fetchConferences };
}
