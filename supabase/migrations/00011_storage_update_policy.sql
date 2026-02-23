-- ============================================================
-- DOSEBASE: Allow updating own storage objects (photo replacement)
-- ============================================================

CREATE POLICY "Users can update own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'injection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'injection-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
