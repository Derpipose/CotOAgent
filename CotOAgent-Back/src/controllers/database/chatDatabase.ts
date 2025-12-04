import pg from 'pg';
import type { ChatMessageDto, ConversationDto } from '../../DTOS/ChatDto.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DEFAULT_CONNECTION,
});

export async function createConversation(
  userId: number,
  conversationName: string
): Promise<ConversationDto> {
  const query = `
    INSERT INTO user_chat_conversations (user_id, conversation_name)
    VALUES ($1, $2)
    RETURNING id, conversation_name as "conversationName", created_at as "createdAt"
  `;

  const result = await pool.query(query, [userId, conversationName]);

  if (result.rows.length === 0) {
    throw new Error('Failed to create conversation');
  }

  return {
    id: result.rows[0].id,
    conversationName: result.rows[0].conversationName,
    createdAt: result.rows[0].createdAt,
  };
}

export async function addMessageToConversation(
  conversationId: string,
  sender: 'user' | 'assistant' | 'system',
  message: string,
  toolId?: string,
  toolResult?: string
): Promise<ChatMessageDto> {
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  const query = `
    INSERT INTO user_chat_messages (conversation_id, sender, message, tool_id, tool_result)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, sender, message, created_at as "createdAt"
  `;

  const result = await pool.query(query, [conversationId, sender, message.trim(), toolId || null, toolResult || null]);

  if (result.rows.length === 0) {
    throw new Error('Failed to add message');
  }

  return {
    id: result.rows[0].id,
    sender: result.rows[0].sender,
    message: result.rows[0].message,
    createdAt: result.rows[0].createdAt,
  };
}


export async function saveUserMessage(
  conversationId: string,
  message: string
): Promise<ChatMessageDto> {
  return addMessageToConversation(conversationId, 'user', message);
}

export async function getConversationHistory(
  conversationId: string
): Promise<ChatMessageDto[]> {
  const query = `
    SELECT id, sender, message, created_at as "createdAt"
    FROM user_chat_messages
    WHERE conversation_id = $1
    ORDER BY created_at ASC
  `;

  const result = await pool.query(query, [conversationId]);
  return result.rows;
}


export async function getConversation(conversationId: string): Promise<ConversationDto | null> {
  const query = `
    SELECT id, conversation_name as "conversationName", created_at as "createdAt"
    FROM user_chat_conversations
    WHERE id = $1
  `;

  const result = await pool.query(query, [conversationId]);

  if (result.rows.length === 0) {
    return null;
  }

  return {
    id: result.rows[0].id,
    conversationName: result.rows[0].conversationName,
    createdAt: result.rows[0].createdAt,
  };
}

export async function userOwnsConversation(userId: number, conversationId: string): Promise<boolean> {
  const query = `
    SELECT 1
    FROM user_chat_conversations
    WHERE id = $1 AND user_id = $2
  `;

  const result = await pool.query(query, [conversationId, userId]);
  return result.rows.length > 0;
}

export async function updateConversationName(
  conversationId: string,
  newName: string
): Promise<void> {
  const query = `
    UPDATE user_chat_conversations
    SET conversation_name = $1
    WHERE id = $2
  `;

  await pool.query(query, [newName, conversationId]);
}
