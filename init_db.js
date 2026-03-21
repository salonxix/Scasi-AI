import { Client } from 'pg';

const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:jSXlmujoeKz9PdA1@db.vkmvquxxpycwbzkihqbc.supabase.co:5432/postgres";

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log("Connected to Supabase Postgres.");

    // Create the teams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_collaborators (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'pending',
        role TEXT DEFAULT 'Member',
        active_tasks_count INTEGER DEFAULT 0,
        response_rate INTEGER DEFAULT 100,
        workload_level TEXT DEFAULT 'Balanced',
        workload_color TEXT DEFAULT '#10B981',
        avatar_text TEXT
      );
    `);

    // Insert dummy tasks if the table is empty
    const { rows } = await client.query('SELECT COUNT(*) FROM team_collaborators');
    if (parseInt(rows[0].count) === 0) {
      await client.query(`
        INSERT INTO team_collaborators (email, name, status, role, active_tasks_count, response_rate, workload_level, workload_color, avatar_text)
        VALUES 
          ('sarah@company.com', 'Sarah Chen', 'active', 'Designer', 12, 94, 'High', '#EF4444', 'SC'),
          ('mike@company.com', 'Mike Ross', 'active', 'Developer', 8, 88, 'Balanced', '#10B981', 'MR'),
          ('emily@company.com', 'Emily Wong', 'active', 'Marketing', 15, 98, 'Very High', '#EF4444', 'EW')
      `);
      console.log("Seeded team_collaborators table.");
    } else {
      console.log("team_collaborators table already has data.");
    }

    // Create assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS email_assignments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        assignee_email TEXT NOT NULL,
        email_subject TEXT NOT NULL,
        email_snippet TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'Medium',
        due_date TIMESTAMP WITH TIME ZONE
      );
    `);

    const assignCount = await client.query('SELECT COUNT(*) FROM email_assignments');
    if (parseInt(assignCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO email_assignments (assignee_email, email_subject, email_snippet, status, priority, due_date)
        VALUES 
          ('sarah@company.com', 'Update Brand Assets', 'Please update the core logo assets for the Q3 campaign', 'pending', 'High', now() + interval '2 days'),
          ('mike@company.com', 'Fix Dashboard Bug', 'The team view is occasionally crashing in production.', 'in_progress', 'Critical', now() + interval '1 day')
      `);
      console.log("Seeded email_assignments table.");
    }

    console.log("Init complete.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  } finally {
    await client.end();
  }
}

run();
