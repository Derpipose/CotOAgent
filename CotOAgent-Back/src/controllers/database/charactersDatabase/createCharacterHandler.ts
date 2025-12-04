import { type Request, type Response } from 'express';
import { validateRequest } from '../../../middleware/errorHandler.js';
import { pool } from './helpers.js';

export async function createCharacterHandler(req: Request, res: Response): Promise<void> {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const { name } = req.body as { name: string };

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(name && name.trim().length > 0, 'Character name is required', 400);

  const client = await pool.connect();

  try {
    const userResult = await client.query('SELECT id FROM users WHERE LOWER(user_email) = $1', [
      userEmail,
    ]);

    let userId: number;

    if (userResult.rows.length === 0) {
      const createUserResult = await client.query(
        'INSERT INTO users (user_email) VALUES ($1) RETURNING id',
        [userEmail]
      );
      userId = createUserResult.rows[0].id as number;
    } else {
      userId = userResult.rows[0].id as number;
    }

    const createCharacterQuery = `
      INSERT INTO characters (user_id, name)
      VALUES ($1, $2)
      RETURNING id, user_id, name, created_at
    `;

    const characterResult = await client.query(createCharacterQuery, [userId, name.trim()]);

    const character = characterResult.rows[0] as {
      id: number;
      name: string;
      created_at: string;
    };

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
}
