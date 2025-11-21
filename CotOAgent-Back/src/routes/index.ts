import type { Application } from 'express';
import embeddingsRouter from '../controllers/embeddings/embeddings.js';
import databaseRouter from '../controllers/database/database.js';
import classesRouter from '../controllers/entities/classes.js';
import racesRouter from '../controllers/entities/races.js';
import spellsRouter from '../controllers/entities/spells.js';
import spellbooksRouter from '../controllers/entities/spellbooks.js';
import authRouter from '../controllers/auth.js';
import discordRouter from '../controllers/discord/discord.js';
import charactersRouter from '../controllers/database/characters.js';
import randomNumberRouter from '../controllers/randomNumberGenerator.js';
import chatRouter from '../controllers/chat/chat.js';

export function setupRoutes(app: Application): void {
  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/chat', chatRouter);
  app.use('/api/embeddings', embeddingsRouter);
  app.use('/api/import', databaseRouter);
  app.use('/api/discord', discordRouter);
  app.use('/api/characters', charactersRouter);
  app.use('/api/random', randomNumberRouter);
  app.use('/api/classes', classesRouter);
  app.use('/api/races', racesRouter);
  app.use('/api/spells', spellsRouter);
  app.use('/api/spellbooks', spellbooksRouter);
}
