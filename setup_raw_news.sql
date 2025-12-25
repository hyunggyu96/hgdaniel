-- raw_news 테이블 생성 SQL
-- Supabase SQL Editor에서 실행해주세요.

CREATE TABLE IF NOT EXISTS public.raw_news (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    link text UNIQUE NOT NULL,
    pub_date timestamptz,
    search_keyword text,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_raw_news_status ON public.raw_news (status);
CREATE INDEX IF NOT EXISTS idx_raw_news_link ON public.raw_news (link);
