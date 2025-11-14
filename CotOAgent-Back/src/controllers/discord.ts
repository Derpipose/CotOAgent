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
 * Handle Discord interactions (button clicks)
 * POST /api/discord/interaction
 * Receives webhooks from Discord when users click buttons
 */
discordRouter.post('/interaction', async (req: Request, res: Response) => {
  try {
    const interaction = req.body;

    // Discord sends a PING request to verify the endpoint
    if (interaction.type === 1) {
      return res.status(200).json({ type: 1 });
    }

    // Handle button interactions
    if (interaction.type === 3) {
      const customId = interaction.data.custom_id;
      const userId = interaction.member.user.id;

      console.log(`[Discord Interaction] User ${userId} clicked button: ${customId}`);

      // Extract action and character ID from custom_id (e.g., "approve_123" or "revision_123")
      const [action, characterIdStr] = customId.split('_');
      const characterId = parseInt(characterIdStr, 10);

      if (action === 'approve') {
        // Update character status to approved
        const client = await pool.connect();
        try {
          await client.query(
            'UPDATE characters SET approval_status = $1, last_modified = CURRENT_TIMESTAMP WHERE id = $2',
            ['approved', characterId]
          );

          // Respond to Discord with success message
          return res.status(200).json({
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
              content: `✅ Character #${characterId} has been **APPROVED**!`,
              flags: 64, // Ephemeral (only visible to the user who clicked)
            },
          });
        } finally {
          client.release();
        }
      } else if (action === 'revision') {
        // Show a modal for admins to enter revision feedback
        return res.status(200).json({
          type: 9, // MODAL
          data: {
            custom_id: `revision_submit_${characterId}`,
            title: 'Request Character Revision',
            components: [
              {
                type: 1, // Action row
                components: [
                  {
                    type: 4, // Text input
                    custom_id: 'revision_notes',
                    label: 'Revision Notes',
                    style: 2, // Paragraph
                    placeholder: 'Describe what needs to be revised...',
                    required: true,
                    max_length: 500,
                  },
                ],
              },
            ],
          },
        });
      }
    }

    // Handle modal submission
    if (interaction.type === 5) {
      const customId = interaction.data.custom_id;

      if (customId.startsWith('revision_submit_')) {
        const characterIdStr = customId.replace('revision_submit_', '');
        const characterId = parseInt(characterIdStr, 10);

        // Extract feedback from modal submission
        const revisionNotes = interaction.data.components[0].components[0].value;

        const client = await pool.connect();
        try {
          // Update character with revision feedback
          await client.query(
            'UPDATE characters SET approval_status = $1, feedback = $2, last_modified = CURRENT_TIMESTAMP WHERE id = $3',
            ['revision_requested', revisionNotes, characterId]
          );

          // Respond to Discord with success message
          return res.status(200).json({
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: {
              content: `📝 Revision requested for Character #${characterId}. Feedback has been recorded.`,
              flags: 64, // Ephemeral
            },
          });
        } finally {
          client.release();
        }
      }
    }

    // Default response
    return res.status(200).json({ type: 4, data: { content: 'Unknown interaction' } });
  } catch (error) {
    console.error('[Discord Interaction Handler] Error:', error);
    return res.status(500).json({
      error: 'Failed to process Discord interaction',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});


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

  const payload = {
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
          {
            name: 'Status',
            value: '⏳ Awaiting Review',
            inline: true,
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 3,
            label: 'Approve',
            custom_id: `approve_${character.id}`,
          },
          {
            type: 2,
            style: 4,
            label: 'Request Revision',
            custom_id: `revision_${character.id}`,
          },
        ],
      },
    ],
  };

  return payload;
}

export default discordRouter;
