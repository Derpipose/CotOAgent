import type { CreateConversationResponseDto } from '../../../DTOS/ChatDto.js';
import * as chatDatabase from '../../../controllers/database/chatDatabase.js';
import { SYSTEM_PROMPT } from '../config.js';

export async function initializeChat(
  conversationId: string,
  conversationName: string
): Promise<CreateConversationResponseDto> {
  const initialGreeting =
    'Hello, I am the Chronicler AI Agent! How can I help you set up your new character?';

  await chatDatabase.addMessageToConversation(conversationId, 'system', SYSTEM_PROMPT);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    conversationId,
    conversationName,
    initialAIResponse: {
      id: 0,
      message: initialGreeting,
      sender: 'assistant',
      createdAt: new Date(),
    },
  };
}
