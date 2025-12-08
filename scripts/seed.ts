const { neon } = require('@neondatabase/serverless');
const { people, tags } = require('../src/lib/initial-data');

// Since we're running this as a script, we should use process.env for DB URL
// Assumes user will run with env vars loaded (e.g. via Vercel env pull or dotenv)
const sql = neon(process.env.DATABASE_URL);

async function main() {
    console.log('🌱 Starting seed script...');

    try {
        // 1. Create Tables
        console.log('creating table tags...');
        await sql`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category VARCHAR(100) DEFAULT 'Non classée',
        is_priority BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

        console.log('creating table people...');
        await sql`
      CREATE TABLE IF NOT EXISTS people (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firstname VARCHAR(100) NOT NULL,
        lastname VARCHAR(100) NOT NULL,
        solicitation_count INTEGER DEFAULT 0,
        last_solicitation_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

        console.log('creating table person_tags...');
        await sql`
      CREATE TABLE IF NOT EXISTS person_tags (
        person_id UUID REFERENCES people(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (person_id, tag_id)
      )
    `;

        // 2. Insert Tags
        console.log(`Inserting ${tags.length} tags...`);
        for (const tag of tags) {
            await sql`
        INSERT INTO tags (name, category, is_priority)
        VALUES (${tag.name}, ${tag.category}, ${tag.is_priority})
        ON CONFLICT (name) DO UPDATE 
        SET category = EXCLUDED.category
      `;
        }

        // 3. Insert People and their Tags
        console.log(`Inserting ${people.length} people...`);

        // Clear existing people to avoid duplicates on re-run (optional, but safer for "initial seed")
        // await sql`TRUNCATE people CASCADE`;
        // For now, let's just insert. Since UUIDs are random, we might get duplicates if run twice.
        // Let's check for existence based on name first.

        let addedCount = 0;
        let skippedCount = 0;

        for (const person of people) {
            // Check if person exists
            const existing = await sql`
        SELECT id FROM people 
        WHERE firstname = ${person.firstname} AND lastname = ${person.lastname}
        LIMIT 1
      `;

            let personId;

            if (existing.length > 0) {
                personId = existing[0].id;
                skippedCount++;
                // Optionally update fields?
            } else {
                const [row] = await sql`
          INSERT INTO people (firstname, lastname, solicitation_count, last_solicitation_date)
          VALUES (${person.firstname}, ${person.lastname}, ${person.solicitation_count}, ${person.last_solicitation_date ? new Date(person.last_solicitation_date) : null})
          RETURNING id
        `;
                personId = row.id;
                addedCount++;
            }

            // Link Tags
            if (person.tags && person.tags.length > 0) {
                // Get IDs for these tags
                const tagRows = await sql`
          SELECT id FROM tags WHERE name = ANY(${person.tags})
        `;

                for (const tagRow of tagRows) {
                    await sql`
            INSERT INTO person_tags (person_id, tag_id)
            VALUES (${personId}, ${tagRow.id})
            ON CONFLICT DO NOTHING
          `;
                }
            }
        }

        console.log(`✅ Seed finished. Added ${addedCount} people, skipped ${skippedCount} existing.`);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

main();
