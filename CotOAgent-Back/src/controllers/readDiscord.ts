import { Router, type Router as ExpressRouter } from 'express';
import { type Message } from 'discord.js';
import { client } from './discordClient.js';
import { processCharacterRevision, getCharacterById } from './database/revision.js';

const readDiscordRouter: ExpressRouter = Router();

// Handle message creation from bot
client.on('messageCreate', async (message: Message) => {
  // Ignore messages from the bot itself
  if (message.author.id === client.user?.id) return;

  if (message.content === '!help') {
    message.reply(
      '**CotO Agent Bot Commands:**\n' +
      '`!help` - Show this help message\n' +
      '`!ping` - Check if the bot is online\n' +
      '`!revise <characterId> <feedback>` - Request a revision for a character\n' +
      '`!DERP` - Respond with an easter egg\n'
    );
  }

  if (message.content === '!ping') {
    message.reply('Pong!');
  }

  if (message.content === '!DERP') {
    message.reply('Derpy DERP DERP!');
  }

  if (message.content.startsWith('!revise')) {
    try {
      const args = message.content.split(' ').slice(1);
      const characterId = parseInt(args[0] || '');
      const feedback = args.slice(1).join(' ');

      if (!characterId || isNaN(characterId)) {
        return message.reply('Invalid character ID. Usage: `!revise <characterId> <feedback>`');
      }

      if (!feedback.trim()) {
        return message.reply('Feedback required. Usage: `!revise <characterId> <feedback>`');
      }

      // Verify character exists
      const character = await getCharacterById(characterId);

      // Process the revision
      await processCharacterRevision({
        characterId,
        feedback,
      });

      message.reply(
        `Character **${character.name}** (ID: ${characterId}) marked for revision.\n` +
        `Player will be notified when they next log in.\n` +
        `Feedback: ${feedback}`
      );
    } catch (error) {
      console.error('[Discord] Revision error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      message.reply(`Error processing revision: ${errorMsg}`);
    }
  }
});

export default readDiscordRouter;
