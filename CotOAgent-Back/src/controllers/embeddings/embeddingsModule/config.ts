export type EntityType = 'races' | 'classes' | 'spells';
export type NameField = 'name' | 'class_name' | 'spell_name';

export interface Entity {
  id: number;
  [key: string]: string | number;
  description: string;
}

export interface EmbeddingProgress {
  races: {
    total: number;
    completed: number;
    failed: number;
    percentageComplete: number;
  };
  classes: {
    total: number;
    completed: number;
    failed: number;
    percentageComplete: number;
  };
  spells: {
    total: number;
    completed: number;
    failed: number;
    percentageComplete: number;
  };
}

export const ENTITY_CONFIG: Record<
  EntityType,
  {
    table: string;
    nameField: NameField;
    idField: string;
  }
> = {
  races: { table: 'races', nameField: 'name', idField: 'id' },
  classes: { table: 'classes', nameField: 'class_name', idField: 'id' },
  spells: { table: 'spells', nameField: 'spell_name', idField: 'id' },
};

export const EMBEDDING_CONFIG = {
  API_URL: 'https://ai-snow.reindeer-pinecone.ts.net/ollama/api/embed',
  MODEL: 'nomic-embed-text:latest',
  TIMEOUT_MS: 60000,
  PROGRESS_UPDATE_INTERVAL_MS: 333,
};
