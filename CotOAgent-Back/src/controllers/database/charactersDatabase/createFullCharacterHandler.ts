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

export async function createFullCharacterHandler(req: Request, res: Response): Promise<void> {
  const userEmail = (req.headers['x-user-email'] as string)?.toLowerCase();
  const { name, class: className, race, stats } = req.body as CharacterPayload;

  validateRequest(userEmail, 'Missing user email in header', 400);
  validateRequest(name && className && race, 'Missing required fields: name, class, race', 400);
  validateRequest(stats && typeof stats.Strength === 'number', 'Invalid stats format', 400);

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

    const { classification: classClassification, classNameValue } =
      await getClassDetails(className);

    const { campaign: raceCampaign, raceNameValue } = await getRaceDetails(race);

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

    const characterId = characterResult.rows[0].id as number;

    res.status(201).json({
      success: true,
      message: 'Character created successfully',
      characterId,
    });
  } finally {
    client.release();
  }
}
