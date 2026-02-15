-- Add rubric column to works table
-- Created: 2026-02-14
-- Purpose: Store Claude-generated evaluation rubric for each work

ALTER TABLE works ADD COLUMN IF NOT EXISTS rubric TEXT;

COMMENT ON COLUMN works.rubric IS 'Claude-generated evaluation rubric (JSON). Generated on first submission, used for all subsequent evaluations.';
