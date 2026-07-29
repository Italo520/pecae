-- Índice para busca de salas ativas por usuário (buyer ou seller)
CREATE INDEX IF NOT EXISTS idx_chat_rooms_buyer_ativa
    ON chat_rooms (buyer_id, is_active, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_ativa
    ON chat_rooms (seller_id, is_active, updated_at DESC);

-- Índice para última mensagem por sala (LATERAL JOIN usa este)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created
    ON chat_messages (chat_room_id, created_at DESC, id DESC)
    WHERE deleted = false;

-- Índice para contagem de não lidos por sala
CREATE INDEX IF NOT EXISTS idx_chat_room_reads_sala_usuario
    ON chat_room_reads (chat_room_id, user_id);

-- Índice GIN para filtros JSONB de buscas salvas
CREATE INDEX IF NOT EXISTS idx_saved_searches_filtros_gin
    ON saved_searches USING GIN (filtros);
