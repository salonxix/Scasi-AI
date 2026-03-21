-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  team_id UUID
);

-- 2. Teams Table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT REFERENCES users(email) ON DELETE CASCADE
);

-- Add foreign key constraint to users table now that teams exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='users_team_id_fkey') THEN
    ALTER TABLE users ADD CONSTRAINT users_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END;
$$;

-- 3. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member',
  PRIMARY KEY (team_id, user_id)
);

-- 4. Shared Emails Table
CREATE TABLE IF NOT EXISTS shared_emails (
  email_id TEXT NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'assigned',
  deadline TIMESTAMP WITH TIME ZONE,
  priority INTEGER DEFAULT 50,
  PRIMARY KEY (email_id, team_id)
);

-- 5. Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Initial Dummy Data logic just to verify it works (uncomment if needed)
/*
INSERT INTO users (name, email) VALUES ('Alex', 'alex@example.com') ON CONFLICT DO NOTHING;
*/
