-- Phase 1: Version System Database Migration
-- Created: 2026-02-11

-- 1. Add current_version to works table
ALTER TABLE works ADD COLUMN IF NOT EXISTS current_version INT DEFAULT 0;

-- 2. Create work_versions table (version history)
CREATE TABLE IF NOT EXISTS work_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    content TEXT NOT NULL,
    is_submitted BOOLEAN DEFAULT false,
    parent_submission_version INT,
    user_reflection TEXT,
    change_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (work_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_work_versions_work_version
    ON work_versions(work_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_work_versions_work_submitted
    ON work_versions(work_id, is_submitted);

-- 3. Create text_analyses table (AI evaluation results)
CREATE TABLE IF NOT EXISTS text_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    version_number INT NOT NULL,
    text_snapshot TEXT NOT NULL,
    fao_comment TEXT NOT NULL,
    sentence_comments JSONB NOT NULL,
    reflection_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_text_analyses_work_version
    ON text_analyses(work_id, version_number);

-- 4. Create suggestion_resolutions table (suggestion tracking)
CREATE TABLE IF NOT EXISTS suggestion_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    analysis_id UUID NOT NULL REFERENCES text_analyses(id),
    suggestion_id VARCHAR(255) NOT NULL,
    from_version INT NOT NULL,
    to_version INT NOT NULL,
    user_action VARCHAR(50) NOT NULL,
    user_note TEXT,
    resolution_status VARCHAR(50),
    llm_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suggestion_resolutions_work_analysis
    ON suggestion_resolutions(work_id, analysis_id);
