-- liquibase formatted sql
-- changeset baha-a:1715345741
CREATE INDEX IF NOT EXISTS idx_chat_created ON chat (created);
CREATE INDEX IF NOT EXISTS idx_message_chat_base_id ON message (chat_base_id);
CREATE INDEX IF NOT EXISTS idx_chat_base_id ON chat (base_id);
