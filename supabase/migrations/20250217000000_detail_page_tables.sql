-- Detail page tables for member check-in dashboard

CREATE TABLE IF NOT EXISTS checkin_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 5),
  question_type TEXT NOT NULL CHECK (question_type IN ('general_notes', 'weekly_question', 'mood')),
  question_index INTEGER, -- for weekly_question ordering
  answer_text TEXT DEFAULT '',
  mood_emoji TEXT,
  mood_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, week_id, day_number, question_type, question_index)
);

CREATE TABLE IF NOT EXISTS checkin_ai_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES members(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES members(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  reason TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  week_id UUID REFERENCES weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  due_type TEXT DEFAULT 'today' CHECK (due_type IN ('today', 'this_week', 'next_week', 'custom')),
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_member_week_day ON checkin_feedback(member_id, week_id, day_number);
CREATE INDEX IF NOT EXISTS idx_ai_notes_member_week_day ON checkin_ai_notes(member_id, week_id, day_number);
CREATE INDEX IF NOT EXISTS idx_blockers_blocker ON blockers(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blockers_blocked ON blockers(blocked_id);
CREATE INDEX IF NOT EXISTS idx_commitments_member_week ON commitments(member_id, week_id);

-- Updated_at triggers
CREATE TRIGGER update_checkin_feedback_updated_at
    BEFORE UPDATE ON checkin_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_notes_updated_at
    BEFORE UPDATE ON checkin_ai_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_commitments_updated_at
    BEFORE UPDATE ON commitments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
