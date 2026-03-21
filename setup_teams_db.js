import { Client } from 'pg';

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:jSXlmujoeKz9PdA1@db.vkmvquxxpycwbzkihqbc.supabase.co:5432/postgres";

async function setupTeamsDb() {
  const client = new Client({ connectionString: dbUrl });
  
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        team_id UUID
      );
    `);
    console.log("Verified 'users' table.");

    // 2. Teams Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        created_by TEXT REFERENCES users(email) ON DELETE CASCADE
      );
    `);
    console.log("Verified 'teams' table.");

    // Add foreign key constraint to users table now that teams exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='users_team_id_fkey') THEN
          ALTER TABLE users ADD CONSTRAINT users_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
        END IF;
      END;
      $$;
    `);

    // 3. Team Members Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'Member',
        PRIMARY KEY (team_id, user_id)
      );
    `);
    console.log("Verified 'team_members' table.");

    // 4. Shared Emails Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shared_emails (
        email_id TEXT NOT NULL,
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
        status TEXT DEFAULT 'assigned',
        deadline TIMESTAMP WITH TIME ZONE,
        priority INTEGER DEFAULT 50,
        PRIMARY KEY (email_id, team_id)
      );
    `);
    console.log("Verified 'shared_emails' table.");

    // 5. Notes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email_id TEXT NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log("Verified 'notes' table.");

    console.log("✅ Successfully initialized Team Collaboration database architecture.");

  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    await client.end();
  }
}

setupTeamsDb();
