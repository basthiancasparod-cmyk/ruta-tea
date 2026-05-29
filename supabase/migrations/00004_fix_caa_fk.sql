-- Fix FK constraint: profile_id should reference auth.users(id)
-- because existing data uses auth.uid() and it's simpler/more direct.

ALTER TABLE caa_boards DROP CONSTRAINT IF EXISTS caa_boards_profile_id_fkey;

ALTER TABLE caa_boards
  ADD CONSTRAINT caa_boards_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Simplify RLS policies to compare profile_id directly to auth.uid()

DROP POLICY IF EXISTS "Users can view own boards" ON caa_boards;
CREATE POLICY "Users can view own boards"
  ON caa_boards FOR SELECT
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own boards" ON caa_boards;
CREATE POLICY "Users can insert own boards"
  ON caa_boards FOR INSERT
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own boards" ON caa_boards;
CREATE POLICY "Users can update own boards"
  ON caa_boards FOR UPDATE
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own boards" ON caa_boards;
CREATE POLICY "Users can delete own boards"
  ON caa_boards FOR DELETE
  USING (profile_id = auth.uid());
