-- Ask AI: pgvector extension + tables + functions
-- Run this in Supabase SQL Editor

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Session table
CREATE TABLE IF NOT EXISTS ask_ai_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text,
  title text DEFAULT 'New Session',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Sources table (papers + uploaded files)
CREATE TABLE IF NOT EXISTS ask_ai_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid REFERENCES ask_ai_sessions(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('paper', 'upload')),
  paper_id text,
  paper_title text,
  paper_journal text,
  paper_link text,
  file_name text,
  file_type text,
  file_size integer,
  created_at timestamptz DEFAULT now()
);

-- 4. Chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS ask_ai_chunks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id uuid REFERENCES ask_ai_sources(id) ON DELETE CASCADE,
  session_id uuid NOT NULL,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  embedding vector(768),
  created_at timestamptz DEFAULT now()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS ask_ai_chunks_session_idx ON ask_ai_chunks(session_id);
CREATE INDEX IF NOT EXISTS ask_ai_sources_session_idx ON ask_ai_sources(session_id);

-- Vector similarity search index (ivfflat)
CREATE INDEX IF NOT EXISTS ask_ai_chunks_embedding_idx
  ON ask_ai_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 6. Vector similarity search function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding vector(768),
  match_session_id uuid,
  match_count int DEFAULT 10,
  match_threshold float DEFAULT 0.3
) RETURNS TABLE (
  id uuid,
  source_id uuid,
  content text,
  chunk_index integer,
  similarity float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.source_id,
    c.content,
    c.chunk_index,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  FROM ask_ai_chunks c
  WHERE c.session_id = match_session_id
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 7. RLS policies
ALTER TABLE ask_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_ai_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE ask_ai_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for ask_ai_sessions" ON ask_ai_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for ask_ai_sources" ON ask_ai_sources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for ask_ai_chunks" ON ask_ai_chunks FOR ALL USING (true) WITH CHECK (true);
