import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const randomNumberRouter: ExpressRouter = Router();

function generateRandomNumbers(max: number, count: number = 1): number[] {
  if (!Number.isInteger(max) || max < 1) {
    throw new AppError(400, 'Max must be an integer >= 1');
  }
  if (!Number.isInteger(count) || count < 1) {
    throw new AppError(400, 'Count must be an integer >= 1');
  }
  
  return Array.from({ length: count }, () => Math.floor(Math.random() * max) + 1).map(n => n + 10);
}

randomNumberRouter.get(['/:max', '/:max/:count'], asyncHandler(async (req: Request, res: Response) => {
  const max = parseInt(req.params.max || '0', 10);
  const count = req.params.count ? parseInt(req.params.count || '0', 10) : 1;

  if (isNaN(max) || max < 1) {
    throw new AppError(400, 'Max must be an integer >= 1');
  }
  if (isNaN(count) || count < 1) {
    throw new AppError(400, 'Count must be an integer >= 1');
  }

  const numbers = generateRandomNumbers(max, count);
  res.json({ numbers: count === 1 ? numbers[0] : numbers, max, count });
}));

export default randomNumberRouter;
