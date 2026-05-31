-- ============================================================
-- 00032: Behavior log images — image_url column & storage bucket
-- ============================================================

ALTER TABLE behavior_logs ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for behavior log images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('conducta', 'conducta', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view conducta images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'conducta');

CREATE POLICY "Users can upload conducta images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'conducta' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update conducta images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'conducta' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete conducta images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'conducta' AND auth.role() = 'authenticated');
