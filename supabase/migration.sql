-- Weekly Check-in Manager Schema

-- Teams/groups for organizing members
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Team members
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  avatar_url text,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Weeks and their active days
CREATE TABLE IF NOT EXISTS weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start date NOT NULL UNIQUE,
  active_days integer[] DEFAULT '{1,3,5}',
  created_at timestamptz DEFAULT now()
);

-- Optional question sets per week
CREATE TABLE IF NOT EXISTS weekly_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid REFERENCES weeks(id) ON DELETE CASCADE,
  questions text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Check-in notes (the core data)
CREATE TABLE IF NOT EXISTS checkin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  week_id uuid REFERENCES weeks(id) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day >= 1 AND day <= 5),
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(member_id, week_id, day)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_members_active ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_checkin_notes_week ON checkin_notes(week_id);
CREATE INDEX IF NOT EXISTS idx_checkin_notes_member ON checkin_notes(member_id);
CREATE INDEX IF NOT EXISTS idx_weeks_start ON weeks(week_start);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_checkin_notes_updated_at
    BEFORE UPDATE ON checkin_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
