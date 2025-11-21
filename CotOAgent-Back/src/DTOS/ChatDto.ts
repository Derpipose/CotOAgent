import { z } from 'zod';

// Request DTOs
export const CreateConversationDtoSchema = z.object({
  conversationName: z.string().min(1, 'Conversation name is required').optional(),
});

export type CreateConversationDto = z.infer<typeof CreateConversationDtoSchema>;

export const SendMessageDtoSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

export type SendMessageDto = z.infer<typeof SendMessageDtoSchema>;

// Response DTOs
export interface ChatMessageDto {
  id: number;
  sender: 'user' | 'ai';
  message: string;
  createdAt: Date;
}

export interface ConversationDto {
  id: string;
  conversationName: string;
  createdAt: Date;
}

export interface SendMessageResponseDto {
  userMessage: ChatMessageDto;
  aiResponse: ChatMessageDto;
  conversationId: string;
}

export interface CreateConversationResponseDto {
  conversationId: string;
  conversationName: string;
  initialAIResponse: ChatMessageDto;
}

export interface ConversationHistoryDto {
  conversationId: string;
  conversationName: string;
  messages: ChatMessageDto[];
}
