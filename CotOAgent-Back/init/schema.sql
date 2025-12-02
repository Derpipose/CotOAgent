CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    admin_email VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    classification VARCHAR(255) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    description TEXT,
    embeddings vector,
    UNIQUE(classification, class_name)
);

CREATE TABLE IF NOT EXISTS races (
    id SERIAL PRIMARY KEY,
    campaign VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    embeddings vector,
    UNIQUE(campaign, name)
);

CREATE TABLE IF NOT EXISTS spellbooks (
    id SERIAL PRIMARY KEY,
    spell_branch VARCHAR(255) NOT NULL,
    book_level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spells (
    id SERIAL PRIMARY KEY,
    spellbook_id INTEGER REFERENCES spellbooks(id) ON DELETE CASCADE,
    spell_name VARCHAR(255) NOT NULL,
    mana_cost VARCHAR(10),
    hit_die VARCHAR(50),
    description TEXT,
    embeddings vector,
    UNIQUE(spell_name)
);

CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    class_name VARCHAR(255),
    class_classification VARCHAR(255),
    race_name VARCHAR(255),
    race_campaign VARCHAR(255),
    strength INTEGER,
    dexterity INTEGER,
    constitution INTEGER,
    intelligence INTEGER,
    wisdom INTEGER,
    charisma INTEGER,
    backstory TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback TEXT,
    approval_status VARCHAR(50) DEFAULT 'pending',
    revised BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS character_spells (
    id SERIAL PRIMARY KEY,
    character_id INTEGER REFERENCES characters(id) ON DELETE CASCADE,
    spell_name VARCHAR(255) NOT NULL,
    UNIQUE(character_id, spell_name)
);

CREATE TABLE IF NOT EXISTS user_chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_chat_messages (
    id SERIAL PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES user_chat_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    tool_id VARCHAR(255),
    tool_result TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (user_email) VALUES ('derpipose@gmail.com') 
ON CONFLICT (user_email) DO NOTHING;

INSERT INTO admin_users (admin_email) VALUES ('derpipose@gmail.com') 
ON CONFLICT (admin_email) DO NOTHING;