-- =============================================================================
-- 003: Fix embedding dimension mismatch
-- The embedding column was altered to vector(1536) outside of migrations.
-- This resets it back to vector(768) to match the LLM router's EMBED_DIM = 768
-- and the hybrid_search_chunks function signature.
-- =============================================================================

-- Drop the HNSW index first (required before altering column type)
DROP INDEX IF EXISTS public.idx_email_chunks_embedding_hnsw;

-- Alter the column back to 768 dimensions
-- NOTE: This clears all existing embeddings — they will be re-indexed automatically
-- on next email load via /api/actions/index-emails
ALTER TABLE public.email_chunks
  ALTER COLUMN embedding TYPE vector(768)
  USING NULL;

-- Recreate the HNSW index for cosine similarity
CREATE INDEX idx_email_chunks_embedding_hnsw
  ON public.email_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Reset ingest_status so emails get re-indexed with correct dimensions
UPDATE public.emails SET ingest_status = 'pending' WHERE ingest_status = 'indexed';
