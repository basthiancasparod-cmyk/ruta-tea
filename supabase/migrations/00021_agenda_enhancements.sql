-- ============================================================
-- Enhancements: rewards, audio, celebration
-- ============================================================

ALTER TABLE agenda_tasks
  ADD COLUMN reward TEXT NOT NULL DEFAULT '',
  ADD COLUMN audio_data TEXT,
  ADD COLUMN use_tts BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN audio_label TEXT NOT NULL DEFAULT '';
