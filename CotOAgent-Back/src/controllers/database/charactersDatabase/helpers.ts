import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

interface ClassResult {
  classification: string;
  class_name: string;
}

interface RaceResult {
  campaign: string;
  name: string;
}

export async function getUserOrCreate(userEmail: string): Promise<number> {
  const client = await pool.connect();
  try {
    const userResult = await client.query('SELECT id FROM users WHERE LOWER(user_email) = $1', [
      userEmail,
    ]);

    if (userResult.rows.length === 0) {
      const createUserResult = await client.query(
        'INSERT INTO users (user_email) VALUES ($1) RETURNING id',
        [userEmail]
      );
      return createUserResult.rows[0].id as number;
    }

    return userResult.rows[0].id as number;
  } finally {
    client.release();
  }
}

export async function getClassDetails(className: string): Promise<{
  classification: string | null;
  classNameValue: string | null;
}> {
  const client = await pool.connect();
  try {
    const classResult = await client.query(
      'SELECT classification, class_name FROM classes WHERE LOWER(class_name) = LOWER($1) LIMIT 1',
      [className]
    );

    if (classResult.rows.length > 0) {
      const row = classResult.rows[0] as ClassResult;
      return {
        classification: row.classification,
        classNameValue: row.class_name,
      };
    }

    return {
      classification: null,
      classNameValue: null,
    };
  } finally {
    client.release();
  }
}

export async function getRaceDetails(race: string): Promise<{
  campaign: string | null;
  raceNameValue: string | null;
}> {
  const client = await pool.connect();
  try {
    const raceResult = await client.query(
      'SELECT campaign, name FROM races WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [race]
    );

    if (raceResult.rows.length > 0) {
      const row = raceResult.rows[0] as RaceResult;
      return {
        campaign: row.campaign,
        raceNameValue: row.name,
      };
    }

    return {
      campaign: null,
      raceNameValue: null,
    };
  } finally {
    client.release();
  }
}

export async function verifyCharacterOwnership(
  characterId: number,
  userId: number
): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id FROM characters WHERE id = $1 AND user_id = $2',
      [characterId, userId]
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}
