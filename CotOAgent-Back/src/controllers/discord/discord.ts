
import { Router, type Router as ExpressRouter } from 'express';
import postDiscordRouter from './postDiscord.js';
import readDiscordRouter from './readDiscord.js';

const discordRouter: ExpressRouter = Router();

discordRouter.use(postDiscordRouter);

discordRouter.use(readDiscordRouter);
export default discordRouter;
