import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';

const charactersRouter: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

interface CharacterPayload {
  name: string;
  class: string;
  race: string;
  stats: {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
  };
}

/**
 * POST /api/characters/create
 * Create or update a character for the current user
 */
charactersRouter.post('/create', async (req: Request, res: Response) => {
  try {
    const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
    const { name, class: className, race, stats } = req.body as CharacterPayload;

    if (!userEmail) {
      return res.status(400).json({ error: 'Missing user email in header' });
    }

    if (!name || !className || !race) {
      return res.status(400).json({ error: 'Missing required fields: name, class, race' });
    }

    if (!stats || typeof stats.Strength !== 'number') {
      return res.status(400).json({ error: 'Invalid stats format' });
    }

    const client = await pool.connect();

    try {
      // Get or create user
      const userResult = await client.query('SELECT id FROM users WHERE LOWER(user_email) = $1', [
        userEmail,
      ]);

      let userId: number;

      if (userResult.rows.length === 0) {
        // Create new user
        const createUserResult = await client.query(
          'INSERT INTO users (user_email) VALUES ($1) RETURNING id',
          [userEmail]
        );
        userId = createUserResult.rows[0].id;
      } else {
        userId = userResult.rows[0].id;
      }

      // Get class ID
      let classId: number | null = null;
      if (className) {
        const classResult = await client.query(
          'SELECT id FROM classes WHERE LOWER(class_name) = LOWER($1) LIMIT 1',
          [className]
        );
        if (classResult.rows.length > 0) {
          classId = classResult.rows[0].id;
        }
      }

      // Get race ID
      let raceId: number | null = null;
      if (race) {
        const raceResult = await client.query(
          'SELECT id FROM races WHERE LOWER(name) = LOWER($1) LIMIT 1',
          [race]
        );
        if (raceResult.rows.length > 0) {
          raceId = raceResult.rows[0].id;
        }
      }

      // Create character
      const createCharacterQuery = `
        INSERT INTO characters (
          user_id, name, class_id, race_id,
          strength, dexterity, constitution, intelligence, wisdom, charisma
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id
      `;

      const characterResult = await client.query(createCharacterQuery, [
        userId,
        name,
        classId,
        raceId,
        stats.Strength,
        stats.Dexterity,
        stats.Constitution,
        stats.Intelligence,
        stats.Wisdom,
        stats.Charisma,
      ]);

      const characterId = characterResult.rows[0].id;

      return res.status(201).json({
        success: true,
        message: 'Character created successfully',
        characterId,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Characters Controller] Error:', error);
    return res.status(500).json({
      error: 'Failed to create character',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/characters
 * Get all characters for the currently logged-in user
 */
charactersRouter.get('/', async (req: Request, res: Response) => {
  try {
    const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();

    if (!userEmail) {
      return res.status(400).json({ error: 'Missing user email in header' });
    }

    const client = await pool.connect();

    try {
      // Get or create user
      const userResult = await client.query('SELECT id FROM users WHERE LOWER(user_email) = $1', [
        userEmail,
      ]);

      let userId: number;

      if (userResult.rows.length === 0) {
        // Create new user if they don't exist
        const createUserResult = await client.query(
          'INSERT INTO users (user_email) VALUES ($1) RETURNING id',
          [userEmail]
        );
        userId = createUserResult.rows[0].id;
      } else {
        userId = userResult.rows[0].id;
      }

      // Get all characters for this user
      const charactersResult = await client.query(
        `SELECT 
          c.id,
          c.name,
          c.class_id,
          c.race_id,
          c.strength,
          c.dexterity,
          c.constitution,
          c.intelligence,
          c.wisdom,
          c.charisma,
          c.created_at,
          c.last_modified,
          c.feedback,
          c.approval_status,
          c.revised,
          cl.class_name,
          r.name as race_name
        FROM characters c
        LEFT JOIN classes cl ON c.class_id = cl.id
        LEFT JOIN races r ON c.race_id = r.id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC`,
        [userId]
      );

      return res.status(200).json({
        success: true,
        characters: charactersResult.rows,
        count: charactersResult.rows.length,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Characters Controller] Error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve characters',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default charactersRouter;
