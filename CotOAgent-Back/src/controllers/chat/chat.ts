import { Router, type Request, type Response, type NextFunction, type Router as ExpressRouter } from 'express';
import pg from 'pg';
import {
  CreateConversationDtoSchema,
  SendMessageDtoSchema,
  type CreateConversationDto,
  type SendMessageDto,
} from '../../DTOS/ChatDto.js';
import * as chatDatabase from '../database/chatDatabase.js';
import * as chatService from '../../services/chatService.js';

interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

declare module 'express' {
  interface Request {
    userId?: number;
  }
}

const router: ExpressRouter = Router();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

async function extractUserFromEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userEmail = req.headers['x-user-email'] as string;
    if (!userEmail) {
      res.status(400).json({ error: 'User email not found in headers' });
      return;
    }

    const trimmedEmail = userEmail.trim();
    let query = 'SELECT id FROM users WHERE LOWER(user_email) = LOWER($1)';
    let result = await pool.query(query, [trimmedEmail]);

    // Create user if not exists
    if (result.rows.length === 0) {
      query = 'INSERT INTO users (user_email) VALUES ($1) RETURNING id';
      result = await pool.query(query, [trimmedEmail]);
    }

    req.userId = result.rows[0].id;
    next();
  } catch (error) {
    next(error);
  }
}

function validateConversationId(req: Request, res: Response, next: NextFunction): void {
  const { conversationId } = req.params;
  if (!conversationId) {
    res.status(400).json({ error: 'Conversation ID is required' });
    return;
  }
  next();
}

router.post(
  '/conversations',
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;

      const dto = CreateConversationDtoSchema.parse(req.body) as CreateConversationDto;

      const conversationName = dto.conversationName || `Chat ${new Date().toLocaleString()}`;

      const conversation = await chatDatabase.createConversation(userId, conversationName);

      const initialResponse = await chatService.initializeChat(
        conversation.id,
        conversation.conversationName
      );

      res.status(201).json(initialResponse);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/conversations/:conversationId/messages',
  validateConversationId,
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params as { conversationId: string };

      const dto = SendMessageDtoSchema.parse(req.body) as SendMessageDto;

      const tools = (req.body as Record<string, unknown>).tools as Tool[] | undefined;

      const response = await chatService.sendMessageAndGetResponse(
        conversationId,
        dto.message,
        tools,
        dto.toolResult
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  '/conversations/:conversationId/messages/save-user-message',
  validateConversationId,
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params as { conversationId: string };
      const { message } = req.body as { message: string };

      // Save user message to database
      const savedMessage = await chatDatabase.saveUserMessage(
        conversationId,
        message
      );

      res.status(201).json({
        success: true,
        message: savedMessage,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  '/conversations/:conversationId/messages/save-tool-call',
  validateConversationId,
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params as { conversationId: string };
      const { toolId, toolCall } = req.body as { toolId: string; toolCall: unknown };

      // Validate that user owns this conversation
      const ownsConversation = await chatDatabase.userOwnsConversation(userId, conversationId);
      if (!ownsConversation) {
        res.status(403).json({ error: 'Unauthorized: You do not own this conversation' });
        return;
      }

      // Validate tool call data
      if (!toolId || !toolCall) {
        res.status(400).json({ error: 'Tool ID and tool call data are required' });
        return;
      }

      // Save tool call to database
      const savedToolCall = await chatDatabase.addMessageToConversation(
        conversationId,
        'assistant',
        JSON.stringify(toolCall),
        toolId,
        undefined
      );

      res.status(201).json({
        success: true,
        message: savedToolCall,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/conversations/:conversationId/messages/save-tool-result',
  validateConversationId,
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params as { conversationId: string };
      const { toolId, toolResult } = req.body as { toolId: string; toolResult: unknown };

      // Validate that user owns this conversation
      const ownsConversation = await chatDatabase.userOwnsConversation(userId, conversationId);
      if (!ownsConversation) {
        res.status(403).json({ error: 'Unauthorized: You do not own this conversation' });
        return;
      }

      // Validate tool result data
      if (!toolId || toolResult === undefined) {
        res.status(400).json({ error: 'Tool ID and tool result are required' });
        return;
      }

      // Save tool result to database
      const savedToolResult = await chatDatabase.addMessageToConversation(
        conversationId,
        'user',
        JSON.stringify(toolResult),
        undefined,
        toolId
      );

      res.status(201).json({
        success: true,
        message: savedToolResult,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
