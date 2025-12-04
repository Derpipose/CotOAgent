import { type Request, type Response } from 'express';
import { validateRequest } from '../../../middleware/errorHandler.js';
import { pool, getClassDetails, getRaceDetails } from './helpers.js';

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

export async function updateCharacterHandler(req: Request, res: Response): Promise<void> {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const characterId = parseInt(req.params.id || '', 10);
  const { name, class: className, race, stats } = req.body as CharacterPayload;

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(!isNaN(characterId), 'Invalid character ID', 400);
  validateRequest(name && className && race, 'Missing required fields: name, class, race', 400);
  validateRequest(stats && typeof stats.Strength === 'number', 'Invalid stats format', 400);

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

    const { classification: classClassification, classNameValue } =
      await getClassDetails(className);

    const { campaign: raceCampaign, raceNameValue } = await getRaceDetails(race);

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
}
