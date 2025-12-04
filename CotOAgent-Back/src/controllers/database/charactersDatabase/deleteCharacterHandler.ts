import { type Request, type Response } from 'express';
import { validateRequest } from '../../../middleware/errorHandler.js';
import { pool } from './helpers.js';

export async function deleteCharacterHandler(req: Request, res: Response): Promise<void> {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const characterId = parseInt(req.params.id || '', 10);

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(!isNaN(characterId), 'Invalid character ID', 400);

  const client = await pool.connect();

  try {
    const userResult = await client.query('SELECT id FROM users WHERE LOWER(user_email) = $1', [
      userEmail,
    ]);

    validateRequest(userResult.rows.length > 0, 'User not found', 404);

    const userId = userResult.rows[0].id as number;

    const characterCheck = await client.query(
      'SELECT id FROM characters WHERE id = $1 AND user_id = $2',
      [characterId, userId]
    );

    validateRequest(
      characterCheck.rows.length > 0,
      'Character not found or does not belong to this user',
      404
    );

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
}
