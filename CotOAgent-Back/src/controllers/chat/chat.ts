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

// Tool interface definition
interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Augment Express Request type
declare module 'express' {
  interface Request {
    userId?: number;
  }
}

const router: ExpressRouter = Router();
const { Pool } = pg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

/**
 * Middleware to extract user ID from email header
 */
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

/**
 * Validate conversation ID from params
 */
function validateConversationId(req: Request, res: Response, next: NextFunction): void {
  const { conversationId } = req.params;
  if (!conversationId) {
    res.status(400).json({ error: 'Conversation ID is required' });
    return;
  }
  next();
}

/**
 * POST /api/chat/conversations
 * Create a new conversation and send initial system prompt to AI
 */
router.post(
  '/conversations',
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;

      // Validate request body
      const dto = CreateConversationDtoSchema.parse(req.body) as CreateConversationDto;

      // Generate conversation name - use provided name or create default
      const conversationName = dto.conversationName || `Chat ${new Date().toLocaleString()}`;

      // Create conversation
      const conversation = await chatDatabase.createConversation(userId, conversationName);

      // Initialize chat with system prompt
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

/**
 * POST /api/chat/conversations/:conversationId/messages
 * Send a message and get AI response
 */
router.post(
  '/conversations/:conversationId/messages',
  validateConversationId,
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params as { conversationId: string };

      // Validate request body
      const dto = SendMessageDtoSchema.parse(req.body) as SendMessageDto;

      // Extract tools from request if provided
      const tools = (req.body as Record<string, unknown>).tools as Tool[] | undefined;

      // Send message and get AI response (with optional tool result for agentic loop)
      // User message is saved separately via /save-user-message endpoint
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

/**
 * SaveUserMessage
 * POST /api/chat/conversations/:conversationId/messages/save-user-message
 * Save a user message to the database
 */
router.post(
  '/conversations/:conversationId/messages/save-user-message',
  validateConversationId,
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
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

/**
 * GET /api/chat/conversations/:conversationId/history
 * Get conversation history
 */
router.get(
  '/conversations/:conversationId/history',
  validateConversationId,
  extractUserFromEmail,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId!;
      const { conversationId } = req.params as { conversationId: string };

      // Validate that user owns this conversation
      const ownsConversation = await chatDatabase.userOwnsConversation(userId, conversationId);
      const admin = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id)).includes(userId);
      if (!ownsConversation && !admin) {
        res.status(403).json({ error: 'Unauthorized: You do not own this conversation' });
        return;
      }

      // Get conversation details
      const conversation = await chatDatabase.getConversation(conversationId);
      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      // Get message history
      const messages = await chatDatabase.getConversationHistory(conversationId);

      res.status(200).json({
        conversationId,
        conversationName: conversation.conversationName,
        messages,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
