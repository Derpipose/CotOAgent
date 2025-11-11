import type { Application } from 'express';
import embeddingsRouter from '../controllers/embeddings.js';
import databaseRouter from '../controllers/database/database.js';
import classesRouter from '../controllers/classes.js';
import racesRouter from '../controllers/races.js';
import spellsRouter from '../controllers/spells.js';
import spellbooksRouter from '../controllers/spellbooks.js';
import authRouter from '../controllers/auth.js';

export function setupRoutes(app: Application): void {
  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/embeddings', embeddingsRouter);
  app.use('/api/import', databaseRouter);
  app.use('/api', classesRouter);
  app.use('/api', racesRouter);
  app.use('/api', spellsRouter);
  app.use('/api', spellbooksRouter);
}
