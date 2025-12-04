import { Router, type Router as ExpressRouter } from 'express';
import { type Message } from 'discord.js';
import { client } from './discordClient.js';
import { processCharacterRevision, getCharacterById, approveCharacter } from '../database/revision.js';

const readDiscordRouter: ExpressRouter = Router();

client.on('messageCreate', async (message: Message) => {
  if (message.author.id === client.user?.id) return;

  if (message.content === '!help') {
    message.reply(
      '**CotO Agent Bot Commands:**\n' +
      '`!help` - Show this help message\n' +
      '`!ping` - Check if the bot is online\n' +
      '`!revise <characterId> <feedback>` - Request a revision for a character\n' +
      '`!approve <characterId>` - Approve a character\n' +
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

      const character = await getCharacterById(characterId);

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
      
      if (errorMsg === 'Character has already gotten review feedback and has not been revised yet.') {
        return message.reply('Character has already gotten review feedback and has not been revised yet.');
      }
      
      message.reply(`Error processing revision: ${errorMsg}`);
    }
  }

  if (message.content.startsWith('!approve')) {
    try {
      const args = message.content.split(' ').slice(1);
      const characterId = parseInt(args[0] || '');

      if (!characterId || isNaN(characterId)) {
        return message.reply('Invalid character ID. Usage: `!approve <characterId>`');
      }

      const character = await getCharacterById(characterId);

      await approveCharacter(characterId);

      message.reply(
        `Character **${character.name}** (ID: ${characterId}) has been approved.\n` +
        `Player will be notified when they next log in.`
      );
    } catch (error) {
      console.error('[Discord] Approval error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      message.reply(`Error processing approval: ${errorMsg}`);
    }
  }
});

export default readDiscordRouter;
