-- Supabase Auth + Row Level Security migration
-- Links members to Supabase Auth users and enforces per-user write access

-- 1. Add auth columns to members
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Helper: resolve current auth user to member id
CREATE OR REPLACE FUNCTION get_my_member_id() RETURNS UUID AS $$
  SELECT id FROM public.members WHERE auth_user_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Helper: check if current auth user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE auth_user_id = auth.uid() AND is_admin = true
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_ai_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockers ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. RLS Policies
-- ============================================================

-- ---------- teams ----------
CREATE POLICY "teams_select" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_insert" ON teams FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "teams_update" ON teams FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "teams_delete" ON teams FOR DELETE TO authenticated USING (is_admin());

-- ---------- members ----------
CREATE POLICY "members_select" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "members_insert" ON members FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "members_update" ON members FOR UPDATE TO authenticated
  USING (auth_user_id = auth.uid() OR is_admin());
CREATE POLICY "members_delete" ON members FOR DELETE TO authenticated USING (is_admin());

-- ---------- weeks ----------
CREATE POLICY "weeks_select" ON weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "weeks_insert" ON weeks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "weeks_update" ON weeks FOR UPDATE TO authenticated USING (true);

-- ---------- weekly_questions ----------
CREATE POLICY "wq_select" ON weekly_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "wq_insert" ON weekly_questions FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "wq_update" ON weekly_questions FOR UPDATE TO authenticated USING (is_admin());
CREATE POLICY "wq_delete" ON weekly_questions FOR DELETE TO authenticated USING (is_admin());

-- ---------- checkin_notes ----------
CREATE POLICY "notes_select" ON checkin_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "notes_insert" ON checkin_notes FOR INSERT TO authenticated
  WITH CHECK (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "notes_update" ON checkin_notes FOR UPDATE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "notes_delete" ON checkin_notes FOR DELETE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());

-- ---------- checkin_feedback ----------
CREATE POLICY "feedback_select" ON checkin_feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "feedback_insert" ON checkin_feedback FOR INSERT TO authenticated
  WITH CHECK (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "feedback_update" ON checkin_feedback FOR UPDATE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "feedback_delete" ON checkin_feedback FOR DELETE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());

-- ---------- checkin_ai_notes ----------
CREATE POLICY "ai_notes_select" ON checkin_ai_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "ai_notes_insert" ON checkin_ai_notes FOR INSERT TO authenticated
  WITH CHECK (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "ai_notes_update" ON checkin_ai_notes FOR UPDATE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "ai_notes_delete" ON checkin_ai_notes FOR DELETE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());

-- ---------- blockers ----------
CREATE POLICY "blockers_select" ON blockers FOR SELECT TO authenticated USING (true);
CREATE POLICY "blockers_insert" ON blockers FOR INSERT TO authenticated
  WITH CHECK (blocker_id = get_my_member_id() OR is_admin());
CREATE POLICY "blockers_update" ON blockers FOR UPDATE TO authenticated
  USING (blocker_id = get_my_member_id() OR is_admin());
CREATE POLICY "blockers_delete" ON blockers FOR DELETE TO authenticated
  USING (blocker_id = get_my_member_id() OR is_admin());

-- ---------- commitments ----------
CREATE POLICY "commitments_select" ON commitments FOR SELECT TO authenticated USING (true);
CREATE POLICY "commitments_insert" ON commitments FOR INSERT TO authenticated
  WITH CHECK (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "commitments_update" ON commitments FOR UPDATE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());
CREATE POLICY "commitments_delete" ON commitments FOR DELETE TO authenticated
  USING (member_id = get_my_member_id() OR is_admin());
