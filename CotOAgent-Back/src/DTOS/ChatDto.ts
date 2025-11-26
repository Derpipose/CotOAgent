import { z } from 'zod';

// Request DTOs
export const CreateConversationDtoSchema = z.object({
  conversationName: z.string().min(1, 'Conversation name is required').optional(),
});

export type CreateConversationDto = z.infer<typeof CreateConversationDtoSchema>;

export const SendMessageDtoSchema = z
  .object({
    message: z.string().min(0, 'Message cannot be empty').optional().default(''),
    toolResult: z.unknown().optional(),
  })
  .superRefine((data, ctx) => {
    // Ensure at least one of message or toolResult is provided
    const hasMessage = data.message && data.message.trim().length > 0;
    const hasToolResult = data.toolResult !== undefined;

    if (!hasMessage && !hasToolResult) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either a message or toolResult must be provided',
      });
    }
  });

export type SendMessageDto = z.infer<typeof SendMessageDtoSchema>;

// Response DTOs
export interface ChatMessageDto {
  id: number;
  sender: 'user' | 'assistant' | 'system';
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
