import { Router, type Router as ExpressRouter } from 'express';
import { createGenerateHandler } from './handlers/generateHandler.js';
import { createStatusHandler } from './handlers/statusHandler.js';
import { createListHandler } from './handlers/listHandler.js';
import { type EntityType } from './config.js';

const databaseRouter: ExpressRouter = Router();

const entityTypes: EntityType[] = ['races', 'classes', 'spells'];
entityTypes.forEach((entityType) => {
  databaseRouter.post(`/${entityType}/generate`, createGenerateHandler(entityType));
  databaseRouter.get(`/${entityType}/status`, createStatusHandler(entityType));
  databaseRouter.get(`/${entityType}/list`, createListHandler(entityType));
});

export default databaseRouter;
