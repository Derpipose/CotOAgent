import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import pg from 'pg';

const discordRouter: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

interface CharacterSubmissionPayload {
  characterId: number;
  userEmail: string;
}

interface CharacterRecord {
  id: number;
  user_id: number;
  name: string;
  class_id: number | null;
  race_id: number | null;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  class_name?: string;
  race_name?: string;
}

/**
 * Send a character to Discord for approval
 * POST /api/discord/submit-character
 * Body: { characterId: number, userEmail: string }
 */
discordRouter.post('/submit-character', async (req: Request, res: Response) => {
  try {
    const { characterId, userEmail } = req.body as CharacterSubmissionPayload;

    // Validate input
    if (!characterId || !userEmail) {
      return res.status(400).json({
        error: 'Missing required fields: characterId and userEmail',
      });
    }

    const client = await pool.connect();

    try {
      // Get character details
      const characterQuery = `
        SELECT c.*, cl.class_name, r.name as race_name
        FROM characters c
        LEFT JOIN classes cl ON c.class_id = cl.id
        LEFT JOIN races r ON c.race_id = r.id
        WHERE c.id = $1
      `;
      const characterResult = await client.query(characterQuery, [characterId]);

      if (characterResult.rows.length === 0) {
        return res.status(404).json({ error: 'Character not found' });
      }

      const character = characterResult.rows[0];

      // Verify user owns this character
      const userQuery = 'SELECT id FROM users WHERE LOWER(user_email) = LOWER($1)';
      const userResult = await client.query(userQuery, [userEmail]);

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = userResult.rows[0].id;

      if (character.user_id !== userId) {
        return res.status(403).json({ error: 'Unauthorized: Character does not belong to this user' });
      }

      // Prepare character data for Discord
      const discordMessage = formatCharacterForDiscord(character, userEmail);

      // Send to Discord webhook
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (!webhookUrl) {
        console.error('[Discord Controller] DISCORD_WEBHOOK_URL not configured');
        return res.status(500).json({ error: 'Discord integration not configured' });
      }

      const discordResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordMessage),
      });

      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        console.error('[Discord Controller] Failed to send to Discord:', errorText);
        throw new Error(`Discord API error: ${discordResponse.statusText}`);
      }

      // Update character approval status to 'submitted'
      const updateQuery = `
        UPDATE characters 
        SET approval_status = 'submitted', last_modified = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      await client.query(updateQuery, [characterId]);

      return res.status(200).json({
        success: true,
        message: 'Character submitted for approval',
        characterId,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[Discord Controller] Error:', error);
    return res.status(500).json({
      error: 'Failed to submit character for approval',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Format character data into a Discord embed message
 */
function formatCharacterForDiscord(character: CharacterRecord, userEmail: string) {
  const stats = {
    Strength: character.strength,
    Dexterity: character.dexterity,
    Constitution: character.constitution,
    Intelligence: character.intelligence,
    Wisdom: character.wisdom,
    Charisma: character.charisma,
  };

  const statsText = Object.entries(stats)
    .map(([name, value]) => `${name}: ${value}`)
    .join('\n');

  return {
    embeds: [
      {
        title: `⚔️ New Character Submission: ${character.name}`,
        description: `A new character has been submitted for approval by ${userEmail}`,
        color: 0x5865f2, // Discord blurple
        fields: [
          {
            name: 'Class',
            value: character.class_name || 'Not specified',
            inline: true,
          },
          {
            name: 'Race',
            value: character.race_name || 'Not specified',
            inline: true,
          },
          {
            name: 'Stats',
            value: statsText || 'Not specified',
            inline: false,
          },
          {
            name: 'Submitted By',
            value: userEmail,
            inline: true,
          },
          {
            name: 'Character ID',
            value: character.id.toString(),
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

export default discordRouter;
