import { type Request, type Response } from 'express';
import { validateRequest } from '../../../middleware/errorHandler.js';
import { pool } from './helpers.js';

export async function getCharactersHandler(req: Request, res: Response): Promise<void> {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();

  validateRequest(userEmail, 'Missing user email in header', 400);

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
}
