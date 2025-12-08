import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Lazy initialization - only connect when needed (at runtime, not build time)
let sql: NeonQueryFunction<false, false> | null = null;

function getDb() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

// Types
export interface Person {
  id: string;
  firstname: string;
  lastname: string;
  solicitation_count: number;
  last_solicitation_date: string | null;
  tags: string[];
}

export interface Tag {
  id: number;
  name: string;
  category: string;
  is_priority: boolean;
}

// Get all contacts with their tags
export async function getContacts(): Promise<Person[]> {
  const db = getDb();
  const rows = await db`
    SELECT 
      p.id,
      p.firstname,
      p.lastname,
      p.solicitation_count,
      p.last_solicitation_date,
      COALESCE(
        array_agg(t.name) FILTER (WHERE t.name IS NOT NULL),
        ARRAY[]::varchar[]
      ) as tags
    FROM people p
    LEFT JOIN person_tags pt ON p.id = pt.person_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    GROUP BY p.id
    ORDER BY p.lastname, p.firstname
  `;

  return rows as Person[];
}

// Get all tags grouped by category
export async function getTags(): Promise<Tag[]> {
  const db = getDb();
  const rows = await db`
    SELECT id, name, category, is_priority
    FROM tags
    ORDER BY category, name
  `;

  return rows as Tag[];
}

// Add a new contact
export async function addContact(
  firstname: string,
  lastname: string,
  tagNames: string[]
): Promise<Person> {
  const db = getDb();

  // Insert the person
  const [person] = await db`
    INSERT INTO people (firstname, lastname, solicitation_count)
    VALUES (${firstname}, ${lastname}, 0)
    RETURNING id, firstname, lastname, solicitation_count, last_solicitation_date
  `;

  // Get tag IDs for the given names
  if (tagNames.length > 0) {
    const tagRows = await db`
      SELECT id FROM tags WHERE name = ANY(${tagNames})
    `;

    // Insert person_tags relationships
    for (const tag of tagRows) {
      await db`
        INSERT INTO person_tags (person_id, tag_id)
        VALUES (${person.id}, ${tag.id})
      `;
    }
  }

  return {
    ...person,
    tags: tagNames
  } as Person;
}

// Update a contact's tags (replace all tags)
export async function updateContactTags(
  personId: string,
  tagNames: string[]
): Promise<Person | null> {
  const db = getDb();

  // Check if person exists
  const [person] = await db`
    SELECT id, firstname, lastname, solicitation_count, last_solicitation_date
    FROM people WHERE id = ${personId}
  `;

  if (!person) return null;

  // Remove all existing tags
  await db`DELETE FROM person_tags WHERE person_id = ${personId}`;

  // Add new tags
  if (tagNames.length > 0) {
    const tagRows = await db`
      SELECT id FROM tags WHERE name = ANY(${tagNames})
    `;

    for (const tag of tagRows) {
      await db`
        INSERT INTO person_tags (person_id, tag_id)
        VALUES (${personId}, ${tag.id})
      `;
    }
  }

  return {
    ...person,
    tags: tagNames
  } as Person;
}

// Delete a contact
export async function deleteContact(personId: string): Promise<boolean> {
  const db = getDb();

  const result = await db`
    DELETE FROM people WHERE id = ${personId}
    RETURNING id
  `;

  return result.length > 0;
}

// Schema creation SQL (for reference and initial setup)
export const SCHEMA_SQL = `
-- Table des contacts
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  solicitation_count INTEGER DEFAULT 0,
  last_solicitation_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des tags
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(100) DEFAULT 'Non classée',
  is_priority BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table de liaison (many-to-many)
CREATE TABLE IF NOT EXISTS person_tags (
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (person_id, tag_id)
);
`;
