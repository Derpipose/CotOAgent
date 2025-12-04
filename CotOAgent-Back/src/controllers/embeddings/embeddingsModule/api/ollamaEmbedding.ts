import { EMBEDDING_CONFIG } from '../config.js';

export async function generateEmbedding(text: string): Promise<number[]> {
  const aiToken = process.env.AIToken || process.env.AI_TOKEN;

  console.log(`[EMBEDDINGS_API] Calling API at: ${EMBEDDING_CONFIG.API_URL}`);
  console.log(`[EMBEDDINGS_API] Model: ${EMBEDDING_CONFIG.MODEL}`);
  console.log(`[EMBEDDINGS_API] Text length: ${text.length}`);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (aiToken) {
    headers['Authorization'] = `Bearer ${aiToken}`;
    console.log('[EMBEDDINGS_API] Using Authorization header');
  } else {
    console.log('[EMBEDDINGS_API] No AI_TOKEN provided');
  }

  const payload = {
    model: EMBEDDING_CONFIG.MODEL,
    input: [text],
  };

  try {
    console.log('[EMBEDDINGS_API] Sending request to Ollama API...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EMBEDDING_CONFIG.TIMEOUT_MS);

    const response = await fetch(EMBEDDING_CONFIG.API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[EMBEDDINGS_API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[EMBEDDINGS_API] HTTP Error response: ${errorText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const data = (await response.json()) as { embeddings?: number[][] };

    console.log(`[EMBEDDINGS_API] Response received:`, {
      hasEmbeddings: !!data.embeddings,
      embeddingsLength: data.embeddings?.length,
      firstEmbeddingDimensions: data.embeddings?.[0]?.length,
    });

    if (!data.embeddings || data.embeddings.length === 0) {
      throw new Error('No embedding returned from API');
    }

    const embedding = data.embeddings[0] as number[];
    console.log(
      `[EMBEDDINGS_API] ✓ Successfully generated embedding with ${embedding.length} dimensions`
    );
    return embedding;
  } catch (error) {
    console.error(
      `[EMBEDDINGS_API] ✗ Failed to generate embedding for text: "${text.substring(0, 50)}..."`,
      error
    );
    throw error;
  }
}
