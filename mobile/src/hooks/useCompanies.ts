import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { CompanyData, allCompanies } from "@/data/companyList";

export function useCompanies() {
    const [companies, setCompanies] = useState<CompanyData[]>(allCompanies);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const loadedRef = useRef(false);

    const fetchCompanies = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .order("name_ko", { ascending: true });

            if (error) {
                throw error;
            }

            if (data) {
                // Map Supabase data to CompanyData interface
                // Note: Supabase returns { name_ko, name_en, ... } fields flat
                // We need to shape it into { name: { ko, en }, ... }
                const formatted: CompanyData[] = data.map((item) => ({
                    id: item.id,
                    name: {
                        ko: item.name_ko,
                        en: item.name_en,
                    },
                    status: item.status,
                    category: item.category,
                }));
                setCompanies(formatted);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            loadedRef.current = true;
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    return { companies, loading, error, refetch: fetchCompanies };
}
