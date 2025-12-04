import { Router, type Router as ExpressRouter } from 'express';
import {
  getRacesHandler,
  getClassesHandler,
  getSpellsHandler,
} from './database.getters.js';

const databaseRouter: ExpressRouter = Router();

databaseRouter.get('/races', getRacesHandler);

databaseRouter.get('/classes', getClassesHandler);

databaseRouter.get('/spells', getSpellsHandler);

export default databaseRouter;
