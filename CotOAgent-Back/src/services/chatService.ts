import type { SendMessageResponseDto, CreateConversationResponseDto } from '../DTOS/ChatDto.js';
import * as chatDatabase from '../controllers/chat/chatDatabase.js';

// AI Service Configuration
const AI_CONFIG = {
  BASE_URL: process.env.AI_SERVER || 'https://ai-snow.reindeer-pinecone.ts.net/api/chat/completions',
  MODEL: 'gpt-oss-120b',
  TIMEOUT_MS: 90000, // 90 seconds
  TOKEN: process.env.AIToken || process.env.AI_TOKEN || '',
};

console.log('[ChatService] AI_CONFIG:', {
  BASE_URL: AI_CONFIG.BASE_URL,
  MODEL: AI_CONFIG.MODEL,
  TIMEOUT_MS: AI_CONFIG.TIMEOUT_MS,
  HAS_TOKEN: !!AI_CONFIG.TOKEN,
});

// System prompt for the AI
const SYSTEM_PROMPT = `You are a very friendly and helpful Chronicler, or game master, for the game Chronicles of the Omuns. You are here to help players build characters for the game using different documents around the site. Be mindful that this isn't dungeons and dragons, but it is a TTRPG.`;

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIRequestBody {
  model: string;
  messages: AIMessage[];
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call the local LLM AI service
 */
async function callAI(messages: AIMessage[]): Promise<string> {
  const requestBody: AIRequestBody = {
    model: AI_CONFIG.MODEL,
    messages,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);

  try {
    console.log('[ChatService] Calling AI at:', AI_CONFIG.BASE_URL);
    console.log('[ChatService] Token available:', !!AI_CONFIG.TOKEN);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token is available
    if (AI_CONFIG.TOKEN) {
      headers['Authorization'] = `Bearer ${AI_CONFIG.TOKEN}`;
      console.log('[ChatService] Authorization header added');
    } else {
      console.log('[ChatService] WARNING: No token available!');
    }

    const response = await fetch(AI_CONFIG.BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI service returned status ${response.status}`);
    }

    const data = (await response.json()) as AIResponse;

    if (!data.choices || data.choices.length === 0) {
      throw new Error('Invalid response from AI service');
    }

    const choice = data.choices[0];
    if (!choice || !choice.message || !choice.message.content) {
      throw new Error('Invalid response from AI service');
    }

    const aiMessage = choice.message.content.trim();

    if (!aiMessage) {
      throw new Error('AI returned empty message');
    }

    return aiMessage;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`AI service timeout after ${AI_CONFIG.TIMEOUT_MS}ms`);
    }
    if (error instanceof TypeError) {
      throw new Error(
        `Failed to connect to AI service at ${AI_CONFIG.BASE_URL}: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Send a message and get AI response
 */
export async function sendMessageAndGetResponse(
  conversationId: string,
  userMessage: string
): Promise<SendMessageResponseDto> {
  // Validate user message
  if (!userMessage || userMessage.trim().length === 0) {
    throw new Error('User message cannot be empty');
  }

  // Get conversation history (includes system prompt from initialization)
  const history = await chatDatabase.getConversationHistory(conversationId);

  // Build message context for AI from history
  const messages: AIMessage[] = history.map((msg) => ({
    role: msg.sender as 'system' | 'user' | 'assistant',
    content: msg.message,
  }));

  // Add the new user message
  messages.push({
    role: 'user',
    content: userMessage.trim(),
  });

  // Save user message to database
  const savedUserMessage = await chatDatabase.addMessageToConversation(
    conversationId,
    'user',
    userMessage
  );

  // Call AI and get response
  const aiResponseText = await callAI(messages);

  // Save AI response to database
  const savedAIResponse = await chatDatabase.addMessageToConversation(
    conversationId,
    'ai',
    aiResponseText
  );

  return {
    userMessage: savedUserMessage,
    aiResponse: savedAIResponse,
    conversationId,
  };
}

/**
 * Initialize a new chat conversation with system prompt and prefab greeting
 */
export async function initializeChat(
  conversationId: string,
  conversationName: string
): Promise<CreateConversationResponseDto> {
  const initialGreeting = "Hello, I am the Chronicler AI Agent! How can I help you set up your new character?";

  // Save system prompt to database once on initialization
  await chatDatabase.addMessageToConversation(
    conversationId,
    'system',
    SYSTEM_PROMPT
  );

  // Add a 1 second delay to make it look like the AI is thinking
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    conversationId,
    conversationName,
    initialAIResponse: {
      id: 0,
      message: initialGreeting,
      sender: 'ai',
      createdAt: new Date(),
    },
  };
}
