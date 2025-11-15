import { Router, type Request, type Response, type Router as ExpressRouter } from 'express';

const randomNumberRouter: ExpressRouter = Router();

function generateRandomNumber(max: number): number {
  if (!Number.isInteger(max) || max < 1) {
    throw new Error('Max must be an integer >= 1');
  }
  return Math.floor(Math.random() * max) + 1;
}

function generateRandomNumbers(max: number, count: number): number[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Count must be an integer >= 1');
  }
  return Array.from({ length: count }, () => generateRandomNumber(max));
}

/**
 * GET /api/random/:max - Generate single random number
 * GET /api/random/:max/:count - Generate multiple random numbers
 */
randomNumberRouter.get(['/:max', '/:max/:count'], (req: Request, res: Response) => {
  try {
    const max = parseInt(req.params.max || '0', 10);
    const count = req.params.count ? parseInt(req.params.count || '0', 10) : 1;

    if (isNaN(max) || max < 1) {
      return res.status(400).json({ error: 'Max must be an integer >= 1' });
    }
    if (isNaN(count) || count < 1) {
      return res.status(400).json({ error: 'Count must be an integer >= 1' });
    }

    const numbers = count === 1 ? [generateRandomNumber(max)] : generateRandomNumbers(max, count);
    return res.json({ numbers: count === 1 ? numbers[0] : numbers, max, count });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate random numbers',
    });
  }
});

export default randomNumberRouter;
