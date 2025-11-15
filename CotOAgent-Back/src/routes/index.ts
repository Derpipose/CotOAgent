import type { Application } from 'express';
import embeddingsRouter from '../controllers/embeddings.js';
import databaseRouter from '../controllers/database/database.js';
import classesRouter from '../controllers/entities/classes.js';
import racesRouter from '../controllers/entities/races.js';
import spellsRouter from '../controllers/entities/spells.js';
import spellbooksRouter from '../controllers/entities/spellbooks.js';
import authRouter from '../controllers/auth.js';
import discordRouter from '../controllers/discord.js';
import charactersRouter from '../controllers/characters.js';
import randomNumberRouter from '../controllers/randomNumberGenerator.js';

export function setupRoutes(app: Application): void {
  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/embeddings', embeddingsRouter);
  app.use('/api/import', databaseRouter);
  app.use('/api/discord', discordRouter);
  app.use('/api/characters', charactersRouter);
  app.use('/api/random', randomNumberRouter);
  app.use('/api', classesRouter);
  app.use('/api', racesRouter);
  app.use('/api', spellsRouter);
  app.use('/api', spellbooksRouter);
}
