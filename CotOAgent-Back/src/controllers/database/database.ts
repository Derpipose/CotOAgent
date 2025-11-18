import { Router, type Router as ExpressRouter } from 'express';
import {
  getRacesHandler,
  getClassesHandler,
  getSpellsHandler,
} from './database.getters.js';

const databaseRouter: ExpressRouter = Router();

/**
 * GET /api/import/races
 * Fetches Races JSON from the hardcoded URL and saves to database
 */
databaseRouter.get('/races', getRacesHandler);

/**
 * GET /api/import/classes
 * Fetches Classes JSON from the hardcoded URL and saves to database
 */
databaseRouter.get('/classes', getClassesHandler);

/**
 * GET /api/import/spells
 * Fetches Spells JSON from the hardcoded URL and saves to database
 */
databaseRouter.get('/spells', getSpellsHandler);

export default databaseRouter;
