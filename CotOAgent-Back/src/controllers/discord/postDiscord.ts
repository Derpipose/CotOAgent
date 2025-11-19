import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';

const postDiscordRouter: ExpressRouter = Router();
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

interface CharacterRecord {
  feedback: string | null;
  id: number;
  user_id: number;
  name: string;
  class_name?: string;
  race_name?: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

/**
 * Send a character to Discord for approval
 * POST /api/discord/submit-character
 * Body: { characterId: number, userEmail: string }
 */
postDiscordRouter.post('/submit-character', async (req: Request, res: Response) => {
  try {
    const { characterId, userEmail } = req.body as { characterId: number; userEmail: string };

    if (!characterId || !userEmail) {
      return res.status(400).json({ error: 'Missing characterId or userEmail' });
    }

    const dbClient = await pool.connect();

    try {
      // Get character details with class and race
      const characterResult = await dbClient.query(
        `SELECT c.*, cl.class_name, r.name as race_name
         FROM characters c
         LEFT JOIN classes cl ON c.class_id = cl.id
         LEFT JOIN races r ON c.race_id = r.id
         WHERE c.id = $1`,
        [characterId]
      );

      if (characterResult.rows.length === 0) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const character = characterResult.rows[0];

      // Verify user owns this character
      const userResult = await dbClient.query(
        'SELECT id FROM users WHERE LOWER(user_email) = LOWER($1)',
        [userEmail]
      );

      if (userResult.rows.length === 0 || character.user_id !== userResult.rows[0].id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Send to Discord webhook
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (!webhookUrl) {
        return res.status(500).json({ error: 'Discord webhook not configured' });
      }

      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatCharacterForDiscord(character, userEmail)),
      });

      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        console.error('[Discord] Failed to send:', errorText);
        throw new Error(`Discord API error: ${discordResponse.statusText}`);
      }

      // Update character status to submitted
      await dbClient.query(
        'UPDATE characters SET approval_status = $1, last_modified = CURRENT_TIMESTAMP WHERE id = $2',
        ['Submitted for Approval', characterId]
      );

      return res.status(200).json({
        success: true,
        message: 'Character submitted for approval',
        characterId,
      });
    } finally {
      dbClient.release();
    }
  } catch (error) {
    console.error('[Discord Controller]', error);
    return res.status(500).json({
      error: 'Failed to submit character',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Send a revised character to Discord for re-review
 * POST /api/discord/submit-revision
 * Body: { characterId: number, userEmail: string }
 */
postDiscordRouter.post('/submit-revision', async (req: Request, res: Response) => {
  try {
    const { characterId, userEmail } = req.body as { characterId: number; userEmail: string };

    if (!characterId || !userEmail) {
      return res.status(400).json({ error: 'Missing characterId or userEmail' });
    }

    const dbClient = await pool.connect();

    try {
      // Get character details with class and race
      const characterResult = await dbClient.query(
        `SELECT c.*, cl.class_name, r.name as race_name
         FROM characters c
         LEFT JOIN classes cl ON c.class_id = cl.id
         LEFT JOIN races r ON c.race_id = r.id
         WHERE c.id = $1`,
        [characterId]
      );

      if (characterResult.rows.length === 0) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const character = characterResult.rows[0];

      // Verify user owns this character
      const userResult = await dbClient.query(
        'SELECT id FROM users WHERE LOWER(user_email) = LOWER($1)',
        [userEmail]
      );

      if (userResult.rows.length === 0 || character.user_id !== userResult.rows[0].id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Send to Discord webhook
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (!webhookUrl) {
        return res.status(500).json({ error: 'Discord webhook not configured' });
      }

      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatRevisedCharacterForDiscord(character, userEmail)),
      });

      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        console.error('[Discord] Failed to send revision:', errorText);
        throw new Error(`Discord API error: ${discordResponse.statusText}`);
      }

      // Update character status to awaiting review
      await dbClient.query(
        'UPDATE characters SET approval_status = $1, revised = false, last_modified = CURRENT_TIMESTAMP WHERE id = $2',
        ['Awaiting Review', characterId]
      );

      return res.status(200).json({
        success: true,
        message: 'Revised character submitted for review',
        characterId,
      });
    } finally {
      dbClient.release();
    }
  } catch (error) {
    console.error('[Discord Controller]', error);
    return res.status(500).json({
      error: 'Failed to submit revision',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

function formatCharacterForDiscord(character: CharacterRecord, userEmail: string) {
  const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    .map(stat => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${character[stat as keyof CharacterRecord]}`)
    .join('\n');

  return {
    embeds: [
      {
        title: `⚔️ New Character Submission: ${character.name}`,
        description: `Submitted for approval by ${userEmail}`,
        color: 0x5865f2,
        fields: [
          { name: 'Class', value: character.class_name || 'Not specified', inline: true },
          { name: 'Race', value: character.race_name || 'Not specified', inline: true },
          { name: 'Stats', value: stats || 'Not specified', inline: false },
          { name: 'Submitted By', value: userEmail, inline: true },
          { name: 'Character ID', value: character.id.toString(), inline: true },
          { name: 'Status', value: '⏳ Awaiting Review', inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

function formatRevisedCharacterForDiscord(character: CharacterRecord, userEmail: string) {
  const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
    .map(stat => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${character[stat as keyof CharacterRecord]}`)
    .join('\n');

  return {
    embeds: [
      {
        title: `🔄 Character Revision: ${character.name}`,
        description: `Revised character resubmitted for review by ${userEmail}`,
        color: 0xfaa61a,
        fields: [
          { name: 'Class', value: character.class_name || 'Not specified', inline: true },
          { name: 'Race', value: character.race_name || 'Not specified', inline: true },
          { name: 'Stats', value: stats || 'Not specified', inline: false },
          { name: 'Submitted By', value: userEmail, inline: true },
          { name: 'Character ID', value: character.id.toString(), inline: true },
          { name: 'Status', value: '🔄 Re-awaiting Review', inline: true },
          { name: 'Previous Feedback', value: character.feedback || 'No feedback yet', inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export default postDiscordRouter;
