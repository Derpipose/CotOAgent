import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';
import { asyncHandler, validateRequest } from '../../middleware/errorHandler.js';

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
 * POST /api/characters
 * Create a new character with just a name (simplified for chat)
 */
charactersRouter.post('/', asyncHandler(async (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const { name } = req.body as { name: string };

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(name && name.trim().length > 0, 'Character name is required', 400);

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

    // Create character with just the name
    const createCharacterQuery = `
      INSERT INTO characters (user_id, name)
      VALUES ($1, $2)
      RETURNING id, user_id, name, created_at
    `;

    const characterResult = await client.query(createCharacterQuery, [userId, name.trim()]);

    const character = characterResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Character created successfully',
      character: {
        id: character.id,
        name: character.name,
        createdAt: character.created_at,
      },
    });
  } finally {
    client.release();
  }
}));

/**
 * POST /api/characters/create
 * Create or update a character for the current user
 */
charactersRouter.post('/create', asyncHandler(async (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const { name, class: className, race, stats } = req.body as CharacterPayload;

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(name && className && race, 'Missing required fields: name, class, race', 400);
  validateRequest(stats && typeof stats.Strength === 'number', 'Invalid stats format', 400);

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

    // Get class details (classification and class_name)
    let classClassification: string | null = null;
    let classNameValue: string | null = null;
    if (className) {
      const classResult = await client.query(
        'SELECT classification, class_name FROM classes WHERE LOWER(class_name) = LOWER($1) LIMIT 1',
        [className]
      );
      if (classResult.rows.length > 0) {
        classClassification = classResult.rows[0].classification;
        classNameValue = classResult.rows[0].class_name;
      }
    }

    // Get race details (campaign and name)
    let raceCampaign: string | null = null;
    let raceNameValue: string | null = null;
    if (race) {
      const raceResult = await client.query(
        'SELECT campaign, name FROM races WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [race]
      );
      if (raceResult.rows.length > 0) {
        raceCampaign = raceResult.rows[0].campaign;
        raceNameValue = raceResult.rows[0].name;
      }
    }

    // Create character
    const createCharacterQuery = `
      INSERT INTO characters (
        user_id, name, class_classification, class_name, race_campaign, race_name,
        strength, dexterity, constitution, intelligence, wisdom, charisma
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;

    const characterResult = await client.query(createCharacterQuery, [
      userId,
      name,
      classClassification,
      classNameValue,
      raceCampaign,
      raceNameValue,
      stats.Strength,
      stats.Dexterity,
      stats.Constitution,
      stats.Intelligence,
      stats.Wisdom,
      stats.Charisma,
    ]);

    const characterId = characterResult.rows[0].id;

    res.status(201).json({
      success: true,
      message: 'Character created successfully',
      characterId,
    });
  } finally {
    client.release();
  }
}));

/**
 * PUT /api/characters/:id
 * Update an existing character and set status to "revised"
 */
charactersRouter.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const characterId = parseInt(req.params.id || '', 10);
  const { name, class: className, race, stats } = req.body as CharacterPayload;

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(!isNaN(characterId), 'Invalid character ID', 400);
  validateRequest(name && className && race, 'Missing required fields: name, class, race', 400);
  validateRequest(stats && typeof stats.Strength === 'number', 'Invalid stats format', 400);

  const client = await pool.connect();

  try {
    // Get user
    const userResult = await client.query('SELECT id FROM users WHERE LOWER(user_email) = $1', [
      userEmail,
    ]);

    validateRequest(userResult.rows.length > 0, 'User not found', 404);

    const userId = userResult.rows[0].id;

    // Verify the character belongs to the user
    const characterCheck = await client.query(
      'SELECT id FROM characters WHERE id = $1 AND user_id = $2',
      [characterId, userId]
    );

    validateRequest(characterCheck.rows.length > 0, 'Character not found or does not belong to this user', 404);

    // Get class details (classification and class_name)
    let classClassification: string | null = null;
    let classNameValue: string | null = null;
    if (className) {
      const classResult = await client.query(
        'SELECT classification, class_name FROM classes WHERE LOWER(class_name) = LOWER($1) LIMIT 1',
        [className]
      );
      if (classResult.rows.length > 0) {
        classClassification = classResult.rows[0].classification;
        classNameValue = classResult.rows[0].class_name;
      }
    }

    // Get race details (campaign and name)
    let raceCampaign: string | null = null;
    let raceNameValue: string | null = null;
    if (race) {
      const raceResult = await client.query(
        'SELECT campaign, name FROM races WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [race]
      );
      if (raceResult.rows.length > 0) {
        raceCampaign = raceResult.rows[0].campaign;
        raceNameValue = raceResult.rows[0].name;
      }
    }

    // Update character
    const updateCharacterQuery = `
      UPDATE characters
      SET 
        name = $1,
        class_classification = $2,
        class_name = $3,
        race_campaign = $4,
        race_name = $5,
        strength = $6,
        dexterity = $7,
        constitution = $8,
        intelligence = $9,
        wisdom = $10,
        charisma = $11,
        revised = true,
        last_modified = CURRENT_TIMESTAMP,
        approval_status = 'Revised'
      WHERE id = $12 AND user_id = $13
      RETURNING id
    `;

    const updateResult = await client.query(updateCharacterQuery, [
      name,
      classClassification,
      classNameValue,
      raceCampaign,
      raceNameValue,
      stats.Strength,
      stats.Dexterity,
      stats.Constitution,
      stats.Intelligence,
      stats.Wisdom,
      stats.Charisma,
      characterId,
      userId,
    ]);

    validateRequest(updateResult.rows.length > 0, 'Failed to update character', 500);

    res.status(200).json({
      success: true,
      message: 'Character updated successfully',
      characterId: updateResult.rows[0].id,
    });
  } finally {
    client.release();
  }
}));

/**
 * GET /api/characters
 * Get all characters for the currently logged-in user
 */
charactersRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();

  validateRequest(userEmail, 'Missing user email in header', 400);

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
        c.class_name,
        c.class_classification,
        c.race_name,
        c.race_campaign,
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
        c.revised
      FROM characters c
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      characters: charactersResult.rows,
      count: charactersResult.rows.length,
    });
  } finally {
    client.release();
  }
}));

/**
 * DELETE /api/characters/:id
 * Delete a character by ID (only the owner can delete their own character)
 */
charactersRouter.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const characterId = parseInt(req.params.id || '', 10);

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(!isNaN(characterId), 'Invalid character ID', 400);

  const client = await pool.connect();

  try {
    // Get user
    const userResult = await client.query('SELECT id FROM users WHERE LOWER(user_email) = $1', [
      userEmail,
    ]);

    validateRequest(userResult.rows.length > 0, 'User not found', 404);

    const userId = userResult.rows[0].id;

    // Verify the character belongs to the user before deleting
    const characterCheck = await client.query(
      'SELECT id FROM characters WHERE id = $1 AND user_id = $2',
      [characterId, userId]
    );

    validateRequest(characterCheck.rows.length > 0, 'Character not found or does not belong to this user', 404);

    // Delete the character
    const deleteResult = await client.query(
      'DELETE FROM characters WHERE id = $1 AND user_id = $2 RETURNING id',
      [characterId, userId]
    );

    validateRequest(deleteResult.rows.length > 0, 'Failed to delete character', 500);

    res.status(200).json({
      success: true,
      message: 'Character deleted successfully',
      characterId: deleteResult.rows[0].id,
    });
  } finally {
    client.release();
  }
}));

export default charactersRouter;
