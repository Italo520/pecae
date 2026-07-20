-- ============================================================
-- V8 — Chat & Negociação: chat_rooms, chat_messages, chat_reads
-- ============================================================

-- Tabela: chat_rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id  UUID        REFERENCES listings(id) ON DELETE CASCADE,
    vehicle_id  UUID        REFERENCES vehicles(id) ON DELETE CASCADE,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN     NOT NULL DEFAULT FALSE,
    closed_at   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unicidade parcial: um comprador por anúncio/veículo
    CONSTRAINT uq_chat_rooms_buyer_listing  UNIQUE (buyer_id, listing_id),
    CONSTRAINT uq_chat_rooms_buyer_vehicle  UNIQUE (buyer_id, vehicle_id),

    -- Regra: listing_id OU vehicle_id deve ser informado, não ambos
    CONSTRAINT ck_chat_rooms_contexto CHECK (
        (listing_id IS NOT NULL AND vehicle_id IS NULL) OR
        (listing_id IS NULL AND vehicle_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_seller_id   ON chat_rooms(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_listing_id  ON chat_rooms(listing_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_vehicle_id  ON chat_rooms(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_updated_at  ON chat_rooms(updated_at DESC);

-- Tabela: chat_messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     UUID        NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT        NOT NULL,
    is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id    ON chat_messages(sender_id);

-- Tabela: chat_reads
CREATE TABLE IF NOT EXISTS chat_reads (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id      UUID        NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_chat_reads_room_user UNIQUE (room_id, user_id)
);
