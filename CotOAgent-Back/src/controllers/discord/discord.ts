/**
 * Main Discord router that combines all Discord-related endpoints
 * This file imports and merges postDiscord and readDiscord routers
 */

import { Router, type Router as ExpressRouter } from 'express';
import postDiscordRouter from './postDiscord.js';
import readDiscordRouter from './readDiscord.js';

const discordRouter: ExpressRouter = Router();

// Mount Discord message posting routes
discordRouter.use(postDiscordRouter);

// Mount Discord message reading routes
discordRouter.use(readDiscordRouter);
export default discordRouter;
