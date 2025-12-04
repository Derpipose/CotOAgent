import { Router, type Router as ExpressRouter } from 'express';
import { asyncHandler } from '../../../middleware/errorHandler.js';
import { createCharacterHandler } from './createCharacterHandler.js';
import { createFullCharacterHandler } from './createFullCharacterHandler.js';
import { updateCharacterHandler } from './updateCharacterHandler.js';
import { getCharactersHandler } from './getCharactersHandler.js';
import { deleteCharacterHandler } from './deleteCharacterHandler.js';

const charactersRouter: ExpressRouter = Router();

charactersRouter.post('/', asyncHandler(createCharacterHandler));
charactersRouter.post('/create', asyncHandler(createFullCharacterHandler));
charactersRouter.put('/:id', asyncHandler(updateCharacterHandler));
charactersRouter.get('/', asyncHandler(getCharactersHandler));
charactersRouter.delete('/:id', asyncHandler(deleteCharacterHandler));

export default charactersRouter;
