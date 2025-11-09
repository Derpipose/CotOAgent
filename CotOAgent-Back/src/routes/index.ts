import type { Application } from 'express';
import embeddingsRouter from '../controllers/embeddings.js';
import databaseRouter from '../controllers/database.js';
import basicPopulateRouter from '../controllers/basicPopulate.js';
import authRouter from '../controllers/auth.js';

export function setupRoutes(app: Application): void {
  // API routes
  app.use('/api/auth', authRouter);
  app.use('/api/embeddings', embeddingsRouter);
  app.use('/api/import', databaseRouter);
  app.use('/api', basicPopulateRouter);
}
