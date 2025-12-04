import { type Request, type Response } from 'express';
import { AppError } from '../../../../middleware/errorHandler.js';
import { generateEmbeddingsForEntity } from '../services/embeddingService.js';
import { getEmbeddingProgress } from '../services/progressService.js';
import { type EntityType, EMBEDDING_CONFIG } from '../config.js';

const activeGenerations = new Set<EntityType>();

export function createGenerateHandler(entityType: EntityType) {
  return (req: Request, res: Response) => {
    if (activeGenerations.has(entityType)) {
      throw new AppError(409, `Embedding generation already in progress for ${entityType}`);
    }

    activeGenerations.add(entityType);

    generateEmbeddingsForEntity(entityType)
      .catch((error) => {
        console.error('[EMBEDDINGS] Background embedding generation failed:', error);
      })
      .finally(() => {
        activeGenerations.delete(entityType);
      });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(
      `data: ${JSON.stringify({
        type: 'started',
        entityType,
        message: `Embedding generation started for ${entityType}`,
      })}\n\n`
    );

    const progressInterval = setInterval(async () => {
      try {
        const progress = await getEmbeddingProgress();
        res.write(
          `data: ${JSON.stringify({
            type: 'progress',
            entityType,
            progress: progress[entityType],
            allProgress: progress,
          })}\n\n`
        );
      } catch (error) {
        console.error('[EMBEDDINGS] Error getting progress:', error);
      }
    }, EMBEDDING_CONFIG.PROGRESS_UPDATE_INTERVAL_MS);

    res.on('close', () => {
      clearInterval(progressInterval);
      res.end();
    });
  };
}
