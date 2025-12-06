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
  validateRequest(name, 'Character name is required', 400);
  if (stats) {
    validateRequest(typeof stats.Strength === 'number', 'Invalid stats format', 400);
  }

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

    let classClassification: string | null | undefined;
    let classNameValue: string | null | undefined;
    let raceCampaign: string | null | undefined;
    let raceNameValue: string | null | undefined;

    if (className) {
      const classDetails = await getClassDetails(className);
      classClassification = classDetails.classification;
      classNameValue = classDetails.classNameValue;
    }

    if (race) {
      const raceDetails = await getRaceDetails(race);
      raceCampaign = raceDetails.campaign;
      raceNameValue = raceDetails.raceNameValue;
    }

    // Build dynamic update query
    const updates: string[] = ['name = $1'];
    const params: unknown[] = [name];
    let paramIndex = 2;

    if (classNameValue !== undefined) {
      updates.push(`class_classification = $${paramIndex++}`);
      updates.push(`class_name = $${paramIndex++}`);
      params.push(classClassification, classNameValue);
    }

    if (raceNameValue !== undefined) {
      updates.push(`race_campaign = $${paramIndex++}`);
      updates.push(`race_name = $${paramIndex++}`);
      params.push(raceCampaign, raceNameValue);
    }

    if (stats) {
      updates.push(`strength = $${paramIndex++}`);
      updates.push(`dexterity = $${paramIndex++}`);
      updates.push(`constitution = $${paramIndex++}`);
      updates.push(`intelligence = $${paramIndex++}`);
      updates.push(`wisdom = $${paramIndex++}`);
      updates.push(`charisma = $${paramIndex++}`);
      params.push(
        stats.Strength,
        stats.Dexterity,
        stats.Constitution,
        stats.Intelligence,
        stats.Wisdom,
        stats.Charisma
      );
    }

    updates.push(`revised = true`);
    updates.push(`last_modified = CURRENT_TIMESTAMP`);
    updates.push(`approval_status = 'Revised'`);

    params.push(characterId, userId);

    const updateCharacterQuery = `
      UPDATE characters
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
      RETURNING id
    `;

    const updateResult = await client.query(updateCharacterQuery, params);

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
