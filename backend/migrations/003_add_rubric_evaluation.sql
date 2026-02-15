-- Add rubric_evaluation column to text_analyses table
-- Created: 2026-02-14
-- Purpose: Store structured rubric evaluation scores from GPT

ALTER TABLE text_analyses ADD COLUMN IF NOT EXISTS rubric_evaluation JSONB;

COMMENT ON COLUMN text_analyses.rubric_evaluation IS 'GPT evaluation scores for each rubric dimension (JSON). Populated when rubric exists.';
